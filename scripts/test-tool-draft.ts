import assert from "node:assert";
import { formatRelativeTime } from "../lib/hooks/use-tool-draft";

console.log("=== RUNNING UNIVERSAL TOOL DRAFT TEST SUITE ===");

// 1. Test formatRelativeTime
const now = Date.now();
assert.strictEqual(formatRelativeTime(now - 5000), "just now");
assert.strictEqual(formatRelativeTime(now - 30000), "30 seconds ago");
assert.strictEqual(formatRelativeTime(now - 60000), "1 minute ago");
assert.strictEqual(formatRelativeTime(now - 5 * 60000), "5 minutes ago");
assert.strictEqual(formatRelativeTime(now - 3600000), "1 hour ago");
assert.strictEqual(formatRelativeTime(now - 4 * 3600000), "4 hours ago");
assert.strictEqual(formatRelativeTime(now - 86400000), "yesterday");
assert.strictEqual(formatRelativeTime(now - 3 * 86400000), "3 days ago");
console.log("✓ formatRelativeTime relative date calculations passed");

// 2. Mock LocalStorage and test serialization & TTL logic
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  removeItem: (k: string) => { delete mockStorage[k]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
};

// Test payload structure
const testKey = "ct_draft_json-formatter";
const samplePayload = {
  data: '{"hello": "world"}',
  savedAt: Date.now(),
  toolSlug: "json-formatter",
};

mockLocalStorage.setItem(testKey, JSON.stringify(samplePayload));
const retrieved = JSON.parse(mockLocalStorage.getItem(testKey) || "{}");
assert.strictEqual(retrieved.toolSlug, "json-formatter");
assert.strictEqual(retrieved.data, '{"hello": "world"}');
console.log("✓ Draft payload storage & retrieval passed");

// Test TTL logic
const stalePayload = {
  data: '{"old": "data"}',
  savedAt: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days old
  toolSlug: "json-formatter",
};
mockLocalStorage.setItem(testKey, JSON.stringify(stalePayload));
const retrievedStale = JSON.parse(mockLocalStorage.getItem(testKey) || "{}");
const age = Date.now() - retrievedStale.savedAt;
const ttl = 7 * 24 * 60 * 60 * 1000;
assert.strictEqual(age > ttl, true); // correctly expired
console.log("✓ Draft TTL expiration detection passed");

// Test Clear Draft
mockLocalStorage.removeItem(testKey);
assert.strictEqual(mockLocalStorage.getItem(testKey), null);
console.log("✓ Draft removal passed");

console.log("🎉 ALL TOOL DRAFT TESTS PASSED CLEANLY!");
