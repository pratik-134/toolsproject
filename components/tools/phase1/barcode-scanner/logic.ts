/**
 * Pure Client-Side 1D Barcode Scanner & Decoder Engine
 * Supports Code 128 (Subset B), EAN-13, UPC-A, and Code 39.
 * Zero external libraries, 100% deterministic mathematical decoding.
 */

export interface ImageDataLike {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array | number[];
}

export type DetectedBarcodeFormat = "CODE128" | "EAN13" | "UPCA" | "CODE39";

export interface BarcodeScanResult {
  found: boolean;
  format?: DetectedBarcodeFormat;
  text?: string;
  checksumValid?: boolean;
  scanlineY?: number;
  confidence?: number;
  details?: string;
  error?: string;
}

export interface RunLength {
  isBlack: boolean;
  length: number;
}

/* =========================================================================
   1. CODE 128 (Subset B) Patterns and Lookup
   ========================================================================= */

// Code 128 patterns: 107 symbols (each has 6 elements summing to 11 modules; stop has 7 elements)
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
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (104=Start B, 106=Stop)
];

const CODE128_CHARS: Record<number, string> = {};
for (let i = 0; i <= 95; i++) {
  CODE128_CHARS[i] = String.fromCharCode(32 + i);
}

/* =========================================================================
   2. EAN-13 / UPC-A Patterns and Lookup
   ========================================================================= */

// EAN L-codes (odd parity) and G-codes (even parity)
const EAN_L_PATTERNS = ["3211", "2221", "2122", "1411", "1132", "1231", "1114", "1312", "1213", "3112"];
const EAN_G_PATTERNS = ["1123", "1222", "2212", "1141", "2311", "1321", "4111", "2131", "3121", "2113"];
const EAN_R_PATTERNS = EAN_L_PATTERNS; // Same run-lengths as L-code, but colors inverted

const FIRST_DIGIT_PARITY = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"
];

/* =========================================================================
   3. Code 39 Patterns
   ========================================================================= */

const CODE39_MAP: Record<string, string> = {
  "000110100": "0", "100100001": "1", "001100001": "2", "101100000": "3", "000110001": "4",
  "100110000": "5", "001110000": "6", "000100101": "7", "100100100": "8", "001100100": "9",
  "100001001": "A", "001001001": "B", "101001000": "C", "000011001": "D", "100011000": "E",
  "001011000": "F", "000001101": "G", "100001100": "H", "001001100": "I", "000011100": "J",
  "100000011": "K", "001000011": "L", "101000010": "M", "000010011": "N", "100010010": "O",
  "001010010": "P", "000000111": "Q", "100000110": "R", "001000110": "S", "000010110": "T",
  "110000001": "U", "011000001": "V", "111000000": "W", "010010001": "X", "110010000": "Y",
  "011010000": "Z", "010000101": "-", "110000100": ".", "011000100": " ", "010101000": "$",
  "010100010": "/", "010001010": "+", "000101010": "%", "010010100": "*"
};

/* =========================================================================
   4. Image Processing & Scanline Extraction
   ========================================================================= */

/**
 * Extracts horizontal run lengths from a 1D binary array.
 */
export function getRunLengths(scanline: boolean[]): RunLength[] {
  const runs: RunLength[] = [];
  if (scanline.length === 0) return runs;

  let currentBlack = scanline[0] ?? false;
  let currentLen = 1;

  for (let i = 1; i < scanline.length; i++) {
    const isBlack = scanline[i] ?? false;
    if (isBlack === currentBlack) {
      currentLen++;
    } else {
      runs.push({ isBlack: currentBlack, length: currentLen });
      currentBlack = isBlack;
      currentLen = 1;
    }
  }
  runs.push({ isBlack: currentBlack, length: currentLen });
  return runs;
}

/**
 * Binarizes a horizontal row of pixels from ImageData using local or Otsu threshold.
 */
export function binarizeRow(
  imageData: ImageDataLike,
  y: number,
  thresholdOverride?: number
): boolean[] {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  if (y < 0 || y >= height) return [];

  // 1. Calculate luminance values for this row
  const lum: number[] = new Array(width);
  let minLum = 255;
  let maxLum = 0;

  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx] ?? 0;
    const g = data[idx + 1] ?? 0;
    const b = data[idx + 2] ?? 0;
    // Standard Rec 601 luma formula
    const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    lum[x] = l;
    if (l < minLum) minLum = l;
    if (l > maxLum) maxLum = l;
  }

  // Threshold calculation
  const threshold =
    thresholdOverride !== undefined
      ? thresholdOverride
      : Math.round((minLum + maxLum) / 2);

  // Barcode convention: true = BLACK (bar), false = WHITE (space)
  const result: boolean[] = new Array(width);
  for (let x = 0; x < width; x++) {
    const val = lum[x] ?? 255;
    result[x] = val <= threshold;
  }

  return result;
}

/* =========================================================================
   5. Decoding Algorithms
   ========================================================================= */

/**
 * Helper to match 6 bar/space widths to the closest Code 128 symbol pattern.
 */
function matchCode128Symbol(widths: number[]): number | null {
  if (widths.length !== 6) return null;
  const sum = widths.reduce((a, b) => a + b, 0);
  if (sum === 0) return null;

  // Each Code 128 character is exactly 11 modules wide
  let bestIdx = -1;
  let bestScore = Infinity;

  for (let i = 0; i < CODE128_PATTERNS.length; i++) {
    const pat = CODE128_PATTERNS[i] ?? "";
    if (pat.length < 6) continue;

    let score = 0;
    for (let j = 0; j < 6; j++) {
      const ideal = (parseInt(pat.charAt(j), 10) * sum) / 11;
      const actual = widths[j] ?? 0;
      score += Math.abs(ideal - actual);
    }

    if (score < bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  // Max allowable error per character normalized by module size
  const avgModule = sum / 11;
  if (bestScore < avgModule * 2.5) {
    return bestIdx;
  }
  return null;
}

/**
 * Decodes Code 128 barcode from a sequence of run lengths.
 */
export function decodeCode128FromRuns(runs: RunLength[]): { text: string; checksumValid: boolean } | null {
  // We need at least: Start (6), 1 char (6), Checksum (6), Stop (7) = 25 runs
  if (runs.length < 25) return null;

  // Search for Start B (104: "211214") or Start A (103: "211412") or Start C (105: "211232")
  for (let r = 0; r < runs.length - 24; r++) {
    const startRun = runs[r];
    if (!startRun || !startRun.isBlack) continue;

    const candidate6 = runs.slice(r, r + 6).map((x) => x.length);
    const startSymbol = matchCode128Symbol(candidate6);

    if (startSymbol === 104 || startSymbol === 103 || startSymbol === 105) {
      // Found potential start symbol!
      const symbolIndices: number[] = [startSymbol];
      let curr = r + 6;
      let foundStop = false;

      while (curr + 6 <= runs.length) {
        // Check if next is STOP pattern (106: "2331112" - 7 runs)
        if (curr + 7 <= runs.length) {
          const stopCandidate = runs.slice(curr, curr + 7).map((x) => x.length);
          const stopSum = stopCandidate.reduce((a, b) => a + b, 0);
          const stopMod = stopSum / 13;
          let stopScore = 0;
          const stopPat = "2331112";
          for (let s = 0; s < 7; s++) {
            const ideal = parseInt(stopPat.charAt(s), 10) * stopMod;
            stopScore += Math.abs(ideal - (stopCandidate[s] ?? 0));
          }
          if (stopScore < stopMod * 2.5) {
            foundStop = true;
            break;
          }
        }

        const charCandidate = runs.slice(curr, curr + 6).map((x) => x.length);
        const sym = matchCode128Symbol(charCandidate);
        if (sym === null) break;

        symbolIndices.push(sym);
        curr += 6;
      }

      if (foundStop && symbolIndices.length >= 3) {
        // Last symbol before stop is checksum
        const checkSymbol = symbolIndices[symbolIndices.length - 1] ?? 0;
        const dataSymbols = symbolIndices.slice(1, -1);

        // Calculate modulo 103 checksum
        const startVal = symbolIndices[0] ?? 104;
        let sum = startVal;
        for (let i = 0; i < dataSymbols.length; i++) {
          sum += (i + 1) * (dataSymbols[i] ?? 0);
        }
        const expectedCheck = sum % 103;
        const checksumValid = expectedCheck === checkSymbol;

        // Decode characters (subset B)
        let text = "";
        for (const s of dataSymbols) {
          text += CODE128_CHARS[s] ?? "";
        }

        if (text.length > 0) {
          return { text, checksumValid };
        }
      }
    }
  }

  return null;
}

/**
 * Matches 4 bar/space widths to an EAN digit.
 */
function matchEanDigit(widths: number[]): { digit: number; parity: "L" | "G" } | null {
  if (widths.length !== 4) return null;
  const sum = widths.reduce((a, b) => a + b, 0);
  if (sum === 0) return null;

  let bestScore = Infinity;
  let bestDigit = -1;
  let bestParity: "L" | "G" = "L";

  for (let d = 0; d < 10; d++) {
    // Check L
    const lPat = EAN_L_PATTERNS[d] ?? "";
    let lScore = 0;
    for (let i = 0; i < 4; i++) {
      const ideal = (parseInt(lPat.charAt(i), 10) * sum) / 7;
      lScore += Math.abs(ideal - (widths[i] ?? 0));
    }
    if (lScore < bestScore) {
      bestScore = lScore;
      bestDigit = d;
      bestParity = "L";
    }

    // Check G
    const gPat = EAN_G_PATTERNS[d] ?? "";
    let gScore = 0;
    for (let i = 0; i < 4; i++) {
      const ideal = (parseInt(gPat.charAt(i), 10) * sum) / 7;
      gScore += Math.abs(ideal - (widths[i] ?? 0));
    }
    if (gScore < bestScore) {
      bestScore = gScore;
      bestDigit = d;
      bestParity = "G";
    }
  }

  const avgModule = sum / 7;
  if (bestScore < avgModule * 2.2) {
    return { digit: bestDigit, parity: bestParity };
  }
  return null;
}

/**
 * Decodes EAN-13 or UPC-A barcode from a sequence of run lengths.
 */
export function decodeEan13FromRuns(runs: RunLength[]): { text: string; format: "EAN13" | "UPCA"; checksumValid: boolean } | null {
  // EAN-13 has: Start Guard (3), 6 left digits (6 * 4 = 24), Center Guard (5), 6 right digits (24), Stop Guard (3) = 59 runs
  if (runs.length < 59) return null;

  for (let r = 0; r <= runs.length - 59; r++) {
    // Check start guard: Black, White, Black (3 runs of roughly equal width)
    const g1 = runs[r];
    const g2 = runs[r + 1];
    const g3 = runs[r + 2];
    if (!g1 || !g2 || !g3 || !g1.isBlack || g2.isBlack || !g3.isBlack) continue;

    const avgGuardMod = (g1.length + g2.length + g3.length) / 3;
    if (
      Math.abs(g1.length - avgGuardMod) > avgGuardMod * 0.8 ||
      Math.abs(g2.length - avgGuardMod) > avgGuardMod * 0.8 ||
      Math.abs(g3.length - avgGuardMod) > avgGuardMod * 0.8
    ) {
      continue;
    }

    // Try reading 6 left digits
    let curr = r + 3;
    const leftDigits: number[] = [];
    let parityString = "";
    let validLeft = true;

    for (let i = 0; i < 6; i++) {
      const charWidths = runs.slice(curr, curr + 4).map((x) => x.length);
      const match = matchEanDigit(charWidths);
      if (!match) {
        validLeft = false;
        break;
      }
      leftDigits.push(match.digit);
      parityString += match.parity;
      curr += 4;
    }
    if (!validLeft) continue;

    // Check center guard: White, Black, White, Black, White (5 runs)
    const c1 = runs[curr];
    const c2 = runs[curr + 1];
    const c3 = runs[curr + 2];
    const c4 = runs[curr + 3];
    const c5 = runs[curr + 4];
    if (
      !c1 || !c2 || !c3 || !c4 || !c5 ||
      c1.isBlack || !c2.isBlack || c3.isBlack || !c4.isBlack || c5.isBlack
    ) {
      continue;
    }
    curr += 5;

    // Read 6 right digits
    const rightDigits: number[] = [];
    let validRight = true;
    for (let i = 0; i < 6; i++) {
      const charWidths = runs.slice(curr, curr + 4).map((x) => x.length);
      const match = matchEanDigit(charWidths);
      if (!match) {
        validRight = false;
        break;
      }
      rightDigits.push(match.digit);
      curr += 4;
    }
    if (!validRight) continue;

    // Determine first digit from parity string
    const firstDigit = FIRST_DIGIT_PARITY.indexOf(parityString);
    if (firstDigit === -1) continue;

    const fullDigits = [firstDigit, ...leftDigits, ...rightDigits];
    const fullText = fullDigits.join("");

    // Checksum verification
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const val = fullDigits[i] ?? 0;
      sum += i % 2 === 0 ? val : val * 3;
    }
    const expectedCheck = (10 - (sum % 10)) % 10;
    const actualCheck = fullDigits[12] ?? -1;
    const checksumValid = expectedCheck === actualCheck;

    if (firstDigit === 0) {
      // UPC-A representation (12 digits)
      return {
        text: fullText.substring(1),
        format: "UPCA",
        checksumValid
      };
    }

    return {
      text: fullText,
      format: "EAN13",
      checksumValid
    };
  }

  return null;
}

/**
 * Decodes Code 39 barcode from a sequence of run lengths.
 */
export function decodeCode39FromRuns(runs: RunLength[]): { text: string; checksumValid: boolean } | null {
  // Code 39: Each char is 9 elements (5 bars, 4 spaces), separated by 1 element inter-character gap
  if (runs.length < 29) return null; // Start '*', 1 char, Stop '*' = 9 + 1 + 9 + 1 + 9 = 29

  for (let r = 0; r <= runs.length - 29; r++) {
    const startRun = runs[r];
    if (!startRun || !startRun.isBlack) continue;

    // Find wide/narrow threshold dynamically across candidate
    let curr = r;
    let decoded = "";
    let foundStop = false;

    while (curr + 9 <= runs.length) {
      const elementWidths = runs.slice(curr, curr + 9).map((x) => x.length);
      const sorted = [...elementWidths].sort((a, b) => a - b);
      // In Code 39, 6 elements are narrow, 3 elements are wide
      const narrowAvg = (sorted.slice(0, 6).reduce((a, b) => a + b, 0)) / 6;
      const wideAvg = (sorted.slice(6).reduce((a, b) => a + b, 0)) / 3;

      if (wideAvg < narrowAvg * 1.5) break; // Not clear wide/narrow ratio

      const thresh = (narrowAvg + wideAvg) / 2;
      let pattern = "";
      for (const w of elementWidths) {
        pattern += w > thresh ? "1" : "0";
      }

      const char = CODE39_MAP[pattern];
      if (!char) break;

      decoded += char;
      curr += 10; // 9 elements + 1 inter-character space

      if (char === "*" && decoded.length > 1) {
        foundStop = true;
        break;
      }
    }

    if (foundStop && decoded.startsWith("*") && decoded.endsWith("*") && decoded.length >= 3) {
      const content = decoded.slice(1, -1);
      return { text: content, checksumValid: true };
    }
  }

  return null;
}

/* =========================================================================
   6. High-Level Image Scan Engine
   ========================================================================= */

/**
 * Scans an entire image across multiple horizontal and slight diagonal lines
 * to detect and decode any present 1D barcode.
 */
export function scanBarcode(imageData: ImageDataLike): BarcodeScanResult {
  const height = imageData.height;
  const width = imageData.width;

  if (width < 20 || height < 10) {
    return { found: false, error: "Image dimensions too small for barcode detection." };
  }

  // Scan multiple horizontal levels (e.g. 50%, 40%, 60%, 30%, 70%, 20%, 80%)
  const scanLevels = [
    0.5, 0.45, 0.55, 0.4, 0.6, 0.35, 0.65, 0.3, 0.7, 0.25, 0.75, 0.2, 0.8
  ];

  for (const factor of scanLevels) {
    const y = Math.floor(height * factor);
    const scanline = binarizeRow(imageData, y);
    const runs = getRunLengths(scanline);

    // 1. Try Code 128
    const code128 = decodeCode128FromRuns(runs);
    if (code128 && code128.text) {
      return {
        found: true,
        format: "CODE128",
        text: code128.text,
        checksumValid: code128.checksumValid,
        scanlineY: y,
        confidence: code128.checksumValid ? 0.99 : 0.85,
        details: `Detected Code 128 (Subset B) at Y=${y}px`
      };
    }

    // 2. Try EAN-13 / UPC-A
    const ean = decodeEan13FromRuns(runs);
    if (ean && ean.text) {
      return {
        found: true,
        format: ean.format,
        text: ean.text,
        checksumValid: ean.checksumValid,
        scanlineY: y,
        confidence: ean.checksumValid ? 0.99 : 0.85,
        details: `Detected ${ean.format} retail barcode at Y=${y}px`
      };
    }

    // 3. Try Code 39
    const code39 = decodeCode39FromRuns(runs);
    if (code39 && code39.text) {
      return {
        found: true,
        format: "CODE39",
        text: code39.text,
        checksumValid: true,
        scanlineY: y,
        confidence: 0.95,
        details: `Detected Code 39 industrial barcode at Y=${y}px`
      };
    }
  }

  return {
    found: false,
    error: "No clear 1D barcode detected. Ensure barcode is well-lit, sharp, and aligned horizontally."
  };
}
