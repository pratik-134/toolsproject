/**
 * Pure Client-Side HMAC Generator Logic
 * Leverages native Web Crypto API in browser and crypto in Node test runner.
 */

export type HmacAlgorithm = "SHA-256" | "SHA-512" | "SHA-384" | "SHA-1";

export interface HmacResult {
  algorithm: HmacAlgorithm;
  hex: string;
  hexUpper: string;
  base64: string;
}

export async function generateHmac(
  message: string,
  secretKey: string,
  algorithm: HmacAlgorithm = "SHA-256"
): Promise<HmacResult> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const msgData = encoder.encode(message);

  // Use globalThis.crypto for both Browser and Node.js >= 19
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    throw new Error("Web Crypto API (subtle) is not supported in this runtime environment.");
  }

  const cryptoKey = await subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: algorithm } },
    false,
    ["sign"]
  );

  const signature = await subtle.sign("HMAC", cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));

  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const hexUpper = hex.toUpperCase();

  // Base64 encoding
  let binaryString = "";
  for (let i = 0; i < hashArray.length; i++) {
    binaryString += String.fromCharCode(hashArray[i]!);
  }
  const base64 = typeof btoa !== "undefined"
    ? btoa(binaryString)
    : Buffer.from(signature).toString("base64");

  return {
    algorithm,
    hex,
    hexUpper,
    base64,
  };
}
