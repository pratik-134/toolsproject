import assert from "assert";
import {
  calculateInferenceDimensions,
  validateImageFile,
  extractAlphaChannel,
  formatByteSize,
  MAX_INFERENCE_DIMENSION,
} from "./logic";

export function runAiBackgroundRemoverTests() {
  console.log("Testing [ai-background-remover] logic...");

  // 1. Dimension Calculation tests
  // Under max dimension (should not scale)
  const d1 = calculateInferenceDimensions(800, 600, 1600);
  assert.strictEqual(d1.width, 800);
  assert.strictEqual(d1.height, 600);
  assert.strictEqual(d1.scaled, false);

  // Landscape exceeding 1600px
  const d2 = calculateInferenceDimensions(3200, 1600, 1600);
  assert.strictEqual(d2.width, 1600);
  assert.strictEqual(d2.height, 800);
  assert.strictEqual(d2.scaled, true);

  // Portrait exceeding 1600px (e.g. 12MP phone camera portrait 3000 x 4000)
  const d3 = calculateInferenceDimensions(3000, 4000, 1600);
  assert.strictEqual(d3.height, 1600);
  assert.strictEqual(d3.width, 1200);
  assert.strictEqual(d3.scaled, true);

  // Square exceeding max
  const d4 = calculateInferenceDimensions(2400, 2400, 1600);
  assert.strictEqual(d4.width, 1600);
  assert.strictEqual(d4.height, 1600);
  assert.strictEqual(d4.scaled, true);

  // Edge cases (0 or negative)
  const d5 = calculateInferenceDimensions(0, 0, 1600);
  assert.strictEqual(d5.width, 1);
  assert.strictEqual(d5.height, 1);

  // 2. File Validation tests
  const fakeJpg = { name: "portrait.jpg", type: "image/jpeg" } as any;
  assert.strictEqual(validateImageFile(fakeJpg).valid, true);

  const fakePng = { name: "model.png", type: "image/png" } as any;
  assert.strictEqual(validateImageFile(fakePng).valid, true);

  const fakeWebp = { name: "photo.webp", type: "image/webp" } as any;
  assert.strictEqual(validateImageFile(fakeWebp).valid, true);

  const fakePdf = { name: "document.pdf", type: "application/pdf" } as any;
  const pdfRes = validateImageFile(fakePdf);
  assert.strictEqual(pdfRes.valid, false);
  assert.ok(pdfRes.error?.includes("Unsupported"));

  const fakeGif = { name: "animation.gif", type: "image/gif" } as any;
  const gifRes = validateImageFile(fakeGif);
  assert.strictEqual(gifRes.valid, false);

  // 3. Alpha Channel Extraction
  const sampleRgba = new Uint8ClampedArray([
    255, 0, 0, 255,   // Red, Alpha 255
    0, 255, 0, 128,   // Green, Alpha 128
    0, 0, 255, 0,     // Blue, Alpha 0
    255, 255, 255, 64 // White, Alpha 64
  ]);
  const alpha = extractAlphaChannel(sampleRgba);
  assert.strictEqual(alpha.length, 4);
  assert.strictEqual(alpha[0], 255);
  assert.strictEqual(alpha[1], 128);
  assert.strictEqual(alpha[2], 0);
  assert.strictEqual(alpha[3], 64);

  // 4. Byte Formatting
  assert.strictEqual(formatByteSize(0), "0 B");
  assert.strictEqual(formatByteSize(1024), "1.0 KB");
  assert.strictEqual(formatByteSize(45 * 1024 * 1024), "45.0 MB");

  console.log("✅ [ai-background-remover] unit tests passed!");
  return true;
}

if (require.main === module) {
  runAiBackgroundRemoverTests();
}
