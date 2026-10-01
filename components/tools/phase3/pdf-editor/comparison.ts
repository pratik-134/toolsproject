import { ContentElement } from "./types";
import { SearchMatch } from "./logic";

export interface PageDiffResult {
  diffScore: number; // 0 to 100%
  diffDataUrl: string;
  hasDifferences: boolean;
}

/**
 * Pixel-level visual comparison between two rendered canvases
 */
export function computeCanvasDiff(
  canvasA: HTMLCanvasElement,
  canvasB: HTMLCanvasElement
): PageDiffResult {
  const width = Math.max(canvasA.width, canvasB.width);
  const height = Math.max(canvasA.height, canvasB.height);

  const diffCanvas = document.createElement("canvas");
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext("2d");
  if (!diffCtx) {
    return { diffScore: 0, diffDataUrl: "", hasDifferences: false };
  }

  // Draw base
  const ctxA = canvasA.getContext("2d");
  const ctxB = canvasB.getContext("2d");

  if (!ctxA || !ctxB) {
    return { diffScore: 0, diffDataUrl: "", hasDifferences: false };
  }

  const imgDataA = ctxA.getImageData(0, 0, canvasA.width, canvasA.height);
  const imgDataB = ctxB.getImageData(0, 0, canvasB.width, canvasB.height);
  const diffImgData = diffCtx.createImageData(width, height);

  const dataA = imgDataA.data;
  const dataB = imgDataB.data;
  const out = diffImgData.data;

  let diffPixelCount = 0;
  const totalPixels = width * height;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;

    const rA = dataA[idx] ?? 255;
    const gA = dataA[idx + 1] ?? 255;
    const bA = dataA[idx + 2] ?? 255;
    const aA = dataA[idx + 3] ?? 0;

    const rB = dataB[idx] ?? 255;
    const gB = dataB[idx + 1] ?? 255;
    const bB = dataB[idx + 2] ?? 255;
    const aB = dataB[idx + 3] ?? 0;

    const colorDiff =
      Math.abs(rA - rB) + Math.abs(gA - gB) + Math.abs(bA - bB) + Math.abs(aA - aB);

    if (colorDiff > 40) {
      diffPixelCount++;
      // If present in A but missing or different in B => Red (deleted/modified)
      // If present in B but missing in A => Green (added)
      const brightnessA = (rA + gA + bA) / 3;
      const brightnessB = (rB + gB + bB) / 3;

      if (brightnessA < brightnessB) {
        // Pixel darker in A -> removed/changed in B
        out[idx] = 239; // Red
        out[idx + 1] = 68;
        out[idx + 2] = 68;
        out[idx + 3] = 220;
      } else {
        // Pixel darker in B -> added in B
        out[idx] = 34; // Green
        out[idx + 1] = 197;
        out[idx + 2] = 94;
        out[idx + 3] = 220;
      }
    } else {
      // Identical or close: light muted gray background
      out[idx] = 240;
      out[idx + 1] = 242;
      out[idx + 2] = 246;
      out[idx + 3] = 200;
    }
  }

  diffCtx.putImageData(diffImgData, 0, 0);

  const diffScore = Math.min(100, Math.round((diffPixelCount / totalPixels) * 1000) / 10);
  return {
    diffScore,
    diffDataUrl: diffCanvas.toDataURL("image/png"),
    hasDifferences: diffPixelCount > 50,
  };
}

/**
 * Creates overlay elements for Find and Replace:
 * Whiteout boxes over matching areas + replacement text elements with matched typography
 */
export function generateFindAndReplaceElements(
  matches: SearchMatch[],
  replacementText: string,
  backgroundColor: string = "#ffffff",
  textColor: string = "#000000"
): { whiteouts: ContentElement[]; replacementTexts: ContentElement[] } {
  const whiteouts: ContentElement[] = [];
  const replacementTexts: ContentElement[] = [];

  matches.forEach((m, idx) => {
    const stamp = Date.now() + idx;

    // Whiteout box covering the old text
    whiteouts.push({
      id: `whiteout-replace-${stamp}`,
      type: "whiteout",
      pageIndex: m.pageIndex,
      x: m.x - 2,
      y: m.y - 1,
      width: m.width + 4,
      height: m.height + 2,
      backgroundColor,
    });

    // Replacement text line
    replacementTexts.push({
      id: `text-replace-${stamp}`,
      type: "text",
      pageIndex: m.pageIndex,
      x: m.x,
      y: m.y,
      width: Math.max(m.width, replacementText.length * 8),
      height: m.height,
      text: replacementText,
      fontSize: Math.max(10, Math.min(18, Math.round(m.height * 0.85))),
      fontFamily: "Helvetica",
      color: textColor,
    });
  });

  return { whiteouts, replacementTexts };
}
