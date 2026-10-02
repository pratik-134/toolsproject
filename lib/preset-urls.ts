/**
 * Shareable Preset URLs Engine (Hash-based)
 *
 * Privacy & Security Invariants:
 * 1. Settings ONLY, NEVER file binary or text payloads in hash.
 * 2. Strict sanitization and range validation against allowable schemas on load.
 * 3. Hashes (#) never get sent to the server in HTTP requests (pure client-side).
 */

export interface ImageConverterSettings {
  format?: "webp" | "jpeg" | "png" | "bmp" | "ico" | "svg";
  quality?: number; // 10 to 100
  scale?: number; // 25 to 200
  bgColor?: string; // Hex color #ffffff
}

export interface PdfCompressorSettings {
  stripMetadata?: boolean;
  useObjectStreams?: boolean;
}

/**
 * Sanitize a string to prevent XSS or dangerous input
 */
function sanitizeString(str: string, maxLength = 64): string {
  return str
    .replace(/[^\w\s\-.]/gi, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate hex color
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color);
}

/**
 * Parse & sanitize Image Converter preset from URL hash
 */
export function parseImageConverterHash(hash: string): ImageConverterSettings {
  if (!hash) return {};
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleaned);
  const result: ImageConverterSettings = {};

  const format = params.get("format")?.toLowerCase();
  const validFormats = ["webp", "jpeg", "png", "bmp", "ico", "svg"];
  if (format) {
    result.format = validFormats.includes(format)
      ? (format as ImageConverterSettings["format"])
      : "webp";
  }

  const quality = params.get("quality");
  if (quality) {
    const q = parseInt(quality, 10);
    if (!isNaN(q)) {
      result.quality = Math.max(10, Math.min(100, q));
    }
  }

  const scale = params.get("scale");
  if (scale) {
    const s = parseInt(scale, 10);
    if (!isNaN(s)) {
      result.scale = Math.max(25, Math.min(200, s));
    }
  }

  const bgColor = params.get("bgColor");
  if (bgColor) {
    const decoded = decodeURIComponent(bgColor);
    if (isValidHexColor(decoded)) {
      result.bgColor = decoded;
    }
  }

  return result;
}

/**
 * Serialize Image Converter settings to URL hash string
 */
export function serializeImageConverterHash(settings: ImageConverterSettings): string {
  const params = new URLSearchParams();
  if (settings.format) params.set("format", settings.format);
  if (settings.quality !== undefined) params.set("quality", String(settings.quality));
  if (settings.scale !== undefined) params.set("scale", String(settings.scale));
  if (settings.bgColor) params.set("bgColor", settings.bgColor);
  return params.toString();
}

/**
 * Parse & sanitize PDF Compressor preset from URL hash
 */
export function parsePdfCompressorHash(hash: string): PdfCompressorSettings {
  if (!hash) return {};
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleaned);
  const result: PdfCompressorSettings = {};

  if (params.has("stripMetadata")) {
    result.stripMetadata = params.get("stripMetadata") === "true";
  }

  if (params.has("useObjectStreams")) {
    result.useObjectStreams = params.get("useObjectStreams") === "true";
  }

  return result;
}

/**
 * Serialize PDF Compressor settings to URL hash string
 */
export function serializePdfCompressorHash(settings: PdfCompressorSettings): string {
  const params = new URLSearchParams();
  if (settings.stripMetadata !== undefined) {
    params.set("stripMetadata", String(settings.stripMetadata));
  }
  if (settings.useObjectStreams !== undefined) {
    params.set("useObjectStreams", String(settings.useObjectStreams));
  }
  return params.toString();
}

export interface PdfMergerSettings {
  autoRotate?: boolean;
}

/**
 * Parse & sanitize PDF Merger preset from URL hash (Settings only, zero file names)
 */
export function parsePdfMergerHash(hash: string): PdfMergerSettings {
  if (!hash) return {};
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleaned);
  const result: PdfMergerSettings = {};

  if (params.has("autoRotate")) {
    result.autoRotate = params.get("autoRotate") === "true";
  }

  return result;
}

/**
 * Serialize PDF Merger settings to URL hash string (Settings only, zero file names)
 */
export function serializePdfMergerHash(settings: PdfMergerSettings): string {
  const params = new URLSearchParams();
  if (settings.autoRotate !== undefined) {
    params.set("autoRotate", String(settings.autoRotate));
  }
  return params.toString();
}

/**
 * Copy a preset URL with updated hash to the clipboard
 */
export async function copyPresetUrl(hashString: string): Promise<string> {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.hash = hashString ? `#${hashString}` : "";
  const fullUrl = url.toString();

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullUrl);
    }
  } catch {
    // Fallback if clipboard permission is restricted
  }

  if (typeof window !== "undefined") {
    window.location.hash = hashString ? `#${hashString}` : "";
  }

  return fullUrl;
}
