export type MinifyLanguage = "html" | "css" | "js" | "json";

export interface MinifyOptions {
  removeComments?: boolean;
  collapseWhitespace?: boolean;
  removeConsole?: boolean; // For JS only
}

export interface MinifyResult {
  code: string;
  originalSize: number;
  minifiedSize: number;
  bytesSaved: number;
  savingsPercent: number;
}

export function minifyCode(
  input: string,
  language: MinifyLanguage,
  options: MinifyOptions = { removeComments: true, collapseWhitespace: true, removeConsole: false }
): MinifyResult {
  const originalSize = new TextEncoder().encode(input).length;
  if (!input.trim()) {
    return {
      code: "",
      originalSize: 0,
      minifiedSize: 0,
      bytesSaved: 0,
      savingsPercent: 0,
    };
  }

  let minified = input;

  switch (language) {
    case "json": {
      try {
        const parsed = JSON.parse(input);
        minified = JSON.stringify(parsed);
      } catch (err: any) {
        throw new Error(`Invalid JSON: ${err.message}`);
      }
      break;
    }

    case "css": {
      if (options.removeComments !== false) {
        // Remove /* ... */ comments
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, "");
      }
      if (options.collapseWhitespace !== false) {
        // Normalize whitespace
        minified = minified
          .replace(/\s+/g, " ")
          .replace(/\s*([\{\}:;,>+~])\s*/g, "$1")
          .replace(/;}/g, "}")
          .trim();
      }
      break;
    }

    case "html": {
      if (options.removeComments !== false) {
        // Remove <!-- ... --> comments, except IE conditionals
        minified = minified.replace(/<!--(?!\s*\[if)[\s\S]*?-->/g, "");
      }
      if (options.collapseWhitespace !== false) {
        // Collapse space between tags and in text
        minified = minified
          .replace(/>\s+</g, "><")
          .replace(/\s{2,}/g, " ")
          .replace(/^\s+|\s+$/gm, "")
          .trim();
      }
      break;
    }

    case "js": {
      if (options.removeConsole) {
        minified = minified.replace(/console\.(log|debug|info|warn|error|assert|table|trace)\s*\([^)]*\);?/g, "");
      }
      if (options.removeComments !== false) {
        // Remove single line comments (careful with URLs like http://)
        minified = minified.replace(/(?:^|[^\\])\/\/.*$/gm, (match) => {
          if (match.startsWith("://") || match.includes("http://") || match.includes("https://")) {
            return match;
          }
          return match.charAt(0) === "/" ? "" : match.charAt(0);
        });
        // Remove multi-line comments
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, "");
      }
      if (options.collapseWhitespace !== false) {
        // Collapse whitespace safely around punctuation
        minified = minified
          .replace(/\r\n|\r/g, "\n")
          .replace(/[ \t]+/g, " ")
          .replace(/\s*([=+\-*\/%&|^!~?:;,<>(){}\[\]])\s*/g, "$1")
          .replace(/;\n/g, ";")
          .replace(/\n+/g, ";")
          .replace(/;;+/g, ";")
          .trim();
      }
      break;
    }
  }

  const minifiedSize = new TextEncoder().encode(minified).length;
  const bytesSaved = Math.max(0, originalSize - minifiedSize);
  const savingsPercent = originalSize > 0 ? Math.round((bytesSaved / originalSize) * 1000) / 10 : 0;

  return {
    code: minified,
    originalSize,
    minifiedSize,
    bytesSaved,
    savingsPercent,
  };
}
