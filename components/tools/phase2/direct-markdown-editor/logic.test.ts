/**
 * Unit Tests for Direct Markdown Editor Logic
 */

import {
  computeTaskProgress,
  generateMarkdownTable,
  insertMarkdownFormat,
  renderMarkdownToHtml,
} from "./logic";

export async function runDirectMarkdownEditorTests() {
  // Test 1: computeTaskProgress
  const sampleMd = `
# Tasks
- [x] Write privacy specification
- [ ] Implement client-side parser
- [x] Run test suites
- [ ] Deploy to production
`;
  const progress = computeTaskProgress(sampleMd);
  if (progress.total !== 4) {
    throw new Error(`Expected total 4 tasks, got ${progress.total}`);
  }
  if (progress.completed !== 2) {
    throw new Error(`Expected 2 completed tasks, got ${progress.completed}`);
  }
  if (progress.percentage !== 50) {
    throw new Error(`Expected 50% completion, got ${progress.percentage}%`);
  }

  // Test 2: generateMarkdownTable
  const table = generateMarkdownTable(2, 3);
  if (!table.includes("Header 1 | Header 2 | Header 3")) {
    throw new Error("Table header missing from generated table");
  }
  if (!table.includes("Row 2 Col 3")) {
    throw new Error("Table rows missing from generated table");
  }

  // Test 3: insertMarkdownFormat
  const orig = "Hello world";
  const boldInsert = insertMarkdownFormat(orig, 6, 11, "bold");
  if (boldInsert.newText !== "Hello **world**") {
    throw new Error(`Bold insert failed: got "${boldInsert.newText}"`);
  }

  const italicInsert = insertMarkdownFormat(orig, 0, 5, "italic");
  if (italicInsert.newText !== "*Hello* world") {
    throw new Error(`Italic insert failed: got "${italicInsert.newText}"`);
  }

  const codeInsert = insertMarkdownFormat(orig, 6, 11, "code");
  if (codeInsert.newText !== "Hello `world`") {
    throw new Error(`Code insert failed: got "${codeInsert.newText}"`);
  }

  // Test 4: renderMarkdownToHtml
  const mdSnippet = `
# Test Document
Here is **bold** text and *italic* text.

> A wise quote.

\`\`\`javascript
const answer = 42;
\`\`\`

- [x] Done item
- [ ] Pending item

| Col A | Col B |
| --- | --- |
| 1 | 2 |
`;
  const html = renderMarkdownToHtml(mdSnippet);

  if (!html.includes("<h1") || !html.includes("Test Document</h1>")) {
    throw new Error("Heading 1 rendering failed");
  }
  if (!html.includes("<strong>bold</strong>")) {
    throw new Error("Bold inline rendering failed");
  }
  if (!html.includes("<em>italic</em>")) {
    throw new Error("Italic inline rendering failed");
  }
  if (!html.includes("<blockquote")) {
    throw new Error("Blockquote rendering failed");
  }
  if (!html.includes("<pre") || !html.includes("const answer = 42;")) {
    throw new Error("Codeblock rendering failed");
  }
  if (!html.includes("type=\"checkbox\" checked")) {
    throw new Error("Checklist rendering failed");
  }
  if (!html.includes("<table") || !html.includes("<th") || !html.includes("<td")) {
    throw new Error("Table rendering failed");
  }

  return true;
}
