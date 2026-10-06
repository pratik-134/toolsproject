/**
 * Unit Tests for Multi-Format Visual Diff Studio
 */

import {
  computeCharDiff,
  computeVisualDiff,
  generateUnifiedPatch,
} from "./logic";

export function runVisualDiffTests(): boolean {
  console.log("Testing [visual-diff-studio] logic...");

  const orig = `const name = "Qwertygen";\nconst version = 1;\nconsole.log(name);`;
  const mod = `const name = "Qwertygen Pro";\nconst version = 2;\nconsole.log(name);\nconsole.log("done");`;

  const diff = computeVisualDiff(orig, mod);

  if (diff.lines.length < 3) {
    throw new Error(`computeVisualDiff should produce at least 3 lines, got ${diff.lines.length}`);
  }

  // First line should be modified
  const firstLine = diff.lines[0];
  if (!firstLine || firstLine.type !== "modified") {
    throw new Error(`Expected first line to be modified`);
  }

  // Micro char diff checks
  const charDiff = computeCharDiff("hello world", "hello brave world");
  if (!charDiff.right.some((c) => c.text === "brave" && c.isChanged)) {
    throw new Error(`computeCharDiff failed to detect inserted word`);
  }

  // Patch generation check
  const patch = generateUnifiedPatch(diff, "config.ts");
  if (!patch.startsWith("--- a/config.ts") || !patch.includes("+++ b/config.ts")) {
    throw new Error(`generateUnifiedPatch failed to produce valid patch header`);
  }

  // Options check (ignore whitespace)
  const diffWs = computeVisualDiff("hello   world", "hello world", { ignoreWhitespace: true });
  if (diffWs.lines[0]?.type !== "unchanged") {
    throw new Error(`ignoreWhitespace should treat differing spacing as unchanged`);
  }

  console.log("✅ [visual-diff-studio] unit tests passed!");
  return true;
}
