import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { PageMeta, AnnotationObject } from "./types";

// Configure local worker safely in browser environment
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  } catch {
    // ignore
  }
}

/**
 * Loads a PDF document and extracts metadata and thumbnail previews for each page.
 */
export async function loadPdfDocument(
  data: Uint8Array | ArrayBuffer
): Promise<{ pages: PageMeta[]; rawPdf: any }> {
  let uint8Data: Uint8Array;
  if (data instanceof Uint8Array) {
    uint8Data = new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  } else {
    uint8Data = new Uint8Array(data.slice(0));
  }

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pages: PageMeta[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const rotation = (page.rotate % 360) as 0 | 90 | 180 | 270;

    // Render low-res thumbnail preview (immediate for first 16 pages to avoid UI lockup on large multi-page PDFs)
    let thumbUrl: string | null = null;
    if (typeof document !== "undefined" && i <= 16) {
      try {
        const thumbScale = Math.min(180 / viewport.width, 240 / viewport.height);
        const thumbViewport = page.getViewport({ scale: thumbScale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(thumbViewport.width);
        canvas.height = Math.floor(thumbViewport.height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: thumbViewport,
          }).promise;
          thumbUrl = canvas.toDataURL("image/jpeg", 0.7);
        }
      } catch (err) {
        console.warn(`Failed to render thumbnail for page ${i}`, err);
      }
    }

    pages.push({
      id: `page-${i}-${Date.now()}`,
      pageNumber: i,
      originalIndex: i - 1,
      width: viewport.width,
      height: viewport.height,
      rotation,
      label: `Page ${i}`,
      thumbnailUrl: thumbUrl,
    });
  }

  return { pages, rawPdf: pdfDoc };
}

/**
 * Creates a beautiful 3-page demo document with sample contract clauses,
 * tables, and signoff blocks for immediate interactive testing.
 */
export async function createDemoPdf(): Promise<{ bytes: Uint8Array; fileName: string }> {
  const pdfDoc = await PDFDocument.create();
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // --- PAGE 1: Master Services Agreement ---
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Header band
  page1.drawRectangle({
    x: 0,
    y: height - 80,
    width,
    height: 80,
    color: rgb(0.08, 0.18, 0.36),
  });

  page1.drawText("CLEARTRIX DIGITAL CONTRACT", {
    x: 40,
    y: height - 48,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText("CONFIDENTIAL & PRIVACY-FIRST ENTERPRISE SERVICES AGREEMENT", {
    x: 40,
    y: height - 66,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.8, 0.88, 1),
  });

  // Body content
  let cursorY = height - 120;
  page1.drawText("1. PURPOSE AND ENGAGEMENT", {
    x: 40,
    y: cursorY,
    size: 13,
    font: fontBold,
    color: rgb(0.12, 0.15, 0.2),
  });

  cursorY -= 20;
  const paragraph1 = [
    "This Master Services Agreement ('Agreement') is entered into by and between Cleartrix Global,",
    "and the counterparty client organization ('Client'). The purpose of this agreement is to establish",
    "the operational terms, zero-telemetry client-side privacy commitments, vector document rendering",
    "standards, and cryptographic verification guarantees under Tier-1 professional specifications.",
  ];
  for (const line of paragraph1) {
    page1.drawText(line, { x: 40, y: cursorY, size: 10, font: fontHelvetica, color: rgb(0.25, 0.28, 0.33) });
    cursorY -= 15;
  }

  cursorY -= 15;
  page1.drawText("2. ZERO DATA TRANSMISSION COMMITMENT", {
    x: 40,
    y: cursorY,
    size: 13,
    font: fontBold,
    color: rgb(0.12, 0.15, 0.2),
  });

  cursorY -= 20;
  const paragraph2 = [
    "All document parsing, page restructuring, annotations, content edits, and cryptographic signatures",
    "execute 100% within the browser's local sandbox memory. At no point in time are documents,",
    "embedded images, or signature vectors transmitted across any external network interface or server.",
  ];
  for (const line of paragraph2) {
    page1.drawText(line, { x: 40, y: cursorY, size: 10, font: fontHelvetica, color: rgb(0.25, 0.28, 0.33) });
    cursorY -= 15;
  }

  // Visual card callout
  cursorY -= 25;
  page1.drawRectangle({
    x: 40,
    y: cursorY - 60,
    width: width - 80,
    height: 75,
    color: rgb(0.95, 0.97, 1),
    borderColor: rgb(0.6, 0.75, 0.95),
    borderWidth: 1,
  });

  page1.drawText("IMPORTANT COMPLIANCE NOTICE", {
    x: 55,
    y: cursorY - 8,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.35, 0.75),
  });
  page1.drawText("This sample document has been generated in-memory to test the Acrobat Pro feature suite:", {
    x: 55,
    y: cursorY - 24,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.2, 0.25, 0.3),
  });
  page1.drawText("Use the toolbar above to highlight text, redact with whiteout, insert signatures, and organize pages.", {
    x: 55,
    y: cursorY - 40,
    size: 9,
    font: fontOblique,
    color: rgb(0.3, 0.35, 0.4),
  });

  // Footer
  page1.drawText("Page 1 of 3 - Cleartrix Enterprise Spec", {
    x: 40,
    y: 30,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.5, 0.55, 0.6),
  });

  // --- PAGE 2: Deliverables & Milestones Table ---
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  page2.drawText("3. DELIVERABLES SPECIFICATION TABLE", {
    x: 40,
    y: height - 60,
    size: 16,
    font: fontBold,
    color: rgb(0.08, 0.18, 0.36),
  });

  // Table header
  const tableY = height - 100;
  page2.drawRectangle({
    x: 40,
    y: tableY,
    width: width - 80,
    height: 24,
    color: rgb(0.12, 0.16, 0.24),
  });
  page2.drawText("Milestone", { x: 50, y: tableY + 7, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page2.drawText("Deliverable Description", { x: 140, y: tableY + 7, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page2.drawText("Tier Status", { x: 380, y: tableY + 7, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page2.drawText("Verification", { x: 470, y: tableY + 7, size: 9, font: fontBold, color: rgb(1, 1, 1) });

  const rows = [
    { m: "M-01", desc: "Organize Pages (Rotate, Merge, Split, Reorder)", tier: "Tier 1: Core", ver: "Client Verified" },
    { m: "M-02", desc: "Vector Annotations (Highlight, Shapes, Freehand)", tier: "Tier 1: Core", ver: "Client Verified" },
    { m: "M-03", desc: "Digital Signatures & Bates Stamping", tier: "Tier 1: Core", ver: "Client Verified" },
    { m: "M-04", desc: "In-Browser Content Text & Whiteout Overlay", tier: "Tier 1: Core", ver: "Client Verified" },
    { m: "M-05", desc: "AcroForm Interactive Field Engine", tier: "Tier 2: Interactive", ver: "Pending Tier 1" },
    { m: "M-06", desc: "Permanent Vector Redaction & Flattening", tier: "Tier 2: Interactive", ver: "Pending Tier 1" },
  ];

  rows.forEach((row, idx) => {
    const rowY = tableY - 26 * (idx + 1);
    page2.drawRectangle({
      x: 40,
      y: rowY,
      width: width - 80,
      height: 25,
      color: idx % 2 === 0 ? rgb(0.97, 0.98, 1) : rgb(1, 1, 1),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 0.5,
    });
    page2.drawText(row.m, { x: 50, y: rowY + 7, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
    page2.drawText(row.desc, { x: 140, y: rowY + 7, size: 9, font: fontHelvetica, color: rgb(0.25, 0.3, 0.35) });
    page2.drawText(row.tier, { x: 380, y: rowY + 7, size: 9, font: fontHelvetica, color: rgb(0.1, 0.4, 0.7) });
    page2.drawText(row.ver, { x: 470, y: rowY + 7, size: 9, font: fontBold, color: rgb(0.15, 0.55, 0.25) });
  });

  page2.drawText("Page 2 of 3 - Cleartrix Enterprise Spec", {
    x: 40,
    y: 30,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.5, 0.55, 0.6),
  });

  // --- PAGE 3: Sign-Off and Execution ---
  const page3 = pdfDoc.addPage([595.28, 841.89]);
  page3.drawText("4. SIGNATURES & EXECUTION", {
    x: 40,
    y: height - 60,
    size: 16,
    font: fontBold,
    color: rgb(0.08, 0.18, 0.36),
  });

  page3.drawText("IN WITNESS WHEREOF, the parties hereto have caused this Agreement to be executed by", {
    x: 40,
    y: height - 90,
    size: 10,
    font: fontHelvetica,
    color: rgb(0.25, 0.28, 0.33),
  });
  page3.drawText("their duly authorized representatives as of the effective date recorded below.", {
    x: 40,
    y: height - 105,
    size: 10,
    font: fontHelvetica,
    color: rgb(0.25, 0.28, 0.33),
  });

  // Two signature columns
  const col1X = 50;
  const col2X = 320;
  const sigBoxY = height - 280;

  // Party A
  page3.drawRectangle({
    x: col1X,
    y: sigBoxY,
    width: 220,
    height: 140,
    borderColor: rgb(0.75, 0.8, 0.85),
    borderWidth: 1,
    color: rgb(0.99, 0.99, 1),
  });
  page3.drawText("PROVIDER: CLEARTRIX INC.", { x: col1X + 12, y: sigBoxY + 118, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
  page3.drawLine({ start: { x: col1X + 12, y: sigBoxY + 50 }, end: { x: col1X + 208, y: sigBoxY + 50 }, thickness: 1, color: rgb(0.5, 0.55, 0.6) });
  page3.drawText("Authorized Signatory", { x: col1X + 12, y: sigBoxY + 36, size: 8, font: fontHelvetica, color: rgb(0.5, 0.55, 0.6) });
  page3.drawText("Date: October 1, 2026", { x: col1X + 12, y: sigBoxY + 18, size: 8, font: fontHelvetica, color: rgb(0.5, 0.55, 0.6) });

  // Party B (User can sign here!)
  page3.drawRectangle({
    x: col2X,
    y: sigBoxY,
    width: 220,
    height: 140,
    borderColor: rgb(0.2, 0.5, 0.9),
    borderWidth: 1.5,
    color: rgb(0.96, 0.98, 1),
  });
  page3.drawText("CLIENT / TEST SIGNER", { x: col2X + 12, y: sigBoxY + 118, size: 10, font: fontBold, color: rgb(0.1, 0.3, 0.7) });
  page3.drawText("Place your signature below:", { x: col2X + 12, y: sigBoxY + 80, size: 9, font: fontOblique, color: rgb(0.4, 0.5, 0.6) });
  page3.drawLine({ start: { x: col2X + 12, y: sigBoxY + 50 }, end: { x: col2X + 208, y: sigBoxY + 50 }, thickness: 1, color: rgb(0.3, 0.5, 0.8) });
  page3.drawText("Signature / Initials / Date", { x: col2X + 12, y: sigBoxY + 36, size: 8, font: fontHelvetica, color: rgb(0.4, 0.5, 0.6) });

  page3.drawText("Page 3 of 3 - Cleartrix Enterprise Spec", {
    x: 40,
    y: 30,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.5, 0.55, 0.6),
  });

  const bytes = await pdfDoc.save();
  return { bytes, fileName: "cleartrix-demo-contract.pdf" };
}

/**
 * Merge an uploaded PDF document into the existing document at a specified page index.
 */
export async function mergePdfs(
  baseBytes: Uint8Array,
  additionalBytes: Uint8Array,
  insertAfterIndex: number = -1
): Promise<{ bytes: Uint8Array; addedCount: number }> {
  const baseDoc = await PDFDocument.load(baseBytes);
  const additionalDoc = await PDFDocument.load(additionalBytes);
  const addedIndices = additionalDoc.getPageIndices();
  const copiedPages = await baseDoc.copyPages(additionalDoc, addedIndices);

  const targetIndex = insertAfterIndex >= 0 ? insertAfterIndex + 1 : baseDoc.getPageCount();

  copiedPages.forEach((page, i) => {
    baseDoc.insertPage(targetIndex + i, page);
  });

  const bytes = await baseDoc.save();
  return { bytes, addedCount: copiedPages.length };
}

/**
 * Extract selected pages into a standalone new PDF document.
 */
export async function extractPagesAsPdf(
  sourceBytes: Uint8Array,
  pageIndices: number[]
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(sourceBytes);
  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(sourceDoc, pageIndices);
  copied.forEach((p) => newDoc.addPage(p));
  return await newDoc.save();
}

/**
 * Format and download comments/notes as a text or JSON file.
 */
export function exportComments(
  annotations: AnnotationObject[],
  format: "txt" | "json",
  documentName: string
) {
  const commentAnnotations = annotations.filter((a) => a.type === "sticky-note" || a.comment);
  let content = "";
  let mimeType = "text/plain";
  let ext = "txt";

  if (format === "json") {
    content = JSON.stringify(commentAnnotations, null, 2);
    mimeType = "application/json";
    ext = "json";
  } else {
    content = `DOCUMENT COMMENTS & ANNOTATIONS REPORT\nDocument: ${documentName}\nGenerated: ${new Date().toLocaleString()}\nTotal Comments: ${commentAnnotations.length}\n${"-".repeat(60)}\n\n`;
    commentAnnotations.forEach((item, index) => {
      content += `[#${index + 1}] Page ${item.pageIndex + 1} - Author: ${item.author || "Anonymous"} (${item.createdAt || "N/A"})\n`;
      content += `Text / Subject: ${item.text || "(No subject)"}\n`;
      if (item.comment) {
        content += `Comment Details: ${item.comment}\n`;
      }
      content += `\n${"-".repeat(40)}\n\n`;
    });
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${documentName.replace(/\.pdf$/i, "")}-comments.${ext}`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Parses existing AcroForm fields from an uploaded PDF document
 */
export async function parseExistingFormFields(
  pdfBytes: Uint8Array
): Promise<import("./types").FormFieldDef[]> {
  try {
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = doc.getForm();
    const fields = form.getFields();
    const extracted: import("./types").FormFieldDef[] = [];

    fields.forEach((f, idx) => {
      const name = f.getName();
      const typeName = f.constructor.name;
      let type: import("./types").FormFieldType = "text";
      let val: string | boolean | undefined;

      if (typeName.includes("TextField")) {
        type = "text";
        try {
          val = (f as any).getText() || "";
        } catch {}
      } else if (typeName.includes("CheckBox")) {
        type = "checkbox";
        try {
          val = (f as any).isChecked();
        } catch {}
      } else if (typeName.includes("Dropdown")) {
        type = "dropdown";
        try {
          const selected = (f as any).getSelected();
          val = Array.isArray(selected) ? selected[0] : selected;
        } catch {}
      } else if (typeName.includes("RadioGroup")) {
        type = "radio";
        try {
          val = (f as any).getSelected();
        } catch {}
      } else if (typeName.includes("OptionList")) {
        type = "listbox";
      } else if (typeName.includes("Button")) {
        type = "button-submit";
      }

      // Default fallback placement
      extracted.push({
        id: `field-parsed-${idx}-${Date.now()}`,
        name,
        type,
        pageIndex: 0,
        x: 60,
        y: 100 + idx * 40,
        width: type === "checkbox" || type === "radio" ? 20 : 180,
        height: type === "checkbox" || type === "radio" ? 20 : 28,
        value: val,
        defaultValue: val,
      });
    });

    return extracted;
  } catch (err) {
    console.warn("No AcroForms or failed to parse form fields:", err);
    return [];
  }
}

export interface SearchMatch {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

/**
 * Searches PDF pages for query string occurrences using pdfjs text content
 */
export async function searchPdfText(
  rawPdfDoc: any,
  query: string
): Promise<SearchMatch[]> {
  if (!rawPdfDoc || !query.trim()) return [];

  const matches: SearchMatch[] = [];
  const cleanQuery = query.toLowerCase();
  const numPages = rawPdfDoc.numPages;

  for (let p = 1; p <= numPages; p++) {
    const page = await rawPdfDoc.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      if (!("str" in item)) continue;
      const str = item.str.toLowerCase();
      if (str.includes(cleanQuery)) {
        // transform is [scaleX, skewY, skewX, scaleY, tx, ty]
        const tx = item.transform[4];
        const ty = item.transform[5];
        const itemWidth = item.width || 60;
        const itemHeight = item.height || 14;

        // In PDF coordinate space, ty is from bottom. Convert to browser top-left:
        const x = tx;
        const y = viewport.height - ty - itemHeight;

        matches.push({
          pageIndex: p - 1,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: Math.max(20, itemWidth),
          height: Math.max(12, itemHeight + 4),
          text: item.str,
        });
      }
    }
  }

  return matches;
}

/**
 * Serialize form values to JSON string
 */
export function serializeFormDataToJson(fields: import("./types").FormFieldDef[]): string {
  const data: Record<string, any> = {};
  fields.forEach((f) => {
    data[f.name] = f.value !== undefined ? f.value : f.defaultValue || "";
  });
  return JSON.stringify(data, null, 2);
}

/**
 * Export form values to JSON file download
 */
export function exportFormDataToJson(
  fields: import("./types").FormFieldDef[],
  documentName: string
) {
  const jsonStr = serializeFormDataToJson(fields);
  if (typeof window === "undefined" || !document?.createElement) return;

  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${documentName.replace(/\.pdf$/i, "")}-form-data.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Serialize form values to standard Adobe FDF string
 */
export function serializeFormDataToFdf(
  fields: import("./types").FormFieldDef[],
  documentName: string
): string {
  let fdf = "%FDF-1.2\n%\n1 0 obj\n<<\n/FDF <<\n/Fields [\n";
  fields.forEach((f) => {
    const val = f.value !== undefined ? String(f.value) : String(f.defaultValue || "");
    fdf += `<< /T (${f.name}) /V (${val.replace(/[()]/g, "")}) >>\n`;
  });
  fdf += `]\n/F (${documentName})\n>>\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF\n`;
  return fdf;
}

/**
 * Export form values to standard Adobe FDF (Forms Data Format)
 */
export function exportFormDataToFdf(
  fields: import("./types").FormFieldDef[],
  documentName: string
) {
  const fdf = serializeFormDataToFdf(fields, documentName);
  if (typeof window === "undefined" || !document?.createElement) return;

  const blob = new Blob([fdf], { type: "application/vnd.fdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${documentName.replace(/\.pdf$/i, "")}.fdf`;
  link.click();
  URL.revokeObjectURL(url);
}

