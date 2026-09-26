import { formatJson } from "./logic";

export function runTests(): boolean {
  // Test 1: Empty input
  const emptyRes = formatJson("", { indent: 2 });
  if (!emptyRes.success || emptyRes.output !== "") {
    throw new Error("Empty JSON test failed");
  }

  // Test 2: Valid JSON formatting
  const raw = '{"b":2,"a":1,"nested":{"z":true}}';
  const formatted = formatJson(raw, { indent: 2, sortKeys: true });
  if (!formatted.success) {
    throw new Error(`Valid JSON test failed: ${formatted.error}`);
  }
  if (!formatted.output.includes('"a": 1') || formatted.output.indexOf('"a"') > formatted.output.indexOf('"b"')) {
    throw new Error("Sort keys or indent failed");
  }

  // Test 3: Minify
  const minified = formatJson(raw, { indent: "minify" });
  if (!minified.success || minified.output.includes("\n") || minified.output.includes(" ")) {
    throw new Error("Minify test failed");
  }

  // Test 4: Invalid JSON handling
  const invalidRes = formatJson('{"unclosed": ', { indent: 2 });
  if (invalidRes.success || !invalidRes.error) {
    throw new Error("Invalid JSON did not fail gracefully");
  }

  return true;
}
