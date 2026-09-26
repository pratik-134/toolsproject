/**
 * Unit Tests for Image to Base64 Converter Logic
 */

import {
  convertImageBytesToBase64,
  parseBase64DataUri,
  formatBase64Snippet,
  computeBase64Metrics,
} from "./logic";

export async function runImageBase64ConverterTests() {
  // Test 1: convertImageBytesToBase64
  const mockBytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
  const dataUri = convertImageBytesToBase64(mockBytes, "image/png");
  if (!dataUri.startsWith("data:image/png;base64,")) {
    throw new Error(`Data URI prefix missing: ${dataUri}`);
  }
  if (!dataUri.includes("SGVsbG8=")) {
    throw new Error(`Base64 payload mismatch: ${dataUri}`);
  }

  // Test 2: parseBase64DataUri with data URI
  const parsed1 = parseBase64DataUri(dataUri);
  if (!parsed1.valid || parsed1.mimeType !== "image/png" || !parsed1.bytes) {
    throw new Error(`parseBase64DataUri failed for data URI: ${parsed1.error}`);
  }
  if (parsed1.bytes[0] !== 72 || parsed1.bytes[4] !== 111) {
    throw new Error("Decoded bytes mismatch");
  }

  // Test 3: parseBase64DataUri with raw base64
  const parsedRaw = parseBase64DataUri("SGVsbG8=");
  if (!parsedRaw.valid || !parsedRaw.bytes || parsedRaw.bytes.length !== 5) {
    throw new Error("parseBase64DataUri failed for raw Base64 string");
  }

  // Test 4: formatBase64Snippet
  const css = formatBase64Snippet(dataUri, "css");
  if (!css.startsWith("background-image: url(\"data:image/png;base64,")) {
    throw new Error("CSS format mismatch");
  }

  const html = formatBase64Snippet(dataUri, "html", "test-img");
  if (!html.includes("<img src=\"data:image/png;base64,") || !html.includes("alt=\"test-img\"")) {
    throw new Error("HTML format mismatch");
  }

  const md = formatBase64Snippet(dataUri, "markdown", "pic");
  if (!md.startsWith("![pic](data:image/png;base64,")) {
    throw new Error("Markdown format mismatch");
  }

  // Test 5: computeBase64Metrics
  const metrics = computeBase64Metrics(100, 133);
  if (metrics.overheadPercent !== 33 || metrics.deltaBytes !== 33) {
    throw new Error(`Metrics calculation mismatch: ${JSON.stringify(metrics)}`);
  }

  return true;
}
