/**
 * HTML Entity Encoder & Decoder Logic
 * Pure client-side character map and regex entity parser.
 */

const NAMED_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
  "€": "&euro;",
  "£": "&pound;",
  "¥": "&yen;",
  "¢": "&cent;",
  "§": "&sect;",
  "°": "&deg;",
  "±": "&plusmn;",
  "×": "&times;",
  "÷": "&divide;",
  "…": "&hellip;",
  "—": "&mdash;",
  "–": "&ndash;",
  "«": "&laquo;",
  "»": "&raquo;",
  "“": "&ldquo;",
  "”": "&rdquo;",
  "‘": "&lsquo;",
  "’": "&rsquo;",
  "•": "&bull;",
  "¶": "&para;",
  "µ": "&micro;",
  "¿": "&iquest;",
  "¡": "&iexcl;",
};

const REVERSE_NAMED_ENTITIES: Record<string, string> = Object.entries(
  NAMED_ENTITIES
).reduce((acc, [char, entity]) => {
  acc[entity] = char;
  return acc;
}, {} as Record<string, string>);

// Additional common named entities for decoding
const EXTRA_DECODE_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&alpha;": "α",
  "&beta;": "β",
  "&gamma;": "γ",
  "&delta;": "δ",
  "&infin;": "∞",
  "&ne;": "≠",
  "&le;": "≤",
  "&ge;": "≥",
  "&larr;": "←",
  "&uarr;": "↑",
  "&rarr;": "→",
  "&darr;": "↓",
  "&harr;": "↔",
  "&spades;": "\u2660",
  "&clubs;": "\u2663",
  "&hearts;": "\u2665",
  "&diams;": "\u2666",
};

export type EntityFormat = "named" | "decimal" | "hex";
export type EncodeScope = "special" | "non-ascii" | "all";

export interface EntityOptions {
  format?: EntityFormat;
  scope?: EncodeScope;
}

export function encodeHtmlEntities(
  text: string,
  options: EntityOptions = {}
): string {
  const { format = "named", scope = "special" } = options;

  if (!text) return "";

  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;

      // Special characters check
      const isSpecial = ['&', '<', '>', '"', "'"].includes(char);
      const isNonAscii = code > 127;

      let shouldEncode = false;
      if (scope === "all") shouldEncode = true;
      else if (scope === "non-ascii") shouldEncode = isSpecial || isNonAscii;
      else shouldEncode = isSpecial;

      if (!shouldEncode) return char;

      if (format === "named" && NAMED_ENTITIES[char]) {
        return NAMED_ENTITIES[char];
      } else if (format === "hex") {
        return `&#x${code.toString(16).toUpperCase()};`;
      } else {
        // Decimal or fallback
        return `&#${code};`;
      }
    })
    .join("");
}

export function decodeHtmlEntities(text: string): string {
  if (!text) return "";

  // 1. Decode numeric entities (decimal &#123; and hex &#x1F600;)
  let decoded = text.replace(/&#(x[0-9a-fA-F]+|[0-9]+);/g, (_, code) => {
    try {
      const num = code.startsWith("x") || code.startsWith("X")
        ? parseInt(code.slice(1), 16)
        : parseInt(code, 10);
      if (Number.isFinite(num) && num >= 0 && num <= 0x10ffff) {
        return String.fromCodePoint(num);
      }
    } catch {
      // fallback
    }
    return _;
  });

  // 2. Decode named entities
  decoded = decoded.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    if (REVERSE_NAMED_ENTITIES[entity]) return REVERSE_NAMED_ENTITIES[entity];
    if (EXTRA_DECODE_ENTITIES[entity]) return EXTRA_DECODE_ENTITIES[entity];
    return entity;
  });

  return decoded;
}
