import { migrateBrandKeys } from "./migrate-brand";

export const INDEX_STORAGE_KEY = "mk_resumes_index";
export const RESUME_STORAGE_PREFIX = "mk_resume_";
export const LEGACY_STORAGE_KEY = "mk_resume_draft";
export const LEGACY_BACKUP_KEY = "mk_resume_draft_backup";

// Legacy keys for non-destructive fallback reads
export const LEGACY_INDEX_KEY = "resumebuilderlab_resumes_index";
export const LEGACY_RESUME_PREFIX = "resumebuilderlab_resume_";
export const OLD_LEGACY_DRAFT_KEY = "resumebuilderlab_resume_draft";

export const BRAND_MIGRATION_FLAG = "mk_brand_migrated_v1";
export const THEME_MIGRATION_FLAG = "mk_theme_v2_migrated";

// Standard browser local storage quota is typically 5MB
export const ESTIMATED_LOCAL_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024;

export function runBrandStorageMigration(storage?: Storage): void {
  const store =
    storage ||
    (typeof window !== "undefined" && window.localStorage ? window.localStorage : null);
  if (!store) {
    return;
  }
  try {
    // 1. Run non-destructive key migration: resumebuilderlab_, curiv_, curviv_ -> mk_
    migrateBrandKeys(store);

    // 2. Legacy theme migration if needed
    if (store.getItem(THEME_MIGRATION_FLAG) !== "true") {
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (!key) continue;

        if (
          key === LEGACY_STORAGE_KEY ||
          key === OLD_LEGACY_DRAFT_KEY ||
          key.startsWith(RESUME_STORAGE_PREFIX) ||
          key.startsWith(LEGACY_RESUME_PREFIX)
        ) {
          const raw = store.getItem(key);
          if (
            raw &&
            (raw.includes("#4F46E5") ||
              raw.includes("#4f46e5") ||
              raw.includes("#16A34A") ||
              raw.includes("#16a34a"))
          ) {
            try {
              const parsed = JSON.parse(raw);
              if (
                parsed?.theme?.accentColor &&
                (parsed.theme.accentColor.toLowerCase() === "#4f46e5" ||
                  parsed.theme.accentColor.toLowerCase() === "#16a34a")) {
                parsed.theme.accentColor = "#2563EB";
                store.setItem(key, JSON.stringify(parsed));
              }
            } catch {
              // Ignore parse error
            }
          }
        }
      }
      store.setItem(THEME_MIGRATION_FLAG, "true");
    }
  } catch (error) {
    console.error("Error migrating brand storage keys:", error);
  }
}

export function getResumeStorageKey(id: string): string {
  return `${RESUME_STORAGE_PREFIX}${id}`;
}

export function safeLocalStorageGet(key: string): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const val = localStorage.getItem(key);
    if (val !== null) return val;

    // Fallback reads: if looking for mk_ prefix, check older prefixes
    if (key.startsWith("mk_")) {
      const suffix = key.slice("mk_".length);
      const fallbackPrefixes = ["resumebuilderlab_", "curiv_", "curviv_"];
      for (const prefix of fallbackPrefixes) {
        const fallbackVal = localStorage.getItem(`${prefix}${suffix}`);
        if (fallbackVal !== null) return fallbackVal;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
    return null;
  }
}

export function safeLocalStorageSet(
  key: string,
  value: string
): { success: boolean; quotaExceeded: boolean; error?: unknown } {
  if (typeof window === "undefined" || !window.localStorage) {
    return { success: false, quotaExceeded: false };
  }
  try {
    localStorage.setItem(key, value);
    return { success: true, quotaExceeded: false };
  } catch (error: any) {
    const isQuotaExceeded =
      error instanceof DOMException &&
      // everything except Firefox
      (error.code === 22 ||
        // Firefox
        error.code === 1014 ||
        // test name field too, because code might not exist
        error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED");

    console.error(`Error saving key "${key}" to localStorage:`, error);
    return { success: false, quotaExceeded: isQuotaExceeded, error };
  }
}

export function safeLocalStorageRemove(key: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    localStorage.removeItem(key);
    // Also remove legacy keys to prevent deleted entries from resurrecting on fallback
    if (key.startsWith("mk_")) {
      const suffix = key.slice("mk_".length);
      const fallbackPrefixes = ["resumebuilderlab_", "curiv_", "curviv_"];
      for (const prefix of fallbackPrefixes) {
        localStorage.removeItem(`${prefix}${suffix}`);
      }
    }
    return true;
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
    return false;
  }
}

export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  percentage: number;
  formattedUsed: string;
}

export function getStorageUsage(): StorageUsage {
  let usedBytes = 0;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || "";
          // Key and value are stored in UTF-16 (2 bytes per character)
          usedBytes += (key.length + value.length) * 2;
        }
      }
    } catch {
      // Ignore reading error
    }
  }

  const quotaBytes = ESTIMATED_LOCAL_STORAGE_QUOTA_BYTES;
  const percentage = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));

  let formattedUsed = `${Math.round(usedBytes / 1024)} KB`;
  if (usedBytes >= 1024 * 1024) {
    formattedUsed = `${(usedBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return {
    usedBytes,
    quotaBytes,
    percentage,
    formattedUsed,
  };
}
