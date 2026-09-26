/**
 * Checksum Verifier Logic (Pure Client-Side, Web Crypto API)
 * Computes and compares cryptographic checksums for files and text.
 */

export type ChecksumAlgorithm = "SHA-256" | "SHA-512" | "SHA-1" | "SHA-384";

export interface ChecksumComparison {
  match: boolean;
  computedHash: string;
  expectedHash: string;
  algorithm: ChecksumAlgorithm;
}

export async function computeBufferHash(
  buffer: ArrayBuffer,
  algorithm: ChecksumAlgorithm = "SHA-256"
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API is not supported in this runtime.");
  }

  const hashBuffer = await subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function computeStringHash(
  text: string,
  algorithm: ChecksumAlgorithm = "SHA-256"
): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(text).buffer;
  return computeBufferHash(buffer, algorithm);
}

export function compareChecksums(
  computed: string,
  expected: string,
  algorithm: ChecksumAlgorithm
): ChecksumComparison {
  const cleanComputed = computed.trim().toLowerCase();
  const cleanExpected = expected.trim().toLowerCase();

  return {
    match: cleanComputed.length > 0 && cleanComputed === cleanExpected,
    computedHash: cleanComputed,
    expectedHash: cleanExpected,
    algorithm,
  };
}
