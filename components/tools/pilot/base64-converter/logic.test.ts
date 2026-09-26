import { encodeBase64, decodeBase64 } from "./logic";

export function runTests(): boolean {
  // Test 1: ASCII string
  const str = "Mindkit Privacy-First 175 Tools";
  const enc = encodeBase64(str);
  if (!enc.success) throw new Error("Base64 ASCII encode failed");
  const dec = decodeBase64(enc.output);
  if (!dec.success || dec.output !== str) throw new Error("Base64 ASCII decode failed");

  // Test 2: Multibyte UTF-8 characters (emoji, accents, non-latin)
  const utfStr = "Mindkit \u26A1 \u{1F680} ツール 100% Free! Éléphant";
  const utfEnc = encodeBase64(utfStr);
  if (!utfEnc.success) throw new Error("Base64 UTF-8 encode failed");
  const utfDec = decodeBase64(utfEnc.output);
  if (!utfDec.success || utfDec.output !== utfStr) throw new Error("Base64 UTF-8 decode failed");

  // Test 3: Invalid base64 decode handling
  const invDec = decodeBase64("!@#$%^&*()");
  if (invDec.success || !invDec.error) throw new Error("Base64 invalid decode did not fail gracefully");

  return true;
}
