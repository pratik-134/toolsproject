/**
 * Unit Tests for File Decryptor Logic
 */

import { encryptFileBuffer } from "../file-encryptor/logic";
import {
  inspectEncryptedContainer,
  decryptFileBuffer,
} from "./logic";

export async function runFileDecryptorTests() {
  const originalText = "Top-secret corporate quarterly roadmap 2026";
  const originalBytes = new TextEncoder().encode(originalText);
  const correctPassword = "CorrectHorseBatteryStaple!2026";
  const filename = "executive_roadmap.pdf";
  const mimeType = "application/pdf";

  // 1. Encrypt file
  const encrypted = await encryptFileBuffer(
    originalBytes,
    filename,
    mimeType,
    correctPassword
  );

  // 2. Test inspectEncryptedContainer
  const inspection = inspectEncryptedContainer(encrypted);
  if (!inspection.valid) {
    throw new Error(`inspectEncryptedContainer failed: ${inspection.error}`);
  }
  if (inspection.filename !== filename) {
    throw new Error(`Filename mismatch: got "${inspection.filename}", expected "${filename}"`);
  }
  if (inspection.mimeType !== mimeType) {
    throw new Error(`Mime mismatch: got "${inspection.mimeType}", expected "${mimeType}"`);
  }

  // 3. Test successful decryption
  const decrypted = await decryptFileBuffer(encrypted, correctPassword);
  if (decrypted.filename !== filename) {
    throw new Error("Decrypted filename mismatch");
  }
  if (decrypted.mimeType !== mimeType) {
    throw new Error("Decrypted mime mismatch");
  }

  const restoredText = new TextDecoder().decode(decrypted.originalBytes);
  if (restoredText !== originalText) {
    throw new Error("Restored plaintext does not match original plaintext");
  }

  // 4. Test wrong password failure
  let failedAsExpected = false;
  try {
    await decryptFileBuffer(encrypted, "WrongPassword!999");
  } catch {
    failedAsExpected = true;
  }

  if (!failedAsExpected) {
    throw new Error("Decryption should have thrown error for incorrect password!");
  }

  return true;
}
