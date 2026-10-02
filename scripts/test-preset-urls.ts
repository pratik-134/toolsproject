import assert from "node:assert";
import {
  parseImageConverterHash,
  serializeImageConverterHash,
  parsePdfCompressorHash,
  serializePdfCompressorHash,
  parsePdfMergerHash,
  serializePdfMergerHash,
} from "../lib/preset-urls";

async function runTests() {
  console.log("Testing Shareable Preset URLs Engine (Hash-based)...");

  // 1. Image Converter: Valid serialization and parsing roundtrip
  const imgSettings = {
    format: "webp" as const,
    quality: 85,
    scale: 150,
    bgColor: "#ffffff",
  };
  const imgHash = serializeImageConverterHash(imgSettings);
  assert.strictEqual(
    imgHash,
    "format=webp&quality=85&scale=150&bgColor=%23ffffff",
    "Should serialize image settings to URL hash params"
  );

  const parsedImg = parseImageConverterHash(`#${imgHash}`);
  assert.strictEqual(parsedImg.format, "webp");
  assert.strictEqual(parsedImg.quality, 85);
  assert.strictEqual(parsedImg.scale, 150);
  assert.strictEqual(parsedImg.bgColor, "#ffffff");

  // 2. Image Converter: Strict Sanitization & Out-of-bounds rejection
  const maliciousImgHash = "#format=malicious_exe&quality=9999&scale=-100&bgColor=javascript:alert(1)&payload=DATA_BLOB";
  const sanitizedImg = parseImageConverterHash(maliciousImgHash);
  assert.strictEqual(sanitizedImg.format, undefined, "Invalid format must be rejected");
  assert.strictEqual(sanitizedImg.quality, undefined, "Out-of-bounds quality must be rejected");
  assert.strictEqual(sanitizedImg.scale, undefined, "Negative scale must be rejected");
  assert.strictEqual(sanitizedImg.bgColor, undefined, "Dangerous bgColor must be rejected");
  assert.strictEqual((sanitizedImg as any).payload, undefined, "Unrecognized or data payloads must never parse");

  // 3. PDF Compressor: Valid serialization and parsing
  const pdfCompSettings = {
    stripMetadata: false,
    useObjectStreams: true,
  };
  const compHash = serializePdfCompressorHash(pdfCompSettings);
  assert.strictEqual(compHash, "stripMetadata=false&useObjectStreams=true");

  const parsedComp = parsePdfCompressorHash(`#${compHash}`);
  assert.strictEqual(parsedComp.stripMetadata, false);
  assert.strictEqual(parsedComp.useObjectStreams, true);

  // 4. PDF Merger: Filename sanitization
  const mergerSettings = {
    outputFileName: "Q3_Report_Final.pdf",
  };
  const mergerHash = serializePdfMergerHash(mergerSettings);
  assert.strictEqual(mergerHash, "filename=Q3_Report_Final.pdf");

  const parsedMerger = parsePdfMergerHash(`#${mergerHash}`);
  assert.strictEqual(parsedMerger.outputFileName, "Q3_Report_Final.pdf");

  // Filename injection sanitization
  const injectionHash = "#filename=<script>alert('xss')</script>bad/path/file";
  const sanitizedMerger = parsePdfMergerHash(injectionHash);
  assert.ok(
    !sanitizedMerger.outputFileName?.includes("<") &&
    !sanitizedMerger.outputFileName?.includes(">") &&
    !sanitizedMerger.outputFileName?.includes("/"),
    "Filename must strip illegal characters"
  );

  console.log("All Shareable Preset URLs tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Preset URL tests failed:", err);
  process.exit(1);
});
