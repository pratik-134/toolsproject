/**
 * In-Browser Image to Base64 & Reverse Converter — Pure Logic
 * High-performance binary buffer to Base64 Data URI formatting and parsing.
 */

/**
 * Format bytes into Data URI
 */
export function convertImageBytesToBase64(bytes: Uint8Array, mimeType: string = "image/png"): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    const b = bytes[i];
    if (b !== undefined) {
      binary += String.fromCharCode(b);
    }
  }
  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Parse any Base64 Data URI or raw Base64 string into binary bytes and mime type
 */
export function parseBase64DataUri(input: string): {
  valid: boolean;
  mimeType?: string;
  base64Data?: string;
  bytes?: Uint8Array;
  error?: string;
} {
  if (!input || !input.trim()) {
    return { valid: false, error: "Base64 input is empty." };
  }

  const trimmed = input.trim();
  let mimeType = "image/png";
  let base64Data = trimmed;

  // Check if it's a data URI
  const dataUriMatch = trimmed.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (dataUriMatch && dataUriMatch[1] && dataUriMatch[2]) {
    mimeType = dataUriMatch[1];
    base64Data = dataUriMatch[2].replace(/\s+/g, "");
  } else {
    // If raw base64, clean whitespace
    base64Data = trimmed.replace(/\s+/g, "");
  }

  try {
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { valid: true, mimeType, base64Data, bytes };
  } catch {
    return { valid: false, error: "Invalid Base64 string. Decoding failed." };
  }
}

/**
 * Format Base64 Data URI into developer code snippets
 */
export function formatBase64Snippet(
  dataUri: string,
  format: "data-uri" | "css" | "html" | "markdown",
  alt: string = "embedded image"
): string {
  switch (format) {
    case "data-uri":
      return dataUri;
    case "css":
      return `background-image: url("${dataUri}");`;
    case "html":
      return `<img src="${dataUri}" alt="${alt}" />`;
    case "markdown":
      return `![${alt}](${dataUri})`;
    default:
      return dataUri;
  }
}

/**
 * Compute overhead metrics
 */
export function computeBase64Metrics(
  originalBytesCount: number,
  base64Length: number
): { overheadPercent: number; deltaBytes: number } {
  if (originalBytesCount <= 0) {
    return { overheadPercent: 0, deltaBytes: 0 };
  }
  const deltaBytes = Math.max(0, base64Length - originalBytesCount);
  const overheadPercent = Math.round((deltaBytes / originalBytesCount) * 100);
  return { overheadPercent, deltaBytes };
}
