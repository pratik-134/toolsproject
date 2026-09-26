import { PDFDocument } from "pdf-lib";
import {
  applyPdfAnnotations,
  createDemoPdf,
  hexToRgb,
  ANNOTATION_PRESETS,
  PdfAnnotation,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: Color helper
  const rgbBlue = hexToRgb("#3b82f6");
  if (rgbBlue.r < 0.2 || rgbBlue.b < 0.9) {
    throw new Error("hexToRgb failed on #3b82f6");
  }

  // Test 2: Create demo PDF
  const demoPdfBytes = await createDemoPdf();
  if (!demoPdfBytes || demoPdfBytes.length === 0) {
    throw new Error("Failed to create demo PDF bytes");
  }

  // Test 3: Apply multiple annotation types
  const annotations: PdfAnnotation[] = [
    {
      id: "1",
      type: "highlight",
      pageIndex: 0,
      x: 50,
      y: 650,
      width: 250,
      height: 20,
      color: "#fde047",
    },
    {
      id: "2",
      type: "stamp",
      pageIndex: 0,
      x: 400,
      y: 700,
      width: 120,
      height: 35,
      color: "#16a34a",
      text: "APPROVED",
    },
    {
      id: "3",
      type: "note",
      pageIndex: 0,
      x: 60,
      y: 400,
      width: 180,
      height: 50,
      color: "#3b82f6",
      text: "Legal clause verified.",
    },
  ];

  const annotatedBytes = await applyPdfAnnotations(demoPdfBytes, annotations);

  if (!annotatedBytes || annotatedBytes.length === 0) {
    throw new Error("applyPdfAnnotations returned empty buffer");
  }

  // Verify resulting document is valid PDF
  const loadedDoc = await PDFDocument.load(annotatedBytes);
  if (loadedDoc.getPageCount() !== 1) {
    throw new Error("Annotated PDF page count mismatch");
  }

  // Test 4: Presets
  if (Object.keys(ANNOTATION_PRESETS).length < 3) {
    throw new Error("Expected at least 3 annotation presets");
  }

  return true;
}
