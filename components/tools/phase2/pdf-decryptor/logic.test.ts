import { PDFDocument } from "pdf-lib";
import {
  isQwertygenEncryptedPdf,
  decryptAndUnlockPdf,
  createDemoEncryptedPdf,
} from "./logic";

export async function runTests(): Promise<boolean> {
  const password = "QwertygenTestPassword2026!";

  // Test 1: createDemoEncryptedPdf
  const demoBytes = await createDemoEncryptedPdf(password);
  if (!demoBytes || demoBytes.length === 0) {
    throw new Error("createDemoEncryptedPdf returned empty Uint8Array");
  }

  // Test 2: isQwertygenEncryptedPdf
  if (!isQwertygenEncryptedPdf(demoBytes)) {
    throw new Error("isQwertygenEncryptedPdf failed to recognize MKPDF1 container");
  }
  if (isQwertygenEncryptedPdf(new Uint8Array([1, 2, 3, 4, 5, 6]))) {
    throw new Error("isQwertygenEncryptedPdf false positive on arbitrary bytes");
  }

  // Test 3: decryptAndUnlockPdf with valid password
  const result = await decryptAndUnlockPdf(demoBytes, password);
  if (!result.pdfBytes || result.pdfBytes.length === 0) {
    throw new Error("decryptAndUnlockPdf returned empty pdfBytes");
  }
  if (result.method !== "qwertygen-aes256") {
    throw new Error(`Unexpected decryption method: ${result.method}`);
  }

  // Verify that returned bytes are a valid PDF
  const loadedPdf = await PDFDocument.load(result.pdfBytes);
  if (loadedPdf.getPageCount() < 1) {
    throw new Error("Decrypted PDF contains zero pages");
  }

  // Test 4: decryptAndUnlockPdf with invalid password should throw
  let caught = false;
  try {
    await decryptAndUnlockPdf(demoBytes, "IncorrectPassword");
  } catch {
    caught = true;
  }
  if (!caught) {
    throw new Error("Expected decryption with bad password to fail");
  }

  return true;
}
