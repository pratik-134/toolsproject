import {
  calculateSinglePosition,
  calculateTiledGrid,
  DEFAULT_WATERMARK_OPTIONS,
  WATERMARK_PRESETS,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Single position calculations
  const center = calculateSinglePosition(1000, 800, 200, 50, "center");
  if (center.x !== 500 || center.y !== 400) {
    throw new Error(`Center position error: expected (500, 400), got (${center.x}, ${center.y})`);
  }

  const topLeft = calculateSinglePosition(1000, 800, 200, 50, "top-left", 20);
  if (topLeft.x !== 120 || topLeft.y !== 45) {
    throw new Error(`Top-left position error: expected (120, 45), got (${topLeft.x}, ${topLeft.y})`);
  }

  const bottomRight = calculateSinglePosition(1000, 800, 200, 50, "bottom-right", 30);
  if (bottomRight.x !== 870 || bottomRight.y !== 745) {
    throw new Error(`Bottom-right position error: expected (870, 745), got (${bottomRight.x}, ${bottomRight.y})`);
  }

  // Test 2: Tiled grid generation
  const grid = calculateTiledGrid(500, 400, 100, 100);
  if (!Array.isArray(grid) || grid.length < 15) {
    throw new Error(`Expected at least 15 tiled coordinates, got ${grid.length}`);
  }

  // Test 3: Presets validity
  if (WATERMARK_PRESETS.length < 3) {
    throw new Error("Expected at least 3 watermark presets");
  }
  for (const preset of WATERMARK_PRESETS) {
    if (!preset.name || !preset.options.text) {
      throw new Error(`Invalid preset: ${JSON.stringify(preset)}`);
    }
  }

  // Test 4: Default options
  if (DEFAULT_WATERMARK_OPTIONS.opacity > 1 || DEFAULT_WATERMARK_OPTIONS.opacity < 0) {
    throw new Error("Default opacity out of range [0, 1]");
  }

  return true;
}
