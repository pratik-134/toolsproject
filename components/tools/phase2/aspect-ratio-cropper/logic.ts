/**
 * Aspect Ratio Cropper — Pure Math & Geometry Logic
 */

export interface CropRect {
  x: number; // Top-left X in source image pixels
  y: number; // Top-left Y in source image pixels
  width: number; // Width in source image pixels
  height: number; // Height in source image pixels
}

export interface AspectPreset {
  id: string;
  name: string;
  ratio: number | null; // width / height, null for freeform
  label: string;
  category: "social" | "standard" | "custom";
}

export const ASPECT_PRESETS: AspectPreset[] = [
  { id: "free", name: "Freeform", ratio: null, label: "Unconstrained", category: "custom" },
  { id: "1:1", name: "Square (1:1)", ratio: 1.0, label: "Instagram, Avatars", category: "social" },
  { id: "16:9", name: "Landscape (16:9)", ratio: 16 / 9, label: "YouTube, Banners", category: "social" },
  { id: "9:16", name: "Vertical (9:16)", ratio: 9 / 16, label: "Reels, Stories, TikTok", category: "social" },
  { id: "4:5", name: "Portrait (4:5)", ratio: 4 / 5, label: "Instagram Feed Post", category: "social" },
  { id: "4:3", name: "Standard (4:3)", ratio: 4 / 3, label: "Classic Monitor & Photo", category: "standard" },
  { id: "3:2", name: "Classic 35mm (3:2)", ratio: 3 / 2, label: "DSLR Photography", category: "standard" },
  { id: "2:1", name: "Header (2:1)", ratio: 2.0, label: "Twitter / X Banner", category: "social" },
];

/**
 * Parse a ratio string such as "16:9" or "1:1" to a floating point number.
 */
export function parseAspectRatio(ratioStr: string): number | null {
  if (!ratioStr || ratioStr === "free" || ratioStr === "custom") return null;
  const parts = ratioStr.split(":");
  if (parts.length !== 2) return null;
  const p0 = parts[0];
  const p1 = parts[1];
  if (!p0 || !p1) return null;
  const w = parseFloat(p0);
  const h = parseFloat(p1);
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
  return w / h;
}

/**
 * Calculate centered initial crop rectangle fitting inside source image dimensions
 */
export function calculateInitialCrop(
  imageW: number,
  imageH: number,
  ratio: number | null
): CropRect {
  if (imageW <= 0 || imageH <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // Freeform: 90% of image centered
  if (ratio === null) {
    const width = Math.round(imageW * 0.9);
    const height = Math.round(imageH * 0.9);
    const x = Math.round((imageW - width) / 2);
    const y = Math.round((imageH - height) / 2);
    return { x, y, width, height };
  }

  const imageRatio = imageW / imageH;
  let cropW: number;
  let cropH: number;

  if (ratio >= imageRatio) {
    // Width-constrained
    cropW = Math.round(imageW * 0.95);
    cropH = Math.round(cropW / ratio);
  } else {
    // Height-constrained
    cropH = Math.round(imageH * 0.95);
    cropW = Math.round(cropH * ratio);
  }

  // Ensure within bounds
  cropW = Math.max(1, Math.min(imageW, cropW));
  cropH = Math.max(1, Math.min(imageH, cropH));

  const cropX = Math.round((imageW - cropW) / 2);
  const cropY = Math.round((imageH - cropH) / 2);

  return {
    x: Math.max(0, cropX),
    y: Math.max(0, cropY),
    width: cropW,
    height: cropH,
  };
}

/**
 * Clamp crop rectangle so that it stays strictly within [0, bounds.width] and [0, bounds.height]
 */
export function clampCropRect(
  rect: CropRect,
  bounds: { width: number; height: number }
): CropRect {
  let width = Math.max(1, Math.min(bounds.width, Math.round(rect.width)));
  let height = Math.max(1, Math.min(bounds.height, Math.round(rect.height)));

  let x = Math.max(0, Math.min(bounds.width - width, Math.round(rect.x)));
  let y = Math.max(0, Math.min(bounds.height - height, Math.round(rect.y)));

  return { x, y, width, height };
}

/**
 * Calculate dimensions after rotation by 0, 90, 180, 270 degrees
 */
export function calculateRotatedDimensions(
  width: number,
  height: number,
  rotationDeg: number
): { width: number; height: number } {
  const norm = ((rotationDeg % 360) + 360) % 360;
  if (norm === 90 || norm === 270) {
    return { width: height, height: width };
  }
  return { width, height };
}
