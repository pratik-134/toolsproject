import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Parses user input page ranges (e.g., "1-3, 5, 8-10") into a sorted,
 * unique array of 0-indexed page indices clamped between 0 and totalPages - 1.
 */
export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || !rangeStr.trim() || totalPages <= 0) return [];

  const indices = new Set<number>();
  const parts = rangeStr.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr ?? "", 10);
      const end = parseInt(endStr ?? "", 10);

      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let p = min; p <= max; p++) {
          if (p >= 1 && p <= totalPages) {
            indices.add(p - 1);
          }
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        indices.add(page - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Creates an in-memory sample multi-page PDF for testing and demo presets.
 */
export async function createSampleSplitPdf(pageCount: number = 5): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    page.drawText(`Sample Document Section ${i}`, {
      x: 50,
      y: height - 80,
      size: 22,
      font,
      color: rgb(0.1, 0.2, 0.5),
    });

    page.drawText(`Chapter ${i} — Page ${i} of ${pageCount}`, {
      x: 50,
      y: height - 120,
      size: 14,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(
      "Mindkit PDF Splitter — 100% private, client-side extraction.",
      {
        x: 50,
        y: 60,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      }
    );
  }

  return await doc.save();
}

/**
 * Extracts specific 0-indexed page indices from a PDF into a new PDF document.
 */
export async function extractPdfPages(
  pdfBuffer: Uint8Array,
  pageIndices: number[]
): Promise<Uint8Array> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }
  if (!pageIndices || pageIndices.length === 0) {
    throw new Error("No page indices specified for extraction.");
  }

  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  const validIndices = pageIndices.filter(
    (idx) => idx >= 0 && idx < totalPages
  );
  if (validIndices.length === 0) {
    throw new Error("Specified pages are out of document range.");
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

/**
 * Splits every page of a PDF into individual single-page PDF files.
 */
export async function burstPdfPages(
  pdfBuffer: Uint8Array
): Promise<{ pageNumber: number; buffer: Uint8Array }[]> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }

  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const results: { pageNumber: number; buffer: Uint8Array }[] = [];

  for (let i = 0; i < totalPages; i++) {
    const singleDoc = await PDFDocument.create();
    const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
    if (copiedPage) {
      singleDoc.addPage(copiedPage);
      const bytes = await singleDoc.save();
      results.push({ pageNumber: i + 1, buffer: bytes });
    }
  }

  return results;
}
