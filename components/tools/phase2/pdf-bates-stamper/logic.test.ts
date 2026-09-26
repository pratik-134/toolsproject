import {
  formatBatesNumber,
  createSampleStampPdf,
  stampPdf,
} from "./logic";
import { PDFDocument } from "pdf-lib";

export async function runTests(): Promise<boolean> {
  // Test 1: formatBatesNumber
  const text1 = formatBatesNumber(0, 10, {
    prefix: "CASE-",
    startNumber: 1,
    digits: 4,
    suffix: "-EX",
  });
  if (text1 !== "CASE-0001-EX") {
    throw new Error(`Expected CASE-0001-EX, got ${text1}`);
  }

  const text2 = formatBatesNumber(4, 10, {
    prefix: "CONFIDENTIAL-",
    startNumber: 100,
    digits: 6,
    includeTotalPages: true,
  });
  if (text2 !== "CONFIDENTIAL-000104 (Page 5 of 10)") {
    throw new Error(`Expected CONFIDENTIAL-000104 (Page 5 of 10), got ${text2}`);
  }

  // Test 2: In-memory sample PDF stamping
  const sample = await createSampleStampPdf(3);
  const stampedBytes = await stampPdf(sample, {
    prefix: "DOC-",
    digits: 5,
    position: "bottom-right",
    color: "red",
  });

  if (!stampedBytes || stampedBytes.length === 0) {
    throw new Error("Stamped PDF is empty.");
  }

  const doc = await PDFDocument.load(stampedBytes);
  if (doc.getPageCount() !== 3) {
    throw new Error(`Expected 3 pages, got ${doc.getPageCount()}`);
  }

  // Test 3: Stamping empty throws
  let threw = false;
  try {
    await stampPdf(new Uint8Array(0));
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected stampPdf to throw on empty buffer.");
  }

  return true;
}
