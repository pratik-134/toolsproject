export interface Base64Result {
  success: boolean;
  output: string;
  error?: string;
  bytesCount?: number;
}

/**
 * UTF-8 safe Base64 Encoder
 */
export function encodeBase64(text: string): Base64Result {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b !== undefined) {
        binary += String.fromCharCode(b);
      }
    }
    const base64 = btoa(binary);
    return {
      success: true,
      output: base64,
      bytesCount: bytes.length,
    };
  } catch (err: unknown) {
    return {
      success: false,
      output: "",
      error: err instanceof Error ? err.message : "Encoding failed",
    };
  }
}

/**
 * UTF-8 safe Base64 Decoder
 */
export function decodeBase64(base64: string): Base64Result {
  try {
    const clean = base64.trim().replace(/\s+/g, "");
    if (!clean) return { success: true, output: "", bytesCount: 0 };

    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder().decode(bytes);
    return {
      success: true,
      output: decoded,
      bytesCount: bytes.length,
    };
  } catch (err: unknown) {
    return {
      success: false,
      output: "",
      error: "Invalid Base64 string. Please check the input for illegal characters or missing padding.",
    };
  }
}
