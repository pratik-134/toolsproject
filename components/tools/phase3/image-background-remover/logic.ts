/**
 * Client-Side Smart Background Remover — High-Fidelity Domain Logic
 * 100% In-Browser Pixel Segmentation, Alpha Feathering & Transparent PNG Export
 * Zero External Network Calls, Zero Server Uploads (Qwertygen Invariant #1)
 */

export interface SegmentationOptions {
  tolerance: number; // 1 to 60 (color distance threshold percentage)
  featherRadius: number; // 0 to 5 (edge smoothing radius)
  smoothRollOff?: boolean; // smooth anti-aliased edge falloff
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
 * Samples perimeter points along top, bottom, left, and right borders to detect
 * dominant background seed colors. Clusters seeds to avoid outliers.
 */
export function detectBorderBackgroundColors(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): Array<[number, number, number]> {
  const seeds: Array<[number, number, number]> = [];
  const samplesPerSide = 12;

  // 1. Top and Bottom edges
  for (let i = 0; i < samplesPerSide; i++) {
    const x = Math.floor((i / (samplesPerSide - 1)) * (width - 1));
    // Top row
    const topIdx = x * 4;
    seeds.push([pixels[topIdx] ?? 255, pixels[topIdx + 1] ?? 255, pixels[topIdx + 2] ?? 255]);

    // Bottom row
    const bottomIdx = ((height - 1) * width + x) * 4;
    seeds.push([pixels[bottomIdx] ?? 255, pixels[bottomIdx + 1] ?? 255, pixels[bottomIdx + 2] ?? 255]);
  }

  // 2. Left and Right edges
  for (let i = 1; i < samplesPerSide - 1; i++) {
    const y = Math.floor((i / (samplesPerSide - 1)) * (height - 1));
    // Left edge
    const leftIdx = (y * width) * 4;
    seeds.push([pixels[leftIdx] ?? 255, pixels[leftIdx + 1] ?? 255, pixels[leftIdx + 2] ?? 255]);

    // Right edge
    const rightIdx = (y * width + (width - 1)) * 4;
    seeds.push([pixels[rightIdx] ?? 255, pixels[rightIdx + 1] ?? 255, pixels[rightIdx + 2] ?? 255]);
  }

  // Deduplicate / cluster close seeds
  const uniqueSeeds: Array<[number, number, number]> = [];
  const clusterDist = 20;

  for (const s of seeds) {
    const exists = uniqueSeeds.some(
      (u) => colorDistance(s[0], s[1], s[2], u[0], u[1], u[2]) < clusterDist
    );
    if (!exists) {
      uniqueSeeds.push(s);
    }
  }

  return uniqueSeeds.length > 0 ? uniqueSeeds : [[255, 255, 255]];
}

/**
 * Removes background pixels using continuous smooth alpha falloff
 * to prevent harsh jagged edges and halos around subjects.
 */
export function removeBackgroundPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  options: SegmentationOptions
): { removedPixelCount: number; totalPixels: number } {
  const seeds = detectBorderBackgroundColors(pixels, width, height);
  const maxDistance = (options.tolerance / 100) * 441.67; // max Euclidean distance between RGB extremes
  const minDistance = maxDistance * 0.65; // falloff threshold for anti-aliasing

  let removedPixelCount = 0;
  const totalPixels = width * height;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;

    let closestDist = Infinity;
    for (const [sr, sg, sb] of seeds) {
      const dist = colorDistance(r, g, b, sr, sg, sb);
      if (dist < closestDist) {
        closestDist = dist;
      }
    }

    if (closestDist <= minDistance) {
      // Complete background
      pixels[i + 3] = 0;
      removedPixelCount++;
    } else if (closestDist < maxDistance) {
      // Soft transition edge (anti-aliased feathering)
      const factor = (closestDist - minDistance) / (maxDistance - minDistance);
      // Smoothstep curve for soft natural transitions
      const smoothAlpha = Math.round(factor * factor * (3 - 2 * factor) * 255);
      pixels[i + 3] = smoothAlpha;
      if (smoothAlpha < 128) {
        removedPixelCount++;
      }
    }
    // Else closestDist >= maxDistance: foreground, preserve original alpha
  }

  return { removedPixelCount, totalPixels };
}

/**
 * Applies multi-pass separable box/Gaussian blur feathering on the alpha channel
 * to produce clean, anti-aliased cutouts without jagged pixel steps.
 */
export function applyAlphaFeather(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number = 1
): void {
  if (radius <= 0) return;

  const total = width * height;
  const alphaCopy = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    alphaCopy[i] = pixels[i * 4 + 3] ?? 255;
  }

  const tempAlpha = new Uint8Array(total);

  // Horizontal blur pass
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < width) {
          sum += alphaCopy[rowOffset + nx] ?? 255;
          count++;
        }
      }
      tempAlpha[rowOffset + x] = Math.round(sum / count);
    }
  }

  // Vertical blur pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < height) {
          sum += tempAlpha[ny * width + x] ?? 255;
          count++;
        }
      }
      pixels[(y * width + x) * 4 + 3] = Math.round(sum / count);
    }
  }
}
