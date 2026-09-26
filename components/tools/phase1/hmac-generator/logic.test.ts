import { generateHmac } from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: Standard RFC 4231 HMAC-SHA-256 test vector
  // Key: "key", Data: "The quick brown fox jumps over the lazy dog"
  // HMAC-SHA256: f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
  const res1 = await generateHmac(
    "The quick brown fox jumps over the lazy dog",
    "key",
    "SHA-256"
  );

  const expectedHex = "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";
  if (res1.hex !== expectedHex) {
    throw new Error(`Test 1 HMAC-SHA-256 failed:\nGot: ${res1.hex}\nExp: ${expectedHex}`);
  }

  // Test 2: Base64 output check
  if (!res1.base64 || res1.base64.length === 0) {
    throw new Error("Test 2 Base64 encoding failed");
  }

  // Test 3: HMAC-SHA-512 check
  const res3 = await generateHmac("hello", "secret", "SHA-512");
  if (res3.hex.length !== 128) {
    throw new Error(`Test 3 HMAC-SHA-512 length failed: ${res3.hex.length}`);
  }

  return true;
}
