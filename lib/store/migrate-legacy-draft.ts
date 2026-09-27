import { resumeDataSchema, ResumeData } from "../schema";
import { ResumeIndexItem, resumeIndexSchema } from "./resume-index-schema";
import {
  INDEX_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  LEGACY_BACKUP_KEY,
  getResumeStorageKey,
  safeLocalStorageGet,
  safeLocalStorageSet,
} from "./storage-utils";

/**
 * Performs a safe, non-destructive one-time migration from single-draft
 * storage to multi-resume index and per-resume storage.
 *
 * Guarantees:
 * 1. Zero data loss: Preserves existing work as the user's first resume ("My Resume").
 * 2. Idempotent: Subsequent calls do nothing if the index already exists.
 * 3. Safe fallback: Legacy draft is backed up safely.
 */
export function migrateLegacyDraft(): ResumeIndexItem[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  // 1. Check if the index already exists
  const existingIndexRaw = safeLocalStorageGet(INDEX_STORAGE_KEY);
  if (existingIndexRaw) {
    try {
      const parsed = JSON.parse(existingIndexRaw);
      const validation = resumeIndexSchema.safeParse(parsed);
      if (validation.success) {
        return validation.data;
      }
    } catch {
      // If corrupted, proceed below to attempt recovery
    }
  }

  // 2. Index doesn't exist yet: Check for legacy single-draft data
  const legacyRaw = safeLocalStorageGet(LEGACY_STORAGE_KEY);
  if (legacyRaw) {
    try {
      const parsedJson = JSON.parse(legacyRaw);
      // Validate or safely adapt legacy data
      let resumeData: ResumeData | null = null;
      const parseResult = resumeDataSchema.safeParse(parsedJson);

      if (parseResult.success) {
        resumeData = parseResult.data;
      } else if (parsedJson && parsedJson.personalInfo) {
        // Partial fallback if schema had minor changes
        resumeData = {
          ...parsedJson,
          id: parsedJson.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `resume_${Date.now()}`),
          title: parsedJson.title || "My Resume",
        } as ResumeData;
      }

      if (resumeData) {
        const resumeId =
          resumeData.id && resumeData.id !== "default-id"
            ? resumeData.id
            : typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `resume_${Date.now()}`;

        resumeData.id = resumeId;
        if (!resumeData.title || resumeData.title === "Untitled Resume") {
          resumeData.title = "My Resume";
        }

        // Save migrated resume under per-resume key
        const resumeKey = getResumeStorageKey(resumeId);
        safeLocalStorageSet(resumeKey, JSON.stringify(resumeData));

        // Create index item
        const indexItem: ResumeIndexItem = {
          id: resumeId,
          title: resumeData.title,
          templateId: resumeData.theme?.templateId || "modern",
          createdAt: new Date().toISOString(),
          updatedAt: resumeData.meta?.lastEditedAt || new Date().toISOString(),
          completenessScore: resumeData.meta?.completenessScore || 0,
        };

        const newIndex: ResumeIndexItem[] = [indexItem];
        safeLocalStorageSet(INDEX_STORAGE_KEY, JSON.stringify(newIndex));

        // Safely backup legacy draft so old data is never lost
        safeLocalStorageSet(LEGACY_BACKUP_KEY, legacyRaw);

        return newIndex;
      }
    } catch (err) {
      console.error("Error migrating legacy resume draft:", err);
    }
  }

  // 3. First time user: initialize empty index
  const emptyIndex: ResumeIndexItem[] = [];
  safeLocalStorageSet(INDEX_STORAGE_KEY, JSON.stringify(emptyIndex));
  return emptyIndex;
}
