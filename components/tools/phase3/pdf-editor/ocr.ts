import { createWorker } from "tesseract.js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { OcrPageResult, OcrWordBox } from "./types";

let tesseractWorkerPromise: Promise<any> | null = null;

async function getWorker() {
  if (!tesseractWorkerPromise) {
    tesseractWorkerPromise = (async () => {
      const worker = await createWorker("eng");
      return worker;
    })();
  }
  return tesseractWorkerPromise;
}

/**
 * Runs OCR on a canvas element using Tesseract.js in the browser
 */
export async function runOcrOnCanvas(
  canvas: HTMLCanvasElement,
  pageIndex: number,
  onProgress?: (progress: number) => void
): Promise<OcrPageResult> {
  const worker = await getWorker();

  const ret = await worker.recognize(canvas);
  const fullText = ret.data.text || "";
  const words: OcrWordBox[] = [];

  if (ret.data.words && Array.isArray(ret.data.words)) {
    ret.data.words.forEach((w: any) => {
      if (w.text && w.text.trim()) {
        words.push({
          text: w.text.trim(),
          x: w.bbox.x0,
          y: w.bbox.y0,
          width: Math.max(10, w.bbox.x1 - w.bbox.x0),
          height: Math.max(8, w.bbox.y1 - w.bbox.y0),
          confidence: w.confidence || 0,
        });
      }
    });
  }

  if (onProgress) onProgress(100);

  return {
    pageIndex,
    fullText,
    words,
  };
}

/**
 * Runs OCR on a specific cropped region of a canvas
 */
export async function runOcrOnRegion(
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const offscreen = document.createElement("canvas");
  offscreen.width = Math.max(1, rect.width);
  offscreen.height = Math.max(1, rect.height);
  const ctx = offscreen.getContext("2d");
  if (!ctx) return "";

  ctx.drawImage(
    canvas,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    rect.width,
    rect.height
  );

  const worker = await getWorker();
  const res = await worker.recognize(offscreen);
  return res.data.text.trim();
}

/**
 * Bakes invisible OCR text layer into scanned PDF to make it fully searchable and selectable in Acrobat Pro / Chrome
 */
export async function createSearchablePdf(
  sourcePdfBytes: Uint8Array,
  ocrResults: OcrPageResult[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(sourcePdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pageCount = pdfDoc.getPageCount();

  for (const res of ocrResults) {
    if (res.pageIndex >= 0 && res.pageIndex < pageCount) {
      const page = pdfDoc.getPage(res.pageIndex);
      const { height } = page.getSize();

      for (const word of res.words) {
        // PDF Y coordinate starts from bottom
        const pdfY = height - word.y - word.height;
        const fontSize = Math.max(6, Math.min(36, word.height * 0.9));

        try {
          // Draw invisible text with opacity 0 (or near zero) matching word coordinates
          page.drawText(word.text, {
            x: Math.max(0, word.x),
            y: Math.max(0, pdfY),
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
            opacity: 0.001, // Invisible overlay for native selection/copying
          });
        } catch {
          // Skip if character cannot be encoded in standard font
        }
      }
    }
  }

  return await pdfDoc.save();
}
