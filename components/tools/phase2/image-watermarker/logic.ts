/**
 * Image Watermark Tool — Pure TypeScript Domain Logic
 * 100% In-Browser Watermarking (Zero Network Uploads)
 */

export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface WatermarkOptions {
  text: string;
  mode: "single" | "tiled";
  position: WatermarkPosition;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number; // In degrees
  margin: number;
  tileSpacingX: number;
  tileSpacingY: number;
}

export const DEFAULT_WATERMARK_OPTIONS: WatermarkOptions = {
  text: "CONFIDENTIAL",
  mode: "single",
  position: "center",
  fontSize: 48,
  color: "#ffffff",
  opacity: 0.35,
  rotation: -30,
  margin: 30,
  tileSpacingX: 200,
  tileSpacingY: 150,
};

export const WATERMARK_PRESETS: { name: string; options: Partial<WatermarkOptions> }[] = [
  {
    name: "Confidential Stamp",
    options: {
      text: "CONFIDENTIAL",
      mode: "single",
      position: "center",
      rotation: -30,
      opacity: 0.35,
      color: "#ef4444",
      fontSize: 54,
    },
  },
  {
    name: "Copyright Notice",
    options: {
      text: "© 2026 All Rights Reserved",
      mode: "single",
      position: "bottom-right",
      rotation: 0,
      opacity: 0.6,
      color: "#ffffff",
      fontSize: 24,
      margin: 25,
    },
  },
  {
    name: "Draft Security Tile",
    options: {
      text: "DRAFT SAMPLE",
      mode: "tiled",
      rotation: -45,
      opacity: 0.2,
      color: "#64748b",
      fontSize: 32,
      tileSpacingX: 220,
      tileSpacingY: 160,
    },
  },
  {
    name: "Do Not Copy",
    options: {
      text: "DO NOT DUPLICATE",
      mode: "tiled",
      rotation: -35,
      opacity: 0.25,
      color: "#dc2626",
      fontSize: 36,
      tileSpacingX: 260,
      tileSpacingY: 180,
    },
  },
];

/**
 * Calculates anchor coordinates for single watermark placement
 */
export function calculateSinglePosition(
  canvasWidth: number,
  canvasHeight: number,
  textWidth: number,
  textHeight: number,
  position: WatermarkPosition,
  margin: number = 30
): { x: number; y: number } {
  const safeMargin = Math.max(0, margin);

  switch (position) {
    case "top-left":
      return { x: safeMargin + textWidth / 2, y: safeMargin + textHeight / 2 };
    case "top-center":
      return { x: canvasWidth / 2, y: safeMargin + textHeight / 2 };
    case "top-right":
      return { x: canvasWidth - safeMargin - textWidth / 2, y: safeMargin + textHeight / 2 };
    case "center":
      return { x: canvasWidth / 2, y: canvasHeight / 2 };
    case "bottom-left":
      return { x: safeMargin + textWidth / 2, y: canvasHeight - safeMargin - textHeight / 2 };
    case "bottom-center":
      return { x: canvasWidth / 2, y: canvasHeight - safeMargin - textHeight / 2 };
    case "bottom-right":
      return { x: canvasWidth - safeMargin - textWidth / 2, y: canvasHeight - safeMargin - textHeight / 2 };
    default:
      return { x: canvasWidth / 2, y: canvasHeight / 2 };
  }
}

/**
 * Calculates coordinates for repeating diagonal tiled grid
 */
export function calculateTiledGrid(
  canvasWidth: number,
  canvasHeight: number,
  stepX: number = 200,
  stepY: number = 150
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const safeStepX = Math.max(50, stepX);
  const safeStepY = Math.max(50, stepY);

  // Extend grid bounds slightly to cover rotation clipping
  const startX = -safeStepX;
  const startY = -safeStepY;
  const endX = canvasWidth + safeStepX * 2;
  const endY = canvasHeight + safeStepY * 2;

  let row = 0;
  for (let y = startY; y < endY; y += safeStepY) {
    const offsetX = (row % 2) * (safeStepX / 2);
    for (let x = startX + offsetX; x < endX; x += safeStepX) {
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
    row++;
  }

  return points;
}
