/**
 * Pure Client-Side Barcode Generator Engine (Code 128B, EAN-13, UPC-A)
 * Zero external libraries, pure algorithmic canvas and SVG rendering.
 */

export type BarcodeFormat = "CODE128" | "EAN13" | "UPCA";

export interface BarcodeRenderOptions {
  barWidth?: number; // width of a single 1-module bar in px (default 2)
  height?: number; // barcode height in px (default 80)
  showText?: boolean;
  color?: string; // bar color (default #000000)
  bgColor?: string; // background color (default #ffffff)
  fontSize?: number;
}

export interface BarcodeValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
  pattern: string; // binary string "101100..."
  displayText: string;
}

/* =========================================================================
   1. CODE 128 (Subset B) - High Density Alphanumeric Barcode
   ========================================================================= */

// Code 128 patterns: 107 symbols (11 bits each, except stop which is 13 bits)
// Represented as run-lengths of bar/space pairs (each pattern has 6 elements)
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (106 is STOP)
];

function runLengthToBinary(runLength: string): string {
  let binary = "";
  for (let i = 0; i < runLength.length; i++) {
    const len = parseInt(runLength[i] ?? "1", 10);
    const bit = i % 2 === 0 ? "1" : "0";
    binary += bit.repeat(len);
  }
  return binary;
}

export function encodeCode128B(text: string): BarcodeValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { valid: false, normalized: "", error: "Please enter text to encode", pattern: "", displayText: "" };
  }

  // Check valid ASCII 32-126
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if (code < 32 || code > 126) {
      return {
        valid: false,
        normalized: trimmed,
        error: `Unsupported character: '${trimmed[i]}'. Code 128B supports standard ASCII.`,
        pattern: "",
        displayText: trimmed,
      };
    }
  }

  // Start B is index 104
  const startVal = 104;
  let checksum = startVal;
  let pattern = runLengthToBinary(CODE128_PATTERNS[startVal] ?? "211214");

  for (let i = 0; i < trimmed.length; i++) {
    const val = trimmed.charCodeAt(i) - 32;
    checksum += val * (i + 1);
    pattern += runLengthToBinary(CODE128_PATTERNS[val] ?? "212222");
  }

  const checkCharVal = checksum % 103;
  pattern += runLengthToBinary(CODE128_PATTERNS[checkCharVal] ?? "212222");

  // Stop character (index 106)
  pattern += runLengthToBinary(CODE128_PATTERNS[106] ?? "2331112");

  return {
    valid: true,
    normalized: trimmed,
    pattern,
    displayText: trimmed,
  };
}

/* =========================================================================
   2. EAN-13 RETAIL BARCODE
   ========================================================================= */

// EAN-13 Digit Encodings: L-code, G-code, R-code
const EAN_L = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011"
];
const EAN_G = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111"
];
const EAN_R = [
  "1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100"
];

// Structure based on 1st digit (0-9)
const EAN_FIRST_DIGIT_STRUCTURE = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"
];

export function calculateEan13Checksum(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12[i] ?? "0", 10);
    sum += i % 2 === 0 ? digit * 1 : digit * 3;
  }
  const rem = sum % 10;
  return rem === 0 ? 0 : 10 - rem;
}

export function encodeEan13(input: string): BarcodeValidationResult {
  const clean = input.replace(/\D/g, "");
  if (clean.length < 12) {
    return {
      valid: false,
      normalized: clean,
      error: `EAN-13 requires 12 or 13 digits (you entered ${clean.length})`,
      pattern: "",
      displayText: clean,
    };
  }

  const digits12 = clean.slice(0, 12);
  const expectedCheck = calculateEan13Checksum(digits12);

  let full13 = digits12 + expectedCheck;
  if (clean.length >= 13 && parseInt(clean[12] ?? "0", 10) !== expectedCheck) {
    // notify corrected check digit
    full13 = digits12 + expectedCheck;
  }

  const firstDigit = parseInt(full13[0] ?? "0", 10);
  const structure = EAN_FIRST_DIGIT_STRUCTURE[firstDigit] ?? "LLLLLL";

  // EAN-13 Binary pattern
  let pattern = "101"; // Start guard

  // Left 6 digits (digits 1 to 6)
  for (let i = 0; i < 6; i++) {
    const digit = parseInt(full13[i + 1] ?? "0", 10);
    const mode = structure[i];
    pattern += mode === "L" ? (EAN_L[digit] ?? "") : (EAN_G[digit] ?? "");
  }

  pattern += "01010"; // Center guard

  // Right 6 digits (digits 7 to 12)
  for (let i = 0; i < 6; i++) {
    const digit = parseInt(full13[i + 7] ?? "0", 10);
    pattern += EAN_R[digit] ?? "";
  }

  pattern += "101"; // Stop guard

  return {
    valid: true,
    normalized: full13,
    pattern,
    displayText: `${full13.slice(0, 1)} ${full13.slice(1, 7)} ${full13.slice(7)}`,
  };
}

/* =========================================================================
   3. UPC-A RETAIL BARCODE (12 digits, subset of EAN-13 with leading 0)
   ========================================================================= */

export function encodeUpcA(input: string): BarcodeValidationResult {
  const clean = input.replace(/\D/g, "");
  if (clean.length < 11) {
    return {
      valid: false,
      normalized: clean,
      error: `UPC-A requires 11 or 12 digits (you entered ${clean.length})`,
      pattern: "",
      displayText: clean,
    };
  }

  // UPC-A is equivalent to EAN-13 with first digit = 0
  const eanEquivalent = "0" + clean.slice(0, 11);
  const eanRes = encodeEan13(eanEquivalent);

  if (!eanRes.valid) {
    return { ...eanRes, error: eanRes.error?.replace("EAN-13", "UPC-A") };
  }

  const upc12 = eanRes.normalized.slice(1);
  return {
    valid: true,
    normalized: upc12,
    pattern: eanRes.pattern,
    displayText: `${upc12[0]} ${upc12.slice(1, 6)} ${upc12.slice(6, 11)} ${upc12[11]}`,
  };
}

/* =========================================================================
   4. RENDERING ENGINE: Canvas & Scalable Vector SVG
   ========================================================================= */

export function renderBarcodeToCanvas(
  canvas: HTMLCanvasElement,
  pattern: string,
  displayText: string,
  options: BarcodeRenderOptions = {}
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const barWidth = options.barWidth || 2;
  const height = options.height || 90;
  const showText = options.showText !== false;
  const color = options.color || "#000000";
  const bgColor = options.bgColor || "#ffffff";
  const quietZoneModules = 10;

  const totalModules = pattern.length + quietZoneModules * 2;
  const canvasWidth = totalModules * barWidth;
  const textHeight = showText ? 24 : 0;
  const canvasHeight = height + textHeight + 20;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Bars
  ctx.fillStyle = color;
  let startX = quietZoneModules * barWidth;
  const startY = 10;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "1") {
      ctx.fillRect(startX, startY, barWidth, height);
    }
    startX += barWidth;
  }

  // Text
  if (showText && displayText) {
    ctx.fillStyle = color;
    ctx.font = `bold ${options.fontSize || 13}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, canvasWidth / 2, startY + height + 12);
  }
}

export function generateBarcodeSvg(
  pattern: string,
  displayText: string,
  options: BarcodeRenderOptions = {}
): string {
  const barWidth = options.barWidth || 2;
  const height = options.height || 90;
  const showText = options.showText !== false;
  const color = options.color || "#000000";
  const bgColor = options.bgColor || "#ffffff";
  const quietZoneModules = 10;

  const totalModules = pattern.length + quietZoneModules * 2;
  const svgWidth = totalModules * barWidth;
  const textHeight = showText ? 24 : 0;
  const svgHeight = height + textHeight + 20;

  let rects = "";
  let startX = quietZoneModules * barWidth;
  const startY = 10;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "1") {
      rects += `<rect x="${startX}" y="${startY}" width="${barWidth}" height="${height}" fill="${color}" />\n`;
    }
    startX += barWidth;
  }

  let textElement = "";
  if (showText && displayText) {
    textElement = `<text x="${svgWidth / 2}" y="${startY + height + 14}" text-anchor="middle" font-family="monospace" font-size="${options.fontSize || 13}" font-weight="bold" fill="${color}">${displayText}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <rect width="100%" height="100%" fill="${bgColor}" />
  ${rects}
  ${textElement}
</svg>`;
}
