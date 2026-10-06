/**
 * PDF Watermark & Page Stamp Studio — Pure Domain Logic
 * 100% In-Browser PDF Watermarking with Vector Geometry & Opacity Control
 * Zero External Network Calls, Zero Server Uploads (Qwertygen Invariant #1)
 */

import { PDFDocument, rgb, degrees } from "pdf-lib";

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number; // 0.05 to 1.0
  rotationAngle: number; // -90 to 90 degrees
  color: [number, number, number]; // RGB 0-1
  pageRange?: "all" | "first" | "odd" | "even";
}

/**
 * Applies text watermark stamping across PDF document pages in memory
 */
export async function applyWatermarkToPdf(
  pdfBytes: Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const pageNum = i + 1;

    // Filter page ranges
    if (options.pageRange === "first" && pageNum !== 1) continue;
    if (options.pageRange === "odd" && pageNum % 2 === 0) continue;
    if (options.pageRange === "even" && pageNum % 2 !== 0) continue;

    const page = pages[i];
    if (!page) continue;
    const { width, height } = page.getSize();

    // Center coordinates
    const centerX = width / 2;
    const centerY = height / 2;

    // Text metrics
    const textWidth = options.text.length * (options.fontSize * 0.5);

    page.drawText(options.text, {
      x: centerX - textWidth / 2,
      y: centerY,
      size: options.fontSize,
      opacity: options.opacity,
      rotate: degrees(options.rotationAngle),
      color: rgb(options.color[0], options.color[1], options.color[2]),
    });
  }

  return await pdfDoc.save();
}
