import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  extractTextBlocksFromPdf,
  createDocxFromBlocks,
  convertPdfToDocx,
  SAMPLE_PDF_PARAGRAPHS,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: createDocxFromBlocks produces valid DOCX (OpenXML ZIP signature PK)
  const docxBytes = await createDocxFromBlocks(SAMPLE_PDF_PARAGRAPHS, {
    title: "Mindkit Spec",
    fontFamily: "Calibri",
  });

  if (!docxBytes || docxBytes.length === 0) {
    throw new Error("createDocxFromBlocks returned empty Uint8Array");
  }
  // Check ZIP signature: PK\x03\x04
  if (docxBytes[0] !== 0x50 || docxBytes[1] !== 0x4b) {
    throw new Error("Generated DOCX does not have valid ZIP / OpenXML header signature (PK)");
  }

  // Test 2: Generate a small vector PDF and extract text blocks
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([600, 400]);

  page.drawText("EXECUTIVE REPORT", { x: 50, y: 350, size: 20, font });
  page.drawText("This is an in-browser PDF test document.", { x: 50, y: 300, size: 12, font });

  const pdfBytes = await pdfDoc.save();

  // Test 3: extractTextBlocksFromPdf
  const blocks = await extractTextBlocksFromPdf(pdfBytes);
  if (blocks.length < 2) {
    throw new Error(`Expected at least 2 text blocks from PDF, got ${blocks.length}`);
  }
  if (!blocks.some((b) => b.text.includes("EXECUTIVE REPORT"))) {
    throw new Error("Could not find 'EXECUTIVE REPORT' in extracted PDF text");
  }

  // Test 4: End-to-end convertPdfToDocx
  const result = await convertPdfToDocx(pdfBytes, { title: "Converted Document" });
  if (!result.docxBytes || result.docxBytes.length === 0) {
    throw new Error("convertPdfToDocx returned empty DOCX buffer");
  }

  return true;
}
