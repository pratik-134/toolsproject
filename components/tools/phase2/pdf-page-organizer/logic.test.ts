import {
  createSampleOrganizerPdf,
  organizePdfPages,
} from "./logic";
import { PDFDocument } from "pdf-lib";

export async function runTests(): Promise<boolean> {
  // Test 1: Sample PDF has 4 pages
  const sample = await createSampleOrganizerPdf(4);
  const doc = await PDFDocument.load(sample);
  if (doc.getPageCount() !== 4) {
    throw new Error(`Expected sample to have 4 pages, got ${doc.getPageCount()}`);
  }

  // Test 2: Reorder to [3, 1, 0] (Delete page 2, reverse page 4 to first)
  const organized = await organizePdfPages(sample, [3, 1, 0]);
  const organizedDoc = await PDFDocument.load(organized);
  if (organizedDoc.getPageCount() !== 3) {
    throw new Error(`Expected 3 pages after reorder, got ${organizedDoc.getPageCount()}`);
  }

  // Test 3: Duplication [0, 0, 1]
  const duplicated = await organizePdfPages(sample, [0, 0, 1]);
  const dupDoc = await PDFDocument.load(duplicated);
  if (dupDoc.getPageCount() !== 3) {
    throw new Error(`Expected 3 pages after duplication, got ${dupDoc.getPageCount()}`);
  }

  // Test 4: Empty page order throws error
  let threw = false;
  try {
    await organizePdfPages(sample, []);
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected organizePdfPages to throw on empty order.");
  }

  return true;
}
