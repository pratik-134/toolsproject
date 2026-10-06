/**
 * Social Media Post Maker — Pure Domain Logic
 * 100% In-Browser HTML Canvas Rendering (Zero Network Uploads)
 */

export type PostAspectRatio = "1:1" | "4:5";

export interface PostDimension {
  width: number;
  height: number;
  label: string;
}

export const POST_DIMENSIONS: Record<PostAspectRatio, PostDimension> = {
  "1:1": { width: 1080, height: 1080, label: "Square (1:1 - Instagram & LinkedIn)" },
  "4:5": { width: 1080, height: 1350, label: "Portrait (4:5 - Instagram Feed)" },
};

export interface PostGradient {
  name: string;
  colors: [string, string];
  angle: number; // degrees
}

export const POST_GRADIENTS: PostGradient[] = [
  { name: "Sunset Orange", colors: ["#f97316", "#db2777"], angle: 135 },
  { name: "Ocean Indigo", colors: ["#3b82f6", "#1e1b4b"], angle: 135 },
  { name: "Emerald Mint", colors: ["#10b981", "#064e3b"], angle: 135 },
  { name: "Cyber Purple", colors: ["#8b5cf6", "#ec4899"], angle: 135 },
  { name: "Midnight Slate", colors: ["#0f172a", "#334155"], angle: 135 },
  { name: "Golden Glow", colors: ["#f59e0b", "#d97706"], angle: 135 },
];

export interface PostConfig {
  aspectRatio: PostAspectRatio;
  headline: string;
  subtitle: string;
  authorHandle: string;
  categoryBadge: string;
  backgroundType: "gradient" | "solid" | "image";
  solidColor: string;
  gradientIndex: number;
  textAlign: "center" | "left";
  textColor: string;
  headlineFontSize: number;
}

export const DEFAULT_POST_CONFIG: PostConfig = {
  aspectRatio: "1:1",
  headline: "Design Systems That Scale In 2026",
  subtitle: "Build consistent, client-side web tools with zero server overhead and maximum privacy.",
  authorHandle: "@qwertygen",
  categoryBadge: "TECH INSIGHTS",
  backgroundType: "gradient",
  solidColor: "#0f172a",
  gradientIndex: 0,
  textAlign: "center",
  textColor: "#ffffff",
  headlineFontSize: 56,
};

/**
 * Wraps text into lines that fit within a maximum width on canvas
 */
export function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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
