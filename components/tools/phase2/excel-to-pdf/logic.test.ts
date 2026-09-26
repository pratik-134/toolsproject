import { PDFDocument } from "pdf-lib";
import {
  parseSpreadsheetText,
  convertTableToPdf,
  SAMPLE_SPREADSHEETS,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: CSV Parser
  const csv = `Name,Role,Status\nAlice,Developer,Active\n"Bob, Jr.",Designer,Remote`;
  const parsed = parseSpreadsheetText(csv);
  if (parsed.length !== 3) {
    throw new Error(`Expected 3 rows from CSV, got ${parsed.length}`);
  }
  if (parsed[2]?.[0] !== "Bob, Jr.") {
    throw new Error(`CSV parser failed to preserve commas inside quotes: ${parsed[2]?.[0]}`);
  }

  // Test 2: Convert Table to PDF
  const tableData = [
    ["Item", "Quantity", "Price"],
    ["Widget A", "10", "$5.00"],
    ["Widget B", "25", "$12.50"],
    ["Widget C", "100", "$1.20"],
  ];

  const pdfBytes = await convertTableToPdf(tableData, {
    title: "Inventory Report",
    subtitle: "Stock valuation",
    orientation: "portrait",
    headerColorHex: "2563EB",
    zebraStriping: true,
    fontSize: 9,
  });

  if (!pdfBytes || pdfBytes.length === 0) {
    throw new Error("convertTableToPdf returned empty buffer");
  }

  // Verify valid PDF
  const doc = await PDFDocument.load(pdfBytes);
  if (doc.getPageCount() < 1) {
    throw new Error("Generated PDF has no pages");
  }

  // Test 3: Sample spreadsheets exist
  if (Object.keys(SAMPLE_SPREADSHEETS).length < 2) {
    throw new Error("Expected at least 2 sample spreadsheet datasets");
  }

  return true;
}
