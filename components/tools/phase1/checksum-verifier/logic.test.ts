import { computeStringHash, compareChecksums } from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: SHA-256 of "Cleartrix"
  const sha256 = await computeStringHash("Cleartrix", "SHA-256");
  if (!sha256 || sha256.length !== 64) {
    throw new Error(`Test 1 SHA-256 length failed: ${sha256}`);
  }

  // Test 2: Checksum comparison match
  const comp1 = compareChecksums(sha256, sha256.toUpperCase(), "SHA-256");
  if (!comp1.match) {
    throw new Error(`Test 2 case-insensitive match failed`);
  }

  // Test 3: Checksum comparison mismatch
  const comp2 = compareChecksums(sha256, "0123456789abcdef", "SHA-256");
  if (comp2.match) {
    throw new Error(`Test 3 mismatch detection failed`);
  }

  // Test 4: SHA-512 length check
  const sha512 = await computeStringHash("Cleartrix", "SHA-512");
  if (sha512.length !== 128) {
    throw new Error(`Test 4 SHA-512 length failed: ${sha512.length}`);
  }

  return true;
}
