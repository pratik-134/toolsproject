/**
 * Unicode Normalizer & Code Point Inspector Logic
 * Pure client-side JavaScript String.prototype.normalize and character inspector.
 */

export type UnicodeNormalizationForm = "NFC" | "NFD" | "NFKC" | "NFKD";

export interface CodePointDetail {
  character: string;
  codePointHex: string; // e.g. U+00E9
  codePointDec: number;
  utf8Bytes: string; // e.g. C3 A9
  htmlEntity: string; // e.g. &#xE9;
}

export interface UnicodeNormalizationResult {
  original: string;
  normalized: string;
  form: UnicodeNormalizationForm;
  isUnchanged: boolean;
  originalCodePoints: number;
  normalizedCodePoints: number;
  originalBytes: number;
  normalizedBytes: number;
  characters: CodePointDetail[];
}

export function normalizeUnicode(
  input: string,
  form: UnicodeNormalizationForm = "NFC"
): UnicodeNormalizationResult {
  const normalized = input.normalize(form);
  const isUnchanged = input === normalized;

  const encoder = new TextEncoder();
  const originalBytes = encoder.encode(input).length;
  const normalizedBytes = encoder.encode(normalized).length;

  const originalCodePoints = Array.from(input).length;
  const normalizedCodePoints = Array.from(normalized).length;

  // Inspect characters of normalized output
  const characters: CodePointDetail[] = Array.from(normalized).map((char) => {
    const cp = char.codePointAt(0) ?? 0;
    const hex = cp.toString(16).toUpperCase().padStart(4, "0");
    const bytes = Array.from(encoder.encode(char))
      .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
      .join(" ");

    return {
      character: char,
      codePointHex: `U+${hex}`,
      codePointDec: cp,
      utf8Bytes: bytes,
      htmlEntity: `&#x${hex};`,
    };
  });

  return {
    original: input,
    normalized,
    form,
    isUnchanged,
    originalCodePoints,
    normalizedCodePoints,
    originalBytes,
    normalizedBytes,
    characters,
  };
}
