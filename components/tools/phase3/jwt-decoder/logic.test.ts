import { base64UrlDecode, decodeJwt, SAMPLE_JWT } from "./logic";

export function runTests(): boolean {
  // Test 1: Standard sample token decode
  const res = decodeJwt(SAMPLE_JWT, 1705000000);
  if (res.error) {
    throw new Error(`Unexpected error decoding sample JWT: ${res.error}`);
  }
  if (!res.header || res.header.alg !== "HS256" || res.header.typ !== "JWT") {
    throw new Error(`Invalid header parsed: ${JSON.stringify(res.header)}`);
  }
  if (!res.payload || res.payload.sub !== "1234567890" || res.payload.name !== "Alex Rivera") {
    throw new Error(`Invalid payload parsed: ${JSON.stringify(res.payload)}`);
  }
  if (res.expStatus.isExpired !== false) {
    throw new Error(`Expected token not to be expired at reference timestamp`);
  }
  if (!res.signature || !res.signature.startsWith("SflKxw")) {
    throw new Error(`Signature mismatch: got ${res.signature}`);
  }

  // Test 2: Expired token detection
  // SAMPLE_JWT exp is 2080000000; check past timestamp
  const expiredRes = decodeJwt(SAMPLE_JWT, 2100000000);
  if (expiredRes.expStatus.isExpired !== true) {
    throw new Error("Expected token to be marked as expired");
  }

  // Test 3: Empty string input
  const emptyRes = decodeJwt("");
  if (emptyRes.header !== null || emptyRes.payload !== null || emptyRes.error !== null) {
    throw new Error("Empty input should return null header/payload without error");
  }

  // Test 4: Malformed JWT (single token segment without dots)
  const singlePartRes = decodeJwt("not-a-valid-jwt-token");
  if (!singlePartRes.error || !singlePartRes.error.includes("Invalid JWT structure")) {
    throw new Error(`Expected structure error, got: ${singlePartRes.error}`);
  }

  // Test 5: Malformed Base64 content
  const malformedB64Res = decodeJwt("???illegal???.payload.signature");
  if (!malformedB64Res.error || !malformedB64Res.error.includes("Failed to decode token")) {
    throw new Error(`Expected base64 error, got: ${malformedB64Res.error}`);
  }

  // Test 6: base64UrlDecode function directly with padding permutations
  // "hello" in base64 is "aGVsbG8=" (len 8, padding 1 '=' so base64url length 7 % 4 == 3)
  const decodedHello = base64UrlDecode("aGVsbG8");
  if (decodedHello !== "hello") {
    throw new Error(`Expected 'hello', got '${decodedHello}'`);
  }

  // "hell" in base64 is "aGVsbA==" (len 8, padding 2 '==' so base64url length 6 % 4 == 2)
  const decodedHell = base64UrlDecode("aGVsbA");
  if (decodedHell !== "hell") {
    throw new Error(`Expected 'hell', got '${decodedHell}'`);
  }

  return true;
}
