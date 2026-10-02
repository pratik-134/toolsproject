import assert from "node:assert";
import {
  saveHandoff,
  getHandoff,
  clearHandoff,
  getChainSuggestions,
  handoffToFile,
  ENABLE_TOOL_CHAINING,
} from "../lib/tool-chains";

async function runTests() {
  console.log("Testing Tool Chaining Engine...");

  // 1. Feature Flag
  assert.strictEqual(ENABLE_TOOL_CHAINING, true, "Tool chaining must be enabled");

  // 2. Suggestions Graph
  const mergerSuggestions = getChainSuggestions("pdf-merger");
  assert.ok(mergerSuggestions.length >= 2, "PDF Merger should suggest chained tools");
  assert.ok(
    mergerSuggestions.some((s) => s.targetSlug === "pdf-compressor"),
    "PDF Merger should suggest PDF Compressor"
  );

  const compressorSuggestions = getChainSuggestions("pdf-compressor");
  assert.ok(compressorSuggestions.length >= 2, "PDF Compressor should suggest chained tools");
  assert.ok(
    compressorSuggestions.some((s) => s.targetSlug === "pdf-merger"),
    "PDF Compressor should suggest PDF Merger"
  );

  const imageSuggestions = getChainSuggestions("image-converter");
  assert.ok(imageSuggestions.length >= 2, "Image Converter should suggest chained tools");
  assert.ok(
    imageSuggestions.some((s) => s.targetSlug === "exif-stripper" || s.targetSlug === "image-watermarker"),
    "Image Converter should suggest Exif Stripper or Image Watermarker"
  );

  // 3. Save and Retrieve Handoff (Memory Cache)
  const testBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]); // "%PDF-1.7"
  const saved = await saveHandoff(
    {
      name: "combined-test.pdf",
      type: "application/pdf",
      data: testBytes,
      sourceToolSlug: "pdf-merger",
    },
    "pdf-compressor"
  );

  assert.strictEqual(saved.name, "combined-test.pdf");
  assert.strictEqual(saved.targetToolSlug, "pdf-compressor");
  assert.strictEqual(saved.sourceToolSlug, "pdf-merger");
  assert.strictEqual(saved.size, testBytes.length);

  const retrieved = await getHandoff("pdf-compressor");
  assert.ok(retrieved, "Should retrieve saved handoff for pdf-compressor");
  assert.strictEqual(retrieved?.name, "combined-test.pdf");
  assert.strictEqual(retrieved?.buffer.length, testBytes.length);
  assert.deepStrictEqual(Array.from(retrieved!.buffer), Array.from(testBytes));

  // Should return null for a different target
  const unneeded = await getHandoff("image-converter");
  assert.strictEqual(unneeded, null, "Should not return handoff for mismatched tool");

  // 4. File Conversion Helper
  if (typeof File !== "undefined") {
    const file = handoffToFile(retrieved!);
    assert.strictEqual(file.name, "combined-test.pdf");
    assert.strictEqual(file.type, "application/pdf");
  }

  // 5. Clear Handoff
  await clearHandoff("pdf-compressor");
  const cleared = await getHandoff("pdf-compressor");
  assert.strictEqual(cleared, null, "Handoff must be null after clearHandoff");

  console.log("All Tool Chaining tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Tool Chaining tests failed:", err);
  process.exit(1);
});
