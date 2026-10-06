import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface PdfFileInfo {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  buffer: Uint8Array;
}

/**
 * Creates an in-memory sample PDF with specified title and page count.
 * Useful for presets, unit tests, and instant browser demonstrations.
 */
export async function createSamplePdf(
  title: string,
  pageCount: number = 1
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]); // A4 dimensions
    const { width, height } = page.getSize();

    page.drawText(title, {
      x: 50,
      y: height - 80,
      size: 24,
      font,
      color: rgb(0.12, 0.23, 0.54), // Qwertygen navy
    });

    page.drawText(`Page ${i} of ${pageCount}`, {
      x: 50,
      y: height - 120,
      size: 14,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText(
      "Generated securely inside your browser using Qwertygen's 100% client-side PDF engine.",
      {
        x: 50,
        y: 60,
        size: 10,
        font,
        color: rgb(0.6, 0.6, 0.6),
      }
    );
  }

  return await doc.save();
}

/**
 * Reads a PDF buffer and returns its total page count.
 */
export async function getPdfPageCount(pdfBuffer: Uint8Array): Promise<number> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("Cannot read page count from an empty PDF buffer.");
  }
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  return doc.getPageCount();
}

/**
 * Merges multiple PDF buffers into a single unified PDF file.
 */
export async function mergePdfs(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  if (!pdfBuffers || pdfBuffers.length === 0) {
    throw new Error("At least one PDF file is required to merge.");
  }

  const mergedDoc = await PDFDocument.create();

  for (let i = 0; i < pdfBuffers.length; i++) {
    const buf = pdfBuffers[i];
    if (!buf || buf.length === 0) continue;
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pageIndices = doc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(doc, pageIndices);
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  if (mergedDoc.getPageCount() === 0) {
    throw new Error("No pages could be extracted from the provided PDF files.");
  }

  return await mergedDoc.save();
}
