/**
 * Unit Tests for Harmonic Color Palette Studio & WCAG Contrast Checker
 * Tests math determinism, WCAG 2.1 compliance ratios, color blindness matrices, and export generators
 */

import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToHex,
  getColorName,
  generateHarmonicPalette,
  getRelativeLuminance,
  getContrastRatio,
  evaluateWCAG,
  getReadableTextColor,
  simulateColorBlindness,
  formatExport,
  ColorItem,
} from "./logic";

export function runColorPaletteTests(): boolean {
  console.log("Testing [color-palette-generator] logic...");

  // 1. Color Conversion Round-trips
  const rgb = hexToRgb("#3b82f6");
  if (rgb[0] !== 59 || rgb[1] !== 130 || rgb[2] !== 246) {
    throw new Error(`hexToRgb failed: expected [59, 130, 246], got ${JSON.stringify(rgb)}`);
  }

  const hexBack = rgbToHex(59, 130, 246);
  if (hexBack.toLowerCase() !== "#3b82f6") {
    throw new Error(`rgbToHex failed: expected #3b82f6, got ${hexBack}`);
  }

  // 2. HSL Conversion
  const [h, s, l] = rgbToHsl(255, 0, 0); // Pure Red
  if (h !== 0 || s !== 100 || l !== 50) {
    throw new Error(`rgbToHsl pure red failed: expected [0, 100, 50], got [${h}, ${s}, ${l}]`);
  }
  const redHex = hslToHex(0, 100, 50);
  if (redHex.toLowerCase() !== "#ff0000") {
    throw new Error(`hslToHex pure red failed: expected #ff0000, got ${redHex}`);
  }

  // 3. Color Naming
  const name = getColorName("#ef4444");
  if (!name || typeof name !== "string") {
    throw new Error(`getColorName failed to provide name`);
  }

  // 4. Harmonic Palette Generation
  const compPalette = generateHarmonicPalette("#3b82f6", "complementary", 5);
  if (compPalette.length !== 5 || !compPalette[0] || !compPalette[0].startsWith("#")) {
    throw new Error(`generateHarmonicPalette complementary returned invalid palette: ${JSON.stringify(compPalette)}`);
  }

  const analogPalette = generateHarmonicPalette("#10b981", "analogous", 5);
  if (analogPalette.length !== 5) {
    throw new Error(`generateHarmonicPalette analogous returned invalid length`);
  }

  const monoPalette = generateHarmonicPalette("#6366f1", "monochromatic", 5);
  if (monoPalette.length !== 5) {
    throw new Error(`generateHarmonicPalette monochromatic returned invalid length`);
  }

  // 5. WCAG 2.1 Contrast Ratio Verification
  // Black on White: 21:1
  const blackWhiteRatio = getContrastRatio("#000000", "#ffffff");
  if (blackWhiteRatio !== 21) {
    throw new Error(`getContrastRatio black on white failed: expected 21, got ${blackWhiteRatio}`);
  }

  // White on White: 1:1
  const whiteWhiteRatio = getContrastRatio("#ffffff", "#ffffff");
  if (whiteWhiteRatio !== 1) {
    throw new Error(`getContrastRatio white on white failed: expected 1, got ${whiteWhiteRatio}`);
  }

  // Dark text on light background
  const wcagPass = evaluateWCAG("#000000", "#ffffff");
  if (!wcagPass.aaNormal || !wcagPass.aaaNormal) {
    throw new Error(`evaluateWCAG black on white should pass AAA Normal`);
  }

  // Poor contrast
  const wcagFail = evaluateWCAG("#f8fafc", "#ffffff");
  if (wcagFail.aaNormal) {
    throw new Error(`evaluateWCAG faint white on white should fail AA Normal`);
  }

  // Readable text selector
  const textOnDark = getReadableTextColor("#0f172a");
  if (textOnDark !== "#ffffff") {
    throw new Error(`getReadableTextColor on obsidian should be #ffffff, got ${textOnDark}`);
  }

  const textOnLight = getReadableTextColor("#f8fafc");
  if (textOnLight !== "#000000") {
    throw new Error(`getReadableTextColor on ghost white should be #000000, got ${textOnLight}`);
  }

  // 6. Vision Simulation
  const vision = simulateColorBlindness("#3b82f6");
  if (!vision.protanopia || !vision.deuteranopia || !vision.tritanopia || !vision.achromatopsia) {
    throw new Error(`simulateColorBlindness returned incomplete simulation`);
  }

  // 7. Format Export
  const sampleColors: ColorItem[] = [
    { id: "1", hex: "#3b82f6", locked: false, name: "Cobalt" },
    { id: "2", hex: "#10b981", locked: false, name: "Emerald" },
  ];

  const cssExp = formatExport(sampleColors, "css-variables");
  if (!cssExp.includes("--color-cobalt-1: #3b82f6;")) {
    throw new Error(`formatExport css-variables format mismatch: ${cssExp}`);
  }

  const twExp = formatExport(sampleColors, "tailwind");
  if (!twExp.includes("'cobalt-1': '#3b82f6'")) {
    throw new Error(`formatExport tailwind format mismatch: ${twExp}`);
  }

  const jsonExp = formatExport(sampleColors, "json");
  const parsed = JSON.parse(jsonExp);
  if (parsed.length !== 2 || parsed[0].hex !== "#3b82f6") {
    throw new Error(`formatExport json format mismatch`);
  }

  console.log("✅ [color-palette-generator] unit tests passed!");
  return true;
}
