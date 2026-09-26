import { analyzeText } from "./logic";

export function runTests(): boolean {
  // Test 1: Empty text
  const empty = analyzeText("");
  if (empty.words !== 0 || empty.characters !== 0) throw new Error("Empty text analysis failed");

  // Test 2: Standard sentence
  const text = "Mindkit is a privacy-first web platform. It runs completely on your device.\n\nEnjoy 175 free tools.";
  const stats = analyzeText(text);

  if (stats.words !== 16) throw new Error(`Expected 16 words, got ${stats.words}`);
  if (stats.paragraphs !== 2) throw new Error(`Expected 2 paragraphs, got ${stats.paragraphs}`);
  if (stats.sentences < 2) throw new Error(`Expected at least 2 sentences, got ${stats.sentences}`);

  return true;
}
