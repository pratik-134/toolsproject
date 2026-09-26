import {
  DEFAULT_FILTER_ADJUSTMENTS,
  FILTER_PRESETS,
  buildCssFilterString,
  applyPreset,
  clampAdjustments,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Default adjustments generate "none"
  const defaultFilter = buildCssFilterString(DEFAULT_FILTER_ADJUSTMENTS);
  if (defaultFilter !== "none") {
    throw new Error(`Expected default filter to be 'none', got '${defaultFilter}'`);
  }

  // Test 2: Custom adjustments
  const custom = buildCssFilterString({
    ...DEFAULT_FILTER_ADJUSTMENTS,
    brightness: 120,
    contrast: 130,
    sepia: 50,
  });
  if (!custom.includes("brightness(120%)") || !custom.includes("contrast(130%)") || !custom.includes("sepia(50%)")) {
    throw new Error(`Custom filter string generation failed: ${custom}`);
  }

  // Test 3: Presets application
  const noir = applyPreset("noir");
  if (noir.grayscale !== 100 || noir.contrast !== 155) {
    throw new Error("Noir preset adjustments failed to apply correctly");
  }

  const vintage = applyPreset("vintage");
  if (vintage.sepia !== 70) {
    throw new Error("Vintage preset failed to set sepia");
  }

  // Test 4: Clamping
  const clamped = clampAdjustments({
    brightness: 999,
    contrast: -50,
    blur: 500,
  });
  if (clamped.brightness !== 200) throw new Error("Brightness not clamped to 200");
  if (clamped.contrast !== 0) throw new Error("Contrast not clamped to 0");
  if (clamped.blur !== 20) throw new Error("Blur not clamped to 20");

  return true;
}
