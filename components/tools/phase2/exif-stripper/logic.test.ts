/**
 * Unit Tests for EXIF Stripper Pure Binary Logic
 */

import {
  parseJpegExif,
  stripJpegMetadata,
  stripPngMetadata,
  stripImageMetadata,
} from "./logic";

export function runExifStripperTests() {
  // Test 1: parseJpegExif on minimal JPEG
  const emptyJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  const meta = parseJpegExif(emptyJpeg);
  if (meta.totalTagCount !== 0) throw new Error("Empty JPEG should have 0 tags");

  // Test 2: stripJpegMetadata removing APP1 marker
  // Construct a synthetic JPEG with SOI + APP1 (Exif) + DQT + SOS + EOI
  const fakeApp1 = new Uint8Array([
    0xff, 0xe1, // APP1 marker
    0x00, 0x08, // Length = 8
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
  ]);
  const fakeDqt = new Uint8Array([
    0xff, 0xdb, // DQT marker
    0x00, 0x04, // Length = 4
    0x00, 0x00,
  ]);
  const fakeSosEoi = new Uint8Array([
    0xff, 0xda, // SOS
    0x00, 0x03, 0x01, 0xff, 0xd9, // EOI
  ]);

  const rawJpeg = new Uint8Array(2 + fakeApp1.length + fakeDqt.length + fakeSosEoi.length);
  rawJpeg.set([0xff, 0xd8], 0);
  rawJpeg.set(fakeApp1, 2);
  rawJpeg.set(fakeDqt, 2 + fakeApp1.length);
  rawJpeg.set(fakeSosEoi, 2 + fakeApp1.length + fakeDqt.length);

  const strippedJpeg = stripJpegMetadata(rawJpeg);

  // Verify strippedJpeg does NOT contain 0xFF, 0xE1
  let hasApp1 = false;
  for (let i = 0; i < strippedJpeg.length - 1; i++) {
    if (strippedJpeg[i] === 0xff && strippedJpeg[i + 1] === 0xe1) {
      hasApp1 = true;
      break;
    }
  }
  if (hasApp1) throw new Error("stripJpegMetadata failed to remove APP1 segment");

  // Verify SOI (FF D8) is retained at beginning
  if (strippedJpeg[0] !== 0xff || strippedJpeg[1] !== 0xd8) {
    throw new Error("SOI marker was corrupted during stripping");
  }

  // Verify DQT is retained
  let hasDqt = false;
  for (let i = 0; i < strippedJpeg.length - 1; i++) {
    if (strippedJpeg[i] === 0xff && strippedJpeg[i + 1] === 0xdb) {
      hasDqt = true;
      break;
    }
  }
  if (!hasDqt) throw new Error("DQT segment was incorrectly removed");

  // Test 3: stripPngMetadata removing tEXt chunk
  const pngHeader = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  // IHDR chunk: 13 bytes data + 4 type + 4 len + 4 crc = 25 bytes
  const ihdrChunk = new Uint8Array([
    0x00, 0x00, 0x00, 0x0d, // Length 13
    0x49, 0x48, 0x44, 0x52, // 'IHDR'
    0, 0, 0, 10, 0, 0, 0, 10, 8, 2, 0, 0, 0, // 10x10 RGB
    0x00, 0x00, 0x00, 0x00, // Dummy CRC
  ]);
  // tEXt chunk: 'Author=Test'
  const textChunk = new Uint8Array([
    0x00, 0x00, 0x00, 0x04, // Length 4
    0x74, 0x45, 0x58, 0x74, // 'tEXt'
    0x61, 0x62, 0x63, 0x64, // 'abcd'
    0x00, 0x00, 0x00, 0x00, // Dummy CRC
  ]);
  // IEND chunk
  const iendChunk = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, // Length 0
    0x49, 0x45, 0x4e, 0x44, // 'IEND'
    0xae, 0x42, 0x60, 0x82, // CRC
  ]);

  const rawPng = new Uint8Array(
    pngHeader.length + ihdrChunk.length + textChunk.length + iendChunk.length
  );
  let p = 0;
  rawPng.set(pngHeader, p); p += pngHeader.length;
  rawPng.set(ihdrChunk, p); p += ihdrChunk.length;
  rawPng.set(textChunk, p); p += textChunk.length;
  rawPng.set(iendChunk, p);

  const strippedPng = stripPngMetadata(rawPng);
  const pngText = new TextDecoder("ascii").decode(strippedPng);

  if (pngText.includes("tEXt")) {
    throw new Error("stripPngMetadata failed to strip tEXt chunk");
  }
  if (!pngText.includes("IHDR") || !pngText.includes("IEND")) {
    throw new Error("Essential PNG chunks (IHDR/IEND) were corrupted");
  }

  // Test 4: stripImageMetadata
  const res = stripImageMetadata(rawJpeg, "image/jpeg");
  if (res.savedBytes !== fakeApp1.length) {
    throw new Error(`Saved bytes mismatch: expected ${fakeApp1.length}, got ${res.savedBytes}`);
  }

  return true;
}
