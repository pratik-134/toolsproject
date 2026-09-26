/**
 * Direct TXT Editor — In-Browser Pure Logic
 * High-performance string analytics, line ending normalizers, whitespace utilities, and case transformers.
 */

export interface TextStats {
  charactersWithSpaces: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  bytesUtf8: number;
  readingTimeMinutes: number;
}

/**
 * Compute exhaustive metrics for text
 */
export function computeTextStats(text: string): TextStats {
  if (!text) {
    return {
      charactersWithSpaces: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      bytesUtf8: 0,
      readingTimeMinutes: 0,
    };
  }

  const charactersWithSpaces = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Words count: split on whitespace sequences
  const wordsMatch = text.trim().match(/\S+/g);
  const words = wordsMatch ? wordsMatch.length : 0;

  // Lines count: split by LF or CRLF
  const lines = text.split(/\r?\n/).length;

  // Paragraphs: blocks separated by one or more blank lines
  const paragraphs = text
    .split(/\r?\n\s*\r?\n/)
    .filter((p) => p.trim().length > 0).length;

  // UTF-8 Byte size
  const bytesUtf8 = new TextEncoder().encode(text).length;

  // Reading time (average 200 wpm)
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    charactersWithSpaces,
    charactersNoSpaces,
    words,
    lines,
    paragraphs: paragraphs === 0 && text.trim().length > 0 ? 1 : paragraphs,
    bytesUtf8,
    readingTimeMinutes: words === 0 ? 0 : readingTimeMinutes,
  };
}

/**
 * Convert line endings to LF (\n) or CRLF (\r\n)
 */
export function convertLineEndings(text: string, target: "lf" | "crlf"): string {
  // First normalize all line breaks to \n
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (target === "crlf") {
    return normalized.replace(/\n/g, "\r\n");
  }
  return normalized;
}

/**
 * Transform text case
 */
export function transformCase(
  text: string,
  mode: "upper" | "lower" | "title" | "sentence"
): string {
  if (!text) return "";

  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      });
    case "sentence":
      return text.toLowerCase().replace(/(^\s*|\.\s*|\?\s*|!\s*)([a-z])/g, (_, prefix, char) => {
        return prefix + char.toUpperCase();
      });
    default:
      return text;
  }
}

/**
 * Clean whitespace with selectable rules
 */
export interface WhitespaceCleanOptions {
  trimTrailing?: boolean;
  normalizeBlankLines?: boolean;
  stripBlankLines?: boolean;
}

export function cleanWhitespace(
  text: string,
  options: WhitespaceCleanOptions = {}
): string {
  let result = text;

  // 1. Trim trailing spaces on each line
  if (options.trimTrailing) {
    result = result
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .join("\n");
  }

  // 2. Strip all blank lines
  if (options.stripBlankLines) {
    result = result
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .join("\n");
  } else if (options.normalizeBlankLines) {
    // 3. Normalize multiple consecutive blank lines to a single blank line
    result = result.replace(/(\r?\n\s*){3,}/g, "\n\n");
  }

  return result;
}

/**
 * Indentation conversion between Tabs and Spaces
 */
export function convertIndentation(
  text: string,
  target: "tabs" | "spaces",
  spaceCount: number = 2
): string {
  const spaces = " ".repeat(spaceCount);
  const lines = text.split(/\r?\n/);

  if (target === "tabs") {
    // Replace leading spaces with tabs
    const spaceRegex = new RegExp(`^(${spaces})+`);
    return lines
      .map((line) => {
        const match = line.match(/^\s+/);
        if (!match) return line;
        const leading = match[0];
        const tabCount = Math.floor(leading.length / spaceCount);
        const rem = leading.length % spaceCount;
        return "\t".repeat(tabCount) + " ".repeat(rem) + line.slice(leading.length);
      })
      .join("\n");
  } else {
    // Replace leading tabs with spaces
    return lines
      .map((line) => {
        const match = line.match(/^\t+/);
        if (!match) return line;
        const count = match[0].length;
        return spaces.repeat(count) + line.slice(count);
      })
      .join("\n");
  }
}
