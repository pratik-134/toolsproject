import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Creates an in-memory sample PDF with labeled pages to demonstrate page reordering.
 */
export async function createSampleOrganizerPdf(
  pageCount: number = 4
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const colors = [
    rgb(0.2, 0.4, 0.8), // Blue
    rgb(0.8, 0.3, 0.2), // Red
    rgb(0.2, 0.7, 0.4), // Green
    rgb(0.7, 0.5, 0.1), // Orange
  ];

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const color = colors[(i - 1) % colors.length] ?? rgb(0.3, 0.3, 0.3);

    page.drawText(`Original Page ${i}`, {
      x: 50,
      y: height - 100,
      size: 26,
      font,
      color,
    });

    page.drawText(
      `Drag, move, duplicate, or delete this page using Mindkit's client-side organizer.`,
      {
        x: 50,
        y: height - 140,
        size: 13,
        font,
        color: rgb(0.35, 0.35, 0.35),
      }
    );
  }

  return await doc.save();
}

/**
 * Reorders, duplicates, or subsets pages of a PDF according to an array of 0-indexed original page numbers.
 */
export async function organizePdfPages(
  pdfBuffer: Uint8Array,
  pageOrder: number[]
): Promise<Uint8Array> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }
  if (!pageOrder || pageOrder.length === 0) {
    throw new Error("Target page order cannot be empty.");
  }

  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const validIndices = pageOrder.filter(
    (idx) => idx >= 0 && idx < totalPages
  );
  if (validIndices.length === 0) {
    throw new Error("No valid page indices specified.");
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}
