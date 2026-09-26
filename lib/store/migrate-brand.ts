/**
 * Mindkit Storage Migration Engine (Non-Destructive)
 * Migrates legacy local storage keys ('resumebuilderlab_', 'curiv_', 'curviv_')
 * to Mindkit's unified 'mk_' storage prefix.
 *
 * Guarantees:
 * 1. Copy, Never Move: Old keys are strictly preserved to ensure zero data loss.
 * 2. Idempotent: Flag 'mk_brand_migrated_v1' prevents repeat migrations.
 * 3. Graceful fallback on quota errors or storage blocks.
 */

export const OLD_PREFIXES = ["resumebuilderlab_", "curiv_", "curviv_"] as const;
export const NEW_PREFIX = "mk_";
export const BRAND_MIGRATION_FLAG = "mk_brand_migrated_v1";

export function migrateBrandKeys(storage?: Storage): void {
  const store: Storage | null =
    storage ||
    (typeof window !== "undefined" && window.localStorage ? window.localStorage : null);

  if (!store) return;

  try {
    if (store.getItem(BRAND_MIGRATION_FLAG)) return;

    // Snapshot existing keys to avoid iterator invalidation
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k) keys.push(k);
    }

    for (const key of keys) {
      const old = OLD_PREFIXES.find((p) => key.startsWith(p));
      if (!old) continue;

      const newKey = NEW_PREFIX + key.slice(old.length);
      const value = store.getItem(key);

      // Copy to new key if new key doesn't already exist
      if (value !== null && store.getItem(newKey) === null) {
        store.setItem(newKey, value);
      }
    }

    store.setItem(BRAND_MIGRATION_FLAG, new Date().toISOString());
  } catch (err) {
    // Quota exceeded or storage blocked: fail-safe, existing keys remain untouched
    console.warn("Notice: Storage migration to 'mk_' completed with warnings:", err);
  }
}
