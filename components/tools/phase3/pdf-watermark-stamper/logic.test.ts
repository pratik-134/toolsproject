/**
 * Unit Tests for PDF Watermark & Page Stamp Studio
 */

import { PDFDocument } from "pdf-lib";
import { applyWatermarkToPdf } from "./logic";

export async function runPdfWatermarkTests(): Promise<boolean> {
  console.log("Testing [pdf-watermark-stamper] logic...");

  // 1. Create a dummy 2-page PDF
  const testDoc = await PDFDocument.create();
  testDoc.addPage([595, 842]); // A4 Page 1
  testDoc.addPage([595, 842]); // A4 Page 2
  const initialBytes = await testDoc.save();

  // 2. Apply watermark across all pages
  const stampedBytes = await applyWatermarkToPdf(initialBytes, {
    text: "CONFIDENTIAL",
    fontSize: 48,
    opacity: 0.25,
    rotationAngle: 45,
    color: [0.8, 0.2, 0.2],
    pageRange: "all",
  });

  if (!stampedBytes || stampedBytes.length <= initialBytes.length) {
    throw new Error(`applyWatermarkToPdf failed to output valid stamped PDF bytes`);
  }

  // 3. Verify output is still valid parsable PDF document
  const reloaded = await PDFDocument.load(stampedBytes);
  if (reloaded.getPageCount() !== 2) {
    throw new Error(`applyWatermarkToPdf corrupted page count`);
  }

  console.log("✅ [pdf-watermark-stamper] unit tests passed!");
  return true;
}
