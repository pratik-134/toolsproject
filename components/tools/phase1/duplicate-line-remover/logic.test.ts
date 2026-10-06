import { deduplicateLines } from "./logic";

export function runTests(): boolean {
  // Test 1: Basic deduplication and empty line removal
  const raw1 = "apple\nbanana\napple\n\norange\nbanana\n";
  const res1 = deduplicateLines(raw1, {
    caseSensitive: true,
    trimWhitespace: true,
    removeEmptyLines: true,
    sortOrder: "none",
  });

  if (res1.uniqueCount !== 3) {
    throw new Error(`Expected 3 unique items, got ${res1.uniqueCount}`);
  }
  if (res1.output !== "apple\nbanana\norange") {
    throw new Error(`Output mismatch: ${res1.output}`);
  }

  // Test 2: Case-insensitive deduplication
  const raw2 = "Hello\nworld\nhello\nWORLD\nQwertygen";
  const res2 = deduplicateLines(raw2, {
    caseSensitive: false,
    trimWhitespace: true,
    removeEmptyLines: true,
    sortOrder: "asc",
  });

  if (res2.uniqueCount !== 3) {
    throw new Error(`Expected 3 case-insensitive items, got ${res2.uniqueCount}`);
  }

  return true;
}
