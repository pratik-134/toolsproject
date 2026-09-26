/**
 * Unit Tests for Image Converter Pure Logic
 */

import {
  formatBytes,
  getFilenameWithExtension,
  validateImageFile,
  calculateScaledDimensions,
  createBmpBinary,
  createIcoBinary,
  createSvgWrapper,
} from "./logic";

export function runImageConverterTests() {
  // Test 1: formatBytes formatting
  const b1 = formatBytes(0);
  if (b1 !== "0 Bytes") throw new Error(`formatBytes(0) failed: got ${b1}`);

  const b2 = formatBytes(1024);
  if (b2 !== "1 KB") throw new Error(`formatBytes(1024) failed: got ${b2}`);

  const b3 = formatBytes(2.5 * 1024 * 1024);
  if (b3 !== "2.5 MB") throw new Error(`formatBytes(2.5MB) failed: got ${b3}`);

  // Test 2: getFilenameWithExtension
  const f1 = getFilenameWithExtension("vacation_photo.png", "jpg");
  if (f1 !== "vacation_photo.jpg") throw new Error(`getFilenameWithExtension failed: ${f1}`);

  const f2 = getFilenameWithExtension("report.final.bmp", ".webp");
  if (f2 !== "report.final.webp") throw new Error(`getFilenameWithExtension failed: ${f2}`);

  const f3 = getFilenameWithExtension("noextension", "ico");
  if (f3 !== "noextension.ico") throw new Error(`getFilenameWithExtension failed: ${f3}`);

  // Test 3: validateImageFile
  const v1 = validateImageFile({ type: "image/png", size: 1000 });
  if (!v1.valid) throw new Error("validateImageFile should pass for image/png");

  const v2 = validateImageFile({ type: "application/pdf", size: 1000 });
  if (v2.valid) throw new Error("validateImageFile should fail for application/pdf");

  const v3 = validateImageFile({ type: "image/jpeg", size: 0 });
  if (v3.valid) throw new Error("validateImageFile should fail for empty file");

  // Test 4: calculateScaledDimensions
  const s1 = calculateScaledDimensions(800, 600, 1.0);
  if (s1.width !== 800 || s1.height !== 600) throw new Error("scale 1.0 failed");

  const s2 = calculateScaledDimensions(800, 600, 0.5);
  if (s2.width !== 400 || s2.height !== 300) throw new Error("scale 0.5 failed");

  const s3 = calculateScaledDimensions(800, 600, 2.0);
  if (s3.width !== 1600 || s3.height !== 1200) throw new Error("scale 2.0 failed");

  // Test 5: createBmpBinary
  const w = 4;
  const h = 4;
  const rgba = new Uint8ClampedArray(w * h * 4);
  // Fill sample red pixel
  rgba[0] = 255;
  rgba[1] = 0;
  rgba[2] = 0;
  rgba[3] = 255;

  const bmpBytes = createBmpBinary(w, h, rgba);
  // Verify 'BM' signature (0x42, 0x4D)
  if (bmpBytes[0] !== 0x42 || bmpBytes[1] !== 0x4d) {
    throw new Error(`BMP header signature invalid: ${bmpBytes[0]} ${bmpBytes[1]}`);
  }
  // Verify total file size offset
  const view = new DataView(bmpBytes.buffer);
  const fileSize = view.getUint32(2, true);
  if (fileSize !== bmpBytes.length) {
    throw new Error(`BMP length mismatch: header says ${fileSize}, actual is ${bmpBytes.length}`);
  }

  // Test 6: createIcoBinary
  const fakePng = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 1, 2, 3]);
  const icoBytes = createIcoBinary(fakePng, 16, 16);
  const icoView = new DataView(icoBytes.buffer);
  if (icoView.getUint16(2, true) !== 1) {
    throw new Error("ICO resource type must be 1");
  }
  if (icoView.getUint16(4, true) !== 1) {
    throw new Error("ICO count must be 1");
  }
  if (icoView.getUint8(6) !== 16 || icoView.getUint8(7) !== 16) {
    throw new Error("ICO width/height entry mismatch");
  }

  // Test 7: createSvgWrapper
  const svg = createSvgWrapper("data:image/png;base64,abc", 100, 50);
  if (!svg.includes('<svg xmlns="http://www.w3.org/2000/svg"') || !svg.includes('width="100"')) {
    throw new Error("SVG wrapper generation failed");
  }

  return true;
}
