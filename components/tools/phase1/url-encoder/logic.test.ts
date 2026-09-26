import { encodeUrl, decodeUrl, parseUrlQuery, buildUrlWithParams } from "./logic";

export function runTests(): boolean {
  // Test 1: Component encoding
  const raw1 = "hello world & foo=bar/baz";
  const enc1 = encodeUrl(raw1, "component");
  if (enc1 !== "hello%20world%20%26%20foo%3Dbar%2Fbaz") {
    throw new Error(`Component encoding failed: ${enc1}`);
  }

  // Test 2: Decoding
  const dec1 = decodeUrl(enc1);
  if (dec1.result !== raw1) {
    throw new Error(`Decoding failed: ${dec1.result}`);
  }

  // Test 3: Query parser
  const testUrl = "https://example.com/search?q=mindkit+tools&category=developer&filter=free";
  const parsed = parseUrlQuery(testUrl);
  if (parsed.baseUrl !== "https://example.com/search") {
    throw new Error(`Base URL parsing failed: ${parsed.baseUrl}`);
  }
  if (parsed.params.length !== 3) {
    throw new Error(`Params count failed: ${parsed.params.length}`);
  }
  if (parsed.params[0]?.key !== "q" || parsed.params[0]?.value !== "mindkit tools") {
    throw new Error(`Param decode failed: ${JSON.stringify(parsed.params[0])}`);
  }

  // Test 4: Build URL
  const reconstructed = buildUrlWithParams(parsed.baseUrl, parsed.params);
  if (!reconstructed.includes("q=mindkit%20tools") || !reconstructed.includes("category=developer")) {
    throw new Error(`Reconstruction failed: ${reconstructed}`);
  }

  return true;
}
