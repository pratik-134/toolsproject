import { createSamplePdf, getPdfPageCount, mergePdfs } from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: Sample PDF creation and page count inspection
  const doc1 = await createSamplePdf("Document Alpha", 2);
  const doc2 = await createSamplePdf("Document Beta", 3);

  const count1 = await getPdfPageCount(doc1);
  if (count1 !== 2) {
    throw new Error(`Expected doc1 to have 2 pages, got ${count1}`);
  }

  const count2 = await getPdfPageCount(doc2);
  if (count2 !== 3) {
    throw new Error(`Expected doc2 to have 3 pages, got ${count2}`);
  }

  // Test 2: Merging two documents
  const mergedBytes = await mergePdfs([doc1, doc2]);
  if (!mergedBytes || mergedBytes.length === 0) {
    throw new Error("Merged PDF output is empty.");
  }

  const mergedCount = await getPdfPageCount(mergedBytes);
  if (mergedCount !== 5) {
    throw new Error(`Expected merged PDF to have 5 pages, got ${mergedCount}`);
  }

  // Test 3: Merging empty list should throw
  let threw = false;
  try {
    await mergePdfs([]);
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected mergePdfs([]) to throw error.");
  }

  return true;
}
