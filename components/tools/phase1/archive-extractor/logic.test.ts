import { zipSync, strToU8 } from "fflate";
import { extractArchive, detectFormat, formatFileSize, readTextContent } from "./logic";

export function runTests(): boolean {
  // Test 1: Create synthetic ZIP with multiple nested files
  const syntheticZip = zipSync({
    "README.md": strToU8("# Sample Archive Project\nCreated with Mindkit!"),
    "src/index.ts": strToU8("console.log('Hello Mindkit');"),
    "data/config.json": strToU8(JSON.stringify({ version: "1.0.0", active: true })),
  });

  // Verify format detection
  const detected = detectFormat(syntheticZip);
  if (detected !== "zip") {
    throw new Error(`Expected format 'zip', got '${detected}'`);
  }

  // Extract archive
  const meta = extractArchive(syntheticZip);
  if (meta.format !== "zip") {
    throw new Error(`Expected meta format 'zip', got '${meta.format}'`);
  }
  if (meta.totalFiles !== 3) {
    throw new Error(`Expected 3 files, got ${meta.totalFiles}`);
  }
  if (meta.uncompressedSize <= 0 || meta.compressedSize <= 0) {
    throw new Error("Sizes must be positive");
  }

  // Find and verify README.md
  const readme = meta.files.find((f) => f.path === "README.md");
  if (!readme) {
    throw new Error("Missing README.md in extracted files");
  }
  if (!readme.isText) {
    throw new Error("README.md should be flagged as text");
  }
  const text = readTextContent(readme);
  if (!text.includes("Created with Mindkit!")) {
    throw new Error(`Unexpected text content: ${text}`);
  }

  // Test 2: File size formatting utility
  if (formatFileSize(500) !== "500 B") throw new Error("500 B format failed");
  if (formatFileSize(2048) !== "2.0 KB") throw new Error("2.0 KB format failed");
  if (formatFileSize(1048576 * 2.5) !== "2.50 MB") throw new Error("2.50 MB format failed");

  return true;
}
