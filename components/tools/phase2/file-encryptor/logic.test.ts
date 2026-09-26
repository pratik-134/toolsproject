/**
 * Unit Tests for File Encryptor Logic
 */

import {
  encryptFileBuffer,
  validatePasswordStrength,
  MAGIC_BYTES,
} from "./logic";

export async function runFileEncryptorTests() {
  // Test 1: validatePasswordStrength
  const weak = validatePasswordStrength("123");
  if (weak.score > 1) {
    throw new Error("Short password should be weak");
  }

  const strong = validatePasswordStrength("K9#xL8!vPq2$wZ");
  if (strong.score < 3) {
    throw new Error("Complex password should score at least 3");
  }

  // Test 2: encryptFileBuffer
  const plainText = "Confidential financial roadmap Q4 2026";
  const plainBytes = new TextEncoder().encode(plainText);
  const password = "MasterSecurityPassword#2026";

  const encrypted = await encryptFileBuffer(
    plainBytes,
    "roadmap.txt",
    "text/plain",
    password
  );

  // Check magic bytes
  for (let i = 0; i < MAGIC_BYTES.length; i++) {
    if (encrypted[i] !== MAGIC_BYTES[i]) {
      throw new Error(`Magic byte mismatch at index ${i}`);
    }
  }

  // Ensure plainText is NOT present anywhere in ciphertext
  const encString = new TextDecoder().decode(encrypted);
  if (encString.includes(plainText)) {
    throw new Error("Plaintext leaked into encrypted container!");
  }

  // Ensure minimum container size
  // Header: 6 (magic) + 16 (salt) + 12 (iv) + 2 (nameLen) + 11 (roadmap.txt) + 2 (mimeLen) + 10 (text/plain) + 38 (data) + 16 (GCM tag) = ~113 bytes
  if (encrypted.length < 100) {
    throw new Error(`Encrypted container unexpectedly small: ${encrypted.length}`);
  }

  return true;
}
