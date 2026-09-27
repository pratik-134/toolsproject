import {
  encodeCode128B,
  encodeEan13,
  encodeUpcA,
  calculateEan13Checksum,
  generateBarcodeSvg,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Code 128B with standard string "CLEARTRIX-101"
  const c128 = encodeCode128B("CLEARTRIX-101");
  if (!c128.valid || c128.pattern.length === 0) {
    throw new Error(`Code 128B encoding failed: ${c128.error}`);
  }
  if (!c128.pattern.startsWith("11010010000")) {
    throw new Error("Code 128B Start B pattern mismatch");
  }

  // Test 2: EAN-13 Checksum for standard prefix "400638133393" -> check digit is 1
  const checkDigit = calculateEan13Checksum("400638133393");
  if (checkDigit !== 1) {
    throw new Error(`Expected EAN-13 check digit 1, got ${checkDigit}`);
  }

  // Test 3: Full EAN-13 encoding
  const ean = encodeEan13("4006381333931");
  if (!ean.valid) {
    throw new Error(`EAN-13 encoding failed: ${ean.error}`);
  }
  // Total modules for EAN-13: 3 (start) + 42 (left 6*7) + 5 (center) + 42 (right 6*7) + 3 (stop) = 95 modules
  if (ean.pattern.length !== 95) {
    throw new Error(`Expected EAN-13 pattern length 95, got ${ean.pattern.length}`);
  }

  // Test 4: UPC-A encoding: 12 digits
  const upc = encodeUpcA("012345678905");
  if (!upc.valid) {
    throw new Error(`UPC-A encoding failed: ${upc.error}`);
  }

  // Test 5: SVG Generation
  const svg = generateBarcodeSvg(c128.pattern, c128.displayText);
  if (!svg.includes("<svg") || !svg.includes("</svg>")) {
    throw new Error("SVG generation failed");
  }

  return true;
}
