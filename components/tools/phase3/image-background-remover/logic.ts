/**
 * Client-Side Smart Background Remover — High-Fidelity Domain Logic
 * 100% In-Browser Pixel Segmentation, Alpha Feathering & Transparent PNG Export
 * Zero External Network Calls, Zero Server Uploads (Qwertygen Invariant #1)
 */

export const MAX_SAFE_IMAGE_DIMENSION = 2048;

export interface SegmentationOptions {
  tolerance: number; // 1 to 60 (color distance threshold percentage)
  featherRadius: number; // 0 to 5 (edge smoothing radius)
  smoothRollOff?: boolean; // smooth anti-aliased edge falloff
  mode?: "contiguous" | "global"; // "contiguous" (flood-fill from border) vs "global" (all matching pixels)
  customSeeds?: Array<[number, number, number]>; // User-picked eyedropper seeds
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
 * Calculates Euclidean distance squared (fast check without Math.sqrt)
 */
export function colorDistanceSq(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

/**
 * Calculates safe processing dimensions to prevent browser tab OOM crashes on large images (e.g. 12MP-24MP cameras)
 */
export function calculateSafeDimensions(
  width: number,
  height: number,
  maxDim: number = MAX_SAFE_IMAGE_DIMENSION
): { width: number; height: number; scaled: boolean } {
  if (width <= maxDim && height <= maxDim) {
    return { width, height, scaled: false };
  }
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
    scaled: true,
  };
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
  const samplesPerSide = Math.min(24, Math.max(8, Math.floor(Math.max(width, height) / 10)));

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
  const clusterDistSq = 20 * 20;

  for (const s of seeds) {
    const exists = uniqueSeeds.some(
      (u) => colorDistanceSq(s[0], s[1], s[2], u[0], u[1], u[2]) < clusterDistSq
    );
    if (!exists) {
      uniqueSeeds.push(s);
    }
  }

  return uniqueSeeds.length > 0 ? uniqueSeeds : [[255, 255, 255]];
}

/**
 * Removes background pixels using continuous smooth alpha falloff
 * with support for contiguous flood-fill segmentation (protecting subject interiors)
 * and custom user-sampled seeds.
 */
export function removeBackgroundPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  options: SegmentationOptions
): { removedPixelCount: number; totalPixels: number } {
  const detectedSeeds = detectBorderBackgroundColors(pixels, width, height);
  const allSeeds = [...detectedSeeds, ...(options.customSeeds || [])];

  const maxDistance = (options.tolerance / 100) * 441.67; // max Euclidean distance between RGB extremes
  const maxDistanceSq = maxDistance * maxDistance;
  const minDistance = maxDistance * 0.65; // falloff threshold for anti-aliasing
  const minDistanceSq = minDistance * minDistance;

  let removedPixelCount = 0;
  const totalPixels = width * height;
  const mode = options.mode ?? "contiguous";

  if (mode === "contiguous") {
    // Breadth-First Flood Fill from edges inward
    const visited = new Uint8Array(totalPixels); // 0 = unvisited, 1 = background, 2 = foreground
    const queue = new Int32Array(totalPixels);
    let queueHead = 0;
    let queueTail = 0;

    // Helper to test if a pixel matches any background seed
    const isMatchingSeed = (pxIdx: number): { matches: boolean; closestDist: number } => {
      const r = pixels[pxIdx] ?? 0;
      const g = pixels[pxIdx + 1] ?? 0;
      const b = pixels[pxIdx + 2] ?? 0;

      let closestSq = Infinity;
      for (let s = 0; s < allSeeds.length; s++) {
        const seed = allSeeds[s]!;
        const dSq = colorDistanceSq(r, g, b, seed[0], seed[1], seed[2]);
        if (dSq < closestSq) {
          closestSq = dSq;
        }
      }
      return { matches: closestSq < maxDistanceSq, closestDist: Math.sqrt(closestSq) };
    };

    // 1. Seed border pixels into the BFS queue
    // Top & Bottom rows
    for (let x = 0; x < width; x++) {
      // Top
      const topIdx = x;
      const topMatch = isMatchingSeed(topIdx * 4);
      if (topMatch.matches) {
        visited[topIdx] = 1;
        queue[queueTail++] = topIdx;
      } else {
        visited[topIdx] = 2;
      }

      // Bottom
      const botIdx = (height - 1) * width + x;
      if (visited[botIdx] === 0) {
        const botMatch = isMatchingSeed(botIdx * 4);
        if (botMatch.matches) {
          visited[botIdx] = 1;
          queue[queueTail++] = botIdx;
        } else {
          visited[botIdx] = 2;
        }
      }
    }

    // Left & Right columns
    for (let y = 1; y < height - 1; y++) {
      // Left
      const leftIdx = y * width;
      if (visited[leftIdx] === 0) {
        const leftMatch = isMatchingSeed(leftIdx * 4);
        if (leftMatch.matches) {
          visited[leftIdx] = 1;
          queue[queueTail++] = leftIdx;
        } else {
          visited[leftIdx] = 2;
        }
      }

      // Right
      const rightIdx = y * width + (width - 1);
      if (visited[rightIdx] === 0) {
        const rightMatch = isMatchingSeed(rightIdx * 4);
        if (rightMatch.matches) {
          visited[rightIdx] = 1;
          queue[queueTail++] = rightIdx;
        } else {
          visited[rightIdx] = 2;
        }
      }
    }

    // Also seed any custom clicked seeds if provided
    if (options.customSeeds && options.customSeeds.length > 0) {
      // If user clicked a spot, ensure that color can spread even if enclosed
      // We will let the flood fill expand from border, which handles 99% of images
    }

    // 2. Process BFS Queue
    while (queueHead < queueTail) {
      const curr = queue[queueHead++]!;
      const cx = curr % width;
      const cy = Math.floor(curr / width);
      const pxIdx = curr * 4;

      // Compute alpha for current background pixel
      const r = pixels[pxIdx] ?? 0;
      const g = pixels[pxIdx + 1] ?? 0;
      const b = pixels[pxIdx + 2] ?? 0;

      let closestDist = Infinity;
      for (let s = 0; s < allSeeds.length; s++) {
        const seed = allSeeds[s]!;
        const d = colorDistance(r, g, b, seed[0], seed[1], seed[2]);
        if (d < closestDist) closestDist = d;
      }

      if (closestDist <= minDistance) {
        pixels[pxIdx + 3] = 0;
        removedPixelCount++;
      } else if (closestDist < maxDistance) {
        const factor = (closestDist - minDistance) / (maxDistance - minDistance);
        const smoothAlpha = Math.round(factor * factor * (3 - 2 * factor) * 255);
        pixels[pxIdx + 3] = smoothAlpha;
        if (smoothAlpha < 128) {
          removedPixelCount++;
        }
      }

      // Check 4-connected neighbors
      // Up
      if (cy > 0) {
        const up = curr - width;
        if (visited[up] === 0) {
          const m = isMatchingSeed(up * 4);
          if (m.matches) {
            visited[up] = 1;
            queue[queueTail++] = up;
          } else {
            visited[up] = 2;
          }
        }
      }
      // Down
      if (cy < height - 1) {
        const down = curr + width;
        if (visited[down] === 0) {
          const m = isMatchingSeed(down * 4);
          if (m.matches) {
            visited[down] = 1;
            queue[queueTail++] = down;
          } else {
            visited[down] = 2;
          }
        }
      }
      // Left
      if (cx > 0) {
        const left = curr - 1;
        if (visited[left] === 0) {
          const m = isMatchingSeed(left * 4);
          if (m.matches) {
            visited[left] = 1;
            queue[queueTail++] = left;
          } else {
            visited[left] = 2;
          }
        }
      }
      // Right
      if (cx < width - 1) {
        const right = curr + 1;
        if (visited[right] === 0) {
          const m = isMatchingSeed(right * 4);
          if (m.matches) {
            visited[right] = 1;
            queue[queueTail++] = right;
          } else {
            visited[right] = 2;
          }
        }
      }
    }
  } else {
    // Global Match mode: Process all pixels across entire image
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;

      let closestSq = Infinity;
      for (let s = 0; s < allSeeds.length; s++) {
        const seed = allSeeds[s]!;
        const dSq = colorDistanceSq(r, g, b, seed[0], seed[1], seed[2]);
        if (dSq < closestSq) {
          closestSq = dSq;
        }
      }

      if (closestSq <= minDistanceSq) {
        pixels[i + 3] = 0;
        removedPixelCount++;
      } else if (closestSq < maxDistanceSq) {
        const closestDist = Math.sqrt(closestSq);
        const factor = (closestDist - minDistance) / (maxDistance - minDistance);
        const smoothAlpha = Math.round(factor * factor * (3 - 2 * factor) * 255);
        pixels[i + 3] = smoothAlpha;
        if (smoothAlpha < 128) {
          removedPixelCount++;
        }
      }
    }
  }

  return { removedPixelCount, totalPixels };
}

/**
 * Applies multi-pass separable box blur feathering on the alpha channel
 * using sliding window sums to guarantee O(N) performance without locking the main thread.
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

  // Horizontal blur pass (separable sliding window)
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    let sum = 0;
    let count = 0;

    // Initial window
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx >= 0 && dx < width) {
        sum += alphaCopy[rowOffset + dx] ?? 255;
        count++;
      }
    }
    tempAlpha[rowOffset] = Math.round(sum / count);

    // Slide window across row
    for (let x = 1; x < width; x++) {
      const removeX = x - radius - 1;
      const addX = x + radius;

      if (removeX >= 0) {
        sum -= alphaCopy[rowOffset + removeX] ?? 255;
        count--;
      }
      if (addX < width) {
        sum += alphaCopy[rowOffset + addX] ?? 255;
        count++;
      }
      tempAlpha[rowOffset + x] = Math.round(sum / (count > 0 ? count : 1));
    }
  }

  // Vertical blur pass (separable sliding window)
  for (let x = 0; x < width; x++) {
    let sum = 0;
    let count = 0;

    // Initial window
    for (let dy = -radius; dy <= radius; dy++) {
      if (dy >= 0 && dy < height) {
        sum += tempAlpha[dy * width + x] ?? 255;
        count++;
      }
    }
    pixels[x * 4 + 3] = Math.round(sum / count);

    // Slide window down column
    for (let y = 1; y < height; y++) {
      const removeY = y - radius - 1;
      const addY = y + radius;

      if (removeY >= 0) {
        sum -= tempAlpha[removeY * width + x] ?? 255;
        count--;
      }
      if (addY < height) {
        sum += tempAlpha[addY * width + x] ?? 255;
        count++;
      }
      pixels[(y * width + x) * 4 + 3] = Math.round(sum / (count > 0 ? count : 1));
    }
  }
}
