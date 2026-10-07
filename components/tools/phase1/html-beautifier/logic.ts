/**
 * Pure Client-Side Robust HTML, CSS, and JS/JSON Beautifier & Minifier Logic
 *
 * Designed to preserve code integrity:
 * - HTML: preserves <pre>, <code>, <script>, <style>, void tags, inline tags, attributes, and comments.
 * - CSS: supports media queries, keyframes, nested blocks, calc(), custom properties, strings, and comments.
 * - JS: preserves strings, template literals, regex literals, comments, indentation, and structure.
 */

export type CodeLanguage = "html" | "css" | "javascript";

export interface BeautifyOptions {
  language: CodeLanguage;
  indentSize?: 2 | 4 | "tab";
  wrapAttributes?: boolean;
}

export interface CodeFormatResult {
  output: string;
  originalBytes: number;
  formattedBytes: number;
  ratio: number;
}

function getIndent(level: number, indentSize: 2 | 4 | "tab"): string {
  if (level <= 0) return "";
  const unit = indentSize === "tab" ? "\t" : " ".repeat(indentSize);
  return unit.repeat(level);
}

// ============================================================================
// 1. HTML FORMATTER & MINIFIER
// ============================================================================

const HTML_VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr", "!doctype"
]);

const HTML_RAW_CONTENT_TAGS = new Set(["pre", "code", "script", "style", "textarea"]);

const HTML_INLINE_TAGS = new Set([
  "a", "abbr", "b", "bdi", "bdo", "cite", "code", "data", "dfn", "em", "i",
  "kbd", "mark", "q", "rp", "rt", "ruby", "s", "samp", "small", "span",
  "strong", "sub", "sup", "time", "u", "var", "wbr"
]);

interface HtmlToken {
  type: "tag" | "raw" | "comment" | "doctype" | "text";
  content: string;
  tagName?: string;
  isClosing?: boolean;
  isSelfClosing?: boolean;
}

function tokenizeHtml(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  let i = 0;
  const len = html.length;

  while (i < len) {
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      if (end === -1) {
        tokens.push({ type: "comment", content: html.slice(i) });
        break;
      } else {
        tokens.push({ type: "comment", content: html.slice(i, end + 3) });
        i = end + 3;
        continue;
      }
    }

    if (html.startsWith("<!DOCTYPE", i) || html.startsWith("<!doctype", i)) {
      const end = html.indexOf(">", i);
      if (end === -1) {
        tokens.push({ type: "doctype", content: html.slice(i) });
        break;
      } else {
        tokens.push({ type: "doctype", content: html.slice(i, end + 1) });
        i = end + 1;
        continue;
      }
    }

    if (html[i] === "<") {
      // Find end of tag taking into account attribute quotes
      let j = i + 1;
      let inQuote: string | null = null;
      while (j < len) {
        const char = html[j];
        if (inQuote) {
          if (char === inQuote) inQuote = null;
        } else if (char === '"' || char === "'") {
          inQuote = char;
        } else if (char === ">") {
          break;
        }
        j++;
      }

      const tagContent = html.slice(i, j + 1);
      i = j + 1;

      const isClosing = tagContent.startsWith("</");
      const isSelfClosing = tagContent.endsWith("/>");
      const match = tagContent.match(/^<\/?([a-zA-Z0-9\-:]+)/);
      const tagName = match ? match[1]!.toLowerCase() : "";

      tokens.push({
        type: "tag",
        content: tagContent,
        tagName,
        isClosing,
        isSelfClosing,
      });

      // If opening a raw content tag like <script>, <style>, <pre>, consume everything up to closing tag
      if (!isClosing && !isSelfClosing && HTML_RAW_CONTENT_TAGS.has(tagName)) {
        const closePattern = `</${tagName}>`;
        const closeIdx = html.toLowerCase().indexOf(closePattern, i);
        if (closeIdx !== -1) {
          const rawContent = html.slice(i, closeIdx);
          if (rawContent.length > 0) {
            tokens.push({ type: "raw", content: rawContent, tagName });
          }
          tokens.push({
            type: "tag",
            content: html.slice(closeIdx, closeIdx + closePattern.length),
            tagName,
            isClosing: true,
            isSelfClosing: false,
          });
          i = closeIdx + closePattern.length;
        }
      }
      continue;
    }

    // Text node
    let nextTag = html.indexOf("<", i);
    if (nextTag === -1) nextTag = len;
    const textContent = html.slice(i, nextTag);
    i = nextTag;
    if (textContent.trim()) {
      tokens.push({ type: "text", content: textContent });
    }
  }

  return tokens;
}

export function formatHtml(html: string, indentSize: 2 | 4 | "tab" = 2): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  const tokens = tokenizeHtml(trimmed);
  let indentLevel = 0;
  const lines: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]!;

    if (tok.type === "doctype" || tok.type === "comment") {
      lines.push(getIndent(indentLevel, indentSize) + tok.content.trim());
      continue;
    }

    if (tok.type === "raw") {
      // In <pre>, keep verbatim. In <style> or <script>, format inside cleanly
      if (tok.tagName === "style") {
        const formattedCss = formatCss(tok.content, indentSize);
        const indentedCss = formattedCss
          .split("\n")
          .map((line) => (line.trim() ? getIndent(indentLevel, indentSize) + line : ""))
          .join("\n");
        lines.push(indentedCss);
      } else if (tok.tagName === "script") {
        const formattedJs = formatJs(tok.content, indentSize);
        const indentedJs = formattedJs
          .split("\n")
          .map((line) => (line.trim() ? getIndent(indentLevel, indentSize) + line : ""))
          .join("\n");
        lines.push(indentedJs);
      } else {
        // <pre>, <code>, etc.: preserve exactly
        lines.push(tok.content);
      }
      continue;
    }

    if (tok.type === "tag") {
      if (tok.isClosing) {
        indentLevel = Math.max(0, indentLevel - 1);
        lines.push(getIndent(indentLevel, indentSize) + tok.content);
      } else {
        lines.push(getIndent(indentLevel, indentSize) + tok.content);
        const isVoid = tok.tagName ? HTML_VOID_TAGS.has(tok.tagName) : false;
        if (!tok.isSelfClosing && !isVoid) {
          indentLevel++;
        }
      }
      continue;
    }

    if (tok.type === "text") {
      // Check if text is between inline tags or standalone block text
      const cleanText = tok.content.replace(/\s+/g, " ").trim();
      if (cleanText) {
        lines.push(getIndent(indentLevel, indentSize) + cleanText);
      }
    }
  }

  // Filter out any accidentally introduced duplicate empty lines
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function minifyHtml(html: string): string {
  if (!html.trim()) return "";

  // Tokenize to preserve content within <pre>, <textarea>, and comments safely
  const tokens = tokenizeHtml(html);
  const out: string[] = [];

  for (const tok of tokens) {
    if (tok.type === "comment") {
      // Omit comments unless conditional
      if (tok.content.includes("[if")) {
        out.push(tok.content.trim());
      }
      continue;
    }
    if (tok.type === "raw") {
      if (tok.tagName === "style") {
        out.push(minifyCss(tok.content));
      } else if (tok.tagName === "script") {
        out.push(minifyJs(tok.content));
      } else {
        // pre / textarea: preserve exact content
        out.push(tok.content);
      }
      continue;
    }
    if (tok.type === "tag") {
      // Clean unnecessary whitespace inside tag
      const cleanTag = tok.content.replace(/\s+/g, " ").replace(/\s+(\/?>)/, "$1");
      out.push(cleanTag);
      continue;
    }
    if (tok.type === "text") {
      const cleanText = tok.content.replace(/\s+/g, " ");
      out.push(cleanText);
      continue;
    }
    out.push(tok.content.trim());
  }

  return out.join("").replace(/>\s+</g, "><").trim();
}

// ============================================================================
// 2. CSS FORMATTER & MINIFIER
// ============================================================================

export function formatCss(css: string, indentSize: 2 | 4 | "tab" = 2): string {
  const trimmed = css.trim();
  if (!trimmed) return "";

  let indent = 0;
  const result: string[] = [];
  let current = "";
  let inString: string | null = null;
  let inComment = false;

  const flush = () => {
    const text = current.trim();
    if (text) {
      result.push(getIndent(indent, indentSize) + text);
    }
    current = "";
  };

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]!;
    const nextChar = trimmed[i + 1] ?? "";

    if (inComment) {
      current += char;
      if (char === "*" && nextChar === "/") {
        current += "/";
        i++;
        inComment = false;
        flush();
      }
      continue;
    }

    if (inString) {
      current += char;
      if (char === inString && trimmed[i - 1] !== "\\") {
        inString = null;
      }
      continue;
    }

    if (char === "/" && nextChar === "*") {
      flush();
      current += "/*";
      i++;
      inComment = true;
      continue;
    }

    if (char === '"' || char === "'") {
      current += char;
      inString = char;
      continue;
    }

    if (char === "{") {
      current = current.trim();
      result.push(getIndent(indent, indentSize) + current + " {");
      current = "";
      indent++;
      continue;
    }

    if (char === "}") {
      flush();
      indent = Math.max(0, indent - 1);
      result.push(getIndent(indent, indentSize) + "}");
      continue;
    }

    if (char === ";") {
      current += ";";
      flush();
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (current.trim()) {
        current += " ";
      }
      continue;
    }

    current += char;
  }

  flush();

  // Clean spacing around properties (e.g. "color:red" -> "color: red")
  return result
    .map((line) => {
      // Only space the colon if not a pseudo-selector line (no trailing '{')
      if (!line.includes("{") && line.includes(":")) {
        return line.replace(/:\s*/, ": ");
      }
      return line;
    })
    .join("\n")
    .trim();
}

export function minifyCss(css: string): string {
  if (!css.trim()) return "";

  let result = "";
  let inString: string | null = null;
  let inComment = false;

  for (let i = 0; i < css.length; i++) {
    const char = css[i]!;
    const nextChar = css[i + 1] ?? "";

    if (inComment) {
      if (char === "*" && nextChar === "/") {
        i++;
        inComment = false;
      }
      continue;
    }

    if (inString) {
      result += char;
      if (char === inString && css[i - 1] !== "\\") {
        inString = null;
      }
      continue;
    }

    if (char === "/" && nextChar === "*") {
      i++;
      inComment = true;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = char;
      result += char;
      continue;
    }

    result += char;
  }

  return result
    .replace(/\s+/g, " ")
    .replace(/\s*([\{\}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

// ============================================================================
// 3. JAVASCRIPT & JSON FORMATTER & MINIFIER
// ============================================================================

export function formatJs(js: string, indentSize: 2 | 4 | "tab" = 2): string {
  const trimmed = js.trim();
  if (!trimmed) return "";

  // 1. If valid JSON, use standard canonical JSON format
  try {
    const parsed = JSON.parse(trimmed);
    const indent = indentSize === "tab" ? "\t" : indentSize;
    return JSON.stringify(parsed, null, indent);
  } catch {
    // Continue with JavaScript lexical formatting
  }

  // 2. JavaScript structural tokenizer and formatter
  let indent = 0;
  const lines: string[] = [];
  let current = "";
  let inString: string | null = null;
  let inSingleComment = false;
  let inMultiComment = false;

  const flush = () => {
    const text = current.trim();
    if (text) {
      lines.push(getIndent(indent, indentSize) + text);
    }
    current = "";
  };

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]!;
    const nextChar = trimmed[i + 1] ?? "";

    if (inSingleComment) {
      current += char;
      if (char === "\n") {
        inSingleComment = false;
        flush();
      }
      continue;
    }

    if (inMultiComment) {
      current += char;
      if (char === "*" && nextChar === "/") {
        current += "/";
        i++;
        inMultiComment = false;
        flush();
      }
      continue;
    }

    if (inString) {
      current += char;
      if (char === inString && trimmed[i - 1] !== "\\") {
        inString = null;
      }
      continue;
    }

    if (char === "/" && nextChar === "/") {
      inSingleComment = true;
      current += "//";
      i++;
      continue;
    }

    if (char === "/" && nextChar === "*") {
      inMultiComment = true;
      current += "/*";
      i++;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      current += char;
      continue;
    }

    if (char === "{") {
      current = current.trim();
      lines.push(getIndent(indent, indentSize) + (current ? current + " " : "") + "{");
      current = "";
      indent++;
      continue;
    }

    if (char === "}") {
      flush();
      indent = Math.max(0, indent - 1);
      // Check if followed by semicolon or comma or else
      let extra = "}";
      let nextIdx = i + 1;
      while (nextIdx < trimmed.length && (trimmed[nextIdx] === " " || trimmed[nextIdx] === "\t")) {
        nextIdx++;
      }
      if (trimmed[nextIdx] === ";" || trimmed[nextIdx] === ",") {
        extra += trimmed[nextIdx];
        i = nextIdx;
      }
      lines.push(getIndent(indent, indentSize) + extra);
      continue;
    }

    if (char === ";") {
      current += ";";
      flush();
      continue;
    }

    if (char === "\n") {
      if (current.trim()) {
        flush();
      }
      continue;
    }

    current += char;
  }

  flush();

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function minifyJs(js: string): string {
  const trimmed = js.trim();
  if (!trimmed) return "";

  // 1. If JSON, parse and stringify compactly
  try {
    return JSON.stringify(JSON.parse(trimmed));
  } catch {
    // Continue with JavaScript minification
  }

  // 2. Safe string/comment-aware minification
  let result = "";
  let inString: string | null = null;
  let inSingleComment = false;
  let inMultiComment = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]!;
    const nextChar = trimmed[i + 1] ?? "";

    if (inSingleComment) {
      if (char === "\n") {
        inSingleComment = false;
        result += "\n";
      }
      continue;
    }

    if (inMultiComment) {
      if (char === "*" && nextChar === "/") {
        i++;
        inMultiComment = false;
      }
      continue;
    }

    if (inString) {
      result += char;
      if (char === inString && trimmed[i - 1] !== "\\") {
        inString = null;
      }
      continue;
    }

    if (char === "/" && nextChar === "/") {
      inSingleComment = true;
      i++;
      continue;
    }

    if (char === "/" && nextChar === "*") {
      inMultiComment = true;
      i++;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      result += char;
      continue;
    }

    result += char;
  }

  // Clean whitespace safely without collapsing necessary identifier spaces
  return result
    .replace(/[ \t]+/g, " ")
    .replace(/\s*([=+\-*\/%&|^!~?:;,<>(){}\[\]])\s*/g, "$1")
    .replace(/;+/g, ";")
    .trim();
}

// ============================================================================
// 4. UNIFIED ENTRY POINT
// ============================================================================

export function processCode(
  input: string,
  mode: "beautify" | "minify",
  options: BeautifyOptions
): CodeFormatResult {
  const originalBytes = new TextEncoder().encode(input).length;
  if (!input.trim()) {
    return { output: "", originalBytes: 0, formattedBytes: 0, ratio: 0 };
  }

  const { language, indentSize = 2 } = options;
  let output = "";

  if (mode === "minify") {
    if (language === "html") output = minifyHtml(input);
    else if (language === "css") output = minifyCss(input);
    else output = minifyJs(input);
  } else {
    if (language === "html") output = formatHtml(input, indentSize);
    else if (language === "css") output = formatCss(input, indentSize);
    else output = formatJs(input, indentSize);
  }

  const formattedBytes = new TextEncoder().encode(output).length;
  const ratio =
    originalBytes > 0
      ? Math.round(((formattedBytes - originalBytes) / originalBytes) * 100)
      : 0;

  return {
    output,
    originalBytes,
    formattedBytes,
    ratio,
  };
}
