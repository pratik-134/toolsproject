import { unzipSync, strFromU8 } from "fflate";
import { packZipArchive, createFileItem, formatBytes } from "./logic";

export function runTests(): boolean {
  // Test 1: Pack 3 files with directories
  const files = [
    createFileItem("index.html", "<!DOCTYPE html><html><body><h1>Mindkit</h1></body></html>"),
    createFileItem("css/style.css", "body { margin: 0; background: #fff; }"),
    createFileItem("data/metadata.json", JSON.stringify({ name: "mindkit", version: "1.0.0" })),
  ];

  const result = packZipArchive(files, { level: 6 });

  if (result.fileCount !== 3) {
    throw new Error(`Expected 3 files, got ${result.fileCount}`);
  }
  if (result.compressedSize <= 0 || result.uncompressedSize <= 0) {
    throw new Error("Invalid output byte counts");
  }

  // Verify PK magic bytes
  if (result.zipData[0] !== 0x50 || result.zipData[1] !== 0x4b) {
    throw new Error("Generated archive missing PK zip magic bytes");
  }

  // Decompress to verify roundtrip fidelity
  const unzipped = unzipSync(result.zipData);
  const unzippedKeys = Object.keys(unzipped);

  if (!unzippedKeys.includes("index.html") || !unzippedKeys.includes("css/style.css")) {
    throw new Error(`Unzipped keys missing expected paths: ${JSON.stringify(unzippedKeys)}`);
  }

  const htmlData = unzipped["index.html"]!;
  if (!strFromU8(htmlData).includes("<h1>Mindkit</h1>")) {
    throw new Error("HTML content did not roundtrip cleanly");
  }

  // Test 2: Formatting utility
  if (formatBytes(100) !== "100 B") throw new Error("100 B format failed");
  if (formatBytes(2048) !== "2.0 KB") throw new Error("2.0 KB format failed");

  return true;
}
