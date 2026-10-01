/**
 * Webcam Overlay Recorder — Pure Domain Logic
 * 100% In-Browser Media Capture (Zero Network Uploads)
 */

export type OverlayPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";
export type BubbleSize = "small" | "medium" | "large";
export type BubbleShape = "circle" | "rounded-rect";

export interface OverlayConfig {
  position: OverlayPosition;
  size: BubbleSize;
  shape: BubbleShape;
  margin: number;
}

export const BUBBLE_DIAMETERS: Record<BubbleSize, number> = {
  small: 160,
  medium: 220,
  large: 300,
};

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
  position: "bottom-right",
  size: "medium",
  shape: "circle",
  margin: 32,
};

/**
 * Calculates coordinates and radius/bounding box for the webcam PiP bubble on canvas
 */
export function calculateBubbleCoordinates(
  canvasWidth: number,
  canvasHeight: number,
  config: OverlayConfig
): { x: number; y: number; width: number; height: number; radius: number } {
  const diameter = BUBBLE_DIAMETERS[config.size] || 220;
  const radius = diameter / 2;
  const margin = Math.max(12, config.margin || 32);

  let x = 0;
  let y = 0;

  switch (config.position) {
    case "top-left":
      x = margin;
      y = margin;
      break;
    case "top-right":
      x = canvasWidth - margin - diameter;
      y = margin;
      break;
    case "bottom-left":
      x = margin;
      y = canvasHeight - margin - diameter;
      break;
    case "bottom-right":
    default:
      x = canvasWidth - margin - diameter;
      y = canvasHeight - margin - diameter;
      break;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: diameter,
    height: diameter,
    radius,
  };
}

/**
 * Validates overlay configuration
 */
export function validateOverlayConfig(config: Partial<OverlayConfig>): boolean {
  if (!config.position || !["bottom-right", "bottom-left", "top-right", "top-left"].includes(config.position)) {
    return false;
  }
  if (!config.size || !["small", "medium", "large"].includes(config.size)) {
    return false;
  }
  return true;
}
