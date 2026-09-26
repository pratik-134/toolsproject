/**
 * Batch Image Compressor — Pure Math, Downscaling & ZIP Packaging Logic
 */

export interface BatchItemStats {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  percentage: number;
}

export interface BatchSummary {
  totalCount: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavedBytes: number;
  overallPercentage: number;
}

/**
 * Calculate saved bytes and percentage reduction
 */
export function calculateSavings(
  origSize: number,
  newSize: number
): { savedBytes: number; percentage: number } {
  if (origSize <= 0) return { savedBytes: 0, percentage: 0 };
  const saved = origSize - newSize;
  const pct = Math.round((saved / origSize) * 100);
  return {
    savedBytes: saved,
    percentage: pct,
  };
}

/**
 * Downscale dimensions proportionally if width or height exceeds maxDimension
 */
export function calculateDownscale(
  origW: number,
  origH: number,
  maxDimension: number
): { width: number; height: number } {
  if (origW <= 0 || origH <= 0) return { width: 1, height: 1 };
  if (maxDimension <= 0 || (origW <= maxDimension && origH <= maxDimension)) {
    return { width: origW, height: origH };
  }

  if (origW >= origH) {
    const w = maxDimension;
    const h = Math.max(1, Math.round((origH * maxDimension) / origW));
    return { width: w, height: h };
  } else {
    const h = maxDimension;
    const w = Math.max(1, Math.round((origW * maxDimension) / origH));
    return { width: w, height: h };
  }
}

/**
 * Aggregate summary metrics across all processed items
 */
export function aggregateBatchStats(
  items: Array<{ originalSize: number; compressedSize: number }>
): BatchSummary {
  if (items.length === 0) {
    return {
      totalCount: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalSavedBytes: 0,
      overallPercentage: 0,
    };
  }

  let totalOrig = 0;
  let totalComp = 0;

  for (const item of items) {
    totalOrig += Math.max(0, item.originalSize);
    totalComp += Math.max(0, item.compressedSize);
  }

  const saved = totalOrig - totalComp;
  const pct = totalOrig > 0 ? Math.round((saved / totalOrig) * 100) : 0;

  return {
    totalCount: items.length,
    totalOriginalSize: totalOrig,
    totalCompressedSize: totalComp,
    totalSavedBytes: saved,
    overallPercentage: pct,
  };
}

/**
 * CRC-32 table implementation for pure client-side ZIP packaging
 */
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c;
}

export function computeCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i] ?? 0;
    const tableVal = CRC_TABLE[(crc ^ byte) & 0xff] ?? 0;
    crc = tableVal ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Pure In-Browser Client-Side ZIP Generator
 * Stores uncompressed / already-compressed images cleanly inside standard ZIP container
 * without external libraries or dependencies.
 */
export function createZipArchive(
  files: Array<{ name: string; data: Uint8Array }>
): Uint8Array {
  const encoder = new TextEncoder();
  const fileEntries: Array<{
    nameBytes: Uint8Array;
    crc: number;
    size: number;
    offset: number;
  }> = [];

  let localParts: Uint8Array[] = [];
  let currentOffset = 0;

  // 1. Write Local File Headers and Data
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = computeCrc32(file.data);
    const size = file.data.length;

    // Local file header: 30 bytes + name length
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature (PK\x03\x04)
    view.setUint16(4, 20, true); // Version needed (2.0)
    view.setUint16(6, 0, true); // General purpose bit flag
    view.setUint16(8, 0, true); // Compression method (0 = stored)
    view.setUint16(10, 0, true); // File mod time
    view.setUint16(12, 0, true); // File mod date
    view.setUint32(14, crc, true); // CRC-32
    view.setUint32(18, size, true); // Compressed size
    view.setUint32(22, size, true); // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // File name length
    view.setUint16(28, 0, true); // Extra field length
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader);
    localParts.push(file.data);

    fileEntries.push({
      nameBytes,
      crc,
      size,
      offset: currentOffset,
    });

    currentOffset += localHeader.length + file.data.length;
  }

  // 2. Central Directory
  const centralDirOffset = currentOffset;
  let centralDirParts: Uint8Array[] = [];

  for (const entry of fileEntries) {
    // Central directory file header: 46 bytes + name length
    const cdHeader = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(cdHeader.buffer);

    view.setUint32(0, 0x02014b50, true); // Central directory header signature (PK\x01\x02)
    view.setUint16(4, 20, true); // Version made by
    view.setUint16(6, 20, true); // Version needed
    view.setUint16(8, 0, true); // Flags
    view.setUint16(10, 0, true); // Compression (0)
    view.setUint16(12, 0, true); // Time
    view.setUint16(14, 0, true); // Date
    view.setUint32(16, entry.crc, true); // CRC-32
    view.setUint32(20, entry.size, true); // Compressed size
    view.setUint32(24, entry.size, true); // Uncompressed size
    view.setUint16(28, entry.nameBytes.length, true); // Name length
    view.setUint16(30, 0, true); // Extra field length
    view.setUint16(32, 0, true); // File comment length
    view.setUint16(34, 0, true); // Disk number
    view.setUint16(36, 0, true); // Internal attributes
    view.setUint32(38, 0, true); // External attributes
    view.setUint32(42, entry.offset, true); // Relative offset of local header
    cdHeader.set(entry.nameBytes, 46);

    centralDirParts.push(cdHeader);
    currentOffset += cdHeader.length;
  }

  const centralDirSize = currentOffset - centralDirOffset;

  // 3. End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature (PK\x05\x06)
  eocdView.setUint16(4, 0, true); // Disk number
  eocdView.setUint16(6, 0, true); // Start disk
  eocdView.setUint16(8, fileEntries.length, true); // Total entries on this disk
  eocdView.setUint16(10, fileEntries.length, true); // Total entries
  eocdView.setUint32(12, centralDirSize, true); // Size of central directory
  eocdView.setUint32(16, centralDirOffset, true); // Offset of central directory
  eocdView.setUint16(20, 0, true); // Comment length

  // 4. Combine all parts into single Uint8Array
  const totalLength = currentOffset + eocd.length;
  const result = new Uint8Array(totalLength);
  let pos = 0;

  for (const part of [...localParts, ...centralDirParts, eocd]) {
    result.set(part, pos);
    pos += part.length;
  }

  return result;
}
