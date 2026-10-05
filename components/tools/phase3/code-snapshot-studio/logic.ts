/**
 * High-Res Code Snapshot Studio — Pure Domain Logic
 * 100% In-Browser Code Syntax Tokenization & SVG/Canvas Snapshot Rendering
 * Zero External Network Calls, Zero Server Uploads (Cleartrix Invariant #1)
 */

export type SupportedLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "html"
  | "css"
  | "sql"
  | "json"
  | "rust"
  | "go"
  | "bash";

export type ThemeId =
  | "dracula"
  | "one-dark"
  | "monokai"
  | "nord"
  | "synthwave"
  | "github-dark"
  | "github-light";

export type BackgroundPreset =
  | "cosmic"
  | "sunset"
  | "emerald"
  | "ocean"
  | "cyber"
  | "slate"
  | "transparent";

export type WindowStyle = "mac" | "windows" | "simple" | "none";
export type PaddingSize = "tight" | "compact" | "balanced" | "spacious";
export type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "operator"
  | "function"
  | "punctuation"
  | "plain";

export interface HighlightedToken {
  text: string;
  type: TokenType;
}

export type HighlightedLine = HighlightedToken[];

export interface ThemeColors {
  name: string;
  isDark: boolean;
  background: string;
  foreground: string;
  titleColor: string;
  lineNumbersColor: string;
  tokens: Record<TokenType, string>;
}

export const THEMES: Record<ThemeId, ThemeColors> = {
  dracula: {
    name: "Dracula",
    isDark: true,
    background: "#282a36",
    foreground: "#f8f8f2",
    titleColor: "#6272a4",
    lineNumbersColor: "#6272a4",
    tokens: {
      keyword: "#ff79c6",
      string: "#f1fa8c",
      comment: "#6272a4",
      number: "#bd93f9",
      operator: "#ff79c6",
      function: "#50fa7b",
      punctuation: "#f8f8f2",
      plain: "#f8f8f2",
    },
  },
  "one-dark": {
    name: "One Dark",
    isDark: true,
    background: "#282c34",
    foreground: "#abb2bf",
    titleColor: "#5c6370",
    lineNumbersColor: "#4b5263",
    tokens: {
      keyword: "#c678dd",
      string: "#98c379",
      comment: "#5c6370",
      number: "#d19a66",
      operator: "#56b6c2",
      function: "#61afef",
      punctuation: "#abb2bf",
      plain: "#abb2bf",
    },
  },
  monokai: {
    name: "Monokai",
    isDark: true,
    background: "#272822",
    foreground: "#f8f8f2",
    titleColor: "#75715e",
    lineNumbersColor: "#75715e",
    tokens: {
      keyword: "#f92672",
      string: "#e6db74",
      comment: "#75715e",
      number: "#ae81ff",
      operator: "#f92672",
      function: "#a6e22e",
      punctuation: "#f8f8f2",
      plain: "#f8f8f2",
    },
  },
  nord: {
    name: "Nord",
    isDark: true,
    background: "#2e3440",
    foreground: "#d8dee9",
    titleColor: "#4c566a",
    lineNumbersColor: "#4c566a",
    tokens: {
      keyword: "#81a1c1",
      string: "#a3be8c",
      comment: "#616e88",
      number: "#b48ead",
      operator: "#81a1c1",
      function: "#88c0d0",
      punctuation: "#d8dee9",
      plain: "#eceff4",
    },
  },
  synthwave: {
    name: "Synthwave '84",
    isDark: true,
    background: "#262335",
    foreground: "#ffffff",
    titleColor: "#614d85",
    lineNumbersColor: "#614d85",
    tokens: {
      keyword: "#f92aad",
      string: "#ff8b39",
      comment: "#614d85",
      number: "#fede5d",
      operator: "#f92aad",
      function: "#36f9f6",
      punctuation: "#ffffff",
      plain: "#ffffff",
    },
  },
  "github-dark": {
    name: "GitHub Dark",
    isDark: true,
    background: "#0d1117",
    foreground: "#c9d1d9",
    titleColor: "#8b949e",
    lineNumbersColor: "#484f58",
    tokens: {
      keyword: "#ff7b72",
      string: "#a5d6ff",
      comment: "#8b949e",
      number: "#79c0ff",
      operator: "#ff7b72",
      function: "#d2a8ff",
      punctuation: "#c9d1d9",
      plain: "#c9d1d9",
    },
  },
  "github-light": {
    name: "GitHub Light",
    isDark: false,
    background: "#ffffff",
    foreground: "#24292f",
    titleColor: "#6e7781",
    lineNumbersColor: "#8c959f",
    tokens: {
      keyword: "#cf222e",
      string: "#0a3069",
      comment: "#6e7781",
      number: "#0550ae",
      operator: "#cf222e",
      function: "#8250df",
      punctuation: "#24292f",
      plain: "#24292f",
    },
  },
};

export const BACKGROUND_PRESETS: Record<
  BackgroundPreset,
  { name: string; css: string; canvasColorStart: string; canvasColorEnd: string }
> = {
  cosmic: {
    name: "Cosmic Glow",
    css: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
    canvasColorStart: "#6366f1",
    canvasColorEnd: "#ec4899",
  },
  sunset: {
    name: "Sunset Vibrant",
    css: "linear-gradient(135deg, #f97316 0%, #f43f5e 50%, #8b5cf6 100%)",
    canvasColorStart: "#f97316",
    canvasColorEnd: "#8b5cf6",
  },
  emerald: {
    name: "Emerald Horizon",
    css: "linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)",
    canvasColorStart: "#059669",
    canvasColorEnd: "#06b6d4",
  },
  ocean: {
    name: "Ocean Deep",
    css: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)",
    canvasColorStart: "#0284c7",
    canvasColorEnd: "#38bdf8",
  },
  cyber: {
    name: "Cyber Neon",
    css: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
    canvasColorStart: "#ec4899",
    canvasColorEnd: "#3b82f6",
  },
  slate: {
    name: "Minimalist Slate",
    css: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    canvasColorStart: "#1e293b",
    canvasColorEnd: "#334155",
  },
  transparent: {
    name: "Transparent Cutout",
    css: "transparent",
    canvasColorStart: "transparent",
    canvasColorEnd: "transparent",
  },
};

export const PADDING_VALUES: Record<PaddingSize, number> = {
  tight: 16,
  compact: 32,
  balanced: 48,
  spacious: 64,
};

const KEYWORDS_BY_LANG: Record<SupportedLanguage, Set<string>> = {
  typescript: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "switch", "case", "break", "import", "export", "from", "default", "class",
    "interface", "type", "extends", "implements", "new", "this", "async",
    "await", "try", "catch", "finally", "throw", "typeof", "instanceof", "in",
    "of", "void", "true", "false", "null", "undefined", "readonly", "as"
  ]),
  javascript: new Set([
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "switch", "case", "break", "import", "export", "from", "default", "class",
    "new", "this", "async", "await", "try", "catch", "finally", "throw", "typeof",
    "true", "false", "null", "undefined"
  ]),
  python: new Set([
    "def", "class", "return", "if", "elif", "else", "for", "while", "import",
    "from", "as", "try", "except", "finally", "raise", "with", "lambda", "yield",
    "pass", "continue", "break", "in", "is", "not", "and", "or", "True", "False",
    "None", "async", "await"
  ]),
  html: new Set(["doctype", "html", "head", "body", "div", "span", "p", "a", "script", "style", "meta", "link"]),
  css: new Set([
    "display", "flex", "grid", "position", "color", "background", "margin", "padding",
    "border", "font", "width", "height", "top", "left", "right", "bottom", "z-index",
    "@media", "@keyframes", "important"
  ]),
  sql: new Set([
    "select", "from", "where", "insert", "into", "update", "delete", "create",
    "table", "alter", "drop", "join", "inner", "left", "right", "outer", "group",
    "by", "order", "having", "limit", "offset", "and", "or", "not", "in", "as",
    "primary", "key", "foreign", "references", "null", "distinct"
  ]),
  json: new Set(["true", "false", "null"]),
  rust: new Set([
    "fn", "let", "mut", "pub", "struct", "enum", "impl", "trait", "match",
    "if", "else", "for", "while", "loop", "return", "use", "mod", "crate",
    "type", "where", "async", "await", "self", "Self", "true", "false"
  ]),
  go: new Set([
    "func", "package", "import", "var", "const", "type", "struct", "interface",
    "return", "if", "else", "for", "range", "switch", "case", "default", "go",
    "chan", "select", "defer", "nil", "true", "false"
  ]),
  bash: new Set([
    "if", "then", "else", "elif", "fi", "for", "while", "do", "done", "case",
    "esac", "echo", "export", "function", "return", "exit", "local", "source"
  ]),
};

export const SAMPLE_CODE_SNIPPETS: Record<SupportedLanguage, string> = {
  typescript: `// High-Performance Client-Side Cache
interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
}

export class MemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  public set(key: string, value: T, ttlMs = 60000): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { key, value, expiresAt });
  }

  public get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      return null;
    }
    return entry.value;
  }
}`,
  javascript: `// Debounce user input safely
function debounce(fn, delayMs = 300) {
  let timerId = null;
  return function (...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delayMs);
  };
}`,
  python: `# Fast asynchronous API handler
import asyncio
from typing import Dict, Any

async def fetch_user_profile(user_id: str) -> Dict[str, Any]:
    """Retrieve user details without blocking event loop."""
    await asyncio.sleep(0.05)
    return {
        "status": "success",
        "user_id": user_id,
        "is_verified": True
    }`,
  html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>ClearTrix Studio</title>
  </head>
  <body>
    <div id="app" class="container">
      <h1>Private In-Browser Sandbox</h1>
    </div>
  </body>
</html>`,
  css: `.glassmorphism-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
}`,
  sql: `-- Optimized User Metric Aggregation
SELECT 
  u.id AS user_id,
  u.email,
  COUNT(t.id) AS total_runs
FROM users u
INNER JOIN tool_sessions t ON t.user_id = u.id
WHERE t.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email
ORDER BY total_runs DESC
LIMIT 10;`,
  json: `{
  "product": "ClearTrix Studio",
  "version": "2.4.0",
  "privacy": "100% In-Browser",
  "features": [
    "Vector PDF Engine",
    "High-Res Code Snapshots",
    "Client Diff Inspector"
  ],
  "telemetry": false
}`,
  rust: `// Zero-allocation byte scanner
pub fn find_subsequence(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    if needle.is_empty() || needle.len() > haystack.len() {
        return None;
    }
    haystack.windows(needle.len()).position(|window| window == needle)
}`,
  go: `package main

import (
	"fmt"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
	for j := range jobs {
		time.Sleep(time.Millisecond * 10)
		results <- j * 2
	}
}`,
  bash: `#!/usr/bin/env bash
# Client-side workspace verification
set -euo pipefail

echo "Running ClearTrix validation..."
npm run typecheck
npm run test:tools
echo "All local suites passed cleanly!"`,
};

/**
 * Tokenizes source code into structured tokens with semantic types.
 */
export function tokenizeCode(code: string, language: SupportedLanguage): HighlightedLine[] {
  if (!code) return [];
  const lines = code.split(/\r?\n/);
  const keywords = KEYWORDS_BY_LANG[language] ?? KEYWORDS_BY_LANG.javascript;

  return lines.map((line) => {
    if (!line) return [{ text: "", type: "plain" }];

    const tokens: HighlightedToken[] = [];
    let i = 0;

    while (i < line.length) {
      // 1. Single-line comments
      if (
        (line.startsWith("//", i) && language !== "python" && language !== "bash" && language !== "sql") ||
        (line.startsWith("#", i) && (language === "python" || language === "bash")) ||
        (line.startsWith("--", i) && language === "sql")
      ) {
        tokens.push({ text: line.slice(i), type: "comment" });
        break;
      }

      // 2. String literals
      const char = line.charAt(i);
      if (char === '"' || char === "'" || char === "`") {
        let j = i + 1;
        while (j < line.length) {
          if (line.charAt(j) === "\\" && j + 1 < line.length) {
            j += 2;
            continue;
          }
          if (line.charAt(j) === char) {
            j++;
            break;
          }
          j++;
        }
        tokens.push({ text: line.slice(i, j), type: "string" });
        i = j;
        continue;
      }

      // 3. Numbers
      if (/\d/.test(char) && (i === 0 || !/[a-zA-Z0-9_$]/.test(line.charAt(i - 1)))) {
        let j = i;
        while (j < line.length && /[\d.xXabcdefABCDEF_]/.test(line.charAt(j))) {
          j++;
        }
        tokens.push({ text: line.slice(i, j), type: "number" });
        i = j;
        continue;
      }

      // 4. Identifiers & Keywords
      if (/[a-zA-Z_$]/.test(char)) {
        let j = i;
        while (j < line.length && /[a-zA-Z0-9_$-]/.test(line.charAt(j))) {
          j++;
        }
        const word = line.slice(i, j);
        const lowerWord = word.toLowerCase();

        // Check if followed by open parenthesis -> function
        let isFunc = false;
        let k = j;
        while (k < line.length && /\s/.test(line.charAt(k))) k++;
        if (k < line.length && line.charAt(k) === "(") {
          isFunc = true;
        }

        if (keywords.has(language === "sql" ? lowerWord : word)) {
          tokens.push({ text: word, type: "keyword" });
        } else if (isFunc) {
          tokens.push({ text: word, type: "function" });
        } else {
          tokens.push({ text: word, type: "plain" });
        }
        i = j;
        continue;
      }

      // 5. Operators
      if (/[=+\-*/%&|^!<>?:~]/.test(char)) {
        let j = i;
        while (j < line.length && /[=+\-*/%&|^!<>?:~]/.test(line.charAt(j))) {
          j++;
        }
        tokens.push({ text: line.slice(i, j), type: "operator" });
        i = j;
        continue;
      }

      // 6. Punctuation
      if (/[{}()[\];,.]/.test(char)) {
        tokens.push({ text: char, type: "punctuation" });
        i++;
        continue;
      }

      // 7. Whitespace & other plain characters
      tokens.push({ text: char, type: "plain" });
      i++;
    }

    return tokens;
  });
}

/**
 * Escapes HTML/XML entities for SVG generation.
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface SvgSnapshotOptions {
  code: string;
  language: SupportedLanguage;
  theme: ThemeId;
  background: BackgroundPreset;
  windowStyle: WindowStyle;
  padding: PaddingSize;
  title: string;
  showLineNumbers: boolean;
  fontSize: number;
}

/**
 * Generates an SVG representation of the code snapshot.
 */
export function generateSvgSnapshot(options: SvgSnapshotOptions): string {
  const {
    code,
    language,
    theme,
    background,
    windowStyle,
    padding,
    title,
    showLineNumbers,
    fontSize,
  } = options;

  const themeConfig = THEMES[theme] ?? THEMES.dracula;
  const bgPreset = BACKGROUND_PRESETS[background] ?? BACKGROUND_PRESETS.cosmic;
  const paddingPx = PADDING_VALUES[padding] ?? 48;
  const tokenizedLines = tokenizeCode(code, language);

  const charWidth = fontSize * 0.6;
  const lineHeight = fontSize * 1.5;

  let maxLineLength = 0;
  for (const line of tokenizedLines) {
    const len = line.reduce((acc, t) => acc + t.text.length, 0);
    if (len > maxLineLength) maxLineLength = len;
  }
  if (maxLineLength < 30) maxLineLength = 30;

  const lineNumberWidth = showLineNumbers ? String(tokenizedLines.length).length * charWidth + 24 : 0;
  const codeContentWidth = maxLineLength * charWidth + lineNumberWidth + 48;
  const titlebarHeight = windowStyle === "none" ? 16 : 40;
  const codeContentHeight = tokenizedLines.length * lineHeight + 32;

  const windowWidth = codeContentWidth;
  const windowHeight = titlebarHeight + codeContentHeight;

  const totalWidth = windowWidth + paddingPx * 2;
  const totalHeight = windowHeight + paddingPx * 2;

  // Background rect or gradient
  let backgroundElement = "";
  if (background === "transparent") {
    backgroundElement = "";
  } else {
    backgroundElement = `
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgPreset.canvasColorStart}" />
          <stop offset="100%" stop-color="${bgPreset.canvasColorEnd}" />
        </linearGradient>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.35" />
        </filter>
      </defs>
      <rect width="${totalWidth}" height="${totalHeight}" fill="url(#bgGrad)" rx="16" />
    `;
  }

  // Window titlebar
  let windowControls = "";
  if (windowStyle === "mac") {
    windowControls = `
      <circle cx="${paddingPx + 20}" cy="${paddingPx + 20}" r="6" fill="#ff5f56" />
      <circle cx="${paddingPx + 38}" cy="${paddingPx + 20}" r="6" fill="#ffbd2e" />
      <circle cx="${paddingPx + 56}" cy="${paddingPx + 20}" r="6" fill="#27c93f" />
    `;
  } else if (windowStyle === "windows") {
    const rx = paddingPx + windowWidth - 60;
    windowControls = `
      <line x1="${rx}" y1="${paddingPx + 20}" x2="${rx + 10}" y2="${paddingPx + 20}" stroke="${themeConfig.titleColor}" stroke-width="1.5" />
      <rect x="${rx + 18}" y="${paddingPx + 15}" width="10" height="10" fill="none" stroke="${themeConfig.titleColor}" stroke-width="1.5" />
      <line x1="${rx + 36}" y1="${paddingPx + 15}" x2="${rx + 46}" y2="${paddingPx + 25}" stroke="${themeConfig.titleColor}" stroke-width="1.5" />
      <line x1="${rx + 46}" y1="${paddingPx + 15}" x2="${rx + 36}" y2="${paddingPx + 25}" stroke="${themeConfig.titleColor}" stroke-width="1.5" />
    `;
  }

  const titleText = title.trim()
    ? `<text x="${paddingPx + windowWidth / 2}" y="${paddingPx + 24}" fill="${themeConfig.titleColor}" font-family="monospace" font-size="12" text-anchor="middle">${escapeXml(title)}</text>`
    : "";

  // Render Code Lines
  const codeStartX = paddingPx + 24 + lineNumberWidth;
  const codeStartY = paddingPx + titlebarHeight + 24;

  let codeLinesSvg = "";
  tokenizedLines.forEach((line, lineIdx) => {
    const lineY = codeStartY + lineIdx * lineHeight;

    // Line number
    if (showLineNumbers) {
      codeLinesSvg += `<text x="${paddingPx + 20}" y="${lineY}" fill="${themeConfig.lineNumbersColor}" font-family="monospace" font-size="${fontSize}" text-anchor="start">${lineIdx + 1}</text>`;
    }

    // Code tokens
    let curX = codeStartX;
    line.forEach((token) => {
      if (!token.text) return;
      const color = themeConfig.tokens[token.type] ?? themeConfig.foreground;
      codeLinesSvg += `<text x="${curX}" y="${lineY}" fill="${color}" font-family="monospace" font-size="${fontSize}" xml:space="preserve">${escapeXml(token.text)}</text>`;
      curX += token.text.length * charWidth;
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
  ${backgroundElement}
  <!-- Window Container -->
  <rect x="${paddingPx}" y="${paddingPx}" width="${windowWidth}" height="${windowHeight}" fill="${themeConfig.background}" rx="12" filter="url(#cardShadow)" />
  ${windowControls}
  ${titleText}
  <!-- Syntax Code -->
  ${codeLinesSvg}
</svg>`;
}
