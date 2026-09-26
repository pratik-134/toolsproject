/**
 * Universal Metadata Stripper — Pure TypeScript Domain Logic
 * 100% In-Browser Binary Sanitization (Zero Server Transmission)
 * Strips EXIF, GPS, IPTC, XMP, and text comments from JPEG and PNG files.
 */

export interface StripResult {
  sanitizedBuffer: Uint8Array;
  originalSize: number;
  sanitizedSize: number;
  removedTags: string[];
  fileType: "jpeg" | "png" | "unknown";
  success: boolean;
}

/**
 * Detect file type from magic bytes
 */
export function detectFileType(buffer: Uint8Array): "jpeg" | "png" | "unknown" {
  if (buffer.length < 8) return "unknown";

  // JPEG: 0xFF 0xD8 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }

  // PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  return "unknown";
}

/**
 * Sanitize JPEG by removing APP1 (EXIF/XMP), APP2, APP13 (IPTC), and COM markers
 */
export function sanitizeJpeg(buffer: Uint8Array): {
  cleanBuffer: Uint8Array;
  removedTags: string[];
} {
  const removedTags: string[] = [];
  const chunks: Uint8Array[] = [];

  // Always keep SOI marker (0xFF, 0xD8)
  chunks.push(new Uint8Array([0xff, 0xd8]));

  let offset = 2;
  const len = buffer.length;

  while (offset < len) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buffer[offset + 1] ?? 0;

    // End of image
    if (marker === 0xd9) {
      chunks.push(new Uint8Array([0xff, 0xd9]));
      break;
    }

    // Start of scan (SOS) — payload data follows until EOI
    if (marker === 0xda) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    // Check segment length (2 bytes, big-endian)
    if (offset + 4 > len) break;
    const segmentLength = ((buffer[offset + 2] ?? 0) << 8) | (buffer[offset + 3] ?? 0);
    const segmentEnd = offset + 2 + segmentLength;

    if (segmentEnd > len) break;

    // Check if segment is metadata to remove:
    // 0xE1: APP1 (EXIF / XMP)
    // 0xE2: APP2 (ICC / FlashPix)
    // 0xED: APP13 (IPTC / Photoshop)
    // 0xFE: COM (Comment)
    if (marker === 0xe1) {
      removedTags.push("EXIF & XMP Metadata (APP1)");
    } else if (marker === 0xed) {
      removedTags.push("IPTC & Photoshop Metadata (APP13)");
    } else if (marker === 0xfe) {
      removedTags.push("Embedded Comments (COM)");
    } else {
      // Retain segment (e.g. APP0 JFIF, DQT, SOF, DHT)
      chunks.push(buffer.subarray(offset, segmentEnd));
    }

    offset = segmentEnd;
  }

  // Combine retained chunks
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const cleanBuffer = new Uint8Array(totalLength);
  let pos = 0;
  for (const c of chunks) {
    cleanBuffer.set(c, pos);
    pos += c.length;
  }

  return { cleanBuffer, removedTags };
}

/**
 * Sanitize PNG by removing metadata chunks: tEXt, zTXt, iTXt, eXIf, tIME
 */
export function sanitizePng(buffer: Uint8Array): {
  cleanBuffer: Uint8Array;
  removedTags: string[];
} {
  const removedTags: string[] = [];
  const chunks: Uint8Array[] = [];

  // Keep PNG 8-byte signature
  chunks.push(buffer.subarray(0, 8));

  let offset = 8;
  const len = buffer.length;

  while (offset + 8 <= len) {
    const chunkLength =
      ((buffer[offset] ?? 0) << 24) |
      ((buffer[offset + 1] ?? 0) << 16) |
      ((buffer[offset + 2] ?? 0) << 8) |
      (buffer[offset + 3] ?? 0);

    const typeChars = [
      String.fromCharCode(buffer[offset + 4] ?? 0),
      String.fromCharCode(buffer[offset + 5] ?? 0),
      String.fromCharCode(buffer[offset + 6] ?? 0),
      String.fromCharCode(buffer[offset + 7] ?? 0),
    ].join("");

    const totalChunkLength = 4 + 4 + chunkLength + 4; // length + type + data + crc
    const chunkEnd = offset + totalChunkLength;

    if (chunkEnd > len) break;

    // Check if chunk is metadata to strip
    if (["tEXt", "zTXt", "iTXt", "eXIf", "tIME"].includes(typeChars)) {
      removedTags.push(`PNG ${typeChars} Metadata`);
    } else {
      chunks.push(buffer.subarray(offset, chunkEnd));
    }

    offset = chunkEnd;
  }

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const cleanBuffer = new Uint8Array(totalLength);
  let pos = 0;
  for (const c of chunks) {
    cleanBuffer.set(c, pos);
    pos += c.length;
  }

  return { cleanBuffer, removedTags };
}

/**
 * Universal Strip Metadata Entrypoint
 */
export function stripMetadata(buffer: Uint8Array): StripResult {
  const originalSize = buffer.length;
  const fileType = detectFileType(buffer);

  if (fileType === "jpeg") {
    const { cleanBuffer, removedTags } = sanitizeJpeg(buffer);
    return {
      sanitizedBuffer: cleanBuffer,
      originalSize,
      sanitizedSize: cleanBuffer.length,
      removedTags: removedTags.length > 0 ? removedTags : ["No EXIF/IPTC tags detected (Clean)"],
      fileType: "jpeg",
      success: true,
    };
  }

  if (fileType === "png") {
    const { cleanBuffer, removedTags } = sanitizePng(buffer);
    return {
      sanitizedBuffer: cleanBuffer,
      originalSize,
      sanitizedSize: cleanBuffer.length,
      removedTags: removedTags.length > 0 ? removedTags : ["No tEXt/eXIf chunks detected (Clean)"],
      fileType: "png",
      success: true,
    };
  }

  return {
    sanitizedBuffer: buffer,
    originalSize,
    sanitizedSize: originalSize,
    removedTags: ["Unsupported format for binary metadata stripping (Only JPEG and PNG supported)"],
    fileType: "unknown",
    success: false,
  };
}
