import { encodeHtmlEntities, decodeHtmlEntities } from "./logic";

export function runTests(): boolean {
  // Test 1: Basic special character encoding (named)
  const raw1 = `<script>alert("Hello & 'Welcome'");</script>`;
  const enc1 = encodeHtmlEntities(raw1, { format: "named", scope: "special" });
  if (enc1 !== `&lt;script&gt;alert(&quot;Hello &amp; &apos;Welcome&apos;&quot;);&lt;/script&gt;`) {
    throw new Error(`Test 1 named encode failed: ${enc1}`);
  }

  // Test 2: Decoding named entities
  const dec1 = decodeHtmlEntities(enc1);
  if (dec1 !== raw1) {
    throw new Error(`Test 2 named decode failed: ${dec1}`);
  }

  // Test 3: Decimal encoding
  const enc3 = encodeHtmlEntities("A&B", { format: "decimal", scope: "special" });
  if (enc3 !== "A&#38;B") {
    throw new Error(`Test 3 decimal failed: ${enc3}`);
  }
  const dec3 = decodeHtmlEntities("A&#38;B");
  if (dec3 !== "A&B") {
    throw new Error(`Test 3 decode failed: ${dec3}`);
  }

  // Test 4: Hex encoding of unicode symbols
  const enc4 = encodeHtmlEntities("Qwertygen © 2026", { format: "hex", scope: "non-ascii" });
  if (!enc4.includes("&#xA9;")) {
    throw new Error(`Test 4 hex encode failed: ${enc4}`);
  }
  const dec4 = decodeHtmlEntities(enc4);
  if (dec4 !== "Qwertygen © 2026") {
    throw new Error(`Test 4 decode failed: ${dec4}`);
  }

  return true;
}
