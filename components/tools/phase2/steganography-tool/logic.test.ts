/**
 * Unit Tests for Steganography Tool Logic
 */

import {
  calculateStegoCapacity,
  encodeStegoMessage,
  decodeStegoMessage,
} from "./logic";

export async function runSteganographyTests() {
  // Test 1: calculateStegoCapacity
  const cap = calculateStegoCapacity(100, 100);
  // 10,000 pixels * 3 bits = 30,000 bits = 3750 bytes - 16 = 3734 bytes
  if (cap.maxBytes < 3000) {
    throw new Error(`Unexpected capacity calculation: ${cap.maxBytes}`);
  }

  // Test 2: Unencrypted Encode and Decode Roundtrip
  // Create mock 50x50 RGBA image (2500 pixels = 10,000 bytes)
  const mockPixels = new Uint8ClampedArray(50 * 50 * 4);
  for (let i = 0; i < mockPixels.length; i += 4) {
    mockPixels[i] = 128;     // R
    mockPixels[i + 1] = 64;  // G
    mockPixels[i + 2] = 200; // B
    mockPixels[i + 3] = 255; // A
  }

  const secretMessage = "Top Secret Rendezvous at 14:00 UTC";
  const encodeRes = encodeStegoMessage(mockPixels, secretMessage);
  if (!encodeRes.success) {
    throw new Error(`Encoding failed: ${encodeRes.error}`);
  }

  const decodeRes = decodeStegoMessage(mockPixels);
  if (!decodeRes.success || decodeRes.message !== secretMessage) {
    throw new Error(`Decoding failed: expected "${secretMessage}", got "${decodeRes.message}"`);
  }

  // Test 3: Passphrase-Protected Steganography
  const passPixels = new Uint8ClampedArray(50 * 50 * 4);
  passPixels.fill(100);
  const secretWithPass = "Classified Project Falcon Blueprint";
  const pass = "FalconKey#99";

  const passEncode = encodeStegoMessage(passPixels, secretWithPass, pass);
  if (!passEncode.success) {
    throw new Error(`Passphrase encoding failed: ${passEncode.error}`);
  }

  // Decode with correct passphrase
  const passDecodeSuccess = decodeStegoMessage(passPixels, pass);
  if (!passDecodeSuccess.success || passDecodeSuccess.message !== secretWithPass) {
    throw new Error("Passphrase decoding failed with correct key");
  }

  // Decode without passphrase should request passphrase
  const passDecodeNoKey = decodeStegoMessage(passPixels);
  if (passDecodeNoKey.success) {
    throw new Error("Decoding should require passphrase");
  }

  // Test 4: Pure unmodified image detection
  const cleanPixels = new Uint8ClampedArray(50 * 50 * 4);
  cleanPixels.fill(0);
  const cleanCheck = decodeStegoMessage(cleanPixels);
  if (cleanCheck.success) {
    throw new Error("Clean image should not detect any stego message");
  }

  return true;
}
