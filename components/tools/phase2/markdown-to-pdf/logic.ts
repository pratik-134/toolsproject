/**
 * Markdown to PDF — In-Browser Pure Logic
 * High-fidelity Markdown tokenizer, HTML styler, and PDF compilation engine.
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface MarkdownPdfOptions {
  title?: string;
  theme: "minimalist" | "technical" | "academic" | "corporate";
  pageSize: "a4" | "letter";
  margin: "normal" | "narrow" | "wide";
  includePageNumbers: boolean;
}

export interface ParsedBlock {
  type: "h1" | "h2" | "h3" | "p" | "ul" | "ol" | "blockquote" | "codeblock" | "hr";
  content: string;
  items?: string[];
}

/**
 * Pure Markdown Parser converts markdown syntax to structural blocks
 */
export function parseMarkdownBlocks(markdown: string): ParsedBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: ParsedBlock[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  let inList = false;
  let listType: "ul" | "ol" = "ul";
  let listItems: string[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      blocks.push({
        type: listType,
        content: "",
        items: [...listItems],
      });
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] ?? "";
    const trimmed = rawLine.trim();

    // Fenced Code Blocks (```)
    if (trimmed.startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        blocks.push({
          type: "codeblock",
          content: codeBuffer.join("\n"),
        });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Empty lines
    if (trimmed === "") {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      flushList();
      blocks.push({ type: "h1", content: trimmed.slice(2).trim() });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      blocks.push({ type: "h2", content: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push({ type: "h3", content: trimmed.slice(4).trim() });
      continue;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushList();
      blocks.push({ type: "hr", content: "" });
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith("> ")) {
      flushList();
      blocks.push({ type: "blockquote", content: trimmed.slice(2).trim() });
      continue;
    }

    // Unordered List (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList || listType !== "ul") {
        flushList();
        inList = true;
        listType = "ul";
      }
      listItems.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }

    // Ordered List (1. 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList || listType !== "ol") {
        flushList();
        inList = true;
        listType = "ol";
      }
      listItems.push(trimmed.replace(/^\d+\.\s+/, ""));
      continue;
    }

    // Regular Paragraph
    flushList();
    blocks.push({ type: "p", content: trimmed });
  }

  flushList();

  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push({ type: "codeblock", content: codeBuffer.join("\n") });
  }

  return blocks;
}

/**
 * Strip Markdown formatting (bold, italic, code) to plain text
 */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1") // Bold italic
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1") // Italic
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1") // Strikethrough
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Links
}

/**
 * Word wrap helper for PDF rendering
 */
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  charWidthEstimate: number = 0.55
): string[] {
  const approxCharWidth = fontSize * charWidthEstimate;
  const maxCharsPerLine = Math.max(10, Math.floor(maxWidth / approxCharWidth));

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!word) continue;
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [""];
}

/**
 * Compile Markdown text into a clean vector PDF document using pdf-lib
 */
export async function compileMarkdownToPdf(
  markdown: string,
  options: MarkdownPdfOptions = {
    theme: "minimalist",
    pageSize: "a4",
    margin: "normal",
    includePageNumbers: true,
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Page dimensions (points)
  const isA4 = options.pageSize === "a4";
  const pageWidth = isA4 ? 595.28 : 612.0;
  const pageHeight = isA4 ? 841.89 : 792.0;

  // Margin
  const marginPt =
    options.margin === "narrow" ? 36 : options.margin === "wide" ? 72 : 54;
  const printableWidth = pageWidth - marginPt * 2;

  // Embed standard typography
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

  // Theme Color Palettes
  let primaryColor = rgb(0.06, 0.09, 0.16); // Slate 900
  let accentColor = rgb(0.15, 0.39, 0.92); // Blue 600
  let bodyColor = rgb(0.2, 0.25, 0.33); // Slate 700

  if (options.theme === "technical") {
    accentColor = rgb(0.01, 0.53, 0.44); // Teal
  } else if (options.theme === "academic") {
    accentColor = rgb(0.55, 0.15, 0.15); // Crimson
  } else if (options.theme === "corporate") {
    accentColor = rgb(0.12, 0.23, 0.54); // Navy
  }

  const blocks = parseMarkdownBlocks(markdown);

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - marginPt;

  const checkPageOverflow = (neededHeight: number) => {
    if (currentY - neededHeight < marginPt + 20) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - marginPt;
    }
  };

  for (const block of blocks) {
    if (block.type === "h1") {
      const clean = stripInlineMarkdown(block.content);
      const fontSize = 22;
      const lines = wrapText(clean, printableWidth, fontSize, 0.6);
      checkPageOverflow(lines.length * 28 + 14);

      for (const line of lines) {
        currentPage.drawText(line, {
          x: marginPt,
          y: currentY - fontSize,
          size: fontSize,
          font: boldFont,
          color: primaryColor,
        });
        currentY -= 28;
      }
      currentY -= 10;
    } else if (block.type === "h2") {
      const clean = stripInlineMarkdown(block.content);
      const fontSize = 16;
      const lines = wrapText(clean, printableWidth, fontSize, 0.6);
      checkPageOverflow(lines.length * 22 + 10);

      for (const line of lines) {
        currentPage.drawText(line, {
          x: marginPt,
          y: currentY - fontSize,
          size: fontSize,
          font: boldFont,
          color: accentColor,
        });
        currentY -= 22;
      }
      currentY -= 6;
    } else if (block.type === "h3") {
      const clean = stripInlineMarkdown(block.content);
      const fontSize = 13;
      const lines = wrapText(clean, printableWidth, fontSize, 0.6);
      checkPageOverflow(lines.length * 18 + 8);

      for (const line of lines) {
        currentPage.drawText(line, {
          x: marginPt,
          y: currentY - fontSize,
          size: fontSize,
          font: boldFont,
          color: primaryColor,
        });
        currentY -= 18;
      }
      currentY -= 4;
    } else if (block.type === "hr") {
      checkPageOverflow(16);
      currentPage.drawLine({
        start: { x: marginPt, y: currentY - 6 },
        end: { x: pageWidth - marginPt, y: currentY - 6 },
        thickness: 1,
        color: rgb(0.85, 0.88, 0.92),
      });
      currentY -= 18;
    } else if (block.type === "blockquote") {
      const clean = stripInlineMarkdown(block.content);
      const fontSize = 10;
      const lines = wrapText(clean, printableWidth - 20, fontSize, 0.55);
      const blockHeight = lines.length * 15 + 8;
      checkPageOverflow(blockHeight + 6);

      // Draw quote border rule
      currentPage.drawLine({
        start: { x: marginPt + 2, y: currentY },
        end: { x: marginPt + 2, y: currentY - blockHeight },
        thickness: 3,
        color: accentColor,
      });

      for (const line of lines) {
        currentPage.drawText(line, {
          x: marginPt + 14,
          y: currentY - fontSize - 2,
          size: fontSize,
          font: regularFont,
          color: rgb(0.35, 0.4, 0.48),
        });
        currentY -= 15;
      }
      currentY -= 10;
    } else if (block.type === "codeblock") {
      const lines = block.content.split("\n");
      const fontSize = 9;
      const blockHeight = lines.length * 14 + 12;
      checkPageOverflow(blockHeight + 6);

      // Background rect
      currentPage.drawRectangle({
        x: marginPt,
        y: currentY - blockHeight,
        width: printableWidth,
        height: blockHeight,
        color: rgb(0.96, 0.97, 0.98),
        borderColor: rgb(0.88, 0.91, 0.94),
        borderWidth: 1,
      });

      let codeY = currentY - 12;
      for (const line of lines) {
        currentPage.drawText(line.slice(0, 80), {
          x: marginPt + 10,
          y: codeY - fontSize,
          size: fontSize,
          font: monoFont,
          color: rgb(0.12, 0.16, 0.22),
        });
        codeY -= 14;
      }
      currentY -= blockHeight + 12;
    } else if (block.type === "ul" || block.type === "ol") {
      const items = block.items ?? [];
      const fontSize = 10;

      for (let idx = 0; idx < items.length; idx++) {
        const itemText = stripInlineMarkdown(items[idx] ?? "");
        const bullet = block.type === "ul" ? "• " : `${idx + 1}. `;
        const lines = wrapText(itemText, printableWidth - 20, fontSize, 0.55);
        checkPageOverflow(lines.length * 15 + 4);

        currentPage.drawText(bullet, {
          x: marginPt + 6,
          y: currentY - fontSize,
          size: fontSize,
          font: boldFont,
          color: accentColor,
        });

        for (let l = 0; l < lines.length; l++) {
          currentPage.drawText(lines[l] ?? "", {
            x: marginPt + 22,
            y: currentY - fontSize,
            size: fontSize,
            font: regularFont,
            color: bodyColor,
          });
          currentY -= 15;
        }
      }
      currentY -= 6;
    } else {
      // Paragraph
      const clean = stripInlineMarkdown(block.content);
      const fontSize = 10.5;
      const lines = wrapText(clean, printableWidth, fontSize, 0.55);
      checkPageOverflow(lines.length * 16 + 6);

      for (const line of lines) {
        currentPage.drawText(line, {
          x: marginPt,
          y: currentY - fontSize,
          size: fontSize,
          font: regularFont,
          color: bodyColor,
        });
        currentY -= 16;
      }
      currentY -= 8;
    }
  }

  // Draw page numbers if enabled
  if (options.includePageNumbers) {
    const totalPages = pdfDoc.getPageCount();
    for (let p = 0; p < totalPages; p++) {
      const page = pdfDoc.getPage(p);
      const text = `Page ${p + 1} of ${totalPages}`;
      page.drawText(text, {
        x: pageWidth / 2 - 25,
        y: marginPt / 2,
        size: 9,
        font: regularFont,
        color: rgb(0.55, 0.6, 0.68),
      });
    }
  }

  return await pdfDoc.save();
}
