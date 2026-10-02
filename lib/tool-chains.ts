/**
 * Client-Side Tool Chaining Engine
 * 100% In-Device File Handoff (Memory + IndexedDB Fallback)
 *
 * Privacy Invariant: Files never leave the browser sandbox.
 * Zero telemetry, zero external network calls.
 */

import { getToolUrl, getToolBySlug } from "@/lib/registry/tools";

export let ENABLE_TOOL_CHAINING = true;
export function _setEnableToolChaining(val: boolean) {
  ENABLE_TOOL_CHAINING = val;
}

const DB_NAME = "cleartrix_file_chains_v1";
const STORE_NAME = "handoffs";
export const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes TTL

export interface HandoffFile {
  id: string;
  name: string;
  type: string;
  size: number;
  buffer: Uint8Array;
  sourceToolSlug?: string;
  targetToolSlug: string;
  createdAt: number;
}

export interface ToolChainSuggestion {
  targetSlug: string;
  label: string;
  description: string;
  url: string;
}

export const TOOL_ACCEPTED_MIMES: Record<string, string[]> = {
  "pdf-merger": ["application/pdf"],
  "pdf-compressor": ["application/pdf"],
  "pdf-encryptor": ["application/pdf"],
  "pdf-page-rotator": ["application/pdf"],
  "pdf-to-png": ["application/pdf"],
  "image-converter": ["image/png", "image/jpeg", "image/webp", "image/bmp", "image/x-icon", "image/svg+xml"],
  "exif-stripper": ["image/png", "image/jpeg", "image/webp", "image/bmp", "image/x-icon", "image/svg+xml"],
  "image-watermarker": ["image/png", "image/jpeg", "image/webp", "image/bmp", "image/x-icon", "image/svg+xml"],
  "image-rotator-flipper": ["image/png", "image/jpeg", "image/webp", "image/bmp", "image/x-icon", "image/svg+xml"],
};

export function isMimeAccepted(targetToolSlug: string, mimeType: string): boolean {
  const accepted = TOOL_ACCEPTED_MIMES[targetToolSlug];
  if (!accepted) return true; // generic tools
  const normalizedMime = mimeType.toLowerCase();
  return accepted.some((m) => normalizedMime.startsWith(m.toLowerCase()) || m === normalizedMime);
}

// In-memory cache for ultra-fast single-page transitions
let inMemoryHandoff: HandoffFile | null = null;

/**
 * Open client-side IndexedDB store safely with private-mode fallback
 */
function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "targetToolSlug" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        // Fallback gracefully if IndexedDB is blocked
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Helper to normalize raw data input to Uint8Array
 */
async function toUint8Array(data: Uint8Array | ArrayBuffer | Blob): Promise<Uint8Array> {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  if (data instanceof Blob) {
    const ab = await data.arrayBuffer();
    return new Uint8Array(ab);
  }
  throw new Error("Unsupported data format for file handoff");
}

/**
 * Save a file to pass to the next tool in the chain
 */
export async function saveHandoff(
  file: {
    name: string;
    type: string;
    data: Uint8Array | ArrayBuffer | Blob;
    sourceToolSlug?: string;
  },
  targetToolSlug: string
): Promise<HandoffFile> {
  if (!ENABLE_TOOL_CHAINING) {
    throw new Error("Tool chaining is currently disabled via feature flag");
  }

  if (!isMimeAccepted(targetToolSlug, file.type)) {
    throw new Error(
      `Incompatible handoff: Tool "${targetToolSlug}" cannot accept file type "${file.type}"`
    );
  }

  const buffer = await toUint8Array(file.data);

  const payload: HandoffFile = {
    id: `chain_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: buffer.length,
    buffer,
    sourceToolSlug: file.sourceToolSlug,
    targetToolSlug,
    createdAt: Date.now(),
  };

  // 1. Cache in memory
  inMemoryHandoff = payload;

  // 2. Persist in IndexedDB for survival across full navigations
  try {
    const db = await openIndexedDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(payload);
    }
  } catch (err) {
    // Non-fatal: memory cache still available
    console.warn("[ToolChain] IndexedDB save fallback to memory", err);
  }

  return payload;
}

/**
 * Retrieve a pending handoff file for a tool
 */
export async function getHandoff(targetToolSlug: string): Promise<HandoffFile | null> {
  if (!ENABLE_TOOL_CHAINING) return null;
  const now = Date.now();

  // 1. Check in-memory cache first
  if (inMemoryHandoff && inMemoryHandoff.targetToolSlug === targetToolSlug) {
    if (!isMimeAccepted(targetToolSlug, inMemoryHandoff.type)) {
      return null;
    }
    if (now - inMemoryHandoff.createdAt < EXPIRY_MS) {
      return inMemoryHandoff;
    }
    // Expired
    inMemoryHandoff = null;
  }

  // 2. Check IndexedDB
  try {
    const db = await openIndexedDB();
    if (!db) return null;

    return await new Promise<HandoffFile | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(targetToolSlug);

      req.onsuccess = () => {
        const result = req.result as HandoffFile | undefined;
        if (!result) {
          resolve(null);
          return;
        }

        if (!isMimeAccepted(targetToolSlug, result.type)) {
          clearHandoff(targetToolSlug);
          resolve(null);
          return;
        }

        if (now - result.createdAt > EXPIRY_MS) {
          // Expired, delete asynchronously
          clearHandoff(targetToolSlug);
          resolve(null);
          return;
        }

        // Cache in memory for subsequent quick queries
        inMemoryHandoff = result;
        resolve(result);
      };

      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn("[ToolChain] IndexedDB read error", err);
    return null;
  }
}

/**
 * Clear a handoff file (e.g. user clicked "Clear files" or file was consumed)
 */
export async function clearHandoff(targetToolSlug?: string): Promise<void> {
  if (!targetToolSlug || inMemoryHandoff?.targetToolSlug === targetToolSlug) {
    inMemoryHandoff = null;
  }

  try {
    const db = await openIndexedDB();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    if (targetToolSlug) {
      store.delete(targetToolSlug);
    } else {
      store.clear();
    }
  } catch (err) {
    console.warn("[ToolChain] IndexedDB delete error", err);
  }
}

/**
 * Suggestions for chaining after a tool finishes processing
 */
export const CHAIN_GRAPH: Record<string, Array<{ targetSlug: string; label: string; description: string }>> = {
  "pdf-merger": [
    {
      targetSlug: "pdf-compressor",
      label: "Compress Merged PDF",
      description: "Optimize & reduce file size instantly",
    },
    {
      targetSlug: "pdf-encryptor",
      label: "Protect with Password",
      description: "Secure the merged document with AES-256",
    },
    {
      targetSlug: "pdf-page-rotator",
      label: "Rotate Pages",
      description: "Fix orientation of merged pages",
    },
  ],
  "pdf-compressor": [
    {
      targetSlug: "pdf-merger",
      label: "Merge with Other PDFs",
      description: "Combine compressed document into a batch",
    },
    {
      targetSlug: "pdf-encryptor",
      label: "Protect with Password",
      description: "Add password security to the optimized PDF",
    },
    {
      targetSlug: "pdf-to-png",
      label: "Convert to PNG Images",
      description: "Export high-resolution raster images",
    },
  ],
  "image-converter": [
    {
      targetSlug: "exif-stripper",
      label: "Strip EXIF Privacy Data",
      description: "Wipe camera, GPS, and device metadata",
    },
    {
      targetSlug: "image-watermarker",
      label: "Watermark Image",
      description: "Overlay copyright text or branding logo",
    },
    {
      targetSlug: "image-rotator-flipper",
      label: "Rotate or Flip Image",
      description: "Quick 90° rotation or horizontal flip",
    },
  ],
};

/**
 * Get intelligent chain suggestions for a source tool
 */
export function getChainSuggestions(sourceToolSlug: string): ToolChainSuggestion[] {
  if (!ENABLE_TOOL_CHAINING) return [];
  const suggestions = CHAIN_GRAPH[sourceToolSlug] || [];
  return suggestions.map((s) => ({
    targetSlug: s.targetSlug,
    label: s.label,
    description: s.description,
    url: getToolUrl(s.targetSlug),
  }));
}

/**
 * Helper to convert HandoffFile buffer back into a browser File object
 */
export function handoffToFile(handoff: HandoffFile): File {
  const blob = new Blob([handoff.buffer as unknown as BlobPart], { type: handoff.type });
  return new File([blob], handoff.name, {
    type: handoff.type,
    lastModified: handoff.createdAt,
  });
}

export function _testSetHandoff(handoff: HandoffFile | null) {
  inMemoryHandoff = handoff;
}
