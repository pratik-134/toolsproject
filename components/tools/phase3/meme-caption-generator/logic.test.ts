import {
  DEFAULT_MEME_OPTIONS,
  wrapMemeText,
  MEME_TEMPLATES,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Wrap meme text mock
  const mockCtx = {
    measureText: (str: string) => ({ width: str.length * 12 }),
  } as unknown as CanvasRenderingContext2D;

  const lines = wrapMemeText(mockCtx, "ONE DOES NOT SIMPLY PASS TESTS", 100);
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("wrapMemeText failed to wrap lines");
  }

  // Test 2: Default options
  if (!DEFAULT_MEME_OPTIONS.topText || !DEFAULT_MEME_OPTIONS.bottomText) {
    throw new Error("Default meme options missing top or bottom text");
  }

  // Test 3: Templates
  if (MEME_TEMPLATES.length < 2) {
    throw new Error("Expected at least 2 meme templates");
  }

  return true;
}
