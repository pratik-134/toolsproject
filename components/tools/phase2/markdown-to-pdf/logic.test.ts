/**
 * Unit Tests for Markdown to PDF Logic
 */

import {
  parseMarkdownBlocks,
  stripInlineMarkdown,
  wrapText,
  compileMarkdownToPdf,
} from "./logic";

export async function runMarkdownToPdfTests() {
  // Test 1: parseMarkdownBlocks
  const md = `
# Main Title
This is a standard paragraph with **bold** text.

## Secondary Heading
- Item one
- Item two
- Item three

1. First step
2. Second step

> A blockquote citation

\`\`\`
const x = 42;
console.log(x);
\`\`\`

---
Final paragraph.
`;

  const blocks = parseMarkdownBlocks(md);
  if (blocks.length < 8) {
    throw new Error(`Expected at least 8 blocks, got ${blocks.length}`);
  }

  const h1 = blocks.find((b) => b.type === "h1");
  if (!h1 || h1.content !== "Main Title") throw new Error("H1 block parsing failed");

  const ul = blocks.find((b) => b.type === "ul");
  if (!ul || ul.items?.length !== 3) throw new Error("UL items parsing failed");

  const ol = blocks.find((b) => b.type === "ol");
  if (!ol || ol.items?.length !== 2) throw new Error("OL items parsing failed");

  const code = blocks.find((b) => b.type === "codeblock");
  if (!code || !code.content.includes("const x = 42;")) throw new Error("Code block parsing failed");

  // Test 2: stripInlineMarkdown
  const stripped = stripInlineMarkdown("Here is **bold** and *italic* and `code` and [link](https://example.com)");
  if (stripped !== "Here is bold and italic and code and link") {
    throw new Error(`stripInlineMarkdown failed: got "${stripped}"`);
  }

  // Test 3: wrapText
  const wrapped = wrapText("The quick brown fox jumps over the lazy dog", 100, 12, 0.55);
  if (wrapped.length < 2) {
    throw new Error("wrapText should wrap into multiple lines for small width");
  }

  // Test 4: compileMarkdownToPdf
  const pdfBytes = await compileMarkdownToPdf(md, {
    theme: "minimalist",
    pageSize: "a4",
    margin: "normal",
    includePageNumbers: true,
  });

  // Verify PDF header magic bytes %PDF-
  if (
    pdfBytes[0] !== 0x25 ||
    pdfBytes[1] !== 0x50 ||
    pdfBytes[2] !== 0x44 ||
    pdfBytes[3] !== 0x46
  ) {
    throw new Error("Compiled output does not have %PDF- header");
  }

  if (pdfBytes.length < 500) {
    throw new Error("Compiled PDF size is unexpectedly small");
  }

  return true;
}
