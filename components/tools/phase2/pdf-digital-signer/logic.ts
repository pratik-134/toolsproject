import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface SignatureStampOptions {
  signaturePngBytes: Uint8Array;
  signerName?: string;
  signerTitle?: string;
  dateString?: string;
  pageIndex?: number; // 0-indexed
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * Valid 1x1 transparent PNG buffer for deterministic unit tests and presets.
 */
export const MINIMAL_PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
  0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44,
  0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D,
  0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
  0x60, 0x82,
]);

/**
 * Creates an in-memory sample document with a signature block area.
 */
export async function createSampleSignablePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawText("Professional Services Consulting Agreement", {
    x: 50,
    y: height - 80,
    size: 20,
    font,
    color: rgb(0.1, 0.2, 0.5),
  });

  page.drawText(
    "By signing below, the authorized party acknowledges receipt of all deliverables.",
    {
      x: 50,
      y: height - 120,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3),
    }
  );

  // Draw signature line box
  page.drawRectangle({
    x: 50,
    y: 80,
    width: 260,
    height: 90,
    borderColor: rgb(0.75, 0.75, 0.75),
    borderWidth: 1,
    color: rgb(0.97, 0.98, 1),
  });

  page.drawText("AUTHORIZED SIGNATURE AREA", {
    x: 60,
    y: 155,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.6),
  });

  return await doc.save();
}

/**
 * Stamps a PNG signature image and verification metadata onto the selected PDF page.
 */
export async function signPdf(
  pdfBuffer: Uint8Array,
  options: SignatureStampOptions
): Promise<Uint8Array> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }
  if (!options.signaturePngBytes || options.signaturePngBytes.length === 0) {
    throw new Error("Signature image data is required.");
  }

  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();
  const pageIdx = Math.max(0, Math.min(pageCount - 1, options.pageIndex ?? 0));
  const page = doc.getPage(pageIdx);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const pngImage = await doc.embedPng(options.signaturePngBytes);

  const sigWidth = options.width ?? 160;
  const sigHeight = options.height ?? 50;
  const sigX = options.x ?? 60;
  const sigY = options.y ?? 100;

  // Draw signature PNG
  page.drawImage(pngImage, {
    x: sigX,
    y: sigY,
    width: sigWidth,
    height: sigHeight,
  });

  // Draw signer details if provided
  let textY = sigY - 14;

  if (options.signerName) {
    page.drawText(options.signerName, {
      x: sigX,
      y: textY,
      size: 10,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    textY -= 12;
  }

  if (options.signerTitle) {
    page.drawText(options.signerTitle, {
      x: sigX,
      y: textY,
      size: 8.5,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
    textY -= 11;
  }

  if (options.dateString) {
    page.drawText(`Date: ${options.dateString}`, {
      x: sigX,
      y: textY,
      size: 8,
      font,
      color: rgb(0.45, 0.45, 0.45),
    });
  }

  return await doc.save();
}
