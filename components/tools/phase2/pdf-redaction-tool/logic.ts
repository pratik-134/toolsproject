/**
 * In-Browser PDF Redaction Tool — Pure Vector Logic
 * Uses pdf-lib to permanently bake opaque vector redaction boxes and labels into PDF pages.
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface RedactionBox {
  id: string;
  pageIndex: number; // 0-indexed
  x: number;
  y: number;
  width: number;
  height: number;
  color?: "black" | "white" | "dark";
  label?: string; // Optional label like "[REDACTED]"
}

export const REDACTION_PRESETS: Record<
  string,
  { name: string; box: Omit<RedactionBox, "id" | "pageIndex"> }
> = {
  ssn_box: {
    name: "Social Security / ID Box",
    box: { x: 50, y: 650, width: 180, height: 24, color: "black", label: "[REDACTED ID]" },
  },
  signature_block: {
    name: "Signature Block",
    box: { x: 50, y: 100, width: 220, height: 50, color: "black", label: "[REDACTED SIGNATURE]" },
  },
  header_banner: {
    name: "Top Confidential Header",
    box: { x: 40, y: 750, width: 515, height: 35, color: "black", label: "[CONFIDENTIAL]" },
  },
  account_number: {
    name: "Account / Financial Digits",
    box: { x: 350, y: 680, width: 160, height: 20, color: "black", label: "[REDACTED ACCT]" },
  },
};

/**
 * Apply permanent vector redactions to PDF document bytes
 */
export async function applyPdfRedactions(
  pdfBytes: Uint8Array,
  redactions: RedactionBox[]
): Promise<Uint8Array> {
  if (!pdfBytes || pdfBytes.length === 0) {
    throw new Error("No PDF data provided.");
  }
  if (!redactions || redactions.length === 0) {
    throw new Error("At least one redaction box must be specified.");
  }

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const box of redactions) {
    if (box.pageIndex < 0 || box.pageIndex >= pages.length) {
      continue; // Skip out-of-range pages
    }

    const page = pages[box.pageIndex];
    if (!page) continue;

    // Determine fill color
    let fillColor = rgb(0, 0, 0); // default black
    let textColor = rgb(1, 1, 1); // default white text on black

    if (box.color === "white") {
      fillColor = rgb(1, 1, 1);
      textColor = rgb(0.2, 0.2, 0.2);
    } else if (box.color === "dark") {
      fillColor = rgb(0.12, 0.14, 0.18);
      textColor = rgb(0.9, 0.9, 0.9);
    }

    // Draw opaque redaction rectangle permanently
    page.drawRectangle({
      x: box.x,
      y: box.y,
      width: Math.max(1, box.width),
      height: Math.max(1, box.height),
      color: fillColor,
      borderColor: fillColor,
      borderWidth: 0,
      opacity: 1, // 100% opaque, completely blocks underlying elements
    });

    // Draw optional label text centered inside redaction box
    if (box.label && box.label.trim()) {
      const fontSize = Math.min(10, Math.max(6, box.height * 0.45));
      const textWidth = font.widthOfTextAtSize(box.label, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      const textX = box.x + Math.max(0, (box.width - textWidth) / 2);
      const textY = box.y + Math.max(0, (box.height - textHeight) / 2);

      page.drawText(box.label, {
        x: textX,
        y: textY,
        size: fontSize,
        font,
        color: textColor,
      });
    }
  }

  return await pdfDoc.save();
}

/**
 * Validate redaction coordinates against page dimensions
 */
export function validateRedactionBounds(
  box: RedactionBox,
  pageWidth: number,
  pageHeight: number
): { valid: boolean; adjustedBox: RedactionBox } {
  const x = Math.max(0, Math.min(box.x, pageWidth - 10));
  const y = Math.max(0, Math.min(box.y, pageHeight - 10));
  const width = Math.max(10, Math.min(box.width, pageWidth - x));
  const height = Math.max(10, Math.min(box.height, pageHeight - y));

  return {
    valid: true,
    adjustedBox: { ...box, x, y, width, height },
  };
}
