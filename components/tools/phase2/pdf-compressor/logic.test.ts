import { createSampleCompressPdf, compressPdf } from "./logic";
import { PDFDocument } from "pdf-lib";

export async function runTests(): Promise<boolean> {
  // Test 1: Sample uncompressed PDF creation
  const sample = await createSampleCompressPdf();
  if (!sample || sample.length === 0) {
    throw new Error("Sample PDF creation failed.");
  }

  // Test 2: Compression of sample
  const result = await compressPdf(sample, {
    stripMetadata: true,
    useObjectStreams: true,
  });

  if (!result.data || result.data.length === 0) {
    throw new Error("Compressed data is empty.");
  }

  // Verify the compressed document is a valid readable PDF
  const testDoc = await PDFDocument.load(result.data);
  if (testDoc.getPageCount() !== 3) {
    throw new Error(`Expected 3 pages in compressed PDF, got ${testDoc.getPageCount()}`);
  }

  // Check savings metrics
  if (typeof result.originalSize !== "number" || typeof result.compressedSize !== "number") {
    throw new Error("Invalid size metrics returned.");
  }

  // Test 3: Empty buffer throws
  let threw = false;
  try {
    await compressPdf(new Uint8Array(0));
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected compressPdf to throw on empty buffer.");
  }

  return true;
}
