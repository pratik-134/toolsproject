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

export interface PdfMergerSettings {
  outputFileName?: string;
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
  if (format && validFormats.includes(format)) {
    result.format = format as ImageConverterSettings["format"];
  }

  const quality = params.get("quality");
  if (quality) {
    const q = parseInt(quality, 10);
    if (!isNaN(q) && q >= 10 && q <= 100) {
      result.quality = q;
    }
  }

  const scale = params.get("scale");
  if (scale) {
    const s = parseInt(scale, 10);
    if (!isNaN(s) && s >= 25 && s <= 200) {
      result.scale = s;
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

/**
 * Parse & sanitize PDF Merger preset from URL hash
 */
export function parsePdfMergerHash(hash: string): PdfMergerSettings {
  if (!hash) return {};
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(cleaned);
  const result: PdfMergerSettings = {};

  const filename = params.get("filename");
  if (filename) {
    const safe = sanitizeString(filename, 80);
    if (safe.length > 0) {
      result.outputFileName = safe.endsWith(".pdf") ? safe : `${safe}.pdf`;
    }
  }

  return result;
}

/**
 * Serialize PDF Merger settings to URL hash string
 */
export function serializePdfMergerHash(settings: PdfMergerSettings): string {
  const params = new URLSearchParams();
  if (settings.outputFileName) {
    params.set("filename", sanitizeString(settings.outputFileName, 80));
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

  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(fullUrl);
  }

  return fullUrl;
}
