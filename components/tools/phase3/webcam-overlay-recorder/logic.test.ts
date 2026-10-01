import {
  calculateBubbleCoordinates,
  validateOverlayConfig,
  DEFAULT_OVERLAY_CONFIG,
  BUBBLE_DIAMETERS,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Bottom-right coordinate math
  // Canvas 1920x1080, medium (220), margin 32
  // x = 1920 - 32 - 220 = 1668
  // y = 1080 - 32 - 220 = 828
  const br = calculateBubbleCoordinates(1920, 1080, {
    position: "bottom-right",
    size: "medium",
    shape: "circle",
    margin: 32,
  });
  if (br.x !== 1668 || br.y !== 828 || br.width !== 220 || br.radius !== 110) {
    throw new Error(`Unexpected bottom-right coords: got (${br.x}, ${br.y})`);
  }

  // Test 2: Top-left coords
  const tl = calculateBubbleCoordinates(1920, 1080, {
    position: "top-left",
    size: "small",
    shape: "circle",
    margin: 40,
  });
  if (tl.x !== 40 || tl.y !== 40 || tl.width !== BUBBLE_DIAMETERS.small) {
    throw new Error(`Unexpected top-left coords: got (${tl.x}, ${tl.y})`);
  }

  // Test 3: Validation
  if (!validateOverlayConfig(DEFAULT_OVERLAY_CONFIG)) {
    throw new Error("Default overlay config failed validation");
  }
  if (validateOverlayConfig({ position: "invalid" as any })) {
    throw new Error("Expected validation error for invalid position");
  }

  return true;
}
