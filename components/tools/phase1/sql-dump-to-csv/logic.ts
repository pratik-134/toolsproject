export type DelimiterType = "," | "\t" | ";" | "|";
export type NullRepresentation = "" | "NULL" | "\\N" | "null";

export interface SqlParseOptions {
  delimiter?: DelimiterType;
  includeHeaders?: boolean;
  nullValue?: NullRepresentation;
  targetTable?: string; // If omitted, parses the first table or all
}

export interface TableData {
  tableName: string;
  columns: string[];
  rows: (string | null)[][];
}

export interface SqlParseResult {
  tables: Record<string, TableData>;
  tableNames: string[];
  activeTable: string;
  columns: string[];
  rows: (string | null)[][];
  csv: string;
  json: string;
  totalStatements: number;
  totalRows: number;
}

/**
 * Strips identifier quotes: `name`, "name", [name] -> name
 */
export function cleanIdentifier(id: string): string {
  return id.replace(/^[`"\[](.*)[`"\]]$/, "$1").trim();
}

/**
 * Parses SQL value tokens from a tuple like: (1, 'Alice O\'Connor', 29.5, NULL, true)
 */
export function parseSqlTuple(tupleStr: string): (string | null)[] {
  const values: (string | null)[] = [];
  let i = 0;
  const len = tupleStr.length;

  while (i < len) {
    // Skip whitespace and commas
    while (i < len && (tupleStr[i] === " " || tupleStr[i] === "\t" || tupleStr[i] === "\n" || tupleStr[i] === "\r" || tupleStr[i] === ",")) {
      i++;
    }
    if (i >= len) break;

    // 1. Quoted String: '...' or "..."
    if (tupleStr[i] === "'" || tupleStr[i] === '"') {
      const quoteChar = tupleStr[i];
      i++;
      let val = "";
      while (i < len) {
        if (tupleStr[i] === "\\") {
          // Escaped character
          i++;
          if (i < len) {
            const next = tupleStr[i];
            if (next === "n") val += "\n";
            else if (next === "r") val += "\r";
            else if (next === "t") val += "\t";
            else if (next === "\\") val += "\\";
            else if (next === "'") val += "'";
            else if (next === '"') val += '"';
            else val += next;
            i++;
          }
        } else if (tupleStr[i] === quoteChar) {
          // Check for SQL double quote escape: '' -> '
          if (i + 1 < len && tupleStr[i + 1] === quoteChar) {
            val += quoteChar;
            i += 2;
          } else {
            // End of string
            i++;
            break;
          }
        } else {
          val += tupleStr[i];
          i++;
        }
      }
      values.push(val);
    } else {
      // 2. Unquoted token (Number, NULL, TRUE, FALSE, expression)
      let token = "";
      while (
        i < len &&
        tupleStr[i] !== "," &&
        tupleStr[i] !== ")" &&
        tupleStr[i] !== " " &&
        tupleStr[i] !== "\t" &&
        tupleStr[i] !== "\n" &&
        tupleStr[i] !== "\r"
      ) {
        token += tupleStr[i];
        i++;
      }

      const upper = token.toUpperCase().trim();
      if (upper === "NULL") {
        values.push(null);
      } else if (upper === "TRUE") {
        values.push("1");
      } else if (upper === "FALSE") {
        values.push("0");
      } else {
        values.push(token);
      }
    }

    // Skip trailing whitespace
    while (i < len && (tupleStr[i] === " " || tupleStr[i] === "\t" || tupleStr[i] === "\n" || tupleStr[i] === "\r")) {
      i++;
    }
    if (i < len && tupleStr[i] === ",") {
      i++;
    }
  }

  return values;
}

/**
 * Converts 2D row array to properly escaped CSV
 */
export function formatCsv(
  columns: string[],
  rows: (string | null)[][],
  options: SqlParseOptions = {}
): string {
  const delim = options.delimiter ?? ",";
  const nullRep = options.nullValue ?? "";
  const includeHeaders = options.includeHeaders !== false;

  const escapeCell = (val: string | null): string => {
    if (val === null) return nullRep;
    const str = String(val);
    if (str.includes(delim) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  if (includeHeaders && columns.length > 0) {
    lines.push(columns.map(escapeCell).join(delim));
  }

  for (const row of rows) {
    lines.push(row.map(escapeCell).join(delim));
  }

  return lines.join("\n");
}

export function parseSqlDump(sql: string, options: SqlParseOptions = {}): SqlParseResult {
  const tables: Record<string, TableData> = {};
  let totalStatements = 0;
  let totalRows = 0;

  // Regex matching INSERT INTO [table] [(cols)] VALUES (...);
  // Handles multi-line statements and case insensitivity
  const insertRegex = /INSERT\s+INTO\s+([`"\[]?\w+[`"\]]?(?:\.[`"\[]?\w+[`"\]]?)?)\s*(?:\(([^)]+)\))?\s*VALUES\s*([\s\S]*?)(?=;|\n\s*INSERT\s+INTO|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = insertRegex.exec(sql)) !== null) {
    totalStatements++;
    const rawTableName = match[1] || "table";
    const rawColumns = match[2];
    const rawValuesBlock = match[3] || "";

    const tableName = cleanIdentifier(rawTableName.split(".").pop() || rawTableName);

    // Extract columns
    let columns: string[] = [];
    if (rawColumns) {
      columns = rawColumns
        .split(",")
        .map((c) => cleanIdentifier(c.trim()))
        .filter(Boolean);
    }

    // Extract individual value tuples: (val1, val2, ...), (val3, val4, ...)
    const rows: (string | null)[][] = [];
    let inTuple = false;
    let inString = false;
    let quoteChar = "";
    let currentTuple = "";

    for (let idx = 0; idx < rawValuesBlock.length; idx++) {
      const char = rawValuesBlock[idx];

      if (!inTuple) {
        if (char === "(") {
          inTuple = true;
          currentTuple = "";
        }
      } else {
        if (inString) {
          currentTuple += char;
          if (char === "\\") {
            // Escaped character, skip next
            idx++;
            if (idx < rawValuesBlock.length) {
              currentTuple += rawValuesBlock[idx];
            }
          } else if (char === quoteChar) {
            // Check for double quote escape ''
            if (idx + 1 < rawValuesBlock.length && rawValuesBlock[idx + 1] === quoteChar) {
              currentTuple += quoteChar;
              idx++;
            } else {
              inString = false;
            }
          }
        } else {
          if (char === "'" || char === '"') {
            inString = true;
            quoteChar = char;
            currentTuple += char;
          } else if (char === ")") {
            inTuple = false;
            const parsedTuple = parseSqlTuple(currentTuple);
            if (parsedTuple.length > 0) {
              rows.push(parsedTuple);
              totalRows++;
            }
          } else {
            currentTuple += char;
          }
        }
      }
    }

    if (!tables[tableName]) {
      tables[tableName] = {
        tableName,
        columns,
        rows,
      };
    } else {
      // Append rows to existing table
      const existing = tables[tableName];
      if (existing) {
        if (existing.columns.length === 0 && columns.length > 0) {
          existing.columns = columns;
        }
        existing.rows.push(...rows);
      }
    }
  }

  const tableNames = Object.keys(tables);
  const activeTable = options.targetTable && tables[options.targetTable]
    ? options.targetTable
    : tableNames[0] || "";

  let activeColumns: string[] = [];
  let activeRows: (string | null)[][] = [];

  if (activeTable && tables[activeTable]) {
    const tableData = tables[activeTable];
    if (tableData) {
      activeRows = tableData.rows;
      activeColumns = tableData.columns;

      // Auto-generate column names if none were specified
      if (activeColumns.length === 0 && activeRows.length > 0) {
        const maxCols = Math.max(...activeRows.map((r) => r.length), 0);
        activeColumns = Array.from({ length: maxCols }, (_, i) => `col_${i + 1}`);
      }
    }
  }

  const csv = formatCsv(activeColumns, activeRows, options);

  // Generate JSON representation
  const jsonObjects = activeRows.map((row) => {
    const obj: Record<string, string | null> = {};
    for (let c = 0; c < activeColumns.length; c++) {
      const colName = activeColumns[c] || `col_${c + 1}`;
      const cell = row[c];
      obj[colName] = cell !== undefined ? cell : null;
    }
    return obj;
  });
  const json = JSON.stringify(jsonObjects, null, 2);

  return {
    tables,
    tableNames,
    activeTable,
    columns: activeColumns,
    rows: activeRows,
    csv,
    json,
    totalStatements,
    totalRows,
  };
}
