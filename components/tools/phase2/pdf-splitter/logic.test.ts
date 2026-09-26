import {
  parsePageRanges,
  createSampleSplitPdf,
  extractPdfPages,
  burstPdfPages,
} from "./logic";
import { PDFDocument } from "pdf-lib";

export async function runTests(): Promise<boolean> {
  // Test 1: parsePageRanges
  const ranges = parsePageRanges("1-3, 5, 2, 8-10", 7);
  // Total pages = 7. 8-10 are out of range. 1-3 -> 0,1,2. 5 -> 4. 2 is duplicate.
  // Result should be [0, 1, 2, 4]
  if (
    ranges.length !== 4 ||
    ranges[0] !== 0 ||
    ranges[1] !== 1 ||
    ranges[2] !== 2 ||
    ranges[3] !== 4
  ) {
    throw new Error(`parsePageRanges failed: got ${JSON.stringify(ranges)}`);
  }

  // Test 2: Sample PDF creation & page extraction
  const samplePdf = await createSampleSplitPdf(5);
  const extractedBytes = await extractPdfPages(samplePdf, [1, 3]); // pages 2 and 4 (0-indexed 1 and 3)

  const extractedDoc = await PDFDocument.load(extractedBytes);
  if (extractedDoc.getPageCount() !== 2) {
    throw new Error(
      `Expected extracted doc to have 2 pages, got ${extractedDoc.getPageCount()}`
    );
  }

  // Test 3: Burst PDF
  const burstResults = await burstPdfPages(samplePdf);
  if (burstResults.length !== 5) {
    throw new Error(`Expected 5 burst pages, got ${burstResults.length}`);
  }
  for (const page of burstResults) {
    const pageDoc = await PDFDocument.load(page.buffer);
    if (pageDoc.getPageCount() !== 1) {
      throw new Error(`Burst page ${page.pageNumber} has invalid page count`);
    }
  }

  return true;
}
