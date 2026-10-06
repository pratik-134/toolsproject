/**
 * Qwertygen Smart Input Auto-Detection Engine
 * Zero-upload, 100% in-browser content sniffing for the Command Palette & Omnibar.
 */

export type DetectedType =
  | "json"
  | "jwt"
  | "color"
  | "timestamp"
  | "cron"
  | "sql"
  | "regex"
  | "markdown"
  | "html"
  | "base64"
  | "url"
  | "ip"
  | "curl";

export interface DetectedAction {
  toolSlug: string;
  actionTitle: string;
  description: string;
  isPrimary?: boolean;
}

export interface DetectedInputResult {
  type: DetectedType;
  label: string;
  badge: string;
  previewValue?: string;
  colorSwatch?: string;
  suggestedTools: DetectedAction[];
}

/**
 * Safely base64url-decode string
 */
function safeBase64UrlDecode(str: string): string | null {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    return atob(base64);
  } catch {
    return null;
  }
}

/**
 * Detect input content type and return tailored action recommendations.
 */
export function detectInputType(raw: string): DetectedInputResult | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length < 3) return null;

  // 1. cURL Command
  if (/^curl\s+[\s\S]+/i.test(trimmed)) {
    return {
      type: "curl",
      label: "cURL Request Command",
      badge: "HTTP / API",
      previewValue: trimmed.slice(0, 80) + (trimmed.length > 80 ? "..." : ""),
      suggestedTools: [
        {
          toolSlug: "curl-to-code-converter",
          actionTitle: "Convert cURL to Code",
          description: "Transform cURL into JavaScript fetch, Python requests, or Axios",
          isPrimary: true,
        },
      ],
    };
  }

  // 2. JWT Token (3 base64url segments separated by dots)
  if (/^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed)) {
    const parts = trimmed.split(".");
    if (parts.length === 3) {
      let preview = "Signed JWT Token";
      try {
        const p0 = parts[0];
        const p1 = parts[1];
        if (p0 && p1) {
          const headerRaw = safeBase64UrlDecode(p0);
          const payloadRaw = safeBase64UrlDecode(p1);
          if (headerRaw && payloadRaw) {
            const header = JSON.parse(headerRaw);
            const payload = JSON.parse(payloadRaw);
            const alg = header.alg || "Unknown Alg";
            const sub = payload.sub || payload.name || payload.email || payload.iss || null;
            preview = sub ? `Alg: ${alg} | Identity: ${sub}` : `Alg: ${alg}`;
          }
        }
      } catch {
        // Fallback preview
      }

      return {
        type: "jwt",
        label: "JSON Web Token (JWT)",
        badge: "Auth & Security",
        previewValue: preview,
        suggestedTools: [
          {
            toolSlug: "jwt-decoder",
            actionTitle: "Inspect & Decode JWT Claims",
            description: "View header, signature status, and payload claims",
            isPrimary: true,
          },
          {
            toolSlug: "json-formatter",
            actionTitle: "Format Token Payload",
            description: "Format the decoded JSON payload",
          },
          {
            toolSlug: "base64-converter",
            actionTitle: "Decode Base64 Segments",
            description: "Inspect raw binary token data",
          },
        ],
      };
    }
  }

  // 3. JSON Object or Array
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      const isArray = Array.isArray(parsed);
      const count = isArray ? parsed.length : Object.keys(parsed).length;
      const preview = isArray
        ? `Array with ${count} items`
        : `Object with ${count} properties`;

      return {
        type: "json",
        label: isArray ? "JSON Array" : "JSON Object",
        badge: "Structured Data",
        previewValue: preview,
        suggestedTools: [
          {
            toolSlug: "json-formatter",
            actionTitle: "Format & Beautify JSON",
            description: "Prettify with indentation, syntax highlighting and tree view",
            isPrimary: true,
          },
          {
            toolSlug: "json-to-typescript",
            actionTitle: "Generate TypeScript Interfaces",
            description: "Auto-generate type definitions from this JSON structure",
          },
          {
            toolSlug: "csv-json-converter",
            actionTitle: "Convert JSON to CSV Table",
            description: "Flatten structured JSON into comma-separated rows",
          },
          {
            toolSlug: "json-yaml-converter",
            actionTitle: "Convert to YAML",
            description: "Export as clean YAML configuration",
          },
          {
            toolSlug: "json-schema-validator",
            actionTitle: "Validate JSON Schema",
            description: "Check structure validity against schemas",
          },
        ],
      };
    } catch {
      // Might be slightly malformed JSON, let JSON Formatter fix it
      if (trimmed.length > 10 && (trimmed.includes('":') || trimmed.includes("':"))) {
        return {
          type: "json",
          label: "Malformed or Unformatted JSON",
          badge: "Syntax Repair",
          previewValue: "Contains JSON-like key-value pairs",
          suggestedTools: [
            {
              toolSlug: "json-formatter",
              actionTitle: "Repair & Format JSON",
              description: "Detect syntax errors and clean up structure",
              isPrimary: true,
            },
          ],
        };
      }
    }
  }

  // 4. Color Code (Hex, RGB, HSL)
  const hexMatch = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed);
  const rgbMatch = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+\s*)?\)$/i.test(trimmed);
  const hslMatch = /^hsla?\(\s*\d+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(?:\s*,\s*[\d.]+\s*)?\)$/i.test(trimmed);

  if (hexMatch || rgbMatch || hslMatch) {
    return {
      type: "color",
      label: "Color Code",
      badge: "Design & CSS",
      previewValue: trimmed.toUpperCase(),
      colorSwatch: trimmed,
      suggestedTools: [
        {
          toolSlug: "color-converter",
          actionTitle: "Convert Color Across Spaces",
          description: "Transform between HEX, RGB, HSL, CMYK, and CSS variables",
          isPrimary: true,
        },
      ],
    };
  }

  // 5. Unix Timestamp (10 digits for seconds, 13 digits for ms)
  if (/^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    const ms = trimmed.length === 10 ? num * 1000 : num;
    // Sensible range: 1980 to 2100
    if (ms >= 315532800000 && ms <= 4102444800000) {
      const date = new Date(ms);
      if (!isNaN(date.getTime())) {
        const isoString = date.toISOString();
        const readable = date.toUTCString();
        return {
          type: "timestamp",
          label: "Unix Epoch Timestamp",
          badge: "Date & Time",
          previewValue: `${readable} (${isoString})`,
          suggestedTools: [
            {
              toolSlug: "date-calculator",
              actionTitle: "Date Calculator & Offsets",
              description: "Calculate time differences, additions, and business days",
              isPrimary: true,
            },
            {
              toolSlug: "world-clock-converter",
              actionTitle: "Convert Across Timezones",
              description: "Compare this exact moment across global capital cities",
            },
          ],
        };
      }
    }
  }

  // 6. Cron Schedule Expression (5 or 6 standard fields)
  // e.g. "*/15 * * * *", "0 0 * * 1-5", "0 12 * * *"
  const cronTokens = trimmed.split(/\s+/);
  if ((cronTokens.length === 5 || cronTokens.length === 6) && cronTokens.every((t) => /^[\d*,\-\/?LW#]+$/.test(t))) {
    // Make sure at least one asterisk or slash is present so it's not plain numbers
    if (trimmed.includes("*") || trimmed.includes("/")) {
      return {
        type: "cron",
        label: "Cron Expression",
        badge: "DevOps & Scheduling",
        previewValue: `${cronTokens.length}-part schedule expression: "${trimmed}"`,
        suggestedTools: [
          {
            toolSlug: "cron-expression-builder",
            actionTitle: "Explain & Visualise Schedule",
            description: "Translate into plain English and calculate upcoming runs",
            isPrimary: true,
          },
        ],
      };
    }
  }

  // 7. SQL Query / DDL Statement
  if (/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|USE|SHOW\s+TABLES|DESCRIBE)\b/i.test(trimmed)) {
    return {
      type: "sql",
      label: "SQL Statement",
      badge: "Database & Query",
      previewValue: trimmed.slice(0, 90) + (trimmed.length > 90 ? "..." : ""),
      suggestedTools: [
        {
          toolSlug: "sql-formatter",
          actionTitle: "Format & Indent SQL Query",
          description: "Clean up keywords, uppercase clauses, and indent subqueries",
          isPrimary: true,
        },
        {
          toolSlug: "sql-dump-to-csv",
          actionTitle: "Convert SQL Insert Dump to CSV",
          description: "Extract relational values into table format",
        },
      ],
    };
  }

  // 8. Regular Expression
  if (/^\/.+\/[a-z]*$/i.test(trimmed) || (/[\^$\[\]\(\)\{\}\+\?\*\\]/.test(trimmed) && trimmed.length >= 4 && !trimmed.includes("\n"))) {
    try {
      new RegExp(trimmed.replace(/^\/|\/[a-z]*$/gi, ""));
      // Only flag if it looks distinctively like a regex pattern
      if (
        (trimmed.startsWith("/") && trimmed.endsWith("/")) ||
        trimmed.startsWith("^") ||
        trimmed.endsWith("$") ||
        trimmed.includes("\\d") ||
        trimmed.includes("\\w") ||
        trimmed.includes("\\s") ||
        trimmed.includes("[a-z") ||
        trimmed.includes("(?<")
      ) {
        return {
          type: "regex",
          label: "Regular Expression",
          badge: "Pattern Matching",
          previewValue: trimmed,
          suggestedTools: [
            {
              toolSlug: "regex-tester",
              actionTitle: "Test & Debug Regex Pattern",
              description: "Run test strings, match groups, and explain syntax step-by-step",
              isPrimary: true,
            },
          ],
        };
      }
    } catch {
      // invalid regex, ignore
    }
  }

  // 9. HTML Markup
  if (/^<(!DOCTYPE\s+html|[a-z1-6]+)[\s>]/i.test(trimmed) && trimmed.includes(">")) {
    return {
      type: "html",
      label: "HTML Markup",
      badge: "Web Document",
      previewValue: trimmed.slice(0, 80) + (trimmed.length > 80 ? "..." : ""),
      suggestedTools: [
        {
          toolSlug: "direct-html-editor",
          actionTitle: "Interactive Live HTML Studio",
          description: "Render live web preview with split-pane code editor",
          isPrimary: true,
        },
        {
          toolSlug: "html-beautifier",
          actionTitle: "Format & Clean HTML",
          description: "Re-indent and structure nested HTML tags",
        },
        {
          toolSlug: "html-to-markdown",
          actionTitle: "Convert HTML to Markdown",
          description: "Transform web tags into readable markdown syntax",
        },
        {
          toolSlug: "html-to-pdf",
          actionTitle: "Export HTML to Vector PDF",
          description: "Compile web page into downloadable PDF document",
        },
      ],
    };
  }

  // 10. Markdown Syntax
  if (
    trimmed.startsWith("# ") ||
    trimmed.startsWith("## ") ||
    trimmed.startsWith("### ") ||
    trimmed.includes("\n# ") ||
    trimmed.includes("\n## ") ||
    (trimmed.includes("```") && trimmed.length > 20) ||
    /\[.+\]\(https?:\/\/[^\)]+\)/.test(trimmed)
  ) {
    return {
      type: "markdown",
      label: "Markdown Document",
      badge: "Formatted Notes",
      previewValue: trimmed.slice(0, 80) + (trimmed.length > 80 ? "..." : ""),
      suggestedTools: [
        {
          toolSlug: "direct-markdown-editor",
          actionTitle: "Preview & Edit Markdown",
          description: "Split-view markdown editor with typography preview",
          isPrimary: true,
        },
        {
          toolSlug: "markdown-to-html",
          actionTitle: "Convert to Clean HTML",
          description: "Compile markdown syntax into standard web HTML",
        },
        {
          toolSlug: "markdown-to-pdf",
          actionTitle: "Export Markdown as PDF",
          description: "Turn markdown notes into an elegant PDF document",
        },
      ],
    };
  }

  // 11. IP Address & CIDR
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/.test(trimmed)) {
    return {
      type: "ip",
      label: "IPv4 Address / Subnet CIDR",
      badge: "Networking",
      previewValue: trimmed,
      suggestedTools: [
        {
          toolSlug: "ip-subnet-calculator",
          actionTitle: "Calculate IP Subnet & Range",
          description: "Determine network ID, broadcast, usable hosts, and wildcard mask",
          isPrimary: true,
        },
      ],
    };
  }

  // 12. Full URL
  if (/^https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/.test(trimmed)) {
    return {
      type: "url",
      label: "Web URL",
      badge: "Network / Web",
      previewValue: trimmed.slice(0, 80) + (trimmed.length > 80 ? "..." : ""),
      suggestedTools: [
        {
          toolSlug: "url-encoder",
          actionTitle: "Decode & Inspect URL Parameters",
          description: "Parse query string parameters and percent-encoding",
          isPrimary: true,
        },
        {
          toolSlug: "qr-generator",
          actionTitle: "Generate QR Code for URL",
          description: "Create high-resolution scannable QR code vector",
        },
      ],
    };
  }

  // 13. Base64 String (Long string with valid base64 chars, length multiple of 4)
  if (
    trimmed.length >= 24 &&
    trimmed.length % 4 === 0 &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) &&
    !trimmed.includes(" ")
  ) {
    try {
      const decoded = atob(trimmed);
      // Make sure it decoded into readable or structured text
      if (decoded.length > 5) {
        return {
          type: "base64",
          label: "Base64 Encoded String",
          badge: "Encoding",
          previewValue: `Decodes to: ${decoded.slice(0, 60)}${decoded.length > 60 ? "..." : ""}`,
          suggestedTools: [
            {
              toolSlug: "base64-converter",
              actionTitle: "Decode Base64 to Plain Text",
              description: "Convert encoded payload back to plain utf-8 text",
              isPrimary: true,
            },
            {
              toolSlug: "image-base64-converter",
              actionTitle: "View as Image / Data URL",
              description: "Render base64 as PNG/JPG graphic",
            },
          ],
        };
      }
    } catch {
      // not valid base64
    }
  }

  return null;
}
