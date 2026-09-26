/**
 * Pure Client-Side HTML, CSS, and JS Beautifier & Minifier Logic
 * Zero external libraries, in-browser regex & lexical tree formatter.
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
  ratio: number; // e.g. -40% or +15%
}

function getIndent(level: number, indentSize: 2 | 4 | "tab"): string {
  if (level <= 0) return "";
  const unit = indentSize === "tab" ? "\t" : " ".repeat(indentSize);
  return unit.repeat(level);
}

/**
 * Format / Beautify HTML
 */
export function formatHtml(html: string, indentSize: 2 | 4 | "tab" = 2): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  // Split tokens by HTML tags and text nodes
  const tokens = trimmed.replace(/>\s*</g, "><").split(/(<[^>]+>)/g).filter(Boolean);
  let indentLevel = 0;
  const result: string[] = [];

  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr", "!doctype"
  ]);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]?.trim();
    if (!token) continue;

    if (token.startsWith("<!--") && token.endsWith("-->")) {
      // Comment
      result.push(getIndent(indentLevel, indentSize) + token);
    } else if (token.startsWith("</")) {
      // Closing tag
      indentLevel = Math.max(0, indentLevel - 1);
      result.push(getIndent(indentLevel, indentSize) + token);
    } else if (token.startsWith("<") && token.endsWith(">")) {
      // Opening or self-closing tag
      const isSelfClosing = token.endsWith("/>");
      const tagNameMatch = token.match(/^<([a-zA-Z0-9\-!]+)/);
      const tagName = tagNameMatch ? (tagNameMatch[1]?.toLowerCase() ?? "") : "";

      result.push(getIndent(indentLevel, indentSize) + token);

      if (!isSelfClosing && !voidTags.has(tagName) && !tagName.startsWith("!")) {
        indentLevel++;
      }
    } else {
      // Text node
      result.push(getIndent(indentLevel, indentSize) + token);
    }
  }

  return result.join("\n");
}

/**
 * Minify HTML
 */
export function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "") // remove comments
    .replace(/\s+/g, " ") // collapse multiple spaces
    .replace(/>\s+</g, "><") // collapse space between tags
    .trim();
}

/**
 * Format / Beautify CSS
 */
export function formatCss(css: string, indentSize: 2 | 4 | "tab" = 2): string {
  const trimmed = css.trim();
  if (!trimmed) return "";

  let formatted = trimmed
    .replace(/\s*\{\s*/g, " {\n")
    .replace(/\s*;\s*/g, ";\n")
    .replace(/\s*\}\s*/g, "\n}\n")
    .replace(/\s*:\s*/g, ": ");

  const lines = formatted.split("\n");
  let indent = 0;
  const output: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    if (line.includes("}")) {
      indent = Math.max(0, indent - 1);
    }

    output.push(getIndent(indent, indentSize) + line);

    if (line.includes("{")) {
      indent++;
    }
  }

  return output.join("\n");
}

/**
 * Minify CSS
 */
export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove comments
    .replace(/\s+/g, " ")
    .replace(/\s*([\{\}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

/**
 * Unified Code Beautifier & Minifier Entry
 */
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
    else {
      // JavaScript / JSON basic minify
      try {
        output = JSON.stringify(JSON.parse(input));
      } catch {
        output = input
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\/\/.*$/gm, "")
          .replace(/\s+/g, " ")
          .trim();
      }
    }
  } else {
    // Beautify
    if (language === "html") output = formatHtml(input, indentSize);
    else if (language === "css") output = formatCss(input, indentSize);
    else {
      // JavaScript / JSON
      try {
        const parsed = JSON.parse(input);
        const indent = indentSize === "tab" ? "\t" : indentSize;
        output = JSON.stringify(parsed, null, indent);
      } catch {
        // Fallback CSS/JS style formatting
        output = formatCss(input, indentSize);
      }
    }
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
