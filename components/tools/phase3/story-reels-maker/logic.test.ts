import {
  STORY_DIMENSIONS,
  STORY_STICKERS,
  DEFAULT_STORY_CONFIG,
  getStorySticker,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Dimensions
  if (STORY_DIMENSIONS.width !== 1080 || STORY_DIMENSIONS.height !== 1920) {
    throw new Error("Story dimensions must be 1080x1920");
  }

  // Test 2: Stickers
  if (STORY_STICKERS.length < 4) {
    throw new Error("Expected at least 4 story sticker options");
  }

  // Test 3: Sticker lookup
  const sticker = getStorySticker("link-in-bio");
  if (!sticker || sticker.id !== "link-in-bio") {
    throw new Error("Failed to lookup link-in-bio sticker");
  }

  // Test 4: Default config
  if (!DEFAULT_STORY_CONFIG.headline || !DEFAULT_STORY_CONFIG.ctaText) {
    throw new Error("Default story config missing essential fields");
  }

  return true;
}
