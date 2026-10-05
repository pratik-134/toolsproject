/**
 * Harmonic Color Palette Studio & WCAG Contrast Checker — Pure Domain Logic
 * 100% In-Browser Color Harmonies, WCAG 2.1 Contrast & Accessibility Auditing
 * Zero External Network Calls, Zero Server Uploads (Cleartrix Invariant #1)
 */

export type HarmonyMode =
  | "analogous"
  | "monochromatic"
  | "triadic"
  | "complementary"
  | "split-complementary"
  | "tetradic"
  | "random";

export type ExportFormat = "hex" | "rgb" | "hsl" | "css-variables" | "tailwind" | "json";

export interface ColorItem {
  id: string;
  hex: string;
  locked: boolean;
  name: string;
}

export interface WCAGScore {
  ratio: number;
  scoreText: string;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}

export interface VisionSimulation {
  protanopia: string;
  deuteranopia: string;
  tritanopia: string;
  achromatopsia: string;
}

/**
 * Standard named color dictionary for naming hex values
 */
const COLOR_NAMES: Array<{ name: string; hex: string }> = [
  { name: "Obsidian", hex: "#0f172a" },
  { name: "Slate", hex: "#475569" },
  { name: "Steel", hex: "#64748b" },
  { name: "Silver", hex: "#94a3b8" },
  { name: "Ghost White", hex: "#f8fafc" },
  { name: "Pure White", hex: "#ffffff" },
  { name: "Crimson", hex: "#ef4444" },
  { name: "Ruby", hex: "#dc2626" },
  { name: "Coral", hex: "#f97316" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Gold", hex: "#eab308" },
  { name: "Lime", hex: "#84cc16" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Sky Blue", hex: "#0ea5e9" },
  { name: "Cobalt", hex: "#3b82f6" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Fuchsia", hex: "#d946ef" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Midnight", hex: "#030712" },
  { name: "Forest", hex: "#166534" },
  { name: "Deep Ocean", hex: "#1e3a8a" },
  { name: "Charcoal", hex: "#1f2937" },
  { name: "Plum", hex: "#701a75" },
];

/**
 * Converts a hex string (#RRGGBB) to RGB tuple [0-255]
 */
export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) {
    return [0, 0, 0];
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return [r, g, b];
}

/**
 * Converts RGB tuple [0-255] to #RRGGBB hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts RGB tuple to HSL tuple [H: 0-360, S: 0-100, L: 0-100]
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Converts HSL tuple [H: 0-360, S: 0-100, L: 0-100] to RGB tuple
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return [val, val, val];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;
  const hNorm = h / 360;

  const r = Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hNorm) * 255);
  const b = Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255);

  return [r, g, b];
}

/**
 * Converts HSL tuple directly to Hex string
 */
export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Nearest color naming heuristic
 */
export function getColorName(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  let minDistance = Infinity;
  let closestName = "Custom Accent";

  for (const item of COLOR_NAMES) {
    const [nr, ng, nb] = hexToRgb(item.hex);
    // Euclidean distance in RGB color space
    const dist = Math.sqrt(
      Math.pow(r - nr, 2) + Math.pow(g - ng, 2) + Math.pow(b - nb, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestName = item.name;
    }
  }

  return closestName;
}

/**
 * Generates harmonic palettes based on standard color theory
 */
export function generateHarmonicPalette(
  baseHex: string,
  mode: HarmonyMode,
  count: number = 5
): string[] {
  const [r, g, b] = hexToRgb(baseHex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const palette: string[] = [baseHex];

  switch (mode) {
    case "analogous": {
      // 30 degree offsets
      const step = 28;
      for (let i = 1; i < count; i++) {
        const offset = i % 2 === 1 ? Math.ceil(i / 2) * step : -Math.ceil(i / 2) * step;
        palette.push(hslToHex(h + offset, s, l));
      }
      break;
    }

    case "monochromatic": {
      // Vary lightness and saturation
      const minL = Math.max(15, l - 35);
      const maxL = Math.min(90, l + 35);
      const span = (maxL - minL) / (count - 1 || 1);
      palette.length = 0;
      for (let i = 0; i < count; i++) {
        palette.push(hslToHex(h, Math.max(20, s - i * 4), minL + i * span));
      }
      break;
    }

    case "triadic": {
      // 120 degree offsets
      const hues = [h, (h + 120) % 360, (h + 240) % 360];
      for (let i = 1; i < count; i++) {
        const hueIdx = i % 3;
        const targetHue = hues[hueIdx] ?? h;
        const lightShift = i >= 3 ? (i % 2 === 0 ? 15 : -15) : 0;
        palette.push(hslToHex(targetHue, s, Math.max(20, Math.min(85, l + lightShift))));
      }
      break;
    }

    case "complementary": {
      // Opposite hue + variations
      const compHue = (h + 180) % 360;
      if (count >= 2) palette.push(hslToHex(compHue, s, l));
      if (count >= 3) palette.push(hslToHex(h, Math.max(25, s - 20), Math.min(85, l + 20)));
      if (count >= 4) palette.push(hslToHex(compHue, Math.max(25, s - 20), Math.max(20, l - 20)));
      if (count >= 5) palette.push(hslToHex(h, s, Math.max(15, l - 25)));
      break;
    }

    case "split-complementary": {
      // Base + 150 deg & 210 deg
      const c1 = (h + 150) % 360;
      const c2 = (h + 210) % 360;
      if (count >= 2) palette.push(hslToHex(c1, s, l));
      if (count >= 3) palette.push(hslToHex(c2, s, l));
      if (count >= 4) palette.push(hslToHex(h, Math.max(30, s - 25), Math.min(85, l + 25)));
      if (count >= 5) palette.push(hslToHex(c1, s, Math.max(20, l - 20)));
      break;
    }

    case "tetradic": {
      // 90 deg offsets (rectangle/square)
      const hues = [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360];
      for (let i = 1; i < count; i++) {
        const hueIdx = i % 4;
        const targetHue = hues[hueIdx] ?? h;
        palette.push(hslToHex(targetHue, s, l));
      }
      break;
    }

    case "random":
    default: {
      palette.length = 0;
      for (let i = 0; i < count; i++) {
        const randH = Math.floor(Math.random() * 360);
        const randS = 50 + Math.floor(Math.random() * 45); // vibrant 50-95%
        const randL = 30 + Math.floor(Math.random() * 50); // readable 30-80%
        palette.push(hslToHex(randH, randS, randL));
      }
      break;
    }
  }

  return palette.slice(0, count);
}

/**
 * Calculates Relative Luminance per W3C WCAG 2.1 specifications
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const transform = (val: number) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = transform(r);
  const G = transform(g);
  const B = transform(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculates WCAG 2.1 Contrast Ratio between two colors
 * Ratio range: 1.00 : 1 to 21.00 : 1
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

/**
 * Evaluates WCAG 2.1 Accessibility compliance
 */
export function evaluateWCAG(fgHex: string, bgHex: string): WCAGScore {
  const ratio = getContrastRatio(fgHex, bgHex);
  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3.0;
  const aaaNormal = ratio >= 7.0;
  const aaaLarge = ratio >= 4.5;

  let scoreText = "Fail";
  if (aaaNormal) {
    scoreText = "AAA Exceptional";
  } else if (aaNormal) {
    scoreText = "AA Pass";
  } else if (aaLarge) {
    scoreText = "AA Large Only";
  }

  return {
    ratio,
    scoreText,
    aaNormal,
    aaLarge,
    aaaNormal,
    aaaLarge,
  };
}

/**
 * Determines whether black or white text is more readable on a given background
 */
export function getReadableTextColor(bgHex: string): "#000000" | "#ffffff" {
  const blackRatio = getContrastRatio("#000000", bgHex);
  const whiteRatio = getContrastRatio("#ffffff", bgHex);
  return blackRatio > whiteRatio ? "#000000" : "#ffffff";
}

/**
 * Brettel / Viénot Color Blindness Simulation Matrices
 */
export function simulateColorBlindness(hex: string): VisionSimulation {
  const [r, g, b] = hexToRgb(hex);

  // Protanopia (red-blind)
  const pr = 0.56667 * r + 0.43333 * g + 0.0 * b;
  const pg = 0.55833 * r + 0.44167 * g + 0.0 * b;
  const pb = 0.0 * r + 0.24167 * g + 0.75833 * b;

  // Deuteranopia (green-blind)
  const dr = 0.625 * r + 0.375 * g + 0.0 * b;
  const dg = 0.7 * r + 0.3 * g + 0.0 * b;
  const db = 0.0 * r + 0.3 * g + 0.7 * b;

  // Tritanopia (blue-blind)
  const tr = 0.95 * r + 0.05 * g + 0.0 * b;
  const tg = 0.0 * r + 0.43333 * g + 0.56667 * b;
  const tb = 0.0 * r + 0.475 * g + 0.525 * b;

  // Achromatopsia (monochromacy)
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;

  return {
    protanopia: rgbToHex(pr, pg, pb),
    deuteranopia: rgbToHex(dr, dg, db),
    tritanopia: rgbToHex(tr, tg, tb),
    achromatopsia: rgbToHex(gray, gray, gray),
  };
}

/**
 * Formats colors into developer export specifications
 */
export function formatExport(colors: ColorItem[], format: ExportFormat): string {
  switch (format) {
    case "hex":
      return colors.map((c) => c.hex).join(", ");

    case "rgb":
      return colors
        .map((c) => {
          const [r, g, b] = hexToRgb(c.hex);
          return `rgb(${r}, ${g}, ${b})`;
        })
        .join("\n");

    case "hsl":
      return colors
        .map((c) => {
          const [r, g, b] = hexToRgb(c.hex);
          const [h, s, l] = rgbToHsl(r, g, b);
          return `hsl(${h}, ${s}%, ${l}%)`;
        })
        .join("\n");

    case "css-variables":
      return `:root {\n${colors
        .map((c, i) => `  --color-${c.name.toLowerCase().replace(/\s+/g, "-")}-${i + 1}: ${c.hex};`)
        .join("\n")}\n}`;

    case "tailwind": {
      const entries = colors
        .map((c, i) => `      '${c.name.toLowerCase().replace(/\s+/g, "-")}-${i + 1}': '${c.hex}',`)
        .join("\n");
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries}\n      }\n    }\n  }\n};`;
    }

    case "json":
      return JSON.stringify(
        colors.map((c) => {
          const [r, g, b] = hexToRgb(c.hex);
          const [h, s, l] = rgbToHsl(r, g, b);
          return {
            name: c.name,
            hex: c.hex,
            rgb: `rgb(${r}, ${g}, ${b})`,
            hsl: `hsl(${h}, ${s}%, ${l}%)`,
          };
        }),
        null,
        2
      );

    default:
      return "";
  }
}
