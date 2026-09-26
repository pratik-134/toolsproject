/**
 * Unit Tests for Direct TXT Editor Logic
 */

import {
  computeTextStats,
  convertLineEndings,
  transformCase,
  cleanWhitespace,
  convertIndentation,
} from "./logic";

export async function runDirectTxtEditorTests() {
  // Test 1: computeTextStats
  const sample = "The quick brown fox\njumps over the lazy dog.\n\nThird paragraph here.";
  const stats = computeTextStats(sample);

  if (stats.words !== 12) {
    throw new Error(`Expected 12 words, got ${stats.words}`);
  }
  if (stats.lines !== 4) {
    throw new Error(`Expected 4 lines, got ${stats.lines}`);
  }
  if (stats.paragraphs !== 2) {
    throw new Error(`Expected 2 paragraphs, got ${stats.paragraphs}`);
  }
  if (stats.charactersWithSpaces !== sample.length) {
    throw new Error("Mismatch in charactersWithSpaces");
  }
  if (stats.bytesUtf8 <= 0) {
    throw new Error("bytesUtf8 should be greater than zero");
  }

  // Test 2: convertLineEndings
  const mixed = "Line 1\r\nLine 2\nLine 3\rLine 4";
  const lf = convertLineEndings(mixed, "lf");
  if (lf.includes("\r")) {
    throw new Error("convertLineEndings to LF should contain no \\r");
  }
  const crlf = convertLineEndings(lf, "crlf");
  if (!crlf.includes("\r\n")) {
    throw new Error("convertLineEndings to CRLF should contain \\r\\n");
  }

  // Test 3: transformCase
  const lower = transformCase("HELLO WORLD", "lower");
  if (lower !== "hello world") throw new Error("transformCase lower failed");

  const upper = transformCase("hello world", "upper");
  if (upper !== "HELLO WORLD") throw new Error("transformCase upper failed");

  const title = transformCase("hello world and universe", "title");
  if (title !== "Hello World And Universe") throw new Error(`transformCase title failed: ${title}`);

  const sentence = transformCase("hello. this is cool! how are you?", "sentence");
  if (sentence !== "Hello. This is cool! How are you?") throw new Error(`transformCase sentence failed: ${sentence}`);

  // Test 4: cleanWhitespace
  const messy = "Line 1   \nLine 2  \n\n\n\nLine 3   ";
  const cleanedTrailing = cleanWhitespace(messy, { trimTrailing: true });
  if (cleanedTrailing.includes("Line 1   ")) {
    throw new Error("cleanWhitespace failed to trim trailing spaces");
  }

  const normalizedBlanks = cleanWhitespace(messy, { normalizeBlankLines: true });
  if (normalizedBlanks.includes("\n\n\n")) {
    throw new Error("cleanWhitespace failed to normalize multiple blank lines");
  }

  const strippedBlanks = cleanWhitespace(messy, { stripBlankLines: true });
  if (strippedBlanks.includes("\n\n")) {
    throw new Error("cleanWhitespace stripBlankLines failed");
  }

  // Test 5: convertIndentation
  const indentedWithSpaces = "    block1\n        sub-block";
  const tabs = convertIndentation(indentedWithSpaces, "tabs", 4);
  if (!tabs.startsWith("\tblock1\n\t\tsub-block")) {
    throw new Error("convertIndentation spaces to tabs failed");
  }

  const backToSpaces = convertIndentation(tabs, "spaces", 4);
  if (backToSpaces !== indentedWithSpaces) {
    throw new Error("convertIndentation tabs to spaces failed");
  }

  return true;
}
