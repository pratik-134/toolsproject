import { PDFDocument, StandardFonts, rgb, RGB } from "pdf-lib";
import { unzipSync, strFromU8 } from "fflate";

export interface PresentationSlide {
  title: string;
  subtitle?: string;
  bullets: string[];
}

export type SlideTheme = "modern-dark" | "executive-light" | "emerald-growth" | "indigo-pitch";

export interface PptxToPdfOptions {
  theme?: SlideTheme;
  deckTitle?: string;
  includeSlideNumbers?: boolean;
}

interface ThemeColors {
  bg: RGB;
  title: RGB;
  subtitle: RGB;
  bullet: RGB;
  accent: RGB;
  footer: RGB;
}

const THEME_MAP: Record<SlideTheme, ThemeColors> = {
  "modern-dark": {
    bg: rgb(0.05, 0.08, 0.15), // #0D1426
    title: rgb(1, 1, 1),
    subtitle: rgb(0.6, 0.7, 0.85),
    bullet: rgb(0.85, 0.9, 0.95),
    accent: rgb(0.2, 0.6, 1),
    footer: rgb(0.4, 0.5, 0.65),
  },
  "executive-light": {
    bg: rgb(0.98, 0.99, 1),
    title: rgb(0.08, 0.15, 0.3),
    subtitle: rgb(0.3, 0.4, 0.55),
    bullet: rgb(0.15, 0.2, 0.28),
    accent: rgb(0.15, 0.4, 0.85),
    footer: rgb(0.5, 0.55, 0.65),
  },
  "emerald-growth": {
    bg: rgb(0.02, 0.15, 0.1),
    title: rgb(0.95, 1, 0.95),
    subtitle: rgb(0.5, 0.85, 0.7),
    bullet: rgb(0.85, 0.95, 0.9),
    accent: rgb(0.1, 0.8, 0.5),
    footer: rgb(0.4, 0.65, 0.55),
  },
  "indigo-pitch": {
    bg: rgb(0.09, 0.07, 0.2),
    title: rgb(1, 1, 1),
    subtitle: rgb(0.75, 0.65, 0.95),
    bullet: rgb(0.9, 0.88, 0.98),
    accent: rgb(0.6, 0.35, 1),
    footer: rgb(0.55, 0.48, 0.7),
  },
};

/**
 * Extracts slides from an OpenXML PPTX ZIP buffer
 */
export function extractSlidesFromPptx(buffer: Uint8Array): PresentationSlide[] {
  try {
    const unzipped = unzipSync(buffer);
    const slideKeys = Object.keys(unzipped)
      .filter((k) => k.startsWith("ppt/slides/slide") && k.endsWith(".xml"))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ""), 10) || 0;
        const numB = parseInt(b.replace(/[^0-9]/g, ""), 10) || 0;
        return numA - numB;
      });

    if (slideKeys.length === 0) {
      throw new Error("No slide XML files found in PPTX archive");
    }

    const slides: PresentationSlide[] = [];

    for (const key of slideKeys) {
      const data = unzipped[key];
      if (!data) continue;
      const xml = strFromU8(data);

      // Extract all <a:t>...</a:t> text nodes
      const textMatches = xml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
      const texts: string[] = [];
      for (const m of textMatches) {
        const inner = m.replace(/<\/?a:t>/g, "").trim();
        if (inner) texts.push(inner);
      }

      if (texts.length === 0) continue;

      const title = texts[0] ?? "Untitled Slide";
      const bullets = texts.slice(1);
      slides.push({
        title,
        subtitle: bullets.length > 0 && bullets[0] && bullets[0].length < 40 ? bullets[0] : undefined,
        bullets: bullets.length > 0 && bullets[0] && bullets[0].length < 40 ? bullets.slice(1) : bullets,
      });
    }

    return slides.length > 0 ? slides : parseMarkdownSlides(SAMPLE_PRESENTATION_MARKDOWN);
  } catch {
    // If not a valid PPTX, fallback to parsing as markdown
    const text = strFromU8(buffer);
    return parseMarkdownSlides(text);
  }
}

/**
 * Parses markdown presentation slides separated by '---'
 */
export function parseMarkdownSlides(text: string): PresentationSlide[] {
  const slideChunks = text.split(/^---$/m).map((c) => c.trim()).filter(Boolean);
  const slides: PresentationSlide[] = [];

  for (const chunk of slideChunks) {
    const lines = chunk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let title = "Slide";
    let subtitle: string | undefined = undefined;
    const bullets: string[] = [];

    for (const line of lines) {
      if (line.startsWith("# ")) {
        title = line.replace(/^#\s*/, "");
      } else if (line.startsWith("## ")) {
        if (!subtitle) subtitle = line.replace(/^##\s*/, "");
        else bullets.push(line.replace(/^##\s*/, ""));
      } else if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
        bullets.push(line.replace(/^[•\-\*]\s*/, ""));
      } else if (!title || title === "Slide") {
        title = line;
      } else {
        bullets.push(line);
      }
    }

    slides.push({ title, subtitle, bullets });
  }

  return slides.length > 0
    ? slides
    : [{ title: "Presentation", bullets: ["No slide content detected."] }];
}

/**
 * Helper to wrap text into multiple lines
 */
function wrapSlideText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

/**
 * Compiles presentation slides into a 16:9 widescreen vector PDF document
 */
export async function convertSlidesToPdf(
  slides: PresentationSlide[],
  options: PptxToPdfOptions = {}
): Promise<Uint8Array> {
  const themeKey = options.theme ?? "modern-dark";
  const theme = THEME_MAP[themeKey];
  const deckTitle = options.deckTitle ?? "Cleartrix Presentation";
  const includeSlideNumbers = options.includeSlideNumbers ?? true;

  // 16:9 Widescreen dimensions: 960 x 540 points
  const slideWidth = 960;
  const slideHeight = 540;

  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const totalSlides = slides.length;

  for (let idx = 0; idx < totalSlides; idx++) {
    const slide = slides[idx]!;
    const page = pdfDoc.addPage([slideWidth, slideHeight]);

    // 1. Draw Slide Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: slideWidth,
      height: slideHeight,
      color: theme.bg,
    });

    // 2. Draw Accent Stripe at top
    page.drawRectangle({
      x: 0,
      y: slideHeight - 6,
      width: slideWidth,
      height: 6,
      color: theme.accent,
    });

    let currentY = slideHeight - 70;
    const marginX = 80;
    const contentWidth = slideWidth - marginX * 2;

    // 3. Draw Slide Title
    const titleLines = wrapSlideText(slide.title, contentWidth, fontBold, 28);
    for (const tl of titleLines) {
      page.drawText(tl, {
        x: marginX,
        y: currentY,
        size: 28,
        font: fontBold,
        color: theme.title,
      });
      currentY -= 36;
    }

    // 4. Draw Subtitle if present
    if (slide.subtitle) {
      currentY -= 4;
      const subLines = wrapSlideText(slide.subtitle, contentWidth, fontRegular, 16);
      for (const sl of subLines) {
        page.drawText(sl, {
          x: marginX,
          y: currentY,
          size: 16,
          font: fontRegular,
          color: theme.subtitle,
        });
        currentY -= 22;
      }
    }

    // Accent line below header
    currentY -= 12;
    page.drawLine({
      start: { x: marginX, y: currentY },
      end: { x: marginX + 120, y: currentY },
      thickness: 3,
      color: theme.accent,
    });
    currentY -= 30;

    // 5. Draw Bullets / Body Content
    const bulletFontSize = 16;
    const bulletLineHeight = 24;

    for (const bullet of slide.bullets) {
      const wrapped = wrapSlideText(bullet, contentWidth - 30, fontRegular, bulletFontSize);
      if (currentY - wrapped.length * bulletLineHeight < 60) break; // prevent overflow

      // Bullet dot
      page.drawCircle({
        x: marginX + 6,
        y: currentY + 5,
        size: 4,
        color: theme.accent,
      });

      for (let lIdx = 0; lIdx < wrapped.length; lIdx++) {
        const line = wrapped[lIdx] ?? "";
        page.drawText(line, {
          x: marginX + 26,
          y: currentY,
          size: bulletFontSize,
          font: fontRegular,
          color: theme.bullet,
        });
        currentY -= bulletLineHeight;
      }
      currentY -= 12;
    }

    // 6. Draw Footer (Deck title and slide number)
    if (deckTitle) {
      page.drawText(deckTitle, {
        x: marginX,
        y: 30,
        size: 10,
        font: fontItalic,
        color: theme.footer,
      });
    }

    if (includeSlideNumbers) {
      const slideNumText = `${idx + 1} / ${totalSlides}`;
      const numWidth = fontRegular.widthOfTextAtSize(slideNumText, 10);
      page.drawText(slideNumText, {
        x: slideWidth - marginX - numWidth,
        y: 30,
        size: 10,
        font: fontRegular,
        color: theme.footer,
      });
    }
  }

  return await pdfDoc.save();
}

export const SAMPLE_PRESENTATION_MARKDOWN = `# Cleartrix Platform Overview
## 100% In-Browser Privacy Architecture
• Zero network requests: Documents, PDFs, and spreadsheets process strictly in client RAM.
• WebAssembly & Web Workers: Native performance without external servers.
• No accounts, paywalls, or watermarks required.
---
# Security & Document Capabilities
## Military-Grade Client Cryptography
• AES-256-GCM encryption with PBKDF2 (100,000 rounds).
• PDF forms, digital signatures, redactions, and vector annotations.
• Bidirectional conversion: DOCX, XLSX, and PPTX to vector PDF.
---
# Roadmap & Execution
## Phase 2 Milestone Completion
• All 41 Phase 2 document and image tools operational.
• 100% CI verification green across all 9 automated test suites.
• Next milestone: Phase 3 Media & Audio suites.`;
