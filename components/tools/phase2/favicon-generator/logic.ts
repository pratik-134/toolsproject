/**
 * Favicon Generator — Pure TypeScript Domain Logic
 * Generates valid Windows ICO binary files, HTML <head> tags, and Web Manifest JSON.
 * 100% In-Browser Execution.
 */

export interface FaviconSizeSpec {
  name: string;
  filename: string;
  width: number;
  height: number;
  purpose: string;
}

export const FAVICON_SPECS: FaviconSizeSpec[] = [
  { name: "Favicon 16x16", filename: "favicon-16x16.png", width: 16, height: 16, purpose: "Standard browser tab icon" },
  { name: "Favicon 32x32", filename: "favicon-32x32.png", width: 32, height: 32, purpose: "High-DPI / Retina browser tab" },
  { name: "Favicon 48x48", filename: "favicon-48x48.png", width: 48, height: 48, purpose: "Desktop shortcut & Windows taskbar" },
  { name: "Apple Touch Icon", filename: "apple-touch-icon.png", width: 180, height: 180, purpose: "iOS home screen bookmark" },
  { name: "Android Chrome 192", filename: "android-chrome-192x192.png", width: 192, height: 192, purpose: "Android Chrome home screen icon" },
  { name: "Android Chrome 512", filename: "android-chrome-512x512.png", width: 512, height: 512, purpose: "PWA splash screen & app install" },
];

export interface WebManifestConfig {
  name: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
}

/**
 * Generate standard site.webmanifest JSON
 */
export function generateWebManifest(config: WebManifestConfig): string {
  const manifest = {
    name: config.name.trim() || "My Application",
    short_name: config.shortName.trim() || config.name.trim() || "App",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: config.themeColor || "#ffffff",
    background_color: config.backgroundColor || "#ffffff",
    display: "standalone",
  };

  return JSON.stringify(manifest, null, 2);
}

/**
 * Generate complete HTML <head> meta & link snippet
 */
export function generateFaviconHtmlTags(themeColor: string = "#ffffff"): string {
  return [
    `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`,
    `<link rel="manifest" href="/site.webmanifest">`,
    `<meta name="theme-color" content="${themeColor}">`,
  ].join("\n");
}

export interface IcoImageEntry {
  width: number;
  height: number;
  data: Uint8Array; // PNG byte buffer
}

/**
 * Build a valid multi-resolution Windows .ico binary buffer from PNG images
 * Supports embedded PNGs (standard since Windows Vista and modern browsers)
 */
export function buildIcoFile(images: IcoImageEntry[]): Uint8Array {
  if (images.length === 0) {
    throw new Error("At least one image entry is required to build an ICO file.");
  }

  const count = images.length;
  const headerSize = 6;
  const directoryEntrySize = 16;
  const directorySize = count * directoryEntrySize;
  let totalDataSize = 0;

  for (const img of images) {
    totalDataSize += img.data.byteLength;
  }

  const totalFileSize = headerSize + directorySize + totalDataSize;
  const buffer = new Uint8Array(totalFileSize);
  const view = new DataView(buffer.buffer);

  // 1. Write ICONDIR Header (6 bytes)
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Resource Type: 1 for Icon (.ico)
  view.setUint16(4, count, true); // Number of images

  // 2. Write ICONDIRENTRY Entries & Data
  let currentOffset = headerSize + directorySize;

  for (let i = 0; i < count; i++) {
    const img = images[i];
    if (!img) continue;

    const entryOffset = headerSize + i * directoryEntrySize;
    const w = img.width >= 256 ? 0 : img.width;
    const h = img.height >= 256 ? 0 : img.height;

    view.setUint8(entryOffset + 0, w); // Width
    view.setUint8(entryOffset + 1, h); // Height
    view.setUint8(entryOffset + 2, 0); // Color palette count (0 for 32-bit truecolor)
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32-bit RGBA)
    view.setUint32(entryOffset + 8, img.data.byteLength, true); // Image data size
    view.setUint32(entryOffset + 12, currentOffset, true); // Image data offset

    // Copy image PNG data into buffer
    buffer.set(img.data, currentOffset);
    currentOffset += img.data.byteLength;
  }

  return buffer;
}
