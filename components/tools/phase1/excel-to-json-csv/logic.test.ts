import { zipSync, strToU8 } from "fflate";
import {
  colLetterToIndex,
  parseDelimitedText,
  sheetToJson,
  sheetToCsv,
  parseXlsxBuffer,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Column letter to index math
  if (colLetterToIndex("A") !== 0) throw new Error("A should be index 0");
  if (colLetterToIndex("B") !== 1) throw new Error("B should be index 1");
  if (colLetterToIndex("Z") !== 25) throw new Error("Z should be index 25");
  if (colLetterToIndex("AA") !== 26) throw new Error("AA should be index 26");
  if (colLetterToIndex("AB") !== 27) throw new Error("AB should be index 27");

  // Test 2: Delimited text parsing and JSON/CSV conversions
  const sampleCsv = `id,name,role,salary\n1,"Alice Smith, Lead",Engineer,120000\n2,Bob Jones,Manager,135000`;
  const sheet = parseDelimitedText(sampleCsv, ",");

  if (sheet.columns.length !== 4) {
    throw new Error(`Expected 4 columns, got ${sheet.columns.length}`);
  }
  if (sheet.rows.length !== 2) {
    throw new Error(`Expected 2 rows, got ${sheet.rows.length}`);
  }
  const r0 = sheet.rows[0]!;
  if (r0[1] !== "Alice Smith, Lead") {
    throw new Error(`Expected quoted comma value, got ${r0[1]}`);
  }

  // JSON objects export
  const jsonObjStr = sheetToJson(sheet, "objects");
  const parsedObjects = JSON.parse(jsonObjStr);
  if (parsedObjects.length !== 2 || parsedObjects[0].name !== "Alice Smith, Lead") {
    throw new Error("Invalid JSON objects export");
  }

  // CSV export roundtrip
  const exportedCsv = sheetToCsv(sheet);
  if (!exportedCsv.includes('"Alice Smith, Lead"')) {
    throw new Error("Exported CSV missing quoted cell with comma");
  }

  // Test 3: Synthetic .xlsx in-memory ZIP package parsing
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <sheets>
      <sheet name="Sales2026" sheetId="1" r:id="rId1"/>
    </sheets>
  </workbook>`;

  const sharedStringsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="3" uniqueCount="3">
    <si><t>Product</t></si>
    <si><t>Revenue</t></si>
    <si><t>Qwertygen Pro</t></si>
  </sst>`;

  const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <sheetData>
      <row r="1">
        <c r="A1" t="s"><v>0</v></c>
        <c r="B1" t="s"><v>1</v></c>
      </row>
      <row r="2">
        <c r="A2" t="s"><v>2</v></c>
        <c r="B2"><v>99.95</v></c>
      </row>
    </sheetData>
  </worksheet>`;

  const syntheticXlsx = zipSync({
    "xl/workbook.xml": strToU8(workbookXml),
    "xl/sharedStrings.xml": strToU8(sharedStringsXml),
    "xl/worksheets/sheet1.xml": strToU8(sheet1Xml),
  });

  const parsedWb = parseXlsxBuffer(syntheticXlsx);
  if (parsedWb.sheets.length !== 1) {
    throw new Error(`Expected 1 sheet, got ${parsedWb.sheets.length}`);
  }

  const s0 = parsedWb.sheets[0]!;
  if (s0.name !== "Sales2026") {
    throw new Error(`Expected sheet name 'Sales2026', got '${s0.name}'`);
  }
  if (s0.columns[0] !== "Product" || s0.columns[1] !== "Revenue") {
    throw new Error(`Expected columns ['Product', 'Revenue'], got ${JSON.stringify(s0.columns)}`);
  }
  if (s0.rows.length !== 1 || s0.rows[0]![0] !== "Qwertygen Pro" || s0.rows[0]![1] !== 99.95) {
    throw new Error(`Unexpected row data: ${JSON.stringify(s0.rows)}`);
  }

  return true;
}
