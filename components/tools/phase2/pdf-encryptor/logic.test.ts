import { PDFDocument } from "pdf-lib";
import {
  evaluatePasswordStrength,
  encryptPdfBuffer,
  decryptPdfContainer,
  PDF_MAGIC_BYTES,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: Password strength evaluation
  const weak = evaluatePasswordStrength("123");
  if (weak.score > 1 || weak.label !== "Weak") {
    throw new Error(`Expected weak score for '123', got ${weak.score}`);
  }

  const strong = evaluatePasswordStrength("P@ssw0rdSecure2026!");
  if (strong.score < 3) {
    throw new Error(`Expected strong score for complex password, got ${strong.score}`);
  }

  // Test 2: Generate sample PDF bytes
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 300]);
  page.drawText("Confidential Mindkit Financials", { x: 50, y: 250 });
  const samplePdfBytes = await doc.save();

  // Test 3: Encrypt PDF buffer
  const password = "SuperSecretPassword123!";
  const encrypted = await encryptPdfBuffer(samplePdfBytes, password, {
    allowPrinting: false,
    allowCopying: false,
    allowModifications: false,
    allowAnnotations: false,
    documentTitle: "Q3 Report",
  });

  if (!encrypted || encrypted.length === 0) {
    throw new Error("encryptPdfBuffer returned empty array");
  }

  // Verify magic header
  for (let i = 0; i < 6; i++) {
    if (encrypted[i] !== PDF_MAGIC_BYTES[i]) {
      throw new Error("Encrypted container missing MKPDF1 magic bytes");
    }
  }

  // Test 4: Decrypt with correct password
  const decrypted = await decryptPdfContainer(encrypted, password);
  if (decrypted.pdfBytes.length !== samplePdfBytes.length) {
    throw new Error("Decrypted PDF byte length does not match original");
  }
  if (decrypted.permissions.documentTitle !== "Q3 Report") {
    throw new Error("Permissions title mismatch in decrypted payload");
  }

  // Test 5: Decrypt with incorrect password should throw
  let caught = false;
  try {
    await decryptPdfContainer(encrypted, "WrongPasswordHere");
  } catch {
    caught = true;
  }
  if (!caught) {
    throw new Error("Expected decryption with wrong password to throw an error");
  }

  return true;
}
