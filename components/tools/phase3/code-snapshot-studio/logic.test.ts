/**
 * Unit Test Suite for High-Res Code Snapshot Studio
 * Deterministic test vectors executed via npm run test:tools
 */

import {
  tokenizeCode,
  escapeXml,
  generateSvgSnapshot,
  THEMES,
  BACKGROUND_PRESETS,
  SAMPLE_CODE_SNIPPETS,
} from "./logic";

export function runTests(): boolean {
  // Test 1: XML entity escaping
  const rawXml = `const text = "<div class='test'>&</div>";`;
  const escaped = escapeXml(rawXml);
  if (escaped.includes("<div") || escaped.includes("&<") || !escaped.includes("&lt;div")) {
    throw new Error(`escapeXml failed to sanitize HTML tags: ${escaped}`);
  }

  // Test 2: TypeScript Tokenizer
  const tsCode = `const count = 42;\n// simple comment\nreturn count;`;
  const tsLines = tokenizeCode(tsCode, "typescript");
  if (tsLines.length !== 3) {
    throw new Error(`Expected 3 tokenized lines, got ${tsLines.length}`);
  }
  const firstLineTokens = tsLines[0] ?? [];
  const hasKeyword = firstLineTokens.some((t) => t.type === "keyword" && t.text === "const");
  const hasNumber = firstLineTokens.some((t) => t.type === "number" && t.text === "42");
  if (!hasKeyword || !hasNumber) {
    throw new Error(`TypeScript tokenizer failed on const or number: ${JSON.stringify(firstLineTokens)}`);
  }

  // Test 3: Python Comment & Keywords
  const pyCode = `# Python async worker\nasync def run():\n    return 100`;
  const pyLines = tokenizeCode(pyCode, "python");
  const pyCommentToken = (pyLines[0] ?? [])[0];
  if (pyCommentToken?.type !== "comment" || !pyCommentToken.text.startsWith("#")) {
    throw new Error(`Python comment tokenization failed: ${JSON.stringify(pyCommentToken)}`);
  }

  // Test 4: SQL Keywords
  const sqlCode = `SELECT id, name FROM users WHERE id = 1;`;
  const sqlLines = tokenizeCode(sqlCode, "sql");
  const hasSelect = (sqlLines[0] ?? []).some((t) => t.type === "keyword" && t.text.toLowerCase() === "select");
  if (!hasSelect) {
    throw new Error(`SQL tokenizer failed on SELECT keyword`);
  }

  // Test 5: Themes & Backgrounds integrity
  if (!THEMES["dracula"] || !THEMES["github-dark"] || !THEMES["one-dark"]) {
    throw new Error("Core themes missing in THEMES dictionary");
  }
  if (!BACKGROUND_PRESETS["cosmic"] || !BACKGROUND_PRESETS["transparent"]) {
    throw new Error("Core background presets missing in BACKGROUND_PRESETS");
  }

  // Test 6: SVG Generation
  const svg = generateSvgSnapshot({
    code: SAMPLE_CODE_SNIPPETS.typescript,
    language: "typescript",
    theme: "dracula",
    background: "cosmic",
    windowStyle: "mac",
    padding: "balanced",
    title: "cache.ts",
    showLineNumbers: true,
    fontSize: 14,
  });

  if (!svg.startsWith("<svg") || !svg.includes("cache.ts") || !svg.includes("</svg>")) {
    throw new Error("SVG generation produced invalid SVG envelope");
  }

  return true;
}
