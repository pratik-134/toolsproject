/**
 * Excel & Spreadsheet to Vector PDF Converter — Pure TypeScript Domain Logic
 * Converts CSV, TSV, and spreadsheet data into formatted multi-page vector PDF tables.
 * 100% In-Browser Execution using pdf-lib.
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface ExcelToPdfConfig {
  title: string;
  subtitle?: string;
  orientation: "portrait" | "landscape";
  headerColorHex: string; // e.g. "2563EB"
  zebraStriping: boolean;
  fontSize: number;
}

export const SAMPLE_SPREADSHEETS: Record<string, { title: string; subtitle: string; csv: string }> = {
  "Financial Summary": {
    title: "Q3 Fiscal Performance Summary",
    subtitle: "Departmental Revenue, Cost of Goods & Net Margin Analysis",
    csv: `Month,Department,Gross Revenue,COGS,Operating Expenses,Net Margin
July,Engineering,"$450,000","$120,000","$85,000","$245,000"
July,Marketing,"$280,000","$40,000","$95,000","$145,000"
August,Engineering,"$490,000","$125,000","$88,000","$277,000"
August,Marketing,"$310,000","$45,000","$98,000","$167,000"
September,Engineering,"$520,000","$130,000","$92,000","$298,000"
September,Marketing,"$340,000","$50,000","$105,000","$185,000"`,
  },
  "Product Inventory": {
    title: "Warehouse Inventory & Stock Status",
    subtitle: "Active Catalog Units, Valuation & Replenishment Flags",
    csv: `SKU,Product Name,Category,Quantity,Unit Cost,Status
MK-101,Vector PDF Engine,Software,1500,"$49.00",In Stock
MK-102,DOCX Generator,Software,1200,"$59.00",In Stock
MK-103,Privacy Sanitizer,Security,850,"$39.00",In Stock
MK-104,Microphone Voice Deck,Audio,320,"$29.00",Low Stock
MK-105,Vector Redaction Tool,Legal,980,"$79.00",In Stock`,
  },
};

/**
 * Robust CSV/TSV parser supporting quotes and escaped delimiters
 */
export function parseSpreadsheetText(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: tab or comma
  const firstLine = lines[0] ?? "";
  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let insideQuote = false;
    let currentCell = "";

    for (let i = 0; i < line.length; i++) {
      const char = line.charAt(i);

      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === delimiter && !insideQuote) {
        row.push(currentCell.trim());
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * Convert hex color to RGB tuple
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16) / 255,
      g: parseInt(clean.substring(2, 4), 16) / 255,
      b: parseInt(clean.substring(4, 6), 16) / 255,
    };
  }
  return { r: 0.15, g: 0.39, b: 0.92 };
}

/**
 * Convert spreadsheet matrix into formatted multi-page vector PDF table
 */
export async function convertTableToPdf(
  rows: string[][],
  config: ExcelToPdfConfig
): Promise<Uint8Array> {
  if (rows.length === 0) {
    throw new Error("Cannot convert empty table to PDF.");
  }

  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Page dimensions: Portrait (612 x 792) or Landscape (792 x 612)
  const isLandscape = config.orientation === "landscape";
  const pageWidth = isLandscape ? 792 : 612;
  const pageHeight = isLandscape ? 612 : 792;

  const marginX = 40;
  const marginTop = 50;
  const marginBottom = 45;
  const contentWidth = pageWidth - marginX * 2;

  // Header & row heights
  const rowHeight = 22;
  const headerHeight = 24;

  const headerColor = hexToRgb(config.headerColorHex || "2563EB");

  // Determine column count and widths
  const numCols = Math.max(...rows.map((r) => r.length));
  const colWidth = contentWidth / numCols;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - marginTop;

  // Draw Document Title
  if (config.title) {
    currentPage.drawText(config.title, {
      x: marginX,
      y: currentY,
      size: 16,
      font: fontBold,
      color: rgb(headerColor.r, headerColor.g, headerColor.b),
    });
    currentY -= 20;
  }

  // Draw Document Subtitle
  if (config.subtitle) {
    currentPage.drawText(config.subtitle, {
      x: marginX,
      y: currentY,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.55),
    });
    currentY -= 24;
  }

  currentY -= 10;

  // Helper: Draw Header Row
  const drawHeaderRow = (page: typeof currentPage, y: number) => {
    // Header background fill
    page.drawRectangle({
      x: marginX,
      y: y - headerHeight + 5,
      width: contentWidth,
      height: headerHeight,
      color: rgb(headerColor.r, headerColor.g, headerColor.b),
    });

    const headers = rows[0] ?? [];
    for (let c = 0; c < numCols; c++) {
      const text = headers[c] ?? "";
      page.drawText(text, {
        x: marginX + c * colWidth + 6,
        y: y - 10,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    }
  };

  // Draw initial header
  drawHeaderRow(currentPage, currentY);
  currentY -= headerHeight;

  // Draw Data Rows
  for (let r = 1; r < rows.length; r++) {
    // Check if new page is needed
    if (currentY - rowHeight < marginBottom) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - marginTop;

      // Repeat header on new page
      drawHeaderRow(currentPage, currentY);
      currentY -= headerHeight;
    }

    const row = rows[r] ?? [];
    const isEven = r % 2 === 0;

    // Zebra striping background
    if (config.zebraStriping && isEven) {
      currentPage.drawRectangle({
        x: marginX,
        y: currentY - rowHeight + 5,
        width: contentWidth,
        height: rowHeight,
        color: rgb(0.96, 0.97, 0.98),
      });
    }

    // Gridline bottom border
    currentPage.drawLine({
      start: { x: marginX, y: currentY - rowHeight + 5 },
      end: { x: marginX + contentWidth, y: currentY - rowHeight + 5 },
      thickness: 0.5,
      color: rgb(0.85, 0.88, 0.92),
    });

    // Draw cells
    for (let c = 0; c < numCols; c++) {
      const cellText = row[c] ?? "";
      // Truncate cell text if excessively long
      const displayCell = cellText.length > 32 ? `${cellText.substring(0, 30)}...` : cellText;

      currentPage.drawText(displayCell, {
        x: marginX + c * colWidth + 6,
        y: currentY - 8,
        size: config.fontSize || 9,
        font: fontRegular,
        color: rgb(0.15, 0.2, 0.25),
      });
    }

    currentY -= rowHeight;
  }

  return pdfDoc.save();
}
