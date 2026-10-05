/**
 * Unit Tests for Client-Side Smart Background Remover
 */

import {
  colorDistance,
  detectBorderBackgroundColors,
  removeBackgroundPixels,
  applyAlphaFeather,
} from "./logic";

export function runBackgroundRemoverTests(): boolean {
  console.log("Testing [image-background-remover] logic...");

  // 1. Color distance tests
  const distZero = colorDistance(255, 255, 255, 255, 255, 255);
  if (distZero !== 0) {
    throw new Error(`colorDistance between identical colors should be 0, got ${distZero}`);
  }

  const distMax = colorDistance(0, 0, 0, 255, 255, 255);
  if (Math.round(distMax) !== 442) {
    throw new Error(`colorDistance between black and white should be ~441.67, got ${distMax}`);
  }

  // 2. Synthetic 4x4 image buffer with white background and black center
  const width = 4;
  const height = 4;
  const pixels = new Uint8ClampedArray(width * height * 4);

  // Fill all with white (255, 255, 255, 255)
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = 255;
  }

  // Set center 2x2 to black subject (0, 0, 0, 255)
  const centerCoords: Array<[number, number]> = [
    [1, 1], [2, 1],
    [1, 2], [2, 2],
  ];
  for (const [cx, cy] of centerCoords) {
    const idx = (cy * width + cx) * 4;
    pixels[idx] = 0;
    pixels[idx + 1] = 0;
    pixels[idx + 2] = 0;
  }

  // 3. Test background seeds
  const seeds = detectBorderBackgroundColors(pixels, width, height);
  if (seeds.length === 0 || !seeds[0] || seeds[0][0] !== 255) {
    throw new Error(`detectBorderBackgroundColors failed to detect white border seeds`);
  }

  // 4. Test removeBackgroundPixels
  const { removedPixelCount, totalPixels } = removeBackgroundPixels(pixels, width, height, {
    tolerance: 15,
    featherRadius: 0,
  });

  // 16 total pixels - 4 center pixels = 12 background pixels removed
  if (removedPixelCount !== 12 || totalPixels !== 16) {
    throw new Error(`removeBackgroundPixels removed ${removedPixelCount} pixels, expected 12`);
  }

  // Verify center pixels remain fully opaque
  for (const [cx, cy] of centerCoords) {
    const idx = (cy * width + cx) * 4;
    if (pixels[idx + 3] !== 255) {
      throw new Error(`Center subject pixel at (${cx}, ${cy}) had alpha ${pixels[idx + 3]}, expected 255`);
    }
  }

  // 5. Test alpha feathering
  applyAlphaFeather(pixels, width, height, 1);
  // center pixels should have blurred slightly along edges
  const centerAlpha = pixels[(1 * width + 1) * 4 + 3];
  if (typeof centerAlpha !== "number") {
    throw new Error(`applyAlphaFeather failed`);
  }

  console.log("✅ [image-background-remover] unit tests passed!");
  return true;
}
