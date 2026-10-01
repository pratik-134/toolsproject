/**
 * Camera-to-PDF Scanner — Pure Domain Logic
 * 100% In-Browser Document Processing (Zero Network Uploads)
 */

export type ScanFilterType = "normal" | "grayscale" | "high-contrast" | "enhanced";

export interface ScannedPage {
  id: string;
  dataUrl: string;
  filter: ScanFilterType;
  rotation: number; // 0, 90, 180, 270
}

/**
 * Applies document image filter (grayscale, high-contrast b&w, enhancement) to Canvas ImageData
 */
export function applyDocumentFilter(imageData: ImageData, filter: ScanFilterType): ImageData {
  if (filter === "normal") return imageData;

  const data = imageData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;

    // Standard perceptual luminance
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (filter === "grayscale") {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else if (filter === "high-contrast") {
      // Threshold at 128 for stark monochrome text
      const bw = gray > 135 ? 255 : 0;
      data[i] = bw;
      data[i + 1] = bw;
      data[i + 2] = bw;
    } else if (filter === "enhanced") {
      // Stretch dynamic range (contrast boost)
      const contrastFactor = 1.35;
      const enhanced = Math.min(255, Math.max(0, (gray - 128) * contrastFactor + 128));
      data[i] = enhanced;
      data[i + 1] = enhanced;
      data[i + 2] = enhanced;
    }
  }

  return imageData;
}

/**
 * Calculates page aspect ratio fit inside A4 dimensions (595.28 x 841.89 points)
 */
export function calculateA4Fitting(
  imgWidth: number,
  imgHeight: number,
  pageWidth: number = 595.28,
  pageHeight: number = 841.89,
  margin: number = 20
): { width: number; height: number; x: number; y: number } {
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  const imgAspect = imgWidth / (imgHeight || 1);
  const pageAspect = maxWidth / maxHeight;

  let fitW = maxWidth;
  let fitH = maxHeight;

  if (imgAspect > pageAspect) {
    fitH = fitW / imgAspect;
  } else {
    fitW = fitH * imgAspect;
  }

  const x = margin + (maxWidth - fitW) / 2;
  const y = margin + (maxHeight - fitH) / 2;

  return {
    width: Math.round(fitW * 100) / 100,
    height: Math.round(fitH * 100) / 100,
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
  };
}
