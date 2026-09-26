import { unzipSync, strFromU8 } from "fflate";

export interface ExcelSheet {
  name: string;
  columns: string[];
  rows: (string | number | boolean | null)[][];
}

export interface ExcelWorkbook {
  sheets: ExcelSheet[];
  activeSheetIndex: number;
}

export type JsonExportFormat = "objects" | "arrays";

/**
 * Converts column letter(s) like "A", "Z", "AA", "BC" to 0-indexed column integer
 */
export function colLetterToIndex(colStr: string): number {
  let index = 0;
  for (let i = 0; i < colStr.length; i++) {
    index = index * 26 + (colStr.charCodeAt(i) - 64);
  }
  return index - 1;
}

/**
 * Decodes XML entities
 */
export function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Parses shared strings XML into a lookup array
 */
export function parseSharedStringsXml(xmlText: string): string[] {
  const strings: string[] = [];
  // Match <si>...</si> entries
  const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
  let match: RegExpExecArray | null;

  while ((match = siRegex.exec(xmlText)) !== null) {
    const siContent = match[1] || "";
    // Combine all <t>...</t> tags inside this <si>
    const tRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/gi;
    let tMatch: RegExpExecArray | null;
    let fullText = "";
    while ((tMatch = tRegex.exec(siContent)) !== null) {
      fullText += tMatch[1] || "";
    }
    strings.push(decodeXmlEntities(fullText));
  }

  return strings;
}

/**
 * Parses workbook.xml to get sheet names
 */
export function parseWorkbookXml(xmlText: string): string[] {
  const names: string[] = [];
  const sheetRegex = /<sheet\b[^>]*name="([^"]+)"[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = sheetRegex.exec(xmlText)) !== null) {
    if (match[1]) {
      names.push(decodeXmlEntities(match[1]));
    }
  }

  return names.length > 0 ? names : ["Sheet1"];
}

/**
 * Parses a single worksheet XML (e.g. xl/worksheets/sheet1.xml)
 */
export function parseWorksheetXml(
  xmlText: string,
  sheetName: string,
  sharedStrings: string[]
): ExcelSheet {
  const rowMap = new Map<number, Map<number, string | number | boolean | null>>();
  let maxColIndex = 0;
  let maxRowIndex = 0;

  // Regex for <c r="A1" ...><v>...</v></c>
  // Also handles inline strings <c r="A1" t="inlineStr"><is><t>...</t></is></c>
  const cellRegex = /<c\b[^>]*\br="([A-Z]+)(\d+)"([^>]*)>([\s\S]*?)<\/c>/gi;
  let cellMatch: RegExpExecArray | null;

  while ((cellMatch = cellRegex.exec(xmlText)) !== null) {
    const colStr = cellMatch[1] || "A";
    const rowStr = cellMatch[2] || "1";
    const attrs = cellMatch[3] || "";
    const innerContent = cellMatch[4] || "";

    const colIdx = colLetterToIndex(colStr);
    const rowIdx = parseInt(rowStr, 10) - 1;

    if (colIdx > maxColIndex) maxColIndex = colIdx;
    if (rowIdx > maxRowIndex) maxRowIndex = rowIdx;

    // Determine type: t="s" (shared string), t="b" (boolean), t="str" (string), t="inlineStr"
    const typeMatch = /t="([^"]+)"/.exec(attrs);
    const type = typeMatch ? typeMatch[1] : "";

    let cellValue: string | number | boolean | null = null;

    if (type === "s") {
      // Shared string
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(innerContent);
      if (vMatch && vMatch[1]) {
        const strIdx = parseInt(vMatch[1], 10);
        cellValue = sharedStrings[strIdx] !== undefined ? sharedStrings[strIdx] : "";
      }
    } else if (type === "inlineStr") {
      const tMatch = /<t\b[^>]*>([\s\S]*?)<\/t>/.exec(innerContent);
      if (tMatch && tMatch[1]) {
        cellValue = decodeXmlEntities(tMatch[1]);
      }
    } else if (type === "b") {
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(innerContent);
      cellValue = vMatch && vMatch[1] === "1";
    } else {
      // Number or unquoted value
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(innerContent);
      if (vMatch && vMatch[1]) {
        const raw = vMatch[1].trim();
        const num = Number(raw);
        cellValue = !isNaN(num) ? num : raw;
      }
    }

    if (!rowMap.has(rowIdx)) {
      rowMap.set(rowIdx, new Map());
    }
    rowMap.get(rowIdx)!.set(colIdx, cellValue);
  }

  // Convert map to rectangular 2D array
  const tableData: (string | number | boolean | null)[][] = [];
  for (let r = 0; r <= maxRowIndex; r++) {
    const rowCells = rowMap.get(r);
    const rowArr: (string | number | boolean | null)[] = [];
    for (let c = 0; c <= maxColIndex; c++) {
      rowArr.push(rowCells?.get(c) ?? null);
    }
    tableData.push(rowArr);
  }

  // First row is assumed to be column headers if non-empty
  let columns: string[] = [];
  let rows: (string | number | boolean | null)[][] = [];

  if (tableData.length > 0) {
    const headerRow = tableData[0] || [];
    columns = headerRow.map((cell, idx) => (cell !== null && cell !== "" ? String(cell) : `col_${idx + 1}`));
    rows = tableData.slice(1);
  }

  return {
    name: sheetName,
    columns,
    rows,
  };
}

/**
 * Unzips an .xlsx buffer and parses all worksheets
 */
export function parseXlsxBuffer(buffer: Uint8Array | ArrayBuffer): ExcelWorkbook {
  const u8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const unzipped = unzipSync(u8);

  // 1. Shared Strings
  let sharedStrings: string[] = [];
  const sharedStringsFile = unzipped["xl/sharedStrings.xml"] || unzipped["XL/SHAREDSTRINGS.XML"];
  if (sharedStringsFile) {
    sharedStrings = parseSharedStringsXml(strFromU8(sharedStringsFile));
  }

  // 2. Workbook sheet names
  let sheetNames: string[] = [];
  const workbookFile = unzipped["xl/workbook.xml"] || unzipped["XL/WORKBOOK.XML"];
  if (workbookFile) {
    sheetNames = parseWorkbookXml(strFromU8(workbookFile));
  }

  // 3. Find all worksheets: xl/worksheets/sheet1.xml, sheet2.xml, ...
  const sheets: ExcelSheet[] = [];
  const worksheetKeys = Object.keys(unzipped)
    .filter((k) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(k))
    .sort((a, b) => {
      const numA = parseInt((a.match(/\d+/) || ["0"])[0] || "0", 10);
      const numB = parseInt((b.match(/\d+/) || ["0"])[0] || "0", 10);
      return numA - numB;
    });

  worksheetKeys.forEach((k, idx) => {
    const sheetFile = unzipped[k];
    if (sheetFile) {
      const sheetName = sheetNames[idx] || `Sheet${idx + 1}`;
      const parsedSheet = parseWorksheetXml(strFromU8(sheetFile), sheetName, sharedStrings);
      sheets.push(parsedSheet);
    }
  });

  return {
    sheets: sheets.length > 0 ? sheets : [{ name: "Sheet1", columns: [], rows: [] }],
    activeSheetIndex: 0,
  };
}

/**
 * Parses raw CSV or TSV string into an ExcelSheet
 */
export function parseDelimitedText(text: string, delimiter: string = ","): ExcelSheet {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { name: "Sheet1", columns: [], rows: [] };
  }

  const parseLine = (line: string): string[] => {
    const fields: string[] = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        fields.push(field.trim());
        field = "";
      } else {
        field += char;
      }
    }
    fields.push(field.trim());
    return fields;
  };

  const rawRows = lines.map(parseLine);
  const firstRow = rawRows[0] || [];
  const columns = firstRow.map((c, i) => (c ? c : `col_${i + 1}`));
  const rows = rawRows.slice(1);

  return {
    name: "Data",
    columns,
    rows,
  };
}

/**
 * Converts sheet data into formatted JSON string
 */
export function sheetToJson(sheet: ExcelSheet, format: JsonExportFormat = "objects"): string {
  if (format === "arrays") {
    const all = [sheet.columns, ...sheet.rows];
    return JSON.stringify(all, null, 2);
  }

  // Format as array of objects
  const objects = sheet.rows.map((row) => {
    const obj: Record<string, string | number | boolean | null> = {};
    sheet.columns.forEach((col, idx) => {
      obj[col] = row[idx] !== undefined ? row[idx] : null;
    });
    return obj;
  });

  return JSON.stringify(objects, null, 2);
}

/**
 * Converts sheet data into standard CSV text
 */
export function sheetToCsv(sheet: ExcelSheet, delimiter: string = ","): string {
  const escapeCell = (val: string | number | boolean | null): string => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  if (sheet.columns.length > 0) {
    lines.push(sheet.columns.map(escapeCell).join(delimiter));
  }

  sheet.rows.forEach((row) => {
    lines.push(row.map(escapeCell).join(delimiter));
  });

  return lines.join("\n");
}
