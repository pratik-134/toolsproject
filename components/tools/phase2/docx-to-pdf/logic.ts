import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import mammoth from "mammoth";

export interface DocxToPdfOptions {
  pageSize?: "letter" | "a4";
  fontSize?: number; // 10, 11, 12
  lineHeight?: number; // 1.2, 1.4, 1.6
  headerTitle?: string;
  includePageNumbers?: boolean;
  accentColorHex?: string; // hex without #
}

export interface ParsedBlock {
  type: "heading1" | "heading2" | "heading3" | "paragraph" | "bullet";
  text: string;
}

/**
 * Extracts structured blocks (headings, paragraphs, bullets) from raw text or HTML
 */
export function extractStructuredBlocks(text: string): ParsedBlock[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const blocks: ParsedBlock[] = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      blocks.push({ type: "heading1", text: line.replace(/^#\s*/, "") });
    } else if (line.startsWith("## ")) {
      blocks.push({ type: "heading2", text: line.replace(/^##\s*/, "") });
    } else if (line.startsWith("### ")) {
      blocks.push({ type: "heading3", text: line.replace(/^###\s*/, "") });
    } else if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      blocks.push({ type: "bullet", text: line.replace(/^[•\-\*]\s*/, "") });
    } else if (line.length < 60 && line.toUpperCase() === line && /[A-Z]/.test(line)) {
      // All-caps short line treated as heading
      blocks.push({ type: "heading2", text: line });
    } else {
      blocks.push({ type: "paragraph", text: line });
    }
  }

  return blocks;
}

/**
 * Parses a DOCX ArrayBuffer into raw text and structured blocks using mammoth
 */
export async function parseDocxBuffer(arrayBuffer: ArrayBuffer): Promise<{
  rawText: string;
  blocks: ParsedBlock[];
}> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    const rawText = result.value || "";
    const blocks = extractStructuredBlocks(rawText);
    return { rawText, blocks };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse DOCX file";
    throw new Error(message);
  }
}

/**
 * Helper to split text into lines that fit within a maximum width
 */
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

/**
 * Converts structured blocks into a formatted vector PDF document
 */
export async function convertBlocksToPdf(
  blocks: ParsedBlock[],
  options: DocxToPdfOptions = {}
): Promise<Uint8Array> {
  const pageSize = options.pageSize ?? "letter";
  const baseFontSize = options.fontSize ?? 11;
  const lineHeightRatio = options.lineHeight ?? 1.4;
  const headerTitle = options.headerTitle ?? "";
  const includePageNumbers = options.includePageNumbers ?? true;
  const accentHex = options.accentColorHex ?? "2563EB";

  // Parse accent color hex
  const r = parseInt(accentHex.substring(0, 2), 16) / 255;
  const g = parseInt(accentHex.substring(2, 4), 16) / 255;
  const b = parseInt(accentHex.substring(4, 6), 16) / 255;
  const accentColor = rgb(isNaN(r) ? 0.15 : r, isNaN(g) ? 0.39 : g, isNaN(b) ? 0.92 : b);

  // Dimensions in points (72 points = 1 inch)
  const pageWidth = pageSize === "a4" ? 595.28 : 612;
  const pageHeight = pageSize === "a4" ? 841.89 : 792;
  const margin = 54; // 0.75 in
  const contentWidth = pageWidth - margin * 2;
  const topMargin = headerTitle ? 72 : 54;
  const bottomMargin = includePageNumbers ? 54 : 40;

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - topMargin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY - neededHeight < bottomMargin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - topMargin;
    }
  };

  for (const block of blocks) {
    if (block.type === "heading1") {
      const headingFontSize = baseFontSize + 7;
      const headingLineHeight = headingFontSize * 1.3;
      checkPageBreak(headingLineHeight + 16);
      currentY -= 12;

      const wrapped = wrapText(block.text, contentWidth, fontBold, headingFontSize);
      for (const line of wrapped) {
        checkPageBreak(headingLineHeight);
        currentPage.drawText(line, {
          x: margin,
          y: currentY,
          size: headingFontSize,
          font: fontBold,
          color: accentColor,
        });
        currentY -= headingLineHeight;
      }
      currentY -= 6;
    } else if (block.type === "heading2") {
      const headingFontSize = baseFontSize + 4;
      const headingLineHeight = headingFontSize * 1.3;
      checkPageBreak(headingLineHeight + 12);
      currentY -= 8;

      const wrapped = wrapText(block.text, contentWidth, fontBold, headingFontSize);
      for (const line of wrapped) {
        checkPageBreak(headingLineHeight);
        currentPage.drawText(line, {
          x: margin,
          y: currentY,
          size: headingFontSize,
          font: fontBold,
          color: rgb(0.12, 0.16, 0.22),
        });
        currentY -= headingLineHeight;
      }
      currentY -= 4;
    } else if (block.type === "heading3") {
      const headingFontSize = baseFontSize + 2;
      const headingLineHeight = headingFontSize * 1.3;
      checkPageBreak(headingLineHeight + 8);
      currentY -= 6;

      const wrapped = wrapText(block.text, contentWidth, fontBold, headingFontSize);
      for (const line of wrapped) {
        checkPageBreak(headingLineHeight);
        currentPage.drawText(line, {
          x: margin,
          y: currentY,
          size: headingFontSize,
          font: fontBold,
          color: rgb(0.2, 0.25, 0.3),
        });
        currentY -= headingLineHeight;
      }
      currentY -= 4;
    } else if (block.type === "bullet") {
      const bulletLineHeight = baseFontSize * lineHeightRatio;
      const bulletIndent = 16;
      const wrapped = wrapText(block.text, contentWidth - bulletIndent, fontRegular, baseFontSize);

      checkPageBreak(bulletLineHeight * wrapped.length + 4);

      // Draw bullet dot
      currentPage.drawText("•", {
        x: margin + 4,
        y: currentY,
        size: baseFontSize,
        font: fontBold,
        color: accentColor,
      });

      for (let i = 0; i < wrapped.length; i++) {
        const line = wrapped[i] ?? "";
        currentPage.drawText(line, {
          x: margin + bulletIndent,
          y: currentY,
          size: baseFontSize,
          font: fontRegular,
          color: rgb(0.18, 0.2, 0.24),
        });
        currentY -= bulletLineHeight;
      }
      currentY -= 4;
    } else {
      // Standard paragraph
      const paragraphLineHeight = baseFontSize * lineHeightRatio;
      const wrapped = wrapText(block.text, contentWidth, fontRegular, baseFontSize);

      checkPageBreak(paragraphLineHeight * wrapped.length + 6);

      for (const line of wrapped) {
        currentPage.drawText(line, {
          x: margin,
          y: currentY,
          size: baseFontSize,
          font: fontRegular,
          color: rgb(0.15, 0.18, 0.22),
        });
        currentY -= paragraphLineHeight;
      }
      currentY -= 8;
    }
  }

  // Draw Header and Footer on all pages
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);

    if (headerTitle) {
      page.drawText(headerTitle, {
        x: margin,
        y: pageHeight - 36,
        size: 9,
        font: fontItalic,
        color: rgb(0.45, 0.5, 0.55),
      });

      // Header thin rule
      page.drawLine({
        start: { x: margin, y: pageHeight - 42 },
        end: { x: pageWidth - margin, y: pageHeight - 42 },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.92),
      });
    }

    if (includePageNumbers) {
      const pageText = `Page ${i + 1} of ${totalPages}`;
      const pageTextWidth = fontRegular.widthOfTextAtSize(pageText, 9);
      page.drawText(pageText, {
        x: pageWidth - margin - pageTextWidth,
        y: 28,
        size: 9,
        font: fontRegular,
        color: rgb(0.45, 0.5, 0.55),
      });
    }
  }

  return await pdfDoc.save();
}

export const SAMPLE_DOCX_MARKDOWN = `# Executive Project Summary: Cleartrix Enterprise Suite
## Overview & Objectives
Cleartrix provides 100% in-browser, privacy-preserving tools designed for professionals and teams. All computations, media transformations, and document conversions execute exclusively within device memory.

## Key Architecture Principles
• Zero Server Data Transmission: Sensitive files, PDFs, and spreadsheets never leave browser RAM.
• Native Vector Rendering: Documents maintain 100% fidelity without rasterization loss.
• Fast Client-Side Performance: Built with WebAssembly, Web Workers, and modern TypeScript.

## Next Steps
1. Finalize Phase 2 document and security tool suite.
2. Prepare in-browser client Python WASM execution for mathematical and scientific computing.
3. Validate all cryptographic operations across Web Crypto and client memory sandboxes.`;
