/**
 * Canvas Resizer — Pure Geometry & Dimension Math
 */

export type ResizeMode = "fit" | "fill" | "stretch" | "pad";

export interface PlacementResult {
  destX: number;
  destY: number;
  destWidth: number;
  destHeight: number;
}

export interface DimensionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: "display" | "social" | "icon";
}

export const RESIZE_PRESETS: DimensionPreset[] = [
  { id: "4k", name: "4K UHD (3840 × 2160)", width: 3840, height: 2160, category: "display" },
  { id: "1080p", name: "Full HD 1080p (1920 × 1080)", width: 1920, height: 1080, category: "display" },
  { id: "720p", name: "HD 720p (1280 × 720)", width: 1280, height: 720, category: "display" },
  { id: "ig-square", name: "Instagram Square (1080 × 1080)", width: 1080, height: 1080, category: "social" },
  { id: "ig-story", name: "Story / Reels (1080 × 1920)", width: 1080, height: 1920, category: "social" },
  { id: "yt-thumb", name: "YouTube Thumbnail (1280 × 720)", width: 1280, height: 720, category: "social" },
  { id: "tw-header", name: "Twitter / X Header (1500 × 500)", width: 1500, height: 500, category: "social" },
  { id: "favicon", name: "App Icon (512 × 512)", width: 512, height: 512, category: "icon" },
];

/**
 * Calculate proportional dimensions when aspect ratio is locked.
 */
export function calculateProportionalDimension(
  origW: number,
  origH: number,
  target: { width?: number; height?: number }
): { width: number; height: number } {
  if (origW <= 0 || origH <= 0) return { width: 1, height: 1 };
  const aspect = origW / origH;

  if (target.width !== undefined && target.width > 0) {
    const w = Math.round(target.width);
    const h = Math.max(1, Math.round(w / aspect));
    return { width: w, height: h };
  }

  if (target.height !== undefined && target.height > 0) {
    const h = Math.round(target.height);
    const w = Math.max(1, Math.round(h * aspect));
    return { width: w, height: h };
  }

  return { width: origW, height: origH };
}

/**
 * Calculate percentage scale dimensions
 */
export function calculatePercentageDimensions(
  origW: number,
  origH: number,
  percent: number
): { width: number; height: number } {
  const p = Math.max(1, Math.min(1000, percent)) / 100;
  return {
    width: Math.max(1, Math.round(origW * p)),
    height: Math.max(1, Math.round(origH * p)),
  };
}

/**
 * Calculate placement inside destination canvas according to resize mode
 */
export function calculateCanvasPlacement(
  origW: number,
  origH: number,
  canvasW: number,
  canvasH: number,
  mode: ResizeMode
): PlacementResult {
  if (origW <= 0 || origH <= 0 || canvasW <= 0 || canvasH <= 0) {
    return { destX: 0, destY: 0, destWidth: canvasW, destHeight: canvasH };
  }

  if (mode === "stretch") {
    return { destX: 0, destY: 0, destWidth: canvasW, destHeight: canvasH };
  }

  const srcAspect = origW / origH;
  const dstAspect = canvasW / canvasH;

  if (mode === "fit" || mode === "pad") {
    // Fit within canvas bounds preserving aspect ratio
    let destW: number;
    let destH: number;

    if (srcAspect >= dstAspect) {
      destW = canvasW;
      destH = Math.round(canvasW / srcAspect);
    } else {
      destH = canvasH;
      destW = Math.round(canvasH * srcAspect);
    }

    const destX = Math.round((canvasW - destW) / 2);
    const destY = Math.round((canvasH - destH) / 2);

    return { destX, destY, destWidth: destW, destHeight: destH };
  }

  if (mode === "fill") {
    // Fill entire canvas, cropping overflow
    let destW: number;
    let destH: number;

    if (srcAspect >= dstAspect) {
      destH = canvasH;
      destW = Math.round(canvasH * srcAspect);
    } else {
      destW = canvasW;
      destH = Math.round(canvasW / srcAspect);
    }

    const destX = Math.round((canvasW - destW) / 2);
    const destY = Math.round((canvasH - destH) / 2);

    return { destX, destY, destWidth: destW, destHeight: destH };
  }

  return { destX: 0, destY: 0, destWidth: canvasW, destHeight: canvasH };
}
