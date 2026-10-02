/**
 * Client-Side In-Device Batch Processing & Worker Pool Engine
 *
 * Privacy Invariant: 100% Client-Side. Zero Server Uploads.
 * Concurrency: 2–4 workers with per-file progress and error boundaries.
 */

import JSZip from "jszip";

export type BatchItemStatus = "idle" | "processing" | "done" | "error";

export interface BatchItem<TOutput = any> {
  id: string;
  file: File;
  name: string;
  size: number;
  status: BatchItemStatus;
  progress: number;
  result?: TOutput;
  error?: string;
}

export interface BatchPoolOptions<TInput, TOutput> {
  concurrency?: number; // Default: 3 (balanced for mobile & desktop memory)
  onItemStart?: (item: TInput, index: number) => void;
  onItemProgress?: (item: TInput, index: number, progress: number) => void;
  onItemComplete?: (item: TInput, index: number, result: TOutput) => void;
  onItemError?: (item: TInput, index: number, error: Error) => void;
}

/**
 * Executes an array of items across a concurrency-controlled worker pool
 */
export async function runBatchPool<TInput, TOutput>(
  items: TInput[],
  taskFn: (item: TInput, onProgress: (pct: number) => void) => Promise<TOutput>,
  options: BatchPoolOptions<TInput, TOutput> = {}
): Promise<Array<{ item: TInput; success: boolean; result?: TOutput; error?: Error }>> {
  const concurrency = Math.max(1, Math.min(4, options.concurrency ?? 3));
  const results: Array<{ item: TInput; success: boolean; result?: TOutput; error?: Error }> = new Array(
    items.length
  );

  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      const item = items[currentIndex];
      if (item === undefined) continue;

      try {
        options.onItemStart?.(item, currentIndex);

        const onProgress = (pct: number) => {
          options.onItemProgress?.(item, currentIndex, Math.min(100, Math.max(0, pct)));
        };

        const result = await taskFn(item, onProgress);
        results[currentIndex] = { item, success: true, result };
        options.onItemComplete?.(item, currentIndex, result);
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error(String(err));
        results[currentIndex] = { item, success: false, error };
        options.onItemError?.(item, currentIndex, error);
      }
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  return results;
}

/**
 * Creates a self-hosted client-side ZIP archive containing the provided files
 */
export async function createZipBlob(
  files: Array<{ name: string; data: Uint8Array | Blob | ArrayBuffer }>
): Promise<Blob> {
  const zip = new JSZip();

  for (const f of files) {
    zip.file(f.name, f.data);
  }

  return await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });
}

/**
 * Triggers an instant client-side download for a given Blob
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
