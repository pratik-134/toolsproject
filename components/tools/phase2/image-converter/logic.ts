/**
 * Image Converter — In-Browser Pure Logic
 * High-performance format conversion, BMP/ICO binary synthesis, and dimension math.
 */

export type SupportedImageFormat = "png" | "jpeg" | "webp" | "bmp" | "ico" | "svg";

export interface ConvertOptions {
  targetFormat: SupportedImageFormat;
  quality: number; // 0.01 to 1.0
  backgroundColor?: string; // e.g. '#ffffff' for filling transparency on formats without alpha
  scale?: number; // 0.1 to 3.0 (default 1.0)
}

export const FORMAT_DETAILS: Record<
  SupportedImageFormat,
  { name: string; ext: string; mime: string; hasAlpha: boolean; lossy: boolean }
> = {
  png: { name: "PNG (Lossless)", ext: "png", mime: "image/png", hasAlpha: true, lossy: false },
  jpeg: { name: "JPEG (Compressed)", ext: "jpg", mime: "image/jpeg", hasAlpha: false, lossy: true },
  webp: { name: "WebP (Modern)", ext: "webp", mime: "image/webp", hasAlpha: true, lossy: true },
  bmp: { name: "BMP (Bitmap)", ext: "bmp", mime: "image/bmp", hasAlpha: false, lossy: false },
  ico: { name: "ICO (Favicon)", ext: "ico", mime: "image/x-icon", hasAlpha: true, lossy: false },
  svg: { name: "SVG (Vector Wrap)", ext: "svg", mime: "image/svg+xml", hasAlpha: true, lossy: false },
};

/**
 * Format raw byte counts into human-readable strings
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  if (bytes < 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(dm))} ${sizes[safeIndex]}`;
}

/**
 * Replace file extension with the target format extension
 */
export function getFilenameWithExtension(originalName: string, targetExt: string): string {
  const cleanExt = targetExt.startsWith(".") ? targetExt.slice(1) : targetExt;
  const lastDot = originalName.lastIndexOf(".");
  if (lastDot === -1) {
    return `${originalName}.${cleanExt}`;
  }
  return `${originalName.substring(0, lastDot)}.${cleanExt}`;
}

/**
 * Validate image file size and MIME type
 */
export function validateImageFile(file: { name?: string; type: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  if (file.size <= 0) {
    return { valid: false, error: "The uploaded file is empty." };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File exceeds 50MB browser memory limit." };
  }
  const isImageMime = file.type.startsWith("image/") || file.type === "image/svg+xml";
  const hasImageExt = file.name
    ? /\.(png|jpe?g|webp|svg|gif|bmp|ico|tiff?|avif)$/i.test(file.name)
    : false;

  if (!isImageMime && !hasImageExt) {
    return { valid: false, error: "Unsupported file format. Please upload a standard image file." };
  }
  return { valid: true };
}

/**
 * Calculate scaled dimensions clamped to positive integers
 */
export function calculateScaledDimensions(
  width: number,
  height: number,
  scale: number = 1.0
): { width: number; height: number } {
  const safeScale = Math.max(0.01, Math.min(10.0, scale));
  const targetW = Math.max(1, Math.round(width * safeScale));
  const targetH = Math.max(1, Math.round(height * safeScale));
  return { width: targetW, height: targetH };
}

/**
 * Pure binary BMP 24-bit RGB encoder
 * Constructs a standard 54-byte BMP file header (BITMAPFILEHEADER + BITMAPINFOHEADER)
 * followed by bottom-up BGR row data with 4-byte alignment.
 */
export function createBmpBinary(
  width: number,
  height: number,
  rgbaData: Uint8ClampedArray
): Uint8Array {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // BITMAPFILEHEADER (14 bytes)
  view.setUint16(0, 0x424d, false); // 'BM'
  view.setUint32(2, fileSize, true); // File size
  view.setUint16(6, 0, true); // Reserved
  view.setUint16(8, 0, true); // Reserved
  view.setUint32(10, 54, true); // Pixel array offset

  // BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true); // Header size
  view.setInt32(18, width, true); // Image width
  view.setInt32(22, height, true); // Image height (positive = bottom-up)
  view.setUint16(26, 1, true); // Color planes
  view.setUint16(28, 24, true); // Bits per pixel (24-bit RGB)
  view.setUint32(30, 0, true); // Compression (0 = BI_RGB uncompressed)
  view.setUint32(34, pixelArraySize, true); // Image size
  view.setInt32(38, 2835, true); // Horizontal resolution (72 DPI = 2835 ppm)
  view.setInt32(42, 2835, true); // Vertical resolution
  view.setUint32(46, 0, true); // Palette colors
  view.setUint32(50, 0, true); // Important colors

  // Pixel data: bottom-to-top, left-to-right, BGR order
  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    let rowOffset = offset;
    for (let x = 0; x < width; x++) {
      const srcIndex = (y * width + x) * 4;
      const r = rgbaData[srcIndex] ?? 0;
      const g = rgbaData[srcIndex + 1] ?? 0;
      const b = rgbaData[srcIndex + 2] ?? 0;

      bytes[rowOffset++] = b;
      bytes[rowOffset++] = g;
      bytes[rowOffset++] = r;
    }
    // Pad to 4-byte boundary
    while ((rowOffset - offset) < rowSize) {
      bytes[rowOffset++] = 0;
    }
    offset += rowSize;
  }

  return bytes;
}

/**
 * Pure binary ICO encoder wrapping PNG payload
 * Generates standard multi-resolution ICO header containing a single PNG entry.
 */
export function createIcoBinary(pngBytes: Uint8Array, width: number, height: number): Uint8Array {
  // ICO Header: 6 bytes
  // Directory Entry: 16 bytes
  // PNG payload: pngBytes.length bytes
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalSize = headerSize + dirEntrySize + pngBytes.length;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // ICONDIR Header
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Resource type: 1 = icon (.ICO)
  view.setUint16(4, 1, true); // Number of images: 1

  // ICONDIRENTRY (16 bytes)
  const icoWidth = width >= 256 ? 0 : width;
  const icoHeight = height >= 256 ? 0 : height;

  view.setUint8(6, icoWidth); // Width in pixels (0 means 256)
  view.setUint8(7, icoHeight); // Height in pixels
  view.setUint8(8, 0); // Palette color count
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true); // Color planes (1)
  view.setUint16(12, 32, true); // Bits per pixel (32-bit RGBA)
  view.setUint32(14, pngBytes.length, true); // Image data size in bytes
  view.setUint32(18, headerSize + dirEntrySize, true); // Offset to image data

  // Copy PNG payload
  bytes.set(pngBytes, headerSize + dirEntrySize);

  return bytes;
}

/**
 * Wrap raster image data URI into a clean vector SVG container
 */
export function createSvgWrapper(dataUri: string, width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" href="${dataUri}"/>
</svg>`;
}
