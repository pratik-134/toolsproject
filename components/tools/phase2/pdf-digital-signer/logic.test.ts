import {
  MINIMAL_PNG_BYTES,
  createSampleSignablePdf,
  signPdf,
} from "./logic";
import { PDFDocument } from "pdf-lib";

export async function runTests(): Promise<boolean> {
  // Test 1: Sign sample PDF with minimal valid PNG
  const sample = await createSampleSignablePdf();
  const signed = await signPdf(sample, {
    signaturePngBytes: MINIMAL_PNG_BYTES,
    signerName: "Dr. Evelyn Reed",
    signerTitle: "Principal Investigator",
    dateString: "2026-09-25",
    pageIndex: 0,
    x: 60,
    y: 100,
    width: 140,
    height: 45,
  });

  if (!signed || signed.length === 0) {
    throw new Error("Signed PDF bytes are empty.");
  }

  const doc = await PDFDocument.load(signed);
  if (doc.getPageCount() !== 1) {
    throw new Error(`Expected 1 page in signed PDF, got ${doc.getPageCount()}`);
  }

  // Test 2: Missing signature bytes throws
  let threw = false;
  try {
    await signPdf(sample, {
      signaturePngBytes: new Uint8Array(0),
    });
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error("Expected signPdf to throw on empty signature bytes.");
  }

  return true;
}
