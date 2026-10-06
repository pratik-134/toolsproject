import { PDFDocument } from "pdf-lib";
import {
  extractStructuredBlocks,
  convertBlocksToPdf,
  SAMPLE_DOCX_MARKDOWN,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: extractStructuredBlocks
  const rawText = `# Main Heading\n## Section 1\nThis is a standard paragraph.\n• First bullet\n• Second bullet`;
  const blocks = extractStructuredBlocks(rawText);

  if (blocks.length !== 5) {
    throw new Error(`Expected 5 structured blocks, got ${blocks.length}`);
  }
  if (blocks[0]?.type !== "heading1" || blocks[0]?.text !== "Main Heading") {
    throw new Error(`First block mismatch: ${JSON.stringify(blocks[0])}`);
  }
  if (blocks[1]?.type !== "heading2" || blocks[1]?.text !== "Section 1") {
    throw new Error(`Second block mismatch: ${JSON.stringify(blocks[1])}`);
  }
  if (blocks[3]?.type !== "bullet" || blocks[3]?.text !== "First bullet") {
    throw new Error(`Bullet block mismatch: ${JSON.stringify(blocks[3])}`);
  }

  // Test 2: convertBlocksToPdf
  const sampleBlocks = extractStructuredBlocks(SAMPLE_DOCX_MARKDOWN);
  const pdfBytes = await convertBlocksToPdf(sampleBlocks, {
    pageSize: "letter",
    fontSize: 11,
    lineHeight: 1.4,
    headerTitle: "Qwertygen Document Conversion",
    includePageNumbers: true,
    accentColorHex: "2563EB",
  });

  if (!pdfBytes || pdfBytes.length === 0) {
    throw new Error("convertBlocksToPdf returned empty Uint8Array");
  }

  // Verify valid PDF structure
  const pdfDoc = await PDFDocument.load(pdfBytes);
  if (pdfDoc.getPageCount() < 1) {
    throw new Error("Generated PDF has 0 pages");
  }

  return true;
}
