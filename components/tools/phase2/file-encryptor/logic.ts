/**
 * In-Browser File Encryptor — Pure Web Crypto Logic
 * Military-grade AES-GCM-256 with PBKDF2 key derivation (100,000 rounds)
 * Format: MKENC1 container with embedded salt, IV, and original file metadata.
 */

export const MAGIC_HEADER = "MKENC1";
export const MAGIC_BYTES = new Uint8Array([0x4d, 0x4b, 0x45, 0x4e, 0x43, 0x31]); // 'M', 'K', 'E', 'N', 'C', '1'
export const PBKDF2_ITERATIONS = 100000;
export const SALT_LENGTH = 16;
export const IV_LENGTH = 12;

/**
 * Derive AES-GCM-256 CryptoKey from user password using PBKDF2
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await globalThis.crypto.subtle.importKey(
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
      iterations,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Validate password strength and return score (0-4) and guidance
 */
export function validatePasswordStrength(password: string): {
  score: number;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Excellent";
  suggestions: string[];
} {
  const suggestions: string[] = [];
  if (!password) {
    return { score: 0, label: "Very Weak", suggestions: ["Enter a master password."] };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;

  if (password.length < 10) suggestions.push("Use at least 10 characters.");
  if (!/[A-Z]/.test(password)) suggestions.push("Add uppercase letters.");
  if (!/\d/.test(password)) suggestions.push("Add numbers.");
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push("Add special symbols.");

  const labels: Array<"Very Weak" | "Weak" | "Fair" | "Strong" | "Excellent"> = [
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Excellent",
  ];

  return {
    score,
    label: labels[score] || "Fair",
    suggestions,
  };
}

/**
 * Encrypt arbitrary file bytes into a portable Mindkit MKENC1 container
 */
export async function encryptFileBuffer(
  fileBytes: Uint8Array,
  filename: string,
  mimeType: string,
  password: string
): Promise<Uint8Array> {
  if (!password) {
    throw new Error("Encryption requires a non-empty password.");
  }

  // 1. Generate cryptographically secure random salt and IV
  const salt = new Uint8Array(SALT_LENGTH);
  const iv = new Uint8Array(IV_LENGTH);
  globalThis.crypto.getRandomValues(salt);
  globalThis.crypto.getRandomValues(iv);

  // 2. Derive 256-bit AES-GCM key
  const key = await deriveKeyFromPassword(password, salt);

  // 3. Encrypt payload with AES-GCM
  const ciphertextBuffer = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
    key,
    fileBytes as unknown as ArrayBuffer
  );
  const ciphertext = new Uint8Array(ciphertextBuffer);

  // 4. Encode metadata
  const enc = new TextEncoder();
  const nameBytes = enc.encode(filename || "encrypted_file");
  const mimeBytes = enc.encode(mimeType || "application/octet-stream");

  // 5. Structure Container:
  // [6B Magic] + [16B Salt] + [12B IV] + [2B NameLen] + [NameBytes] + [2B MimeLen] + [MimeBytes] + [Ciphertext + Tag]
  const totalLength =
    MAGIC_BYTES.length +
    SALT_LENGTH +
    IV_LENGTH +
    2 +
    nameBytes.length +
    2 +
    mimeBytes.length +
    ciphertext.length;

  const container = new Uint8Array(totalLength);
  let offset = 0;

  // Magic
  container.set(MAGIC_BYTES, offset);
  offset += MAGIC_BYTES.length;

  // Salt
  container.set(salt, offset);
  offset += SALT_LENGTH;

  // IV
  container.set(iv, offset);
  offset += IV_LENGTH;

  // Filename
  const view = new DataView(container.buffer);
  view.setUint16(offset, nameBytes.length, false);
  offset += 2;
  container.set(nameBytes, offset);
  offset += nameBytes.length;

  // Mime Type
  view.setUint16(offset, mimeBytes.length, false);
  offset += 2;
  container.set(mimeBytes, offset);
  offset += mimeBytes.length;

  // Ciphertext (includes 16-byte GCM authentication tag at end)
  container.set(ciphertext, offset);

  return container;
}
