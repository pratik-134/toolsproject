import assert from "node:assert/strict";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { getAllTools } from "../lib/registry/tools";
import {
  saveHandoff,
  getHandoff,
  clearHandoff,
  isMimeAccepted,
  CHAIN_GRAPH,
  getChainSuggestions,
  _testSetHandoff,
  _setEnableToolChaining,
  EXPIRY_MS,
} from "../lib/tool-chains";
import {
  parseImageConverterHash,
  serializeImageConverterHash,
  parsePdfCompressorHash,
  serializePdfCompressorHash,
  parsePdfMergerHash,
  serializePdfMergerHash,
} from "../lib/preset-urls";
import {
  runBatchPool,
  checkBatchMemoryLimit,
  createZipBlob,
  DEFAULT_MAX_BATCH_BYTES,
} from "../lib/batch-processor";

async function runUnitTests() {
  console.log("=================================================");
  console.log("RUNNING SUITE A: UNIT & SYSTEM INVARIANT TESTS");
  console.log("=================================================\n");

  // -------------------------------------------------------------
  // A1. tool-chains mapping
  // -------------------------------------------------------------
  console.log("[A1] Testing tool-chains mapping and registry validity...");
  const allTools = getAllTools();
  const validSlugs = new Set(allTools.map((t) => t.slug));

  for (const [sourceSlug, suggestions] of Object.entries(CHAIN_GRAPH)) {
    assert(
      validSlugs.has(sourceSlug),
      `Source slug "${sourceSlug}" in CHAIN_GRAPH must exist in tool registry`
    );

    for (const sug of suggestions) {
      assert(
        validSlugs.has(sug.targetSlug),
        `Target slug "${sug.targetSlug}" chained from "${sourceSlug}" must exist in tool registry`
      );

      // Verify that chaining makes logical sense regarding input types
      if (sourceSlug.startsWith("pdf-")) {
        // PDF source outputs a PDF. Target must accept application/pdf
        const acceptsPdf = isMimeAccepted(sug.targetSlug, "application/pdf");
        assert(
          acceptsPdf,
          `PDF tool "${sourceSlug}" chains to "${sug.targetSlug}" which rejects application/pdf`
        );
      } else if (sourceSlug === "image-converter") {
        // Image converter outputs image/png or image/jpeg. Target must accept images
        const acceptsImage = isMimeAccepted(sug.targetSlug, "image/png");
        assert(
          acceptsImage,
          `Image tool "${sourceSlug}" chains to "${sug.targetSlug}" which rejects image/png`
        );
      }
    }
  }
  console.log("  ✓ A1 Passed: All chain target slugs exist in registry and MIME compatibility is verified.\n");

  // -------------------------------------------------------------
  // A2. Handoff store: save, read, clear, and expiry
  // -------------------------------------------------------------
  console.log("[A2] Testing handoff store (save, read, clear, expiry)...");
  await clearHandoff();

  const testPdfDoc = await PDFDocument.create();
  testPdfDoc.addPage([200, 200]);
  const pdfBytes = await testPdfDoc.save();

  // Save file
  const saved = await saveHandoff(
    {
      name: "report.pdf",
      type: "application/pdf",
      data: pdfBytes,
      sourceToolSlug: "pdf-merger",
    },
    "pdf-compressor"
  );
  assert.equal(saved.name, "report.pdf");
  assert.equal(saved.type, "application/pdf");
  assert.equal(saved.buffer.length, pdfBytes.length);

  // Read file
  const read = await getHandoff("pdf-compressor");
  assert(read !== null, "Handoff must be retrievable for target tool");
  assert.equal(read.name, "report.pdf");
  assert.equal(read.buffer.length, pdfBytes.length);

  // Clear file
  await clearHandoff("pdf-compressor");
  const readAfterClear = await getHandoff("pdf-compressor");
  assert.equal(readAfterClear, null, "After clear, getHandoff must return null");

  // Expiry test (older than TTL)
  _testSetHandoff({
    id: "test-expired",
    name: "expired.pdf",
    type: "application/pdf",
    size: pdfBytes.length,
    buffer: new Uint8Array(pdfBytes),
    targetToolSlug: "pdf-compressor",
    createdAt: Date.now() - (EXPIRY_MS + 5_000), // Expired TTL ago
  });
  const readExpired = await getHandoff("pdf-compressor");
  assert.equal(readExpired, null, "Expired handoff (>TTL) must return null");
  console.log("  ✓ A2 Passed: Save, read, clear, and expiry time enforcement verified.\n");

  // -------------------------------------------------------------
  // A3. Handoff store MIME type safety
  // -------------------------------------------------------------
  console.log("[A3] Testing handoff store MIME type safety...");
  // Attempt to send a PDF to an image-only tool
  let pdfToImageError: Error | null = null;
  try {
    await saveHandoff(
      {
        name: "document.pdf",
        type: "application/pdf",
        data: pdfBytes,
      },
      "image-converter"
    );
  } catch (err: any) {
    pdfToImageError = err;
  }
  assert(
    pdfToImageError !== null,
    "saveHandoff must throw error when handing a PDF to image-converter"
  );
  assert(
    pdfToImageError.message.includes("Incompatible handoff"),
    `Error message must state incompatible handoff: ${pdfToImageError.message}`
  );

  // Attempt to send an image to a PDF-only tool
  let imageToPdfError: Error | null = null;
  const dummyImageBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
  try {
    await saveHandoff(
      {
        name: "photo.png",
        type: "image/png",
        data: dummyImageBytes,
      },
      "pdf-compressor"
    );
  } catch (err: any) {
    imageToPdfError = err;
  }
  assert(
    imageToPdfError !== null,
    "saveHandoff must throw error when handing an image to pdf-compressor"
  );
  assert(
    imageToPdfError.message.includes("Incompatible handoff"),
    `Error message must state incompatible handoff: ${imageToPdfError.message}`
  );
  console.log("  ✓ A3 Passed: Strict cross-format MIME safety guarantees verified.\n");

  // -------------------------------------------------------------
  // A4. Preset hash parser
  // -------------------------------------------------------------
  console.log("[A4] Testing preset hash parser on valid inputs...");
  const imgParsed = parseImageConverterHash("#format=jpeg&quality=85&scale=150&bgColor=%23ffffff");
  assert.deepEqual(imgParsed, {
    format: "jpeg",
    quality: 85,
    scale: 150,
    bgColor: "#ffffff",
  });

  const pdfCompParsed = parsePdfCompressorHash("#stripMetadata=true&useObjectStreams=false");
  assert.deepEqual(pdfCompParsed, {
    stripMetadata: true,
    useObjectStreams: false,
  });

  const pdfMergeParsed = parsePdfMergerHash("#autoRotate=true");
  assert.deepEqual(pdfMergeParsed, {
    autoRotate: true,
  });
  console.log("  ✓ A4 Passed: Valid hash strings correctly parsed to typed configuration objects.\n");

  // -------------------------------------------------------------
  // A5. Preset hash builder round-trip
  // -------------------------------------------------------------
  console.log("[A5] Testing preset hash builder round-trip...");
  const originalImg = {
    format: "webp" as const,
    quality: 90,
    scale: 75,
    bgColor: "#112233",
  };
  const imgSerialized = serializeImageConverterHash(originalImg);
  const imgRoundTrip = parseImageConverterHash(imgSerialized);
  assert.deepEqual(imgRoundTrip, originalImg, "Image converter settings must round-trip cleanly");

  const originalComp = {
    stripMetadata: true,
    useObjectStreams: true,
  };
  const compSerialized = serializePdfCompressorHash(originalComp);
  const compRoundTrip = parsePdfCompressorHash(compSerialized);
  assert.deepEqual(compRoundTrip, originalComp, "PDF compressor settings must round-trip cleanly");

  const originalMerge = {
    autoRotate: true,
  };
  const mergeSerialized = serializePdfMergerHash(originalMerge);
  const mergeRoundTrip = parsePdfMergerHash(mergeSerialized);
  assert.deepEqual(mergeRoundTrip, originalMerge, "PDF merger settings must round-trip cleanly");
  console.log("  ✓ A5 Passed: Settings round-trip serialize <-> parse with identical values.\n");

  // -------------------------------------------------------------
  // A6. Preset hash sanitization & security
  // -------------------------------------------------------------
  console.log("[A6] Testing preset hash sanitization, range clamping & security...");
  // 1. Unknown keys stripped & filename injection prevented
  const dirtyHash = "#format=png&quality=80&maliciousKey=alert(1)&filename=passwords.pdf&auth_token=secret123";
  const sanitizedDirty = parseImageConverterHash(dirtyHash);
  assert.equal((sanitizedDirty as any).maliciousKey, undefined, "Unknown keys must be stripped");
  assert.equal((sanitizedDirty as any).filename, undefined, "Filename parameter must be stripped");
  assert.equal((sanitizedDirty as any).auth_token, undefined, "Token parameters must be stripped");
  assert.equal(sanitizedDirty.format, "png");
  assert.equal(sanitizedDirty.quality, 80);

  // 2. Out-of-range numbers clamped
  const clampedLow = parseImageConverterHash("#quality=-50&scale=5");
  assert.equal(clampedLow.quality, 10, "Quality must clamp to minimum 10");
  assert.equal(clampedLow.scale, 25, "Scale must clamp to minimum 25");

  const clampedHigh = parseImageConverterHash("#quality=9999&scale=9999");
  assert.equal(clampedHigh.quality, 100, "Quality must clamp to maximum 100");
  assert.equal(clampedHigh.scale, 200, "Scale must clamp to maximum 200");

  // 3. Invalid enums replaced with default
  const invalidEnum = parseImageConverterHash("#format=exe_hack");
  assert.equal(invalidEnum.format, "webp", "Invalid format enum must fallback to webp default");

  // 4. Malicious strings (XSS / path traversal) in bgColor neutralized
  const xssColor = parseImageConverterHash("#bgColor=%3Cscript%3Ealert(document.cookie)%3C%2Fscript%3E");
  assert.equal(xssColor.bgColor, undefined, "XSS script payload in color must be discarded");

  const pathColor = parseImageConverterHash("#bgColor=..%2F..%2Fetc%2Fpasswd");
  assert.equal(pathColor.bgColor, undefined, "Path traversal payload in color must be discarded");
  console.log("  ✓ A6 Passed: Strict sanitization, clamping, enum defaulting, and payload neutralization verified.\n");

  // -------------------------------------------------------------
  // A7. Batch queue concurrency
  // -------------------------------------------------------------
  console.log("[A7] Testing batch queue concurrency worker pool limit...");
  let activeWorkers = 0;
  let maxObservedActive = 0;
  const itemsToProcess = [1, 2, 3, 4, 5, 6];

  await runBatchPool(
    itemsToProcess,
    async (item, onProgress) => {
      activeWorkers++;
      maxObservedActive = Math.max(maxObservedActive, activeWorkers);
      onProgress(50);
      await new Promise((r) => setTimeout(r, 40));
      onProgress(100);
      activeWorkers--;
      return item * 10;
    },
    { concurrency: 3 }
  );

  assert(
    maxObservedActive <= 3,
    `Active worker count (${maxObservedActive}) must never exceed configured concurrency (3)`
  );
  assert(
    maxObservedActive >= 2,
    `Active worker count (${maxObservedActive}) should achieve parallel execution`
  );
  console.log(`  ✓ A7 Passed: Pool processed 6 items without exceeding concurrency limit (peak active: ${maxObservedActive}).\n`);

  // -------------------------------------------------------------
  // A8. Batch queue error isolation
  // -------------------------------------------------------------
  console.log("[A8] Testing batch queue error isolation (per-file error boundary)...");
  const mixedItems = ["file1.pdf", "file2_corrupt.pdf", "file3.pdf", "file4.pdf", "file5.pdf", "file6.pdf"];

  const batchResults = await runBatchPool(
    mixedItems,
    async (name) => {
      if (name === "file2_corrupt.pdf") {
        throw new Error("Deliberately corrupt PDF structure: premature EOF");
      }
      return { processed: true, name };
    },
    { concurrency: 3 }
  );

  assert.equal(batchResults.length, 6, "All 6 items must have a corresponding result entry");
  assert.equal(batchResults[0]!.success, true, "Item 1 must succeed");
  assert.equal(batchResults[1]!.success, false, "Item 2 must be marked as failed");
  assert(
    batchResults[1]!.error?.message.includes("Deliberately corrupt"),
    "Item 2 error message must be captured"
  );
  assert.equal(batchResults[2]!.success, true, "Item 3 must succeed despite Item 2 failing");
  assert.equal(batchResults[3]!.success, true, "Item 4 must succeed");
  assert.equal(batchResults[4]!.success, true, "Item 5 must succeed");
  assert.equal(batchResults[5]!.success, true, "Item 6 must succeed");
  console.log("  ✓ A8 Passed: Error in item 2 isolated; remaining 5 items processed successfully.\n");

  // -------------------------------------------------------------
  // A9. Batch memory limit
  // -------------------------------------------------------------
  console.log("[A9] Testing batch total memory limit check...");
  const memoryCheckSafe = checkBatchMemoryLimit(30 * 1024 * 1024, DEFAULT_MAX_BATCH_BYTES);
  assert.equal(memoryCheckSafe.valid, true, "30MB batch must be within 50MB limit");

  const memoryCheckExcess = checkBatchMemoryLimit(65 * 1024 * 1024, DEFAULT_MAX_BATCH_BYTES);
  assert.equal(memoryCheckExcess.valid, false, "65MB batch must exceed 50MB limit");
  assert(
    memoryCheckExcess.error?.includes("Batch exceeds total memory limit of 50MB"),
    "Error message must be clear and user-friendly"
  );

  // Test pool rejection upfront
  let poolMemoryError: Error | null = null;
  try {
    await runBatchPool(
      [{ size: 30 * 1024 * 1024 }, { size: 35 * 1024 * 1024 }],
      async () => "ok",
      {
        getItemSize: (item) => item.size,
        maxTotalBytes: 50 * 1024 * 1024,
      }
    );
  } catch (err: any) {
    poolMemoryError = err;
  }
  assert(poolMemoryError !== null, "runBatchPool must reject when batch exceeds memory limit");
  assert(poolMemoryError.message.includes("Batch exceeds total memory limit"));
  console.log("  ✓ A9 Passed: Batch memory limit enforced upfront before running tasks.\n");

  // -------------------------------------------------------------
  // A10. ZIP generation & duplicate disambiguation
  // -------------------------------------------------------------
  console.log("[A10] Testing ZIP generation with duplicate filename deduplication...");
  const zipInput = [
    { name: "document.pdf", data: new Uint8Array([1, 2, 3, 4]) },
    { name: "document.pdf", data: new Uint8Array([5, 6, 7, 8]) },
    { name: "document.pdf", data: new Uint8Array([9, 10, 11, 12]) },
    { name: "invoice.pdf", data: new Uint8Array([13, 14, 15, 16]) },
    { name: "failed.pdf", data: null }, // Failed file should be safely omitted
  ];

  const zipBlob = await createZipBlob(zipInput);
  assert(zipBlob.size > 0, "Generated ZIP blob must not be empty");

  // Inspect ZIP contents with JSZip
  const zipBuffer = await zipBlob.arrayBuffer();
  const unzipped = await JSZip.loadAsync(zipBuffer);
  const unzippedFiles = Object.keys(unzipped.files);

  assert.deepEqual(
    unzippedFiles.sort(),
    ["document (1).pdf", "document (2).pdf", "document.pdf", "invoice.pdf"].sort(),
    "ZIP files must contain disambiguated names and exclude failed null entries"
  );

  // Check uncorrupted data
  const doc1Content = await unzipped.file("document.pdf")!.async("uint8array");
  assert.deepEqual(Array.from(doc1Content), [1, 2, 3, 4]);

  const doc2Content = await unzipped.file("document (1).pdf")!.async("uint8array");
  assert.deepEqual(Array.from(doc2Content), [5, 6, 7, 8]);
  console.log("  ✓ A10 Passed: ZIP created with duplicate filenames disambiguated and data verified uncorrupted.\n");

  // -------------------------------------------------------------
  // E3. Feature Flag ENABLE_TOOL_CHAINING = false
  // -------------------------------------------------------------
  console.log("[E3] Testing feature flag toggle (ENABLE_TOOL_CHAINING = false)...");
  try {
    _setEnableToolChaining(false);
    const suggestionsDisabled = getChainSuggestions("pdf-merger");
    assert.deepEqual(suggestionsDisabled, [], "Suggestions must be empty when feature flag is disabled");

    const handoffDisabled = await getHandoff("pdf-compressor");
    assert.equal(handoffDisabled, null, "Handoff must return null when feature flag is disabled");

    let saveFlagError: Error | null = null;
    try {
      await saveHandoff(
        {
          name: "test.pdf",
          type: "application/pdf",
          data: new Uint8Array([1, 2, 3]),
        },
        "pdf-compressor"
      );
    } catch (err: any) {
      saveFlagError = err;
    }
    assert(saveFlagError !== null, "saveHandoff must throw when feature flag is disabled");
    assert(saveFlagError.message.includes("disabled via feature flag"));
  } finally {
    _setEnableToolChaining(true); // Always restore
  }
  console.log("  ✓ E3 Passed: When ENABLE_TOOL_CHAINING=false, handoff engine gracefully deactivates.\n");

  console.log("=================================================");
  console.log("ALL UNIT & INVARIANT TESTS (A1 - A10, E3) PASSED!");
  console.log("=================================================\n");
}

runUnitTests().catch((err) => {
  console.error("UNIT TEST FAILURE:", err);
  process.exit(1);
});
