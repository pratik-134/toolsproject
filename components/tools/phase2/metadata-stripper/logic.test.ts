import {
  detectFileType,
  sanitizeJpeg,
  sanitizePng,
  stripMetadata,
} from "./logic";

export function runTests(): boolean {
  // Test 1: File type detection
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  if (detectFileType(jpegHeader) !== "jpeg") {
    throw new Error("Failed to detect JPEG file type");
  }

  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (detectFileType(pngHeader) !== "png") {
    throw new Error("Failed to detect PNG file type");
  }

  const randomData = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
  if (detectFileType(randomData) !== "unknown") {
    throw new Error("Failed to return unknown for arbitrary bytes");
  }

  // Test 2: JPEG Sanitization with simulated APP1 (EXIF) and COM markers
  // Build a synthetic JPEG: SOI (2) + APP0 JFIF (6) + APP1 EXIF (8) + COM (6) + SOS (4) + EOI (2)
  const syntheticJpeg = new Uint8Array([
    0xff, 0xd8, // SOI
    0xff, 0xe0, 0x00, 0x04, 0x01, 0x02, // APP0 (length 4)
    0xff, 0xe1, 0x00, 0x06, 0x45, 0x78, 0x69, 0x66, // APP1 EXIF (length 6: "Exif")
    0xff, 0xfe, 0x00, 0x04, 0x48, 0x69, // COM (length 4: "Hi")
    0xff, 0xda, 0x00, 0x02, // SOS
    0x00, 0x11, 0x22, // scan data
    0xff, 0xd9, // EOI
  ]);

  const { cleanBuffer, removedTags } = sanitizeJpeg(syntheticJpeg);
  if (removedTags.length !== 2) {
    throw new Error(`Expected 2 removed tags from synthetic JPEG, got ${removedTags.length}`);
  }
  if (cleanBuffer.length >= syntheticJpeg.length) {
    throw new Error("Sanitized JPEG buffer was not reduced in size");
  }

  // Verify APP1 and COM markers were completely stripped from cleanBuffer
  for (let i = 0; i < cleanBuffer.length - 1; i++) {
    if (cleanBuffer[i] === 0xff && (cleanBuffer[i + 1] === 0xe1 || cleanBuffer[i + 1] === 0xfe)) {
      throw new Error("Clean JPEG still contains forbidden metadata markers");
    }
  }

  // Test 3: Universal stripMetadata wrapper
  const result = stripMetadata(syntheticJpeg);
  if (!result.success || result.fileType !== "jpeg" || result.sanitizedSize >= result.originalSize) {
    throw new Error("stripMetadata wrapper test failed on JPEG");
  }

  return true;
}
