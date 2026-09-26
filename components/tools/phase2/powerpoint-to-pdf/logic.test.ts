import { PDFDocument } from "pdf-lib";
import {
  parseMarkdownSlides,
  convertSlidesToPdf,
  SAMPLE_PRESENTATION_MARKDOWN,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: parseMarkdownSlides
  const slides = parseMarkdownSlides(SAMPLE_PRESENTATION_MARKDOWN);
  if (slides.length !== 3) {
    throw new Error(`Expected 3 presentation slides, got ${slides.length}`);
  }
  if (slides[0]?.title !== "Mindkit Platform Overview") {
    throw new Error(`Slide 1 title mismatch: ${slides[0]?.title}`);
  }
  if (slides[0]?.bullets.length !== 3) {
    throw new Error(`Slide 1 bullets mismatch: expected 3, got ${slides[0]?.bullets.length}`);
  }

  // Test 2: convertSlidesToPdf with modern-dark theme
  const pdfBytesDark = await convertSlidesToPdf(slides, {
    theme: "modern-dark",
    deckTitle: "Investor Deck",
    includeSlideNumbers: true,
  });

  if (!pdfBytesDark || pdfBytesDark.length === 0) {
    throw new Error("convertSlidesToPdf returned empty dark theme PDF");
  }

  const docDark = await PDFDocument.load(pdfBytesDark);
  if (docDark.getPageCount() !== 3) {
    throw new Error(`Expected 3 PDF pages, got ${docDark.getPageCount()}`);
  }
  const p1 = docDark.getPage(0);
  if (Math.round(p1.getWidth()) !== 960 || Math.round(p1.getHeight()) !== 540) {
    throw new Error(`Slide dimensions mismatch: expected 960x540, got ${p1.getWidth()}x${p1.getHeight()}`);
  }

  // Test 3: convertSlidesToPdf with executive-light theme
  const pdfBytesLight = await convertSlidesToPdf(slides, {
    theme: "executive-light",
    deckTitle: "Corporate Strategy",
    includeSlideNumbers: false,
  });

  if (!pdfBytesLight || pdfBytesLight.length === 0) {
    throw new Error("convertSlidesToPdf returned empty light theme PDF");
  }

  return true;
}
