/**
 * Unit Tests for Batch Image Compressor Logic
 */

import {
  calculateSavings,
  calculateDownscale,
  aggregateBatchStats,
  computeCrc32,
  createZipArchive,
} from "./logic";

export function runBatchImageCompressorTests() {
  // Test 1: calculateSavings
  const s1 = calculateSavings(1000, 250);
  if (s1.savedBytes !== 750 || s1.percentage !== 75) {
    throw new Error(`Savings error: got ${JSON.stringify(s1)}`);
  }

  const s2 = calculateSavings(500, 500);
  if (s2.savedBytes !== 0 || s2.percentage !== 0) {
    throw new Error(`Zero savings error: got ${JSON.stringify(s2)}`);
  }

  // Test 2: calculateDownscale
  const d1 = calculateDownscale(3840, 2160, 1920);
  if (d1.width !== 1920 || d1.height !== 1080) {
    throw new Error(`Downscale 4K to 1080p failed: got ${JSON.stringify(d1)}`);
  }

  const d2 = calculateDownscale(800, 600, 1920);
  if (d2.width !== 800 || d2.height !== 600) {
    throw new Error("Image smaller than max dimension should not be upscaled");
  }

  // Test 3: aggregateBatchStats
  const batch = aggregateBatchStats([
    { originalSize: 1000, compressedSize: 400 },
    { originalSize: 2000, compressedSize: 1000 },
    { originalSize: 3000, compressedSize: 1600 },
  ]);

  if (batch.totalCount !== 3) throw new Error("Batch count mismatch");
  if (batch.totalOriginalSize !== 6000) throw new Error("Total orig mismatch");
  if (batch.totalCompressedSize !== 3000) throw new Error("Total comp mismatch");
  if (batch.totalSavedBytes !== 3000) throw new Error("Total saved mismatch");
  if (batch.overallPercentage !== 50) throw new Error("Overall pct mismatch");

  // Test 4: computeCrc32
  const text = new TextEncoder().encode("Hello World");
  const crc = computeCrc32(text);
  if (typeof crc !== "number" || crc === 0) {
    throw new Error(`CRC-32 computation failed: ${crc}`);
  }

  // Test 5: createZipArchive
  const zip = createZipArchive([
    { name: "test1.jpg", data: new Uint8Array([1, 2, 3, 4]) },
    { name: "test2.webp", data: new Uint8Array([5, 6, 7, 8, 9]) },
  ]);

  // Check PK\x03\x04 signature at offset 0
  if (zip[0] !== 0x50 || zip[1] !== 0x4b || zip[2] !== 0x03 || zip[3] !== 0x04) {
    throw new Error("ZIP header signature missing");
  }

  // Check minimum ZIP length
  if (zip.length < 100) {
    throw new Error(`Generated ZIP is unexpectedly short: ${zip.length} bytes`);
  }

  return true;
}
