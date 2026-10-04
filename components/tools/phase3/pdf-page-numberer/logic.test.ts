import {
  formatPageNumber,
  calculateNumberPosition,
  hexToRgb,
  Position,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Format patterns
  const p1 = formatPageNumber("Page {n} of {total}", 1, 10);
  if (p1 !== "Page 1 of 10") {
    throw new Error(`Expected 'Page 1 of 10', got '${p1}'`);
  }

  const p2 = formatPageNumber("{n} / {total}", 5, 20);
  if (p2 !== "5 / 20") {
    throw new Error(`Expected '5 / 20', got '${p2}'`);
  }

  const p3 = formatPageNumber("- {n} -", 7, 7);
  if (p3 !== "- 7 -") {
    throw new Error(`Expected '- 7 -', got '${p3}'`);
  }

  const p4 = formatPageNumber("{n}", 9999, 10000);
  if (p4 !== "9999") {
    throw new Error(`Expected '9999', got '${p4}'`);
  }

  // Test 2: Positioning Calculations (US Letter: 612 x 792 pt)
  const width = 612;
  const height = 792;
  const textWidth = 50;
  const fontSize = 12;
  const margin = 24;

  const bc = calculateNumberPosition("bottom-center", width, height, textWidth, fontSize, margin);
  if (bc.x !== (612 - 50) / 2 || bc.y !== 24) {
    throw new Error(`Unexpected bottom-center coordinate: ${JSON.stringify(bc)}`);
  }

  const br = calculateNumberPosition("bottom-right", width, height, textWidth, fontSize, margin);
  if (br.x !== 612 - 50 - 24 || br.y !== 24) {
    throw new Error(`Unexpected bottom-right coordinate: ${JSON.stringify(br)}`);
  }

  const bl = calculateNumberPosition("bottom-left", width, height, textWidth, fontSize, margin);
  if (bl.x !== 24 || bl.y !== 24) {
    throw new Error(`Unexpected bottom-left coordinate: ${JSON.stringify(bl)}`);
  }

  const tc = calculateNumberPosition("top-center", width, height, textWidth, fontSize, margin);
  if (tc.x !== (612 - 50) / 2 || tc.y !== 792 - 24 - 12) {
    throw new Error(`Unexpected top-center coordinate: ${JSON.stringify(tc)}`);
  }

  const tr = calculateNumberPosition("top-right", width, height, textWidth, fontSize, margin);
  if (tr.x !== 612 - 50 - 24 || tr.y !== 792 - 24 - 12) {
    throw new Error(`Unexpected top-right coordinate: ${JSON.stringify(tr)}`);
  }

  const tl = calculateNumberPosition("top-left", width, height, textWidth, fontSize, margin);
  if (tl.x !== 24 || tl.y !== 792 - 24 - 12) {
    throw new Error(`Unexpected top-left coordinate: ${JSON.stringify(tl)}`);
  }

  // Test 3: Color hex parser
  const black = hexToRgb("#000000");
  if (black.r !== 0 || black.g !== 0 || black.b !== 0) {
    throw new Error(`Expected black RGB 0,0,0, got ${JSON.stringify(black)}`);
  }

  const white = hexToRgb("#ffffff");
  if (Math.round(white.r) !== 1 || Math.round(white.g) !== 1 || Math.round(white.b) !== 1) {
    throw new Error(`Expected white RGB 1,1,1, got ${JSON.stringify(white)}`);
  }

  const invalid = hexToRgb("invalid");
  if (invalid.r !== 0 || invalid.g !== 0 || invalid.b !== 0) {
    throw new Error("Invalid hex should default to 0,0,0");
  }

  return true;
}
