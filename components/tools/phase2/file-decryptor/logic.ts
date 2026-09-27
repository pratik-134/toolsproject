/**
 * In-Browser File Decryptor — Pure Web Crypto Logic
 * Reverse container parsing, PBKDF2 key derivation, and AES-GCM-256 decryption.
 */

import {
  MAGIC_BYTES,
  SALT_LENGTH,
  IV_LENGTH,
  deriveKeyFromPassword,
} from "../file-encryptor/logic";

export interface DecryptedFileInfo {
  originalBytes: Uint8Array;
  filename: string;
  mimeType: string;
}

/**
 * Inspect an encrypted container and extract header metadata without password
 */
export function inspectEncryptedContainer(containerBytes: Uint8Array): {
  valid: boolean;
  filename?: string;
  mimeType?: string;
  error?: string;
} {
  if (containerBytes.length < MAGIC_BYTES.length + SALT_LENGTH + IV_LENGTH + 4) {
    return { valid: false, error: "File is too small to be a valid Cleartrix encrypted container." };
  }

  // Check magic bytes
  for (let i = 0; i < MAGIC_BYTES.length; i++) {
    if (containerBytes[i] !== MAGIC_BYTES[i]) {
      return { valid: false, error: "Unrecognized file signature. Not a Cleartrix .enc file." };
    }
  }

  let offset = MAGIC_BYTES.length + SALT_LENGTH + IV_LENGTH;
  const view = new DataView(
    containerBytes.buffer,
    containerBytes.byteOffset,
    containerBytes.byteLength
  );

  const nameLen = view.getUint16(offset, false);
  offset += 2;

  if (offset + nameLen > containerBytes.length) {
    return { valid: false, error: "Corrupted filename header." };
  }

  const dec = new TextDecoder();
  const filename = dec.decode(containerBytes.subarray(offset, offset + nameLen));
  offset += nameLen;

  const mimeLen = view.getUint16(offset, false);
  offset += 2;

  if (offset + mimeLen > containerBytes.length) {
    return { valid: false, error: "Corrupted mime type header." };
  }

  const mimeType = dec.decode(containerBytes.subarray(offset, offset + mimeLen));

  return { valid: true, filename, mimeType };
}

/**
 * Decrypt a Cleartrix encrypted container with password
 */
export async function decryptFileBuffer(
  containerBytes: Uint8Array,
  password: string
): Promise<DecryptedFileInfo> {
  if (!password) {
    throw new Error("Password cannot be empty.");
  }

  const inspect = inspectEncryptedContainer(containerBytes);
  if (!inspect.valid) {
    throw new Error(inspect.error || "Invalid encrypted file.");
  }

  let offset = MAGIC_BYTES.length;

  // Salt
  const salt = containerBytes.subarray(offset, offset + SALT_LENGTH);
  offset += SALT_LENGTH;

  // IV
  const iv = containerBytes.subarray(offset, offset + IV_LENGTH);
  offset += IV_LENGTH;

  const view = new DataView(
    containerBytes.buffer,
    containerBytes.byteOffset,
    containerBytes.byteLength
  );

  // Filename
  const nameLen = view.getUint16(offset, false);
  offset += 2;
  const dec = new TextDecoder();
  const filename = dec.decode(containerBytes.subarray(offset, offset + nameLen));
  offset += nameLen;

  // Mime Type
  const mimeLen = view.getUint16(offset, false);
  offset += 2;
  const mimeType = dec.decode(containerBytes.subarray(offset, offset + mimeLen));
  offset += mimeLen;

  // Ciphertext + GCM Tag
  const ciphertext = containerBytes.subarray(offset);

  // Derive AES key
  const key = await deriveKeyFromPassword(password, salt);

  // Decrypt with AES-GCM
  try {
    const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
      key,
      ciphertext as unknown as ArrayBuffer
    );

    return {
      originalBytes: new Uint8Array(decryptedBuffer),
      filename,
      mimeType,
    };
  } catch {
    throw new Error(
      "Decryption failed. Incorrect master password or corrupted file integrity tag."
    );
  }
}
