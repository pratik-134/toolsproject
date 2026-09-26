export interface CsvToJsonOptions {
  delimiter?: string;
  hasHeaders?: boolean;
  parseNumbersAndBooleans?: boolean;
  indent?: number | "minify";
}

export interface JsonToCsvOptions {
  delimiter?: string;
  includeHeaders?: boolean;
}

export interface ConversionResult {
  success: boolean;
  output: string;
  error?: string;
  rowsCount?: number;
}

/**
 * Robust RFC 4180 CSV Parser in pure TypeScript
 */
export function csvToJson(csvText: string, options: CsvToJsonOptions = {}): ConversionResult {
  const trimmed = csvText.trim();
  if (!trimmed) {
    return { success: true, output: "[]", rowsCount: 0 };
  }

  const delimiter = options.delimiter || ",";
  const hasHeaders = options.hasHeaders !== false;
  const parseNumbers = options.parseNumbersAndBooleans !== false;
  const indent = options.indent === "minify" ? 0 : (options.indent ?? 2);

  try {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      const nextChar = trimmed[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if ((char === "\r" || char === "\n") && !insideQuotes) {
        if (char === "\r" && nextChar === "\n") {
          i++; // skip \n in CRLF
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
    }

    if (rows.length === 0) {
      return { success: true, output: "[]", rowsCount: 0 };
    }

    const formatVal = (v: string): unknown => {
      if (!parseNumbers) return v;
      if (v === "true") return true;
      if (v === "false") return false;
      if (v === "null") return null;
      if (v !== "" && !isNaN(Number(v))) return Number(v);
      return v;
    };

    let parsedResult: unknown;

    if (hasHeaders && rows.length > 0) {
      const headerRow = rows[0];
      if (!headerRow) return { success: true, output: "[]", rowsCount: 0 };

      const headers = headerRow.map((h, idx) => h || `column_${idx + 1}`);
      const dataRows = rows.slice(1);

      parsedResult = dataRows.map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((header, idx) => {
          obj[header] = formatVal(row[idx] ?? "");
        });
        return obj;
      });
    } else {
      parsedResult = rows.map((row) => row.map(formatVal));
    }

    const output = indent === 0 ? JSON.stringify(parsedResult) : JSON.stringify(parsedResult, null, indent);
    const count = Array.isArray(parsedResult) ? parsedResult.length : 0;

    return {
      success: true,
      output,
      rowsCount: count,
    };
  } catch (err: unknown) {
    return {
      success: false,
      output: "",
      error: err instanceof Error ? err.message : "Failed to parse CSV",
    };
  }
}

/**
 * JSON to CSV Converter
 */
export function jsonToCsv(jsonText: string, options: JsonToCsvOptions = {}): ConversionResult {
  const trimmed = jsonText.trim();
  if (!trimmed) {
    return { success: true, output: "", rowsCount: 0 };
  }

  const delimiter = options.delimiter || ",";
  const includeHeaders = options.includeHeaders !== false;

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return {
        success: false,
        output: "",
        error: "JSON input must be an array of objects or an array of arrays to convert to CSV.",
      };
    }

    if (parsed.length === 0) {
      return { success: true, output: "", rowsCount: 0 };
    }

    const escapeCell = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const isArrayOfObjects = typeof parsed[0] === "object" && parsed[0] !== null && !Array.isArray(parsed[0]);

    if (isArrayOfObjects) {
      const keysSet = new Set<string>();
      parsed.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          Object.keys(item).forEach((k) => keysSet.add(k));
        }
      });
      const headers = Array.from(keysSet);

      const lines: string[] = [];
      if (includeHeaders) {
        lines.push(headers.map(escapeCell).join(delimiter));
      }

      for (const item of parsed) {
        const row = headers.map((key) => escapeCell((item as Record<string, unknown>)[key]));
        lines.push(row.join(delimiter));
      }

      return {
        success: true,
        output: lines.join("\n"),
        rowsCount: parsed.length,
      };
    } else if (Array.isArray(parsed[0])) {
      const lines = parsed.map((row: unknown[]) => row.map(escapeCell).join(delimiter));
      return {
        success: true,
        output: lines.join("\n"),
        rowsCount: parsed.length,
      };
    } else {
      return {
        success: false,
        output: "",
        error: "JSON array elements must be objects or arrays.",
      };
    }
  } catch (err: unknown) {
    return {
      success: false,
      output: "",
      error: err instanceof Error ? err.message : "Invalid JSON",
    };
  }
}
