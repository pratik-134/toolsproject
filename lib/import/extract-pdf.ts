import { ExtractionResult } from "./types";

interface ItemWithPos {
  text: string;
  x: number;
  y: number;
  width: number;
}

/**
 * Extracts text from a PDF file locally in the browser memory using pdfjs-dist.
 * Preserves reading order by sorting text fragments by Y (descending) and X (ascending).
 */
export async function extractTextFromPdf(file: File): Promise<ExtractionResult> {
  const pdfjsLib = await import("pdfjs-dist");

  // Configure worker in client browser environment
  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    } catch {
      // Fallback CDN if local static asset fails
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }
  }

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (err: any) {
    throw new Error("Unable to read the uploaded PDF file from memory.");
  }

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const pageCount = pdfDocument.numPages;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      const items: ItemWithPos[] = [];

      for (const item of textContent.items as any[]) {
        if (!item || typeof item.str !== "string") continue;
        const text = item.str;
        if (!text && !item.hasEOL) continue;

        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const x = transform[4] || 0;
        const y = transform[5] || 0;
        const width = item.width || 0;

        items.push({ text, x, y, width });
      }

      if (items.length === 0) {
        continue;
      }

      // Sort items by Y descending (top to bottom), then by X ascending (left to right)
      // Note: PDF coordinate system (0,0) is bottom-left, so larger Y is higher up on the page.
      const LINE_TOLERANCE = 4.0; // Points tolerance to consider items on the same line

      // Group items into lines
      // First sort roughly by Y descending
      items.sort((a, b) => b.y - a.y);

      const lines: ItemWithPos[][] = [];
      let currentLine: ItemWithPos[] = [];
      let currentLineY: number | null = null;

      for (const item of items) {
        if (currentLineY === null) {
          currentLine = [item];
          currentLineY = item.y;
        } else if (Math.abs(item.y - currentLineY) <= LINE_TOLERANCE) {
          currentLine.push(item);
        } else {
          // Sort the completed line left to right by X
          currentLine.sort((a, b) => a.x - b.x);
          lines.push(currentLine);
          currentLine = [item];
          currentLineY = item.y;
        }
      }

      if (currentLine.length > 0) {
        currentLine.sort((a, b) => a.x - b.x);
        lines.push(currentLine);
      }

      // Assemble lines into text
      const pageLines: string[] = [];
      for (const line of lines) {
        let lineStr = "";
        let prevRight = 0;

        for (const item of line) {
          if (!lineStr) {
            lineStr = item.text;
          } else {
            // Check if space needed between items
            const spaceNeeded = item.x > prevRight + 2;
            const alreadyHasSpace = lineStr.endsWith(" ") || item.text.startsWith(" ");
            if (spaceNeeded && !alreadyHasSpace) {
              lineStr += " " + item.text;
            } else {
              lineStr += item.text;
            }
          }
          prevRight = item.x + item.width;
        }

        const trimmed = lineStr.trim();
        if (trimmed) {
          pageLines.push(trimmed);
        }
      }

      pageTexts.push(pageLines.join("\n"));
    }

    const fullText = pageTexts.join("\n\n").trim();

    // Check for scanned / image-only PDFs
    if (!fullText || fullText.length < 50) {
      throw new Error(
        "This PDF appears to be a scanned image or contains no selectable text. Qwertygen requires a text-based PDF or DOCX file."
      );
    }

    return {
      text: fullText,
      fileType: "pdf",
      fileName: file.name,
      fileSize: file.size,
      pageCount,
    };
  } catch (err: any) {
    if (
      err?.name === "PasswordException" ||
      /password/i.test(err?.message || "")
    ) {
      throw new Error(
        "This PDF is password-protected. Please remove the password or export an unprotected copy before uploading."
      );
    }

    // Re-throw our custom errors directly
    if (err?.message && err.message.includes("scanned image")) {
      throw err;
    }

    throw new Error(
      err?.message || "Could not read this PDF file. It may be corrupted or in an unsupported format."
    );
  }
}
