/**
 * Client-Side Smart Background Remover — Pure Domain Logic
 * 100% In-Browser Pixel Segmentation, Alpha Masking & Background Replacement
 * Zero External Network Calls, Zero Server Uploads (Qwertygen Invariant #1)
 */

export interface SegmentationOptions {
  tolerance: number; // 1 to 100 (color distance threshold)
  featherRadius: number; // 0 to 10 (edge smoothing)
  samplePoints?: Array<{ x: number; y: number }>; // coordinate points for background seeds
}

export interface ReplacementFill {
  type: "transparent" | "solid" | "gradient";
  solidColor?: string; // hex
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
}

/**
 * Calculates Euclidean color distance in 3D RGB color space
 */
export function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
}

/**
 * Analyzes pixel borders to detect dominant background color seeds (corners & borders)
 */
export function detectBorderBackgroundColors(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): Array<[number, number, number]> {
  const seeds: Array<[number, number, number]> = [];
  const sampleIndices = [
    0, // Top-left
    (width - 1) * 4, // Top-right
    (width * (height - 1)) * 4, // Bottom-left
    (width * height - 1) * 4, // Bottom-right
    Math.floor(width / 2) * 4, // Top-center
    (width * (height - 1) + Math.floor(width / 2)) * 4, // Bottom-center
  ];

  for (const idx of sampleIndices) {
    if (idx >= 0 && idx + 2 < pixels.length) {
      const r = pixels[idx] ?? 255;
      const g = pixels[idx + 1] ?? 255;
      const b = pixels[idx + 2] ?? 255;
      seeds.push([r, g, b]);
    }
  }

  return seeds;
}

/**
 * Removes background pixels based on color distance from background seeds
 * Modifies pixel alpha channel in-place
 */
export function removeBackgroundPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  options: SegmentationOptions
): { removedPixelCount: number; totalPixels: number } {
  const seeds = detectBorderBackgroundColors(pixels, width, height);
  const maxDistance = (options.tolerance / 100) * 441.67; // max Euclidean distance between (0,0,0) and (255,255,255)
  let removedPixelCount = 0;
  const totalPixels = width * height;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;

    let isBackground = false;
    for (const [sr, sg, sb] of seeds) {
      const dist = colorDistance(r, g, b, sr, sg, sb);
      if (dist <= maxDistance) {
        isBackground = true;
        break;
      }
    }

    if (isBackground) {
      pixels[i + 3] = 0; // alpha = 0
      removedPixelCount++;
    }
  }

  return { removedPixelCount, totalPixels };
}

/**
 * Applies box blur feathering onto the alpha channel to soften harsh edges
 */
export function applyAlphaFeather(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number = 1
): void {
  if (radius <= 0) return;
  const alphaCopy = new Uint8Array(width * height);
  for (let i = 0; i < alphaCopy.length; i++) {
    alphaCopy[i] = pixels[i * 4 + 3] ?? 255;
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // 3x3 kernel average for alpha
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const sample = alphaCopy[(y + dy) * width + (x + dx)] ?? 255;
          sum += sample;
        }
      }
      pixels[idx * 4 + 3] = Math.round(sum / 9);
    }
  }
}
