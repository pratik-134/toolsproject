import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import JSZip from "jszip";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { PageMeta } from "./types";

/**
 * PDF to Word (.docx) export
 */
export async function exportPdfToDocx(rawPdfDoc: any, fileName: string): Promise<Blob> {
  if (!rawPdfDoc) throw new Error("No PDF loaded");

  const numPages = rawPdfDoc.numPages;
  const docParagraphs: Paragraph[] = [];

  // Title paragraph
  docParagraphs.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: fileName.replace(/\.[^/.]+$/, ""),
          bold: true,
          size: 32, // 16pt
        }),
      ],
    })
  );

  for (let p = 1; p <= numPages; p++) {
    const page = await rawPdfDoc.getPage(p);
    const textContent = await page.getTextContent();

    // Group items into lines by Y coordinate
    const lineMap = new Map<number, string[]>();
    for (const item of textContent.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y)!.push(item.str);
    }

    // Sort lines top to bottom (descending Y)
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);

    // Page header marker
    if (numPages > 1) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `--- Page ${p} ---`,
              italics: true,
              color: "888888",
              size: 18,
            }),
          ],
        })
      );
    }

    for (const y of sortedY) {
      const lineText = lineMap.get(y)!.join(" ").trim();
      if (!lineText) continue;

      // Heuristic: Short capitalized or bold-like strings can be headings
      const isHeading = lineText.length < 50 && lineText === lineText.toUpperCase() && lineText.length > 3;

      docParagraphs.push(
        new Paragraph({
          heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
          children: [
            new TextRun({
              text: lineText,
              size: isHeading ? 24 : 22, // 12pt / 11pt
              bold: isHeading,
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * PDF to Excel (.csv & .tsv tabular extraction)
 */
export async function exportPdfToExcel(rawPdfDoc: any, fileName: string): Promise<Blob> {
  if (!rawPdfDoc) throw new Error("No PDF loaded");

  const numPages = rawPdfDoc.numPages;
  const rows: string[][] = [];

  for (let p = 1; p <= numPages; p++) {
    const page = await rawPdfDoc.getPage(p);
    const textContent = await page.getTextContent();

    // Group items into lines
    const lineMap = new Map<number, { x: number; text: string }[]>();
    for (const item of textContent.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      const x = Math.round(item.transform[4]);
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y)!.push({ x, text: item.str });
    }

    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);

    rows.push([`--- Page ${p} ---`]);
    for (const y of sortedY) {
      const lineItems = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      // Group spaced items into columns
      const rowColumns = lineItems.map((item) => `"${item.text.replace(/"/g, '""')}"`);
      rows.push(rowColumns);
    }
  }

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
}

/**
 * PDF to Plain Text (.txt)
 */
export async function exportPdfToText(rawPdfDoc: any): Promise<string> {
  if (!rawPdfDoc) throw new Error("No PDF loaded");

  const numPages = rawPdfDoc.numPages;
  const textParts: string[] = [];

  for (let p = 1; p <= numPages; p++) {
    const page = await rawPdfDoc.getPage(p);
    const textContent = await page.getTextContent();

    const lineMap = new Map<number, string[]>();
    for (const item of textContent.items) {
      if (!("str" in item)) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push(item.str);
    }

    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
    textParts.push(`--- Page ${p} ---`);
    for (const y of sortedY) {
      textParts.push(lineMap.get(y)!.join(" "));
    }
    textParts.push("");
  }

  return textParts.join("\n");
}

/**
 * PDF to HTML (.html)
 */
export async function exportPdfToHtml(rawPdfDoc: any, fileName: string): Promise<string> {
  if (!rawPdfDoc) throw new Error("No PDF loaded");

  const numPages = rawPdfDoc.numPages;
  const htmlParts: string[] = [
    `<!DOCTYPE html>`,
    `<html lang="en">`,
    `<head>`,
    `<meta charset="UTF-8">`,
    `<title>${fileName}</title>`,
    `<style>`,
    `  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }`,
    `  .pdf-page { background: #ffffff; max-width: 800px; margin: 20px auto; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 4px; line-height: 1.6; }`,
    `  .page-num { font-size: 11px; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; }`,
    `  p { margin: 0 0 10px 0; }`,
    `</style>`,
    `</head>`,
    `<body>`,
  ];

  for (let p = 1; p <= numPages; p++) {
    const page = await rawPdfDoc.getPage(p);
    const textContent = await page.getTextContent();

    const lineMap = new Map<number, string[]>();
    for (const item of textContent.items) {
      if (!("str" in item)) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push(item.str);
    }

    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);

    htmlParts.push(`  <div class="pdf-page">`);
    htmlParts.push(`    <div class="page-num">Page ${p} of ${numPages}</div>`);
    for (const y of sortedY) {
      const lineText = lineMap.get(y)!.join(" ").trim();
      if (lineText) {
        htmlParts.push(`    <p>${lineText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`);
      }
    }
    htmlParts.push(`  </div>`);
  }

  htmlParts.push(`</body></html>`);
  return htmlParts.join("\n");
}

/**
 * PDF to High-Fidelity Images (JPG/PNG ZIP container)
 */
export async function exportPdfToImagesZip(
  rawPdfDoc: any,
  baseFileName: string,
  format: "jpg" | "png" = "png",
  scale: number = 2.0
): Promise<Blob> {
  if (!rawPdfDoc) throw new Error("No PDF loaded");

  const zip = new JSZip();
  const numPages = rawPdfDoc.numPages;

  for (let p = 1; p <= numPages; p++) {
    const page = await rawPdfDoc.getPage(p);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) continue;

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const mime = format === "jpg" ? "image/jpeg" : "image/png";
    const dataUrl = canvas.toDataURL(mime, 0.92);
    const base64Data = dataUrl.split(",")[1];
    if (base64Data) {
      zip.file(`${baseFileName}_page_${p}.${format}`, base64Data, { base64: true });
    }
  }

  return await zip.generateAsync({ type: "blob" });
}

/**
 * PDF to PowerPoint (.pptx) presentation
 */
export async function exportPdfToPptx(rawPdfDoc: any, fileName: string): Promise<Blob> {
  if (!rawPdfDoc) throw new Error("No PDF loaded");

  const zip = new JSZip();
  const numPages = rawPdfDoc.numPages;

  // Standard OpenXML Presentation structure
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${Array.from({ length: numPages }, (_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("\n  ")}
</Types>`);

  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

  const slideRelEntries = Array.from(
    { length: numPages },
    (_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
  ).join("\n  ");

  zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${slideRelEntries}
</Relationships>`);

  const slideIdEntries = Array.from(
    { length: numPages },
    (_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`
  ).join("\n    ");

  zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/officeDocument/2006/presentationml">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
    ${slideIdEntries}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="5143500"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`);

  for (let p = 1; p <= numPages; p++) {
    const page = await rawPdfDoc.getPage(p);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .filter((item: any) => "str" in item && item.str.trim())
      .map((item: any) => item.str)
      .slice(0, 10); // Capture primary points

    const textXml = pageStrings
      .map(
        (s: string) => `<a:p><a:r><a:rPr lang="en-US" sz="1600"/><a:t>${s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</a:t></a:r></a:p>`
      )
      .join("");

    zip.file(`ppt/slides/slide${p}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/officeDocument/2006/presentationml">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="274638"/><a:ext cx="8229600" cy="800000"/></a:xfrm></p:spPr>
        <p:txBody>
          <a:bodyPr/><a:lstStyle/>
          <a:p><a:r><a:rPr lang="en-US" sz="2800" b="1"/><a:t>Page ${p} - ${fileName}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Content"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="1200000"/><a:ext cx="8229600" cy="3500000"/></a:xfrm></p:spPr>
        <p:txBody>
          <a:bodyPr/><a:lstStyle/>
          ${textXml || `<a:p><a:r><a:t>Slide content extracted from PDF</a:t></a:r></a:p>`}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`);
  }

  return await zip.generateAsync({ type: "blob" });
}

/**
 * Images to PDF converter (compiles multi-image array into clean PDF document)
 */
export async function convertImagesToPdf(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuf = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);

    let embeddedImg: any;
    if (file.type.includes("jpeg") || file.type.includes("jpg")) {
      embeddedImg = await pdfDoc.embedJpg(bytes);
    } else {
      // Default to PNG embedding
      embeddedImg = await pdfDoc.embedPng(bytes);
    }

    const { width, height } = embeddedImg.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
}

/**
 * Word (.docx) to PDF in-browser converter
 */
export async function convertWordToPdf(file: File): Promise<Uint8Array> {
  const arrayBuf = await file.arrayBuffer();
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: arrayBuf });
  const rawText = result.value || "Empty Word Document";

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const lines = rawText.split("\n");
  let currentPage = pdfDoc.addPage([595.28, 841.89]);
  let currentY = 841.89 - 50;

  // Document Title
  currentPage.drawText(file.name.replace(/\.[^/.]+$/, ""), {
    x: 50,
    y: currentY,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });
  currentY -= 30;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      currentY -= 12;
      continue;
    }

    if (currentY < 50) {
      currentPage = pdfDoc.addPage([595.28, 841.89]);
      currentY = 841.89 - 50;
    }

    // Wrap long lines
    const maxChars = 80;
    for (let c = 0; c < trimmed.length; c += maxChars) {
      const chunk = trimmed.substring(c, c + maxChars);
      currentPage.drawText(chunk, {
        x: 50,
        y: currentY,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      currentY -= 15;
    }
  }

  return await pdfDoc.save();
}

/**
 * Excel / CSV / Spreadsheet to PDF in-browser converter
 */
export async function convertExcelToPdf(file: File): Promise<Uint8Array> {
  const text = await file.text();
  const rows = text
    .split(/\r?\n/)
    .map((r) => r.split(",").map((c) => c.replace(/^"|"$/g, "").trim()))
    .filter((r) => r.some((c) => c.length > 0));

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Landscape for spreadsheets
  const pageWidth = 841.89;
  const pageHeight = 595.28;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - 50;

  // Title
  currentPage.drawText(file.name.replace(/\.[^/.]+$/, ""), {
    x: 40,
    y: currentY,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });
  currentY -= 25;

  const colCount = Math.max(...rows.map((r) => r.length), 1);
  const usableWidth = pageWidth - 80;
  const colWidth = Math.min(180, usableWidth / colCount);

  rows.forEach((row, rowIdx) => {
    if (currentY < 40) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - 50;
    }

    const isHeader = rowIdx === 0;
    const rowHeight = 22;

    // Row background
    currentPage.drawRectangle({
      x: 40,
      y: currentY - 5,
      width: colWidth * row.length,
      height: rowHeight,
      color: isHeader ? rgb(0.12, 0.18, 0.28) : rowIdx % 2 === 0 ? rgb(0.96, 0.97, 0.99) : rgb(1, 1, 1),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 0.5,
    });

    row.forEach((cell, colIdx) => {
      currentPage.drawText(cell.substring(0, 24), {
        x: 45 + colIdx * colWidth,
        y: currentY + 2,
        size: isHeader ? 9 : 8.5,
        font: isHeader ? fontBold : font,
        color: isHeader ? rgb(1, 1, 1) : rgb(0.15, 0.2, 0.25),
      });
    });

    currentY -= rowHeight;
  });

  return await pdfDoc.save();
}
