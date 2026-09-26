import { normalizeUnicode } from "./logic";

export function runTests(): boolean {
  // Test 1: Composed vs Decomposed 'é' (U+00E9 vs e + U+0301)
  const decomposed = "e\u0301"; // NFD
  const resNfc = normalizeUnicode(decomposed, "NFC");

  if (resNfc.normalized !== "\u00E9") {
    throw new Error(`Test 1 NFC failed: ${resNfc.normalized}`);
  }
  if (resNfc.originalCodePoints !== 2 || resNfc.normalizedCodePoints !== 1) {
    throw new Error(`Test 1 code points failed`);
  }

  // Test 2: Decomposing 'é' to NFD
  const composed = "\u00E9";
  const resNfd = normalizeUnicode(composed, "NFD");
  if (resNfd.normalized !== "e\u0301") {
    throw new Error(`Test 2 NFD failed`);
  }
  if (resNfd.normalizedCodePoints !== 2) {
    throw new Error(`Test 2 NFD length failed: ${resNfd.normalizedCodePoints}`);
  }

  // Test 3: Compatibility decomposition NFKC (e.g. ligature 'ﬁ' -> 'fi')
  const ligature = "ﬁle";
  const resNfkc = normalizeUnicode(ligature, "NFKC");
  if (resNfkc.normalized !== "file") {
    throw new Error(`Test 3 NFKC ligature failed: ${resNfkc.normalized}`);
  }

  // Test 4: Code point inspection
  const charDetail = resNfc.characters[0];
  if (!charDetail || charDetail.codePointHex !== "U+00E9") {
    throw new Error(`Test 4 detail failed: ${charDetail?.codePointHex}`);
  }

  return true;
}
