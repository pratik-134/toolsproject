/**
 * Unit Tests for Client-Side PDF to Vector SVG Converter
 */

import { createSvgPageXml, validatePdfBytes } from "./logic";

export function runPdfToSvgTests(): boolean {
  console.log("Testing [pdf-to-svg] logic...");

  // 1. Magic bytes validation
  const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  if (!validatePdfBytes(validPdfHeader)) {
    throw new Error(`validatePdfBytes should validate valid PDF magic header`);
  }

  const invalidHeader = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
  if (validatePdfBytes(invalidHeader)) {
    throw new Error(`validatePdfBytes should reject non-PDF bytes`);
  }

  // 2. SVG XML Creation
  const svg = createSvgPageXml(1, 595, 842, '<text x="50" y="50">Hello</text>');
  if (!svg.startsWith("<svg") || !svg.includes('id="pdf-page-1"') || !svg.includes("Hello")) {
    throw new Error(`createSvgPageXml failed to construct valid SVG markup`);
  }

  console.log("✅ [pdf-to-svg] unit tests passed!");
  return true;
}
