import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from "docx";
import * as pdfjsLib from "pdfjs-dist";

// Ensure worker is configured safely in browser without breaking Node
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  } catch {
    // ignore
  }
}

export interface ExtractedPdfBlock {
  type: "heading1" | "heading2" | "heading3" | "paragraph" | "bullet";
  text: string;
  pageNumber: number;
}

export interface PdfToDocxOptions {
  title?: string;
  detectHeadings?: boolean;
  detectBullets?: boolean;
  fontFamily?: string; // e.g. "Calibri", "Arial", "Times New Roman"
  fontSizeHalfPoints?: number; // 22 = 11pt, 24 = 12pt
}

/**
 * Parses a PDF buffer and extracts text structured into lines and paragraphs
 */
export async function extractTextBlocksFromPdf(
  pdfData: Uint8Array | ArrayBuffer
): Promise<ExtractedPdfBlock[]> {
  let data: Uint8Array;
  if (pdfData instanceof Uint8Array) {
    data = new Uint8Array(pdfData.buffer.slice(pdfData.byteOffset, pdfData.byteOffset + pdfData.byteLength));
  } else {
    data = new Uint8Array(pdfData.slice(0));
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const blocks: ExtractedPdfBlock[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    interface PositionItem {
      text: string;
      x: number;
      y: number;
      fontSize: number;
    }

    const items: PositionItem[] = [];

    for (const rawItem of textContent.items as any[]) {
      if (!rawItem || typeof rawItem.str !== "string") continue;
      const str = rawItem.str.trim();
      if (!str) continue;

      const transform = rawItem.transform || [1, 0, 0, 1, 0, 0];
      const x = transform[4] || 0;
      const y = transform[5] || 0;
      const fontSize = Math.abs(transform[0] || transform[3] || 10);

      items.push({ text: str, x, y, fontSize });
    }

    // Sort items top-to-bottom (Y desc) then left-to-right (X asc)
    items.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 4) {
        return b.y - a.y;
      }
      return a.x - b.x;
    });

    // Group items into lines
    const lineGroups: PositionItem[][] = [];
    let currentLine: PositionItem[] = [];
    let currentLineY: number | null = null;

    for (const it of items) {
      if (currentLineY === null) {
        currentLine = [it];
        currentLineY = it.y;
      } else if (Math.abs(it.y - currentLineY) <= 4) {
        currentLine.push(it);
      } else {
        lineGroups.push(currentLine);
        currentLine = [it];
        currentLineY = it.y;
      }
    }
    if (currentLine.length > 0) {
      lineGroups.push(currentLine);
    }

    // Process line groups into text blocks
    for (const group of lineGroups) {
      const lineText = group.map((i) => i.text).join(" ").trim();
      if (!lineText) continue;

      const maxFontSize = Math.max(...group.map((i) => i.fontSize));

      if (maxFontSize >= 18 || (lineText.length < 50 && lineText === lineText.toUpperCase() && /[A-Z]/.test(lineText))) {
        blocks.push({ type: "heading1", text: lineText, pageNumber: pageNum });
      } else if (maxFontSize >= 14) {
        blocks.push({ type: "heading2", text: lineText, pageNumber: pageNum });
      } else if (lineText.startsWith("•") || lineText.startsWith("-") || lineText.startsWith("*")) {
        blocks.push({
          type: "bullet",
          text: lineText.replace(/^[•\-\*]\s*/, ""),
          pageNumber: pageNum,
        });
      } else {
        blocks.push({ type: "paragraph", text: lineText, pageNumber: pageNum });
      }
    }
  }

  return blocks;
}

/**
 * Builds a Microsoft Word DOCX document from extracted PDF blocks
 */
export async function createDocxFromBlocks(
  blocks: ExtractedPdfBlock[],
  options: PdfToDocxOptions = {}
): Promise<Uint8Array> {
  const font = options.fontFamily ?? "Calibri";
  const fontSize = options.fontSizeHalfPoints ?? 22; // 11pt = 22 half-pts
  const paragraphs: Paragraph[] = [];

  // Optional Document Title
  if (options.title) {
    paragraphs.push(
      new Paragraph({
        text: options.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  for (const block of blocks) {
    if (block.type === "heading1") {
      paragraphs.push(
        new Paragraph({
          text: block.text,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (block.type === "heading2") {
      paragraphs.push(
        new Paragraph({
          text: block.text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
        })
      );
    } else if (block.type === "heading3") {
      paragraphs.push(
        new Paragraph({
          text: block.text,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 120, after: 60 },
        })
      );
    } else if (block.type === "bullet") {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: block.text,
              font,
              size: fontSize,
            }),
          ],
          bullet: { level: 0 },
          spacing: { after: 60 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: block.text,
              font,
              size: fontSize,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }
  }

  // Create docx document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: "Empty document" })],
      },
    ],
  });

  const arrayBuffer = await Packer.toArrayBuffer(doc);
  return new Uint8Array(arrayBuffer);
}

/**
 * Full end-to-end conversion from PDF buffer to DOCX Uint8Array
 */
export async function convertPdfToDocx(
  pdfData: Uint8Array | ArrayBuffer,
  options: PdfToDocxOptions = {}
): Promise<{ docxBytes: Uint8Array; blocks: ExtractedPdfBlock[] }> {
  const blocks = await extractTextBlocksFromPdf(pdfData);
  const docxBytes = await createDocxFromBlocks(blocks, options);
  return { docxBytes, blocks };
}

export const SAMPLE_PDF_PARAGRAPHS: ExtractedPdfBlock[] = [
  { type: "heading1", text: "QWERTYGEN ENTERPRISE ARCHITECTURE", pageNumber: 1 },
  { type: "heading2", text: "Section 1: In-Browser Execution", pageNumber: 1 },
  {
    type: "paragraph",
    text: "Qwertygen processes all binary documents, PDFs, and spreadsheets locally inside your browser memory sandbox.",
    pageNumber: 1,
  },
  { type: "bullet", text: "Zero network telemetry or document transmission.", pageNumber: 1 },
  { type: "bullet", text: "Lossless vector generation using WebAssembly.", pageNumber: 1 },
  { type: "heading2", text: "Section 2: Microsoft Office Compatibility", pageNumber: 1 },
  {
    type: "paragraph",
    text: "The generated DOCX files conform to the OpenXML WordprocessingML standard, opening seamlessly in Microsoft Word, Google Docs, and LibreOffice.",
    pageNumber: 1,
  },
];
