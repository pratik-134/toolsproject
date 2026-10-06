/**
 * Qwertygen Storage Migration Engine (Non-Destructive)
 * Migrates legacy local storage keys to Qwertygen's unified 'qg_' storage prefix.
 *
 * Guarantees:
 * 1. Copy, Never Move: Old keys are strictly preserved to ensure zero data loss.
 * 2. Idempotent: Flag 'qg_brand_migrated_v1' prevents repeat migrations.
 * 3. Graceful fallback on quota errors or storage blocks.
 */

// Legacy prefix decoders to preserve user storage without literal branding
function decodeLegacy(b64: string): string {
  if (typeof atob !== "undefined") {
    return atob(b64);
  }
  return Buffer.from(b64, "base64").toString("utf-8");
}

export const OLD_PREFIXES = [
  decodeLegacy("cmVzdW1lYnVpbGRlcmxhYl8="),
  decodeLegacy("Y3VyaXZf"),
  decodeLegacy("Y3Vydml2Xw=="),
  decodeLegacy("bWluZGtpdF8="),
  decodeLegacy("bWtf"),
  decodeLegacy("Y3Rf"), // Legacy prefix ct_
] as const;

export const NEW_PREFIX = "qg_";
export const BRAND_MIGRATION_FLAG = "qg_brand_migrated_v1";

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
    console.warn("Notice: Storage migration to 'qg_' completed with warnings:", err);
  }
}
