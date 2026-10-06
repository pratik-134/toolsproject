/**
 * In-Browser Image Steganography — Pure Canvas Pixel Logic
 * Least Significant Bit (LSB) embedding with optional passphrase obfuscation.
 * Preserves lossless RGB values across standard HTML5 Canvas ImageData.
 */

export const STEGO_MAGIC = new Uint8Array([0x53, 0x54, 0x45, 0x47]); // 'S', 'T', 'E', 'G'

/**
 * Calculate total text capacity for given image dimensions
 */
export function calculateStegoCapacity(width: number, height: number): {
  maxBytes: number;
  maxCharacters: number;
} {
  const totalPixels = width * height;
  // 3 bits per pixel (R, G, B channels)
  const totalBits = totalPixels * 3;
  // 8 bits per byte, minus header overhead (4B magic + 4B length + 1B flag + 2B crc = 11 bytes)
  const maxBytes = Math.max(0, Math.floor(totalBits / 8) - 16);
  return {
    maxBytes,
    maxCharacters: maxBytes, // 1 char ~= 1-2 bytes UTF-8
  };
}

/**
 * Deterministic keystream generator from passphrase
 */
function applyKeystream(data: Uint8Array, passphrase?: string): Uint8Array {
  if (!passphrase) return data;
  const result = new Uint8Array(data.length);
  const passBytes = new TextEncoder().encode(passphrase);
  for (let i = 0; i < data.length; i++) {
    const pByte = passBytes[i % passBytes.length] ?? 0;
    const key = (pByte * 31 + (i % 256)) & 0xff;
    const current = data[i] ?? 0;
    result[i] = current ^ key;
  }
  return result;
}

/**
 * Calculate simple 16-bit checksum
 */
function calculateCrc16(data: Uint8Array): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    const val = data[i] ?? 0;
    crc ^= val << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc;
}

/**
 * Encode message into pixelData (RGBA) in-place
 */
export function encodeStegoMessage(
  pixelData: Uint8ClampedArray,
  message: string,
  passphrase?: string
): { success: boolean; error?: string; bytesEncoded: number } {
  if (!message || !message.trim()) {
    return { success: false, error: "Secret message cannot be empty.", bytesEncoded: 0 };
  }

  const enc = new TextEncoder();
  const rawPayload = enc.encode(message);
  const isEncrypted = Boolean(passphrase && passphrase.trim());
  const processedPayload = isEncrypted ? applyKeystream(rawPayload, passphrase) : rawPayload;

  const payloadLen = processedPayload.length;
  const crc = calculateCrc16(processedPayload);

  // Total packet:
  // [4B Magic] + [4B Length] + [1B Flag (0x01 if encrypted, 0x00 if plain)] + [Payload] + [2B CRC]
  const packetLen = 4 + 4 + 1 + payloadLen + 2;
  const totalBitsNeeded = packetLen * 8;

  // Capacity check: R, G, B per pixel = 3 bits per 4 bytes of RGBA
  const usableBits = (pixelData.length / 4) * 3;
  if (totalBitsNeeded > usableBits) {
    return {
      success: false,
      error: `Carrier image is too small. Needs ${Math.ceil(totalBitsNeeded / 8)} bytes of capacity, but image only holds ${Math.floor(usableBits / 8)} bytes.`,
      bytesEncoded: 0,
    };
  }

  // Assemble packet
  const packet = new Uint8Array(packetLen);
  packet.set(STEGO_MAGIC, 0);

  // Length (uint32 big-endian)
  packet[4] = (payloadLen >>> 24) & 0xff;
  packet[5] = (payloadLen >>> 16) & 0xff;
  packet[6] = (payloadLen >>> 8) & 0xff;
  packet[7] = payloadLen & 0xff;

  // Flag
  packet[8] = isEncrypted ? 0x01 : 0x00;

  // Payload
  packet.set(processedPayload, 9);

  // CRC (uint16 big-endian)
  packet[9 + payloadLen] = (crc >>> 8) & 0xff;
  packet[9 + payloadLen + 1] = crc & 0xff;

  // Embed bits into LSBs of R, G, B
  let bitIndex = 0;
  for (let i = 0; i < pixelData.length; i += 4) {
    // Channel R
    if (bitIndex < totalBitsNeeded) {
      const byteIdx = Math.floor(bitIndex / 8);
      const bitOffset = 7 - (bitIndex % 8);
      const pByte = packet[byteIdx] ?? 0;
      const bit = (pByte >>> bitOffset) & 0x01;
      const pixelVal = pixelData[i] ?? 0;
      pixelData[i] = (pixelVal & 0xfe) | bit;
      bitIndex++;
    }

    // Channel G
    if (bitIndex < totalBitsNeeded) {
      const byteIdx = Math.floor(bitIndex / 8);
      const bitOffset = 7 - (bitIndex % 8);
      const pByte = packet[byteIdx] ?? 0;
      const bit = (pByte >>> bitOffset) & 0x01;
      const pixelVal = pixelData[i + 1] ?? 0;
      pixelData[i + 1] = (pixelVal & 0xfe) | bit;
      bitIndex++;
    }

    // Channel B
    if (bitIndex < totalBitsNeeded) {
      const byteIdx = Math.floor(bitIndex / 8);
      const bitOffset = 7 - (bitIndex % 8);
      const pByte = packet[byteIdx] ?? 0;
      const bit = (pByte >>> bitOffset) & 0x01;
      const pixelVal = pixelData[i + 2] ?? 0;
      pixelData[i + 2] = (pixelVal & 0xfe) | bit;
      bitIndex++;
    }

    if (bitIndex >= totalBitsNeeded) break;
  }

  return { success: true, bytesEncoded: packetLen };
}

/**
 * Decode hidden message from pixelData (RGBA)
 */
export function decodeStegoMessage(
  pixelData: Uint8ClampedArray,
  passphrase?: string
): { success: boolean; message?: string; error?: string } {
  // Extract first 72 bits (9 bytes: 4B Magic + 4B Length + 1B Flag)
  const headerBytes = new Uint8Array(9);
  let bitIndex = 0;

  for (let i = 0; i < pixelData.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      if (bitIndex < 72) {
        const byteIdx = Math.floor(bitIndex / 8);
        const bitOffset = 7 - (bitIndex % 8);
        const channelVal = pixelData[i + c] ?? 0;
        const bit = channelVal & 0x01;
        headerBytes[byteIdx] = (headerBytes[byteIdx] ?? 0) | (bit << bitOffset);
        bitIndex++;
      }
    }
    if (bitIndex >= 72) break;
  }

  // Validate Magic
  for (let m = 0; m < 4; m++) {
    if (headerBytes[m] !== STEGO_MAGIC[m]) {
      return {
        success: false,
        error: "No hidden Qwertygen steganographic message detected in this image.",
      };
    }
  }

  // Read Length
  const h4 = headerBytes[4] ?? 0;
  const h5 = headerBytes[5] ?? 0;
  const h6 = headerBytes[6] ?? 0;
  const h7 = headerBytes[7] ?? 0;
  const payloadLen = ((h4 << 24) | (h5 << 16) | (h6 << 8) | h7) >>> 0;
  const isEncrypted = (headerBytes[8] ?? 0) === 0x01;

  if (payloadLen <= 0 || payloadLen > 10_000_000) {
    return { success: false, error: "Invalid or corrupted message length header." };
  }

  const totalBitsToRead = (9 + payloadLen + 2) * 8;
  const totalUsableBits = (pixelData.length / 4) * 3;
  if (totalBitsToRead > totalUsableBits) {
    return { success: false, error: "Image data truncated; missing hidden payload." };
  }

  // Extract full packet bits
  const packet = new Uint8Array(9 + payloadLen + 2);
  bitIndex = 0;

  for (let i = 0; i < pixelData.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      if (bitIndex < totalBitsToRead) {
        const byteIdx = Math.floor(bitIndex / 8);
        const bitOffset = 7 - (bitIndex % 8);
        const channelVal = pixelData[i + c] ?? 0;
        const bit = channelVal & 0x01;
        packet[byteIdx] = (packet[byteIdx] ?? 0) | (bit << bitOffset);
        bitIndex++;
      }
    }
    if (bitIndex >= totalBitsToRead) break;
  }

  // Extract payload and verify CRC
  const payload = packet.subarray(9, 9 + payloadLen);
  const p1 = packet[9 + payloadLen] ?? 0;
  const p2 = packet[9 + payloadLen + 1] ?? 0;
  const storedCrc = (p1 << 8) | p2;
  const calculatedCrc = calculateCrc16(payload);

  if (storedCrc !== calculatedCrc) {
    return { success: false, error: "Integrity check failed. Image pixels were altered." };
  }

  if (isEncrypted && (!passphrase || !passphrase.trim())) {
    return {
      success: false,
      error: "This secret message is passphrase-protected. Please enter the correct passphrase.",
    };
  }

  const decryptedPayload = isEncrypted ? applyKeystream(payload, passphrase) : payload;

  try {
    const message = new TextDecoder("utf-8", { fatal: true }).decode(decryptedPayload);
    return { success: true, message };
  } catch {
    return {
      success: false,
      error: "Failed to decode text. Passphrase may be incorrect.",
    };
  }
}
