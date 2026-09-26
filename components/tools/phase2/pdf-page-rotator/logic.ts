import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

export type RotationDelta = 90 | 180 | 270;

export interface PageRotationInfo {
  pageIndex: number;
  currentAngle: number;
}

/**
 * Creates an in-memory sample multi-page PDF for testing and demo presets.
 */
export async function createSamplePdfForRotation(
  pageCount: number = 3
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    page.drawText(`Sample Page ${i} for Rotation`, {
      x: 50,
      y: height - 100,
      size: 22,
      font,
      color: rgb(0.1, 0.3, 0.6),
    });

    page.drawText(
      `Orientation Test Page: Rotate this page 90°, 180°, or 270° client-side.`,
      {
        x: 50,
        y: height - 140,
        size: 13,
        font,
        color: rgb(0.3, 0.3, 0.3),
      }
    );
  }

  return await doc.save();
}

/**
 * Inspects all pages of a PDF and returns their current rotation angles (0, 90, 180, 270).
 */
export async function getPageRotations(
  pdfBuffer: Uint8Array
): Promise<PageRotationInfo[]> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const total = doc.getPageCount();
  const results: PageRotationInfo[] = [];

  for (let i = 0; i < total; i++) {
    const page = doc.getPage(i);
    const angle = page.getRotation().angle;
    results.push({ pageIndex: i, currentAngle: angle });
  }

  return results;
}

/**
 * Rotates all or specific pages of a PDF by a given angle delta (clockwise).
 * Can accept an absolute map or relative rotation delta (e.g. +90).
 */
export async function rotatePdf(
  pdfBuffer: Uint8Array,
  angleDelta: number,
  targetPageIndices?: number[]
): Promise<Uint8Array> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }

  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();

  const pagesToRotate =
    targetPageIndices && targetPageIndices.length > 0
      ? targetPageIndices.filter((idx) => idx >= 0 && idx < pageCount)
      : Array.from({ length: pageCount }, (_, i) => i);

  for (const pageIdx of pagesToRotate) {
    const page = doc.getPage(pageIdx);
    const currentAngle = page.getRotation().angle;
    // Calculate new normalized angle (0, 90, 180, 270)
    const newAngle = ((currentAngle + angleDelta) % 360 + 360) % 360;
    page.setRotation(degrees(newAngle));
  }

  return await doc.save();
}
