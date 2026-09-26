/**
 * In-Browser PDF Annotator — Pure TypeScript Vector Logic
 * Uses pdf-lib to bake highlights, text stamps, notes, and bounding shapes into PDF pages.
 * 100% In-Browser Execution.
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface PdfAnnotation {
  id: string;
  type: "highlight" | "stamp" | "note" | "rect";
  pageIndex: number; // 0-indexed
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string; // hex
  text?: string;
  opacity?: number;
}

export const ANNOTATION_PRESETS: Record<string, Omit<PdfAnnotation, "id" | "pageIndex">> = {
  approved_stamp: {
    type: "stamp",
    x: 400,
    y: 680,
    width: 140,
    height: 40,
    color: "#16a34a",
    text: "APPROVED",
    opacity: 0.85,
  },
  confidential_stamp: {
    type: "stamp",
    x: 380,
    y: 720,
    width: 160,
    height: 36,
    color: "#dc2626",
    text: "CONFIDENTIAL",
    opacity: 0.85,
  },
  yellow_highlight: {
    type: "highlight",
    x: 50,
    y: 650,
    width: 320,
    height: 20,
    color: "#fde047",
    opacity: 0.45,
  },
  review_note: {
    type: "note",
    x: 50,
    y: 500,
    width: 200,
    height: 60,
    color: "#3b82f6",
    text: "Review required by Legal",
    opacity: 0.9,
  },
};

/**
 * Parse hex color to pdf-lib rgb tuple
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return { r, g, b };
  }
  return { r: 0.2, g: 0.4, b: 0.8 };
}

/**
 * Creates a clean demo agreement PDF for testing and immediate sandbox usage
 */
export async function createDemoPdf(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("SERVICE LEVEL & CONSULTING AGREEMENT", {
    x: 50,
    y: 730,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  page.drawText("1. OBLIGATIONS & ARCHITECTURAL DELIVERABLES", {
    x: 50,
    y: 680,
    size: 12,
    font: fontBold,
    color: rgb(0.15, 0.2, 0.3),
  });

  const bodyLines = [
    "The Service Provider agrees to architect, build, and verify 100+ browser-based tools.",
    "All tools must execute strictly within client-side WebAssembly and Worker environments.",
    "Zero user confidential documents or credentials shall ever be sent to remote servers.",
    "",
    "2. ACCEPTANCE CRITERIA & TIMELINE",
    "• Parity between Vector PDF, native Microsoft Word (.docx), and Rich Text (.rtf).",
    "• 100% automated test coverage across schema, typecheck, and privacy scanners.",
    "• Formal sign-off upon completing Phase 2 milestones.",
  ];

  let y = 650;
  for (const line of bodyLines) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.35),
    });
    y -= 22;
  }

  return pdfDoc.save();
}

/**
 * Apply vector annotations to a PDF document
 */
export async function applyPdfAnnotations(
  pdfBytes: Uint8Array,
  annotations: PdfAnnotation[]
): Promise<Uint8Array> {
  if (!pdfBytes || pdfBytes.length === 0) {
    throw new Error("No PDF data provided.");
  }

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const ann of annotations) {
    if (ann.pageIndex < 0 || ann.pageIndex >= pages.length) continue;
    const page = pages[ann.pageIndex];
    if (!page) continue;

    const { r, g, b } = hexToRgb(ann.color || "#fde047");
    const alpha = ann.opacity ?? (ann.type === "highlight" ? 0.4 : 0.85);

    switch (ann.type) {
      case "highlight":
        // Semi-transparent highlight box
        page.drawRectangle({
          x: ann.x,
          y: ann.y,
          width: ann.width,
          height: ann.height,
          color: rgb(r, g, b),
          opacity: alpha,
        });
        break;

      case "stamp":
        // Outer bordered badge box
        page.drawRectangle({
          x: ann.x,
          y: ann.y,
          width: ann.width,
          height: ann.height,
          borderColor: rgb(r, g, b),
          borderWidth: 2,
          color: rgb(r, g, b),
          opacity: 0.12,
        });

        if (ann.text) {
          const fontSize = 14;
          const textWidth = fontBold.widthOfTextAtSize(ann.text, fontSize);
          const textX = ann.x + (ann.width - textWidth) / 2;
          const textY = ann.y + (ann.height - fontSize) / 2 + 2;

          page.drawText(ann.text, {
            x: textX,
            y: textY,
            size: fontSize,
            font: fontBold,
            color: rgb(r, g, b),
            opacity: alpha,
          });
        }
        break;

      case "note":
        // Note container box
        page.drawRectangle({
          x: ann.x,
          y: ann.y,
          width: ann.width,
          height: ann.height,
          color: rgb(0.98, 0.98, 0.95),
          borderColor: rgb(r, g, b),
          borderWidth: 1.5,
          opacity: 0.95,
        });

        // Note header bar
        page.drawRectangle({
          x: ann.x,
          y: ann.y + ann.height - 14,
          width: ann.width,
          height: 14,
          color: rgb(r, g, b),
          opacity: 0.85,
        });

        page.drawText("NOTE", {
          x: ann.x + 6,
          y: ann.y + ann.height - 11,
          size: 8,
          font: fontBold,
          color: rgb(1, 1, 1),
        });

        if (ann.text) {
          page.drawText(ann.text, {
            x: ann.x + 8,
            y: ann.y + ann.height - 30,
            size: 9,
            font: fontRegular,
            color: rgb(0.15, 0.2, 0.25),
          });
        }
        break;

      case "rect":
      default:
        page.drawRectangle({
          x: ann.x,
          y: ann.y,
          width: ann.width,
          height: ann.height,
          borderColor: rgb(r, g, b),
          borderWidth: 2,
          opacity: alpha,
        });
        break;
    }
  }

  return pdfDoc.save();
}
