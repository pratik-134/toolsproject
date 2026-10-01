/**
 * Meme Caption Generator — Pure Domain Logic
 * 100% In-Browser HTML Canvas Rendering (Zero Network Uploads)
 */

export interface MemeOptions {
  topText: string;
  bottomText: string;
  fontSize: number;
  fontFamily: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  uppercase: boolean;
  dropShadow: boolean;
}

export const DEFAULT_MEME_OPTIONS: MemeOptions = {
  topText: "ONE DOES NOT SIMPLY",
  bottomText: "UPLOAD USER FILES TO A SERVER",
  fontSize: 48,
  fontFamily: "Impact, -apple-system, sans-serif",
  fillColor: "#ffffff",
  strokeColor: "#000000",
  strokeWidth: 6,
  uppercase: true,
  dropShadow: true,
};

export const MEME_TEMPLATES = [
  { id: "sample-1", name: "Modern Minimal Template", width: 800, height: 600, color: "#1e293b" },
  { id: "sample-2", name: "Dramatic Sunset Template", width: 800, height: 600, color: "#9a3412" },
  { id: "sample-3", name: "Tech Indigo Template", width: 800, height: 600, color: "#312e81" },
];

/**
 * Calculates text wrapping for meme captions
 */
export function wrapMemeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}
