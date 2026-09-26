import { zipSync, strToU8, AsyncZipOptions } from "fflate";

export type CompressionLevel = 0 | 1 | 6 | 9;

export interface FileItem {
  id: string;
  path: string;
  data: Uint8Array;
  size: number;
}

export interface PackOptions {
  level?: CompressionLevel;
  comment?: string;
}

export interface PackResult {
  zipData: Uint8Array;
  uncompressedSize: number;
  compressedSize: number;
  savingsPercent: number;
  fileCount: number;
}

export function createFileItem(path: string, content: string | Uint8Array): FileItem {
  const cleanPath = path.trim().replace(/^\/+/, "");
  const data = typeof content === "string" ? strToU8(content) : content;
  return {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    path: cleanPath,
    data,
    size: data.length,
  };
}

export function packZipArchive(files: FileItem[], options: PackOptions = {}): PackResult {
  const level = options.level ?? 6;
  const zipInput: Record<string, [Uint8Array, AsyncZipOptions]> = {};

  let uncompressedSize = 0;

  for (const f of files) {
    if (!f.path) continue;
    uncompressedSize += f.data.length;
    zipInput[f.path] = [f.data, { level }];
  }

  // Generate ZIP synchronously
  const zipData = zipSync(zipInput);
  const compressedSize = zipData.length;
  const savingsPercent =
    uncompressedSize > 0
      ? Math.max(0, Math.round(((uncompressedSize - compressedSize) / uncompressedSize) * 100))
      : 0;

  return {
    zipData,
    uncompressedSize,
    compressedSize,
    savingsPercent,
    fileCount: files.length,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
