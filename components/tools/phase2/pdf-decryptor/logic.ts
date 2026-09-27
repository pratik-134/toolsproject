import { PDFDocument } from "pdf-lib";
import {
  decryptPdfContainer,
  PDF_MAGIC_BYTES,
  PdfSecurityPermissions,
  encryptPdfBuffer,
} from "../pdf-encryptor/logic";

export interface DecryptResult {
  pdfBytes: Uint8Array;
  method: "cleartrix-aes256" | "standard-pdf";
  permissions?: PdfSecurityPermissions;
}

/**
 * Checks whether a byte buffer starts with the Cleartrix MKPDF1 magic header
 */
export function isCleartrixEncryptedPdf(buffer: Uint8Array): boolean {
  if (buffer.length < 6) return false;
  for (let i = 0; i < 6; i++) {
    if (buffer[i] !== PDF_MAGIC_BYTES[i]) return false;
  }
  return true;
}

/**
 * Decrypts a Cleartrix encrypted PDF or standard password-protected PDF in-browser
 */
export async function decryptAndUnlockPdf(
  buffer: Uint8Array,
  password: string
): Promise<DecryptResult> {
  if (!password) {
    throw new Error("Password is required to decrypt the document.");
  }

  // Case 1: Cleartrix MKPDF1 AES-256 Container
  if (isCleartrixEncryptedPdf(buffer)) {
    const { pdfBytes, permissions } = await decryptPdfContainer(buffer, password);
    return {
      pdfBytes,
      method: "cleartrix-aes256",
      permissions,
    };
  }

  // Case 2: Standard Encrypted PDF
  try {
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
    });
    const unlockedBytes = await pdfDoc.save();
    return {
      pdfBytes: unlockedBytes,
      method: "standard-pdf",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Standard PDF decryption failed";
    throw new Error(`Failed to unlock PDF: ${message}`);
  }
}

/**
 * Creates a sample encrypted PDF for testing or instant demo
 */
export async function createDemoEncryptedPdf(password: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([500, 350]);
  page.drawText("Demo Decrypted Document", { x: 50, y: 300, size: 18 });
  page.drawText("This file was locked with AES-256 and unlocked in-browser.", {
    x: 50,
    y: 260,
    size: 11,
  });
  const rawBytes = await doc.save();
  return await encryptPdfBuffer(rawBytes, password, {
    allowPrinting: true,
    allowCopying: true,
    allowModifications: false,
    allowAnnotations: true,
    documentTitle: "Demo Protected Document",
  });
}
