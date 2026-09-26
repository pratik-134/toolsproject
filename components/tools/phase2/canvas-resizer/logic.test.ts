/**
 * Unit Tests for Canvas Resizer Logic
 */

import {
  calculateProportionalDimension,
  calculatePercentageDimensions,
  calculateCanvasPlacement,
  RESIZE_PRESETS,
} from "./logic";

export function runCanvasResizerTests() {
  // Test 1: calculateProportionalDimension (width driven)
  const d1 = calculateProportionalDimension(1920, 1080, { width: 960 });
  if (d1.width !== 960 || d1.height !== 540) {
    throw new Error(`Aspect ratio scaling width-driven failed: got ${JSON.stringify(d1)}`);
  }

  // Test 2: calculateProportionalDimension (height driven)
  const d2 = calculateProportionalDimension(1920, 1080, { height: 720 });
  if (d2.width !== 1280 || d2.height !== 720) {
    throw new Error(`Aspect ratio scaling height-driven failed: got ${JSON.stringify(d2)}`);
  }

  // Test 3: calculatePercentageDimensions
  const p50 = calculatePercentageDimensions(1920, 1080, 50);
  if (p50.width !== 960 || p50.height !== 540) {
    throw new Error(`50% percentage resize failed: got ${JSON.stringify(p50)}`);
  }

  const p200 = calculatePercentageDimensions(800, 600, 200);
  if (p200.width !== 1600 || p200.height !== 1200) {
    throw new Error(`200% percentage resize failed: got ${JSON.stringify(p200)}`);
  }

  // Test 4: calculateCanvasPlacement ("fit" mode for 16:9 in square)
  const fit = calculateCanvasPlacement(1600, 900, 1000, 1000, "fit");
  if (fit.destWidth !== 1000) throw new Error(`Fit width error: got ${fit.destWidth}`);
  if (fit.destHeight !== Math.round(1000 / (16 / 9))) {
    throw new Error(`Fit height error: got ${fit.destHeight}`);
  }
  if (fit.destX !== 0 || fit.destY <= 0) {
    throw new Error(`Fit vertical centering error: destY=${fit.destY}`);
  }

  // Test 5: calculateCanvasPlacement ("fill" mode)
  const fill = calculateCanvasPlacement(1600, 900, 1000, 1000, "fill");
  if (fill.destHeight !== 1000) throw new Error("Fill height should match canvas");
  if (fill.destWidth <= 1000) throw new Error("Fill width should exceed canvas width");
  if (fill.destX >= 0) throw new Error("Fill destX should be negative (centered overflow)");

  // Test 6: calculateCanvasPlacement ("stretch" mode)
  const stretch = calculateCanvasPlacement(1600, 900, 500, 400, "stretch");
  if (stretch.destWidth !== 500 || stretch.destHeight !== 400 || stretch.destX !== 0 || stretch.destY !== 0) {
    throw new Error("Stretch placement should match canvas exactly");
  }

  // Test 7: verify presets
  RESIZE_PRESETS.forEach((preset) => {
    if (preset.width <= 0 || preset.height <= 0) {
      throw new Error(`Invalid preset dimensions: ${preset.name}`);
    }
  });

  return true;
}
