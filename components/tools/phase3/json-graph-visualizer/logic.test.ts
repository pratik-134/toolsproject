/**
 * Unit Test Suite for Interactive JSON/YAML Graph & Tree Visualizer
 * Deterministic test vectors executed via npm run test:tools
 */

import {
  parseJsonToTree,
  calculateTreeStats,
  filterTreeNodes,
  generateTreeSvg,
  SAMPLE_JSON,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Valid JSON Parsing
  const valid = parseJsonToTree(SAMPLE_JSON);
  if (!valid.root || valid.error !== null) {
    throw new Error(`Failed to parse sample JSON: ${valid.error}`);
  }
  if (valid.root.children.length < 5) {
    throw new Error(`Expected at least 5 top-level keys in root, got ${valid.root.children.length}`);
  }

  // Test 2: Invalid JSON Error Handling
  const invalid = parseJsonToTree("{ name: 'broken' ");
  if (invalid.root !== null || typeof invalid.error !== "string") {
    throw new Error("Failed to report invalid JSON syntax error");
  }

  // Test 3: Metric Statistics Calculation
  const stats = calculateTreeStats(valid.root);
  if (stats.totalNodes < 10 || stats.maxDepth < 2 || stats.objectsCount < 2) {
    throw new Error(`Tree stats calculation mismatch: ${JSON.stringify(stats)}`);
  }

  // Test 4: Node Search & Filtering
  const filtered = filterTreeNodes(valid.root, "AES-256");
  if (!filtered) {
    throw new Error("Failed to find node matching 'AES-256'");
  }
  const encryptionChild = filtered.children.find((c) => c.key === "encryption");
  if (!encryptionChild) {
    throw new Error("Filtered tree did not preserve parent hierarchy");
  }

  // Test 5: SVG Graph Export
  const svg = generateTreeSvg(valid.root, true);
  if (!svg.startsWith("<svg") || !svg.includes("viewBox=") || !svg.endsWith("</svg>")) {
    throw new Error("Generated tree SVG is malformed");
  }

  return true;
}
