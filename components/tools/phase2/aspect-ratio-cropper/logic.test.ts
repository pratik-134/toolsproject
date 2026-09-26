/**
 * Unit Tests for Aspect Ratio Cropper Logic
 */

import {
  parseAspectRatio,
  calculateInitialCrop,
  clampCropRect,
  calculateRotatedDimensions,
  ASPECT_PRESETS,
} from "./logic";

export function runAspectRatioCropperTests() {
  // Test 1: parseAspectRatio
  const r1 = parseAspectRatio("16:9");
  if (!r1 || Math.abs(r1 - 16 / 9) > 0.0001) throw new Error("16:9 ratio parsing failed");

  const r2 = parseAspectRatio("1:1");
  if (!r2 || r2 !== 1.0) throw new Error("1:1 ratio parsing failed");

  const r3 = parseAspectRatio("free");
  if (r3 !== null) throw new Error("free ratio should return null");

  const r4 = parseAspectRatio("invalid:ratio");
  if (r4 !== null) throw new Error("invalid ratio should return null");

  // Test 2: calculateInitialCrop (Square 1:1 on 1920x1080)
  const c1 = calculateInitialCrop(1920, 1080, 1.0);
  if (c1.width !== c1.height) {
    throw new Error(`1:1 crop width and height must match: ${c1.width} vs ${c1.height}`);
  }
  if (c1.x < 0 || c1.y < 0 || c1.x + c1.width > 1920 || c1.y + c1.height > 1080) {
    throw new Error("Crop rectangle out of bounds");
  }

  // Test 3: calculateInitialCrop (16:9 on 1000x1000 square image)
  const c2 = calculateInitialCrop(1000, 1000, 16 / 9);
  const ratio2 = c2.width / c2.height;
  if (Math.abs(ratio2 - 16 / 9) > 0.02) {
    throw new Error(`Crop ratio error for 16:9: got ${ratio2}`);
  }

  // Test 4: clampCropRect
  const rectToClamp = { x: -50, y: -20, width: 2000, height: 1200 };
  const clamped = clampCropRect(rectToClamp, { width: 1920, height: 1080 });
  if (clamped.x < 0 || clamped.y < 0) throw new Error("Clamped coordinate cannot be negative");
  if (clamped.width > 1920 || clamped.height > 1080) throw new Error("Clamped size exceeds bounds");
  if (clamped.x + clamped.width > 1920 || clamped.y + clamped.height > 1080) {
    throw new Error("Clamped rectangle bounds overflow");
  }

  // Test 5: calculateRotatedDimensions
  const rot0 = calculateRotatedDimensions(1920, 1080, 0);
  if (rot0.width !== 1920 || rot0.height !== 1080) throw new Error("Rot 0 failed");

  const rot90 = calculateRotatedDimensions(1920, 1080, 90);
  if (rot90.width !== 1080 || rot90.height !== 1920) throw new Error("Rot 90 failed");

  const rot180 = calculateRotatedDimensions(1920, 1080, 180);
  if (rot180.width !== 1920 || rot180.height !== 1080) throw new Error("Rot 180 failed");

  const rot270 = calculateRotatedDimensions(1920, 1080, 270);
  if (rot270.width !== 1080 || rot270.height !== 1920) throw new Error("Rot 270 failed");

  // Test 6: Verify all presets have valid definitions
  ASPECT_PRESETS.forEach((preset) => {
    if (!preset.id || !preset.name || !preset.label) {
      throw new Error(`Invalid preset: ${JSON.stringify(preset)}`);
    }
  });

  return true;
}
