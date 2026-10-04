import { computeLineDiff } from "../components/tools/shared/DiffInspector";

console.log("=== RUNNING NEW ENHANCEMENTS UNIT TEST SUITE ===");

// 1. Test DiffInspector computeLineDiff
const text1 = "function hello() {\n  console.log('hi');\n}";
const text2 = "function hello() {\n  return 'hi';\n}";

const diff = computeLineDiff(text1, text2);
if (!Array.isArray(diff) || diff.length === 0) {
  throw new Error("computeLineDiff returned empty or invalid diff");
}

const hasRemoved = diff.some((d) => d.type === "removed" && d.text.includes("console.log"));
const hasAdded = diff.some((d) => d.type === "added" && d.text.includes("return 'hi'"));
const hasUnchanged = diff.some((d) => d.type === "unchanged" && d.text.includes("function hello()"));

if (!hasRemoved || !hasAdded || !hasUnchanged) {
  throw new Error("computeLineDiff failed to detect added, removed, and unchanged lines correctly");
}
console.log("✓ computeLineDiff LCS line diff engine verified");

// 2. Test identical diff
const identicalDiff = computeLineDiff("line 1\nline 2", "line 1\nline 2");
if (identicalDiff.some((d) => d.type !== "unchanged")) {
  throw new Error("computeLineDiff failed for identical input");
}
console.log("✓ Identical text diff verified (zero false additions/deletions)");

console.log("🎉 ALL NEW ENHANCEMENT TESTS PASSED CLEANLY!");
