import {
  POST_DIMENSIONS,
  POST_GRADIENTS,
  DEFAULT_POST_CONFIG,
  wrapTextLines,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Dimensions
  if (POST_DIMENSIONS["1:1"].width !== 1080 || POST_DIMENSIONS["1:1"].height !== 1080) {
    throw new Error("1:1 dimensions should be 1080x1080");
  }
  if (POST_DIMENSIONS["4:5"].width !== 1080 || POST_DIMENSIONS["4:5"].height !== 1350) {
    throw new Error("4:5 dimensions should be 1080x1350");
  }

  // Test 2: Gradients
  if (POST_GRADIENTS.length < 4) {
    throw new Error("Expected at least 4 gradient presets");
  }

  // Test 3: Wrap text lines mock
  const mockCtx = {
    measureText: (text: string) => ({ width: text.length * 10 }),
  } as unknown as CanvasRenderingContext2D;

  const lines = wrapTextLines(mockCtx, "Hello World from ClearTrix Post Maker", 120);
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("wrapTextLines should return non-empty array of strings");
  }

  // Test 4: Default post config
  if (!DEFAULT_POST_CONFIG.headline || !DEFAULT_POST_CONFIG.authorHandle) {
    throw new Error("Default post config missing headline or author handle");
  }

  return true;
}
