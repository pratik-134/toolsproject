import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type StampPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type StampColor = "black" | "red" | "blue" | "gray";

export interface BatesOptions {
  prefix?: string;
  startNumber?: number;
  digits?: number;
  suffix?: string;
  includeTotalPages?: boolean;
  position?: StampPosition;
  fontSize?: number;
  color?: StampColor;
  targetPages?: number[]; // 0-indexed. If empty/omitted, stamps all pages.
}

/**
 * Formats a Bates number string for a given page index.
 */
export function formatBatesNumber(
  pageIndex: number,
  totalCount: number,
  options: BatesOptions
): string {
  const prefix = options.prefix ?? "BATES-";
  const startNumber = options.startNumber ?? 1;
  const digits = Math.max(1, Math.min(12, options.digits ?? 6));
  const suffix = options.suffix ?? "";

  const currentVal = startNumber + pageIndex;
  const numStr = String(currentVal).padStart(digits, "0");

  let result = `${prefix}${numStr}${suffix}`;
  if (options.includeTotalPages) {
    result += ` (Page ${pageIndex + 1} of ${totalCount})`;
  }
  return result;
}

/**
 * Creates an in-memory sample PDF to demonstrate stamping.
 */
export async function createSampleStampPdf(pageCount: number = 3): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    page.drawText(`Legal Exhibit Document ${i}`, {
      x: 60,
      y: height - 120,
      size: 22,
      font,
      color: rgb(0.1, 0.2, 0.5),
    });

    page.drawText(
      `Confidential litigation document. Prepared for client-side Bates stamping test.`,
      {
        x: 60,
        y: height - 160,
        size: 12,
        font,
        color: rgb(0.3, 0.3, 0.3),
      }
    );
  }

  return await doc.save();
}

/**
 * Stamps Bates numbering or custom running header/footer on a PDF document.
 */
export async function stampPdf(
  pdfBuffer: Uint8Array,
  options: BatesOptions = {}
): Promise<Uint8Array> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF buffer is empty.");
  }

  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const totalPages = doc.getPageCount();

  const fontSize = options.fontSize ?? 10;
  const position = options.position ?? "bottom-right";

  // Pick color
  let fontRgb = rgb(0, 0, 0); // black
  if (options.color === "red") fontRgb = rgb(0.8, 0.1, 0.1);
  else if (options.color === "blue") fontRgb = rgb(0.1, 0.3, 0.8);
  else if (options.color === "gray") fontRgb = rgb(0.45, 0.45, 0.45);

  const pagesToStamp =
    options.targetPages && options.targetPages.length > 0
      ? options.targetPages.filter((idx) => idx >= 0 && idx < totalPages)
      : Array.from({ length: totalPages }, (_, i) => i);

  for (const pageIdx of pagesToStamp) {
    const page = doc.getPage(pageIdx);
    const { width, height } = page.getSize();
    const stampText = formatBatesNumber(pageIdx, totalPages, options);
    const textWidth = font.widthOfTextAtSize(stampText, fontSize);

    let x = 40;
    let y = 35;

    // Horizontal placement
    if (position.includes("center")) {
      x = (width - textWidth) / 2;
    } else if (position.includes("right")) {
      x = width - textWidth - 40;
    } else {
      x = 40; // left
    }

    // Vertical placement
    if (position.includes("top")) {
      y = height - 40;
    } else {
      y = 35; // bottom
    }

    page.drawText(stampText, {
      x,
      y,
      size: fontSize,
      font,
      color: fontRgb,
    });
  }

  return await doc.save();
}
