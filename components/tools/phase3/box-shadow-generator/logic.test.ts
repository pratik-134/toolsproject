/**
 * Unit Tests for Interactive CSS Box-Shadow & Glassmorphism Studio
 */

import { buildBoxShadowCss, getElevationPreset } from "./logic";

export function runBoxShadowTests(): boolean {
  console.log("Testing [box-shadow-generator] logic...");

  // 1. Single layer
  const single = buildBoxShadowCss([
    { id: "1", x: 0, y: 10, blur: 20, spread: 5, color: "rgba(0, 0, 0, 0.2)", inset: false },
  ]);
  if (single !== "0px 10px 20px 5px rgba(0, 0, 0, 0.2)") {
    throw new Error(`buildBoxShadowCss unexpected output: ${single}`);
  }

  // 2. Inset shadow
  const inset = buildBoxShadowCss([
    { id: "1", x: 2, y: 2, blur: 4, spread: 0, color: "#000000", inset: true },
  ]);
  if (!inset.startsWith("inset ")) {
    throw new Error(`buildBoxShadowCss should start with inset`);
  }

  // 3. Elevation Presets
  const elevation = getElevationPreset(3);
  if (elevation.length !== 2) {
    throw new Error(`getElevationPreset(3) expected 2 layers, got ${elevation.length}`);
  }

  console.log("✅ [box-shadow-generator] unit tests passed!");
  return true;
}
