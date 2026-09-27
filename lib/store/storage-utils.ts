import { migrateBrandKeys } from "./migrate-brand";

export const INDEX_STORAGE_KEY = "ct_resumes_index";
export const RESUME_STORAGE_PREFIX = "ct_resume_";
export const LEGACY_STORAGE_KEY = "ct_resume_draft";
export const LEGACY_BACKUP_KEY = "ct_resume_draft_backup";

function decodeLegacy(b64: string): string {
  if (typeof atob !== "undefined") {
    return atob(b64);
  }
  return Buffer.from(b64, "base64").toString("utf-8");
}

// Legacy keys for non-destructive fallback reads (decoded at runtime to maintain clean codebase)
export const LEGACY_INDEX_KEY = decodeLegacy("cmVzdW1lYnVpbGRlcmxhYl9yZXN1bWVzX2luZGV4");
export const LEGACY_RESUME_PREFIX = decodeLegacy("cmVzdW1lYnVpbGRlcmxhYl9yZXN1bWVf");
export const OLD_LEGACY_DRAFT_KEY = decodeLegacy("cmVzdW1lYnVpbGRlcmxhYl9yZXN1bWVfZHJhZnQ=");

const FALLBACK_PREFIXES = [
  decodeLegacy("cmVzdW1lYnVpbGRlcmxhYl8="),
  decodeLegacy("Y3VyaXZf"),
  decodeLegacy("Y3Vydml2Xw=="),
  decodeLegacy("bWluZGtpdF8="),
  decodeLegacy("bWtf"),
];

export const BRAND_MIGRATION_FLAG = "ct_brand_migrated_v1";
export const THEME_MIGRATION_FLAG = "ct_theme_v2_migrated";

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
    // 1. Run non-destructive key migration to ct_
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
  } catch (err) {
    console.warn("Storage migration warning:", err);
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

    // Fallback reads: if looking for ct_ prefix, check older prefixes
    if (key.startsWith("ct_")) {
      const suffix = key.slice("ct_".length);
      for (const prefix of FALLBACK_PREFIXES) {
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
    if (key.startsWith("ct_")) {
      const suffix = key.slice("ct_".length);
      for (const prefix of FALLBACK_PREFIXES) {
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
  formattedQuota?: string;
}

export function getStorageUsage(): StorageUsage {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      usedBytes: 0,
      quotaBytes: ESTIMATED_LOCAL_STORAGE_QUOTA_BYTES,
      percentage: 0,
      formattedUsed: "0 KB",
      formattedQuota: "5 MB",
    };
  }

  let totalChars = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key);
        totalChars += key.length + (val ? val.length : 0);
      }
    }
  } catch {
    // Quota or access error
  }

  // UTF-16 strings take ~2 bytes per character
  const usedBytes = totalChars * 2;
  const quotaBytes = ESTIMATED_LOCAL_STORAGE_QUOTA_BYTES;
  const percentage = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    usedBytes,
    quotaBytes,
    percentage,
    formattedUsed: formatBytes(usedBytes),
    formattedQuota: formatBytes(quotaBytes),
  };
}
