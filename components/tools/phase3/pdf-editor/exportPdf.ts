import { PDFDocument, rgb, degrees, StandardFonts, PDFName, PDFDict, PDFArray, PDFNumber, PDFString } from "pdf-lib";
import {
  PageMeta,
  AnnotationObject,
  ContentElement,
  WatermarkConfig,
  PageNumberConfig,
  BatesConfig,
  HeaderFooterConfig,
  PageBackgroundConfig,
} from "./types";

function hexToRgb(hex?: string): { r: number; g: number; b: number } {
  if (!hex) return { r: 0, g: 0, b: 0 };
  const clean = hex.replace("#", "");
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16) / 255,
      g: parseInt(clean.substring(2, 4), 16) / 255,
      b: parseInt(clean.substring(4, 6), 16) / 255,
    };
  }
  return { r: 0, g: 0, b: 0 };
}

function base64ToUint8(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export interface ExportPdfOptions {
  sourcePdfBytes: Uint8Array;
  pages: PageMeta[];
  annotations: AnnotationObject[];
  elements: ContentElement[];
  watermark: WatermarkConfig | null;
  pageNumbering: PageNumberConfig | null;
  bates: BatesConfig | null;
  headerFooter: HeaderFooterConfig | null;
  pageBackground: PageBackgroundConfig | null;
}

/**
 * Compiles and bakes all page operations, annotations, content edits, and stamps
 * into a single clean PDF document using pdf-lib. 100% in-browser execution.
 */
export async function exportPdfDocument(options: ExportPdfOptions): Promise<Uint8Array> {
  const {
    sourcePdfBytes,
    pages,
    annotations,
    elements,
    watermark,
    pageNumbering,
    bates,
    headerFooter,
    pageBackground,
  } = options;

  // Load the source PDF for extracting pages
  const sourceDoc = await PDFDocument.load(sourcePdfBytes);
  const outputDoc = await PDFDocument.create();

  // Pre-embed standard fonts to ensure zero runtime shift
  const fontHelvetica = await outputDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await outputDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimes = await outputDoc.embedFont(StandardFonts.TimesRoman);
  const fontCourier = await outputDoc.embedFont(StandardFonts.Courier);

  const getFont = (family?: string) => {
    switch (family) {
      case "Helvetica-Bold":
        return fontHelveticaBold;
      case "Times-Roman":
        return fontTimes;
      case "Courier":
        return fontCourier;
      case "Helvetica":
      default:
        return fontHelvetica;
    }
  };

  // Image cache to prevent duplicate embedding
  const embeddedImages = new Map<string, any>();

  // Assemble target pages in current ordered list
  for (let i = 0; i < pages.length; i++) {
    const pageMeta = pages[i];
    if (!pageMeta) continue;
    let page: any;

    if (pageMeta.originalIndex >= 0 && pageMeta.originalIndex < sourceDoc.getPageCount()) {
      const [copiedPage] = await outputDoc.copyPages(sourceDoc, [pageMeta.originalIndex]);
      page = outputDoc.addPage(copiedPage);
    } else {
      // Inserted blank page
      page = outputDoc.addPage([pageMeta.width || 595.28, pageMeta.height || 841.89]);
    }

    const { width: pWidth, height: pHeight } = page.getSize();

    // 1. Page Rotation
    if (pageMeta.rotation !== undefined) {
      page.setRotation(degrees(pageMeta.rotation));
    }

    // 2. Page Crop Box
    if (pageMeta.cropBox) {
      const cb = pageMeta.cropBox;
      page.setCropBox(cb.x, pHeight - cb.y - cb.height, cb.width, cb.height);
    }

    // 3. Background Color (if applied)
    if (pageBackground && pageBackground.enabled && pageBackground.color) {
      const { r, g, b } = hexToRgb(pageBackground.color);
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pWidth,
        height: pHeight,
        color: rgb(r, g, b),
        opacity: 0.25,
      });
    }

    // 4. Whiteout Elements first (so they cover existing text before new annotations/content)
    const pageElements = elements.filter((el) => el.pageIndex === i);
    const whiteouts = pageElements.filter((el) => el.type === "whiteout");
    for (const w of whiteouts) {
      const { r, g, b } = hexToRgb(w.backgroundColor || "#ffffff");
      page.drawRectangle({
        x: w.x,
        y: pHeight - w.y - w.height,
        width: w.width,
        height: w.height,
        color: rgb(r, g, b),
        opacity: 1,
      });
    }

    // 5. Annotations for this page
    const pageAnns = annotations.filter((ann) => ann.pageIndex === i);
    for (const ann of pageAnns) {
      const { r, g, b } = hexToRgb(ann.color);
      const alpha = ann.opacity ?? 1;

      switch (ann.type) {
        case "highlight": {
          page.drawRectangle({
            x: ann.x,
            y: pHeight - ann.y - ann.height,
            width: ann.width,
            height: ann.height,
            color: rgb(r, g, b),
            opacity: 0.45,
          });
          break;
        }

        case "underline": {
          page.drawLine({
            start: { x: ann.x, y: pHeight - ann.y - ann.height },
            end: { x: ann.x + ann.width, y: pHeight - ann.y - ann.height },
            thickness: ann.strokeWidth || 1.5,
            color: rgb(r, g, b),
            opacity: alpha,
          });
          break;
        }

        case "strikethrough": {
          const midY = pHeight - ann.y - ann.height / 2;
          page.drawLine({
            start: { x: ann.x, y: midY },
            end: { x: ann.x + ann.width, y: midY },
            thickness: ann.strokeWidth || 1.5,
            color: rgb(r, g, b),
            opacity: alpha,
          });
          break;
        }

        case "squiggly": {
          const startX = ann.x;
          const endX = ann.x + ann.width;
          const baseY = pHeight - ann.y - ann.height;
          const waveLen = 4;
          const waveHeight = 2;
          let curX = startX;
          let up = true;

          while (curX < endX) {
            const nextX = Math.min(curX + waveLen, endX);
            const nextY = up ? baseY + waveHeight : baseY - waveHeight;
            page.drawLine({
              start: { x: curX, y: up ? baseY - waveHeight : baseY + waveHeight },
              end: { x: nextX, y: nextY },
              thickness: ann.strokeWidth || 1.2,
              color: rgb(r, g, b),
              opacity: alpha,
            });
            curX = nextX;
            up = !up;
          }
          break;
        }

        case "freehand": {
          if (ann.points && ann.points.length > 1) {
            for (let pIdx = 0; pIdx < ann.points.length - 1; pIdx++) {
              const p1 = ann.points[pIdx];
              const p2 = ann.points[pIdx + 1];
              if (!p1 || !p2) continue;
              page.drawLine({
                start: { x: p1.x, y: pHeight - p1.y },
                end: { x: p2.x, y: pHeight - p2.y },
                thickness: ann.strokeWidth || 2,
                color: rgb(r, g, b),
                opacity: alpha,
              });
            }
          }
          break;
        }

        case "shape-rect": {
          const fill = ann.fillColor ? hexToRgb(ann.fillColor) : undefined;
          page.drawRectangle({
            x: ann.x,
            y: pHeight - ann.y - ann.height,
            width: ann.width,
            height: ann.height,
            borderColor: rgb(r, g, b),
            borderWidth: ann.strokeWidth || 2,
            color: fill ? rgb(fill.r, fill.g, fill.b) : undefined,
            opacity: alpha,
          });
          break;
        }

        case "shape-circle": {
          const rx = ann.width / 2;
          const ry = ann.height / 2;
          const cx = ann.x + rx;
          const cy = pHeight - ann.y - ry;
          const fill = ann.fillColor ? hexToRgb(ann.fillColor) : undefined;
          page.drawEllipse({
            x: cx,
            y: cy,
            xScale: rx,
            yScale: ry,
            borderColor: rgb(r, g, b),
            borderWidth: ann.strokeWidth || 2,
            color: fill ? rgb(fill.r, fill.g, fill.b) : undefined,
            opacity: alpha,
          });
          break;
        }

        case "line": {
          page.drawLine({
            start: { x: ann.x, y: pHeight - ann.y },
            end: { x: ann.x + ann.width, y: pHeight - (ann.y + ann.height) },
            thickness: ann.strokeWidth || 2,
            color: rgb(r, g, b),
            opacity: alpha,
          });
          break;
        }

        case "arrow": {
          const startPt = { x: ann.x, y: pHeight - ann.y };
          const endPt = { x: ann.x + ann.width, y: pHeight - (ann.y + ann.height) };
          page.drawLine({
            start: startPt,
            end: endPt,
            thickness: ann.strokeWidth || 2,
            color: rgb(r, g, b),
            opacity: alpha,
          });

          // Draw arrowhead at endPt
          const angle = Math.atan2(endPt.y - startPt.y, endPt.x - startPt.x);
          const headLength = 10;
          const arrowAngle = Math.PI / 6;

          page.drawLine({
            start: endPt,
            end: {
              x: endPt.x - headLength * Math.cos(angle - arrowAngle),
              y: endPt.y - headLength * Math.sin(angle - arrowAngle),
            },
            thickness: ann.strokeWidth || 2,
            color: rgb(r, g, b),
            opacity: alpha,
          });
          page.drawLine({
            start: endPt,
            end: {
              x: endPt.x - headLength * Math.cos(angle + arrowAngle),
              y: endPt.y - headLength * Math.sin(angle + arrowAngle),
            },
            thickness: ann.strokeWidth || 2,
            color: rgb(r, g, b),
            opacity: alpha,
          });
          break;
        }

        case "sticky-note": {
          // Visual note badge icon
          page.drawRectangle({
            x: ann.x,
            y: pHeight - ann.y - 24,
            width: 24,
            height: 24,
            color: rgb(1, 0.9, 0.3),
            borderColor: rgb(0.85, 0.7, 0.1),
            borderWidth: 1,
          });
          page.drawText("?", {
            x: ann.x + 8,
            y: pHeight - ann.y - 18,
            size: 14,
            font: fontHelveticaBold,
            color: rgb(0.2, 0.2, 0.2),
          });
          break;
        }

        case "stamp": {
          const stampText = ann.text || "APPROVED";
          const fontSize = 14;
          const stampWidth = ann.width || 120;
          const stampHeight = ann.height || 36;
          page.drawRectangle({
            x: ann.x,
            y: pHeight - ann.y - stampHeight,
            width: stampWidth,
            height: stampHeight,
            borderColor: rgb(r, g, b),
            borderWidth: 2,
            color: rgb(r, g, b),
            opacity: 0.15,
          });

          const tw = fontHelveticaBold.widthOfTextAtSize(stampText, fontSize);
          page.drawText(stampText, {
            x: ann.x + (stampWidth - tw) / 2,
            y: pHeight - ann.y - stampHeight / 2 - fontSize / 3,
            size: fontSize,
            font: fontHelveticaBold,
            color: rgb(r, g, b),
            opacity: alpha,
          });
          break;
        }
      }
    }

    // 6. Content Elements (Text, Image, Signature, Initials, Date, Link)
    const contentElements = pageElements.filter((el) => el.type !== "whiteout");
    for (const el of contentElements) {
      if (el.type === "text" || el.type === "date" || el.type === "initials" || el.type === "link") {
        const text = el.text || (el.type === "date" ? new Date().toISOString().split("T")[0] : "");
        if (text) {
          const font = getFont(el.fontFamily);
          const fontSize = el.fontSize || 12;
          const { r, g, b } = hexToRgb(el.color || "#000000");

          // Draw background if specified
          if (el.backgroundColor) {
            const bgRgb = hexToRgb(el.backgroundColor);
            page.drawRectangle({
              x: el.x,
              y: pHeight - el.y - (el.height || fontSize + 6),
              width: el.width || font.widthOfTextAtSize(text, fontSize) + 8,
              height: el.height || fontSize + 6,
              color: rgb(bgRgb.r, bgRgb.g, bgRgb.b),
            });
          }

          // Render multiline if text contains newlines
          const lines = text.split("\n");
          lines.forEach((line, lineIdx) => {
            page.drawText(line, {
              x: el.x + 2,
              y: pHeight - el.y - fontSize * 1.15 * (lineIdx + 1),
              size: fontSize,
              font,
              color: rgb(r, g, b),
            });
          });

          // If link, add subtle underline
          if (el.type === "link") {
            const tw = font.widthOfTextAtSize(text, fontSize);
            page.drawLine({
              start: { x: el.x + 2, y: pHeight - el.y - fontSize * 1.25 },
              end: { x: el.x + 2 + tw, y: pHeight - el.y - fontSize * 1.25 },
              thickness: 1,
              color: rgb(r, g, b),
            });
          }
        }
      } else if (el.type === "image" || el.type === "signature") {
        if (el.imageDataUrl) {
          try {
            let embeddedImg = embeddedImages.get(el.imageDataUrl);
            if (!embeddedImg) {
              const parts = el.imageDataUrl.split(",");
              const header = parts[0] || "";
              const base64 = parts[1] || "";
              const imgBytes = base64ToUint8(base64);
              if (header.includes("image/png") || header.includes("image/webp")) {
                embeddedImg = await outputDoc.embedPng(imgBytes);
              } else {
                embeddedImg = await outputDoc.embedJpg(imgBytes);
              }
              embeddedImages.set(el.imageDataUrl, embeddedImg);
            }

            page.drawImage(embeddedImg, {
              x: el.x,
              y: pHeight - el.y - el.height,
              width: el.width,
              height: el.height,
            });
          } catch (imgErr) {
            console.warn("Failed to embed image element:", imgErr);
          }
        }
      }
    }

    // 7. Global Header and Footer
    if (headerFooter && headerFooter.enabled) {
      const hfFont = fontHelvetica;
      const hfSize = headerFooter.fontSize || 9;
      const { r, g, b } = hexToRgb(headerFooter.color || "#6b7280");

      if (headerFooter.headerText) {
        page.drawText(headerFooter.headerText, {
          x: 40,
          y: pHeight - 25,
          size: hfSize,
          font: hfFont,
          color: rgb(r, g, b),
        });
      }

      if (headerFooter.footerText) {
        page.drawText(headerFooter.footerText, {
          x: 40,
          y: 20,
          size: hfSize,
          font: hfFont,
          color: rgb(r, g, b),
        });
      }
    }

    // 8. Global Watermark
    if (watermark && watermark.enabled && watermark.text) {
      const wmText = watermark.text;
      const wmSize = watermark.fontSize || 48;
      const { r, g, b } = hexToRgb(watermark.color || "#94a3b8");
      const alpha = watermark.opacity || 0.2;
      const rot = watermark.rotation || 45;

      const tw = fontHelveticaBold.widthOfTextAtSize(wmText, wmSize);
      page.drawText(wmText, {
        x: pWidth / 2 - (tw / 2) * Math.cos((rot * Math.PI) / 180),
        y: pHeight / 2 - (tw / 2) * Math.sin((rot * Math.PI) / 180),
        size: wmSize,
        font: fontHelveticaBold,
        color: rgb(r, g, b),
        opacity: alpha,
        rotate: degrees(rot),
      });
    }

    // 9. Page Numbering
    if (pageNumbering && pageNumbering.enabled) {
      const pnFont = fontHelvetica;
      const pnSize = pageNumbering.fontSize || 9;
      const { r, g, b } = hexToRgb(pageNumbering.color || "#4b5563");

      let pnStr = `${i + 1}`;
      if (pageNumbering.format === "page") {
        pnStr = `Page ${i + 1}`;
      } else if (pageNumbering.format === "page-of-total") {
        pnStr = `Page ${i + 1} of ${pages.length}`;
      }

      const ptw = pnFont.widthOfTextAtSize(pnStr, pnSize);
      let pX = pWidth / 2 - ptw / 2;
      let pY = 25;

      switch (pageNumbering.position) {
        case "top-left":
          pX = 40;
          pY = pHeight - 25;
          break;
        case "top-center":
          pX = pWidth / 2 - ptw / 2;
          pY = pHeight - 25;
          break;
        case "top-right":
          pX = pWidth - 40 - ptw;
          pY = pHeight - 25;
          break;
        case "bottom-left":
          pX = 40;
          pY = 25;
          break;
        case "bottom-center":
          pX = pWidth / 2 - ptw / 2;
          pY = 25;
          break;
        case "bottom-right":
          pX = pWidth - 40 - ptw;
          pY = 25;
          break;
      }

      page.drawText(pnStr, {
        x: pX,
        y: pY,
        size: pnSize,
        font: pnFont,
        color: rgb(r, g, b),
      });
    }

    // 10. Bates Stamping
    if (bates && bates.enabled) {
      const bFont = fontCourier;
      const bSize = 10;
      const numStr = String(bates.startNumber + i).padStart(bates.digits || 6, "0");
      const batesText = `${bates.prefix || ""}${numStr}${bates.suffix || ""}`;
      const btw = bFont.widthOfTextAtSize(batesText, bSize);

      let bX = pWidth - 40 - btw;
      let bY = 25;

      if (bates.position === "top-right") {
        bX = pWidth - 40 - btw;
        bY = pHeight - 25;
      } else if (bates.position === "bottom-left") {
        bX = 40;
        bY = 25;
      }

      page.drawText(batesText, {
        x: bX,
        y: bY,
        size: bSize,
        font: bFont,
        color: rgb(0.2, 0.2, 0.25),
      });
    }
  }

  return await outputDoc.save();
}
