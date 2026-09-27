/**
 * In-Browser PDF Encryptor & Password Locker
 * Military-grade AES-GCM-256 with PBKDF2 key derivation (100,000 iterations).
 * 100% Client-Side RAM execution.
 */

export const PDF_MAGIC_HEADER = "MKPDF1";
export const PDF_MAGIC_BYTES = new Uint8Array([0x4d, 0x4b, 0x50, 0x44, 0x46, 0x31]); // 'M','K','P','D','F','1'
export const PBKDF2_ROUNDS = 100000;
export const SALT_LEN = 16;
export const IV_LEN = 12;

export interface PdfSecurityPermissions {
  allowPrinting: boolean;
  allowCopying: boolean;
  allowModifications: boolean;
  allowAnnotations: boolean;
  documentTitle?: string;
  lockedAt?: number;
}

export const DEFAULT_PERMISSIONS: PdfSecurityPermissions = {
  allowPrinting: true,
  allowCopying: false,
  allowModifications: false,
  allowAnnotations: false,
};

/**
 * Derives an AES-GCM-256 key from a user password using PBKDF2
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return globalThis.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as ArrayBuffer,
      iterations: PBKDF2_ROUNDS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Validates password strength score (0 to 4)
 */
export function evaluatePasswordStrength(password: string): {
  score: number;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  suggestions: string[];
} {
  const suggestions: string[] = [];
  if (!password) {
    return { score: 0, label: "Very Weak", suggestions: ["Enter a password to encrypt."] };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length < 8) {
    suggestions.push("Use at least 8 characters.");
  }
  if (!/[0-9]/.test(password)) {
    suggestions.push("Add a number.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    suggestions.push("Add a special character ($@!%*#?&).");
  }

  let label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong" = "Very Weak";
  if (score <= 1) label = "Weak";
  else if (score === 2) label = "Fair";
  else if (score === 3 || score === 4) label = "Strong";
  else if (score >= 5) label = "Very Strong";

  return { score: Math.min(score, 4), label, suggestions };
}

/**
 * Encrypts a PDF Uint8Array buffer with AES-GCM-256 and packages into MKPDF1 container
 */
export async function encryptPdfBuffer(
  pdfBytes: Uint8Array,
  password: string,
  permissions: PdfSecurityPermissions = DEFAULT_PERMISSIONS
): Promise<Uint8Array> {
  if (!password) {
    throw new Error("Encryption password cannot be empty");
  }
  if (pdfBytes.length === 0) {
    throw new Error("PDF data cannot be empty");
  }

  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(password, salt);

  // Serialize permissions metadata
  const metaJson = JSON.stringify({
    ...permissions,
    lockedAt: Date.now(),
  });
  const enc = new TextEncoder();
  const metaBytes = enc.encode(metaJson);

  if (metaBytes.length > 65535) {
    throw new Error("Metadata too large");
  }

  // Encrypt PDF bytes
  const encryptedPdfBuffer = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
    key,
    pdfBytes as unknown as ArrayBuffer
  );
  const cipherBytes = new Uint8Array(encryptedPdfBuffer);

  // Binary Layout:
  // [0..5]: Magic 'MKPDF1' (6 bytes)
  // [6..21]: Salt (16 bytes)
  // [22..33]: IV (12 bytes)
  // [34..35]: Meta length (2 bytes Uint16 BE)
  // [36..36+metaLen-1]: Meta bytes
  // [rest]: Ciphertext
  const totalLength = 6 + SALT_LEN + IV_LEN + 2 + metaBytes.length + cipherBytes.length;
  const result = new Uint8Array(totalLength);

  let offset = 0;
  result.set(PDF_MAGIC_BYTES, offset);
  offset += 6;

  result.set(salt, offset);
  offset += SALT_LEN;

  result.set(iv, offset);
  offset += IV_LEN;

  const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
  view.setUint16(offset, metaBytes.length, false);
  offset += 2;

  result.set(metaBytes, offset);
  offset += metaBytes.length;

  result.set(cipherBytes, offset);

  return result;
}

/**
 * Decrypts a MKPDF1 container and recovers the original PDF bytes and permissions
 */
export async function decryptPdfContainer(
  containerBytes: Uint8Array,
  password: string
): Promise<{ pdfBytes: Uint8Array; permissions: PdfSecurityPermissions }> {
  if (containerBytes.length < 6 + SALT_LEN + IV_LEN + 2 + 16) {
    throw new Error("Invalid or corrupted encrypted PDF container");
  }

  // Check magic bytes
  for (let i = 0; i < 6; i++) {
    if (containerBytes[i] !== PDF_MAGIC_BYTES[i]) {
      throw new Error("File is not a valid Cleartrix encrypted PDF (MKPDF1)");
    }
  }

  let offset = 6;
  const salt = containerBytes.slice(offset, offset + SALT_LEN);
  offset += SALT_LEN;

  const iv = containerBytes.slice(offset, offset + IV_LEN);
  offset += IV_LEN;

  const view = new DataView(containerBytes.buffer, containerBytes.byteOffset, containerBytes.byteLength);
  const metaLen = view.getUint16(offset, false);
  offset += 2;

  if (offset + metaLen > containerBytes.length) {
    throw new Error("Corrupted metadata header in encrypted PDF");
  }

  const metaBytes = containerBytes.slice(offset, offset + metaLen);
  offset += metaLen;

  const dec = new TextDecoder();
  const permissions: PdfSecurityPermissions = JSON.parse(dec.decode(metaBytes));

  const cipherBytes = containerBytes.slice(offset);
  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
      key,
      cipherBytes as unknown as ArrayBuffer
    );
    return { pdfBytes: new Uint8Array(decryptedBuffer), permissions };
  } catch {
    throw new Error("Decryption failed. Incorrect password or tampered file.");
  }
}
