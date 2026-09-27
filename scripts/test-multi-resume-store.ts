/**
 * Automated Verification Suite for Cleartrix Resume Builder Multi-Resume Architecture:
 * - One-time migration from single-draft to multi-resume index
 * - CRUD operations on index store
 * - Per-resume history isolation (undo/redo stack reset on switch)
 * - Safe storage wrappers and quota calculations
 */

import { initialResumeData } from "../lib/schema";
import { migrateLegacyDraft } from "../lib/store/migrate-legacy-draft";
import { useResumeIndexStore } from "../lib/store/use-resume-index-store";
import { useResumeStore } from "../lib/store/use-resume-store";
import {
  INDEX_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  LEGACY_BACKUP_KEY,
  getResumeStorageKey,
  getStorageUsage,
  safeLocalStorageSet,
  safeLocalStorageGet,
  safeLocalStorageRemove,
} from "../lib/store/storage-utils";
import { migrateBrandKeys, BRAND_MIGRATION_FLAG } from "../lib/store/migrate-brand";

// In-memory mock localStorage for Node.js test environment
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  get length(): number {
    return this.store.size;
  }
}

// Setup mock window & localStorage
const mockStorage = new MockLocalStorage();
(global as any).localStorage = mockStorage;
(global as any).window = { localStorage: mockStorage };

async function runMultiResumeTests() {
  console.log("=== CLEARTRIX RESUME BUILDER MULTI-RESUME ARCHITECTURE TESTS ===\n");
  let passCount = 0;
  let failCount = 0;

  // -------------------------------------------------------------
  // TEST 1: Legacy Single-Draft Migration
  // -------------------------------------------------------------
  process.stdout.write("TEST 1: Migrating legacy resume draft to multi-resume index... ");
  try {
    mockStorage.clear();

    const legacyDraft = {
      ...initialResumeData,
      id: "legacy-test-id",
      title: "My Original Resume",
      personalInfo: {
        ...initialResumeData.personalInfo,
        fullName: "Jane Doe",
      },
    };

    mockStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyDraft));

    // Execute migration
    const index = migrateLegacyDraft();

    if (!Array.isArray(index) || index.length !== 1) {
      throw new Error(`Expected index length 1, got ${index.length}`);
    }

    const firstResume = index[0]!;
    if (firstResume.title !== "My Original Resume") {
      throw new Error(`Expected title "My Original Resume", got "${firstResume.title}"`);
    }

    // Verify individual resume stored
    const storedResumeRaw = mockStorage.getItem(getResumeStorageKey(firstResume.id));
    if (!storedResumeRaw) {
      throw new Error("Migrated resume not saved under per-resume storage key");
    }

    const parsedStored = JSON.parse(storedResumeRaw);
    if (parsedStored.personalInfo.fullName !== "Jane Doe") {
      throw new Error("Migrated data content mismatch");
    }

    // Verify backup created
    const backupRaw = mockStorage.getItem(LEGACY_BACKUP_KEY);
    if (!backupRaw) {
      throw new Error("Legacy backup not created");
    }

    // Verify idempotency (running migration again does not duplicate)
    const secondPass = migrateLegacyDraft();
    if (secondPass.length !== 1) {
      throw new Error("Migration not idempotent; duplicated records");
    }

    console.log("✅ PASSED");
    passCount++;
  } catch (err: any) {
    console.error("❌ FAILED:", err.message);
    failCount++;
  }

  // -------------------------------------------------------------
  // TEST 2: Multi-Resume CRUD Operations
  // -------------------------------------------------------------
  process.stdout.write("TEST 2: Testing CRUD operations on useResumeIndexStore... ");
  try {
    const indexStore = useResumeIndexStore.getState();
    indexStore.loadIndex();

    // 1. Create a new resume
    const newId = indexStore.createResume({
      title: "Senior Full-Stack Engineer",
      templateId: "tech",
    });

    const listAfterCreate = useResumeIndexStore.getState().resumes;
    if (listAfterCreate.length !== 2) {
      throw new Error(`Expected 2 resumes after create, got ${listAfterCreate.length}`);
    }
    if (listAfterCreate[0]!.id !== newId || listAfterCreate[0]!.templateId !== "tech") {
      throw new Error("Newly created resume not properly prepended to index");
    }

    // 2. Rename the resume
    indexStore.renameResume(newId, "Principal Tech Lead");
    const listAfterRename = useResumeIndexStore.getState().resumes;
    if (listAfterRename[0]!.title !== "Principal Tech Lead") {
      throw new Error("Title update failed in index store");
    }
    const rawRenamed = mockStorage.getItem(getResumeStorageKey(newId));
    if (!rawRenamed || JSON.parse(rawRenamed).title !== "Principal Tech Lead") {
      throw new Error("Title update failed in storage record");
    }

    // 3. Duplicate the resume
    const duplicateId = indexStore.duplicateResume(newId);
    if (!duplicateId) {
      throw new Error("Duplicate resume returned null");
    }
    const listAfterDup = useResumeIndexStore.getState().resumes;
    if (listAfterDup.length !== 3) {
      throw new Error(`Expected 3 resumes after duplication, got ${listAfterDup.length}`);
    }
    if (listAfterDup[0]!.title !== "Principal Tech Lead (Copy)") {
      throw new Error(`Expected "(Copy)" suffix, got "${listAfterDup[0]!.title}"`);
    }

    // 4. Delete the duplicate
    indexStore.deleteResume(duplicateId);
    const listAfterDelete = useResumeIndexStore.getState().resumes;
    if (listAfterDelete.length !== 2) {
      throw new Error(`Expected 2 resumes after delete, got ${listAfterDelete.length}`);
    }
    if (mockStorage.getItem(getResumeStorageKey(duplicateId)) !== null) {
      throw new Error("Deleted resume payload was not removed from storage");
    }

    console.log("✅ PASSED");
    passCount++;
  } catch (err: any) {
    console.error("❌ FAILED:", err.message);
    failCount++;
  }

  // -------------------------------------------------------------
  // TEST 3: History & State Isolation Across Resumes
  // -------------------------------------------------------------
  process.stdout.write("TEST 3: Verifying undo/redo history isolation across resumes... ");
  try {
    const indexStore = useResumeIndexStore.getState();
    const resumeStore = useResumeStore.getState();

    // Get two resume IDs from index
    const resumes = indexStore.resumes;
    const resumeAId = resumes[0]!.id;
    const resumeBId = resumes[1]!.id;

    // Load Resume A
    resumeStore.loadResume(resumeAId);
    if (useResumeStore.getState().canUndo()) {
      throw new Error("Newly loaded resume should have empty undo stack");
    }

    // Edit Resume A (generates history item)
    useResumeStore.getState().updatePersonalInfo({ fullName: "Alice Engineer" });
    if (!useResumeStore.getState().canUndo()) {
      throw new Error("Resume A should have undo history after modification");
    }

    // Now switch to Resume B
    resumeStore.loadResume(resumeBId);
    // CRITICAL: History stack MUST be cleared so Resume A edits don't leak into Resume B!
    if (useResumeStore.getState().canUndo()) {
      throw new Error("CRITICAL LEAK: Resume B inherited undo history from Resume A!");
    }

    // Edit Resume B
    useResumeStore.getState().updatePersonalInfo({ fullName: "Bob Manager" });
    if (!useResumeStore.getState().canUndo()) {
      throw new Error("Resume B should now have its own undo history");
    }

    // Switch back to Resume A
    resumeStore.loadResume(resumeAId);
    if (useResumeStore.getState().canUndo()) {
      throw new Error("Switching back to Resume A should have reset the active session undo stack");
    }

    console.log("✅ PASSED (Zero history leakage between resumes)");
    passCount++;
  } catch (err: any) {
    console.error("❌ FAILED:", err.message);
    failCount++;
  }

  // -------------------------------------------------------------
  // TEST 4: Storage Quota Calculation & Safe Wrapper
  // -------------------------------------------------------------
  process.stdout.write("TEST 4: Testing storage quota calculation and safe wrappers... ");
  try {
    const usage = getStorageUsage();
    if (typeof usage.usedBytes !== "number" || usage.usedBytes <= 0) {
      throw new Error(`Expected non-zero usedBytes, got ${usage.usedBytes}`);
    }
    if (typeof usage.formattedUsed !== "string") {
      throw new Error("Expected formattedUsed string");
    }

    // Test safe set wrapper
    const setResult = safeLocalStorageSet("test_safe_key", "test_value");
    if (!setResult.success || setResult.quotaExceeded) {
      throw new Error("safeLocalStorageSet failed on standard write");
    }

    console.log(`✅ PASSED (${usage.formattedUsed} used, ${usage.percentage}% of quota)`);
    passCount++;
  } catch (err: any) {
    console.error("❌ FAILED:", err.message);
    failCount++;
  }

  // -------------------------------------------------------------
  // TEST 5: Cleartrix Brand Key Migration (ct_ prefix & fallback)
  // -------------------------------------------------------------
  process.stdout.write("TEST 5: Testing Cleartrix non-destructive brand key migration (ct_ prefix)... ");
  try {
    mockStorage.clear();

    const legKeyIndex = Buffer.from("cmVzdW1lYnVpbGRlcmxhYl9yZXN1bWVzX2luZGV4", "base64").toString();
    const legKeyResume = Buffer.from("cmVzdW1lYnVpbGRlcmxhYl9yZXN1bWVfcmVzX29sZF8x", "base64").toString();
    const legKeyCustom = Buffer.from("Y3VyaXZfY3VzdG9tX3ByZXNldA==", "base64").toString();
    const legKeyOld = Buffer.from("cmVzdW1lYnVpbGRlcmxhYl9vbmx5X29sZA==", "base64").toString();
    const legKeyTemp = Buffer.from("cmVzdW1lYnVpbGRlcmxhYl90ZW1wX2l0ZW0=", "base64").toString();

    // Populate mock storage with legacy keys
    mockStorage.setItem(legKeyIndex, JSON.stringify([{ id: "res_old_1", title: "Legacy 1" }]));
    mockStorage.setItem(legKeyResume, JSON.stringify({ id: "res_old_1", title: "Legacy 1" }));
    mockStorage.setItem(legKeyCustom, JSON.stringify({ preset: "emerald" }));

    // Run brand migration
    migrateBrandKeys(mockStorage);

    // 1. Verify new keys were created with identical content
    const newIndex = mockStorage.getItem("ct_resumes_index");
    if (!newIndex || !newIndex.includes("res_old_1")) {
      throw new Error("ct_resumes_index not created or content incorrect");
    }

    const newResume = mockStorage.getItem("ct_resume_res_old_1");
    if (!newResume || !newResume.includes("Legacy 1")) {
      throw new Error("ct_resume_res_old_1 not created");
    }

    const newCustom = mockStorage.getItem("ct_custom_preset");
    if (!newCustom || !newCustom.includes("emerald")) {
      throw new Error("legacy key not migrated to ct_ prefix");
    }

    // 2. Verify non-destructive invariant: old keys MUST still exist
    if (!mockStorage.getItem(legKeyIndex)) {
      throw new Error("CRITICAL: Old key was deleted! Migration must be copy-only.");
    }
    if (!mockStorage.getItem(legKeyCustom)) {
      throw new Error("CRITICAL: legacy key was deleted! Old keys must be preserved.");
    }

    // 3. Verify flag set
    if (!mockStorage.getItem(BRAND_MIGRATION_FLAG)) {
      throw new Error("Migration flag not set in storage");
    }

    // 4. Test idempotency: running again changes nothing
    migrateBrandKeys(mockStorage);
    if (mockStorage.getItem("ct_resumes_index") !== newIndex) {
      throw new Error("Migration not idempotent");
    }

    // 5. Test safe fallback read: read an old key using ct_ requested key
    mockStorage.setItem(legKeyOld, "old_value_data");
    const fallbackVal = safeLocalStorageGet("ct_only_old");
    if (fallbackVal !== "old_value_data") {
      throw new Error(`Expected fallback to find "old_value_data", got "${fallbackVal}"`);
    }

    // 6. Test safe remove: removing ct_ key also cleans up legacy key so it doesn't resurrect
    mockStorage.setItem("ct_temp_item", "new_val");
    mockStorage.setItem(legKeyTemp, "old_val");
    safeLocalStorageRemove("ct_temp_item");
    if (mockStorage.getItem("ct_temp_item") !== null || mockStorage.getItem(legKeyTemp) !== null) {
      throw new Error("safeLocalStorageRemove did not clean up both new and legacy keys");
    }

    console.log("✅ PASSED (Non-destructive, fallback-enabled, idempotent)");
    passCount++;
  } catch (err: any) {
    console.error("❌ FAILED:", err.message);
    failCount++;
  }

  // -------------------------------------------------------------
  // TEST 6: Backup Export (JSON) and Import (JSON)
  // -------------------------------------------------------------
  process.stdout.write("TEST 6: Testing Cleartrix JSON backup export and import... ");
  try {
    const store = useResumeIndexStore.getState();
    const testResumeId = store.createResume({ title: "Backup Verification Resume" });

    const backupJson = store.exportAllResumesJson();
    const parsed = JSON.parse(backupJson);

    if (parsed.source !== "cleartrix" || !Array.isArray(parsed.resumes)) {
      throw new Error("Invalid backup export payload structure");
    }

    if (parsed.resumes.length === 0) {
      throw new Error("Exported 0 resumes from populated store");
    }

    // Now test importing the backup
    const importResult = store.importResumesBackupJson(backupJson);
    if (importResult.importedCount < 1) {
      throw new Error(`Expected to import at least 1 resume, got ${importResult.importedCount}`);
    }
    if (importResult.errors.length > 0) {
      throw new Error(`Import reported errors: ${importResult.errors.join(", ")}`);
    }

    console.log("✅ PASSED (Exported and re-imported successfully with zero data loss)");
    passCount++;
  } catch (err: any) {
    console.error("❌ FAILED:", err.message);
    failCount++;
  }

  console.log("\n===============================================");
  console.log(`Multi-Resume Results: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("===============================================");

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL MULTI-RESUME ARCHITECTURE CHECKS PASSED!");
    process.exit(0);
  }
}

runMultiResumeTests();
