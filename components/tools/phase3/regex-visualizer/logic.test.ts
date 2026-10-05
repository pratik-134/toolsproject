/**
 * Unit Tests for Interactive RegEx Visualizer & Rail Diagram
 */

import {
  parseRegexExplanation,
  executeRegexMatch,
} from "./logic";

export function runRegexVisualizerTests(): boolean {
  console.log("Testing [regex-visualizer] logic...");

  // 1. Parsing railroad explanation nodes
  const nodes = parseRegexExplanation("^([a-z]+)@([a-z0-9]+)$");
  if (nodes.length < 5) {
    throw new Error(`parseRegexExplanation expected at least 5 nodes, got ${nodes.length}`);
  }

  // Anchor check
  if (nodes[0]?.type !== "anchor" || nodes[nodes.length - 1]?.type !== "anchor") {
    throw new Error(`Expected start and end anchors`);
  }

  // 2. Matching evaluation
  const result = executeRegexMatch("[0-9]{3}-[0-9]{4}", "g", "Call 555-1234 or 999-5678");
  if (!result.isValid || result.matches.length !== 2) {
    throw new Error(`executeRegexMatch expected 2 phone number matches, got ${result.matches.length}`);
  }

  // 3. Invalid regex error handling
  const invalid = executeRegexMatch("([a-z", "", "test");
  if (invalid.isValid) {
    throw new Error(`executeRegexMatch should fail gracefully on unclosed bracket`);
  }

  console.log("✅ [regex-visualizer] unit tests passed!");
  return true;
}
