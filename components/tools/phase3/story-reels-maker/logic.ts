/**
 * Story & Reels Canvas Maker — Pure Domain Logic
 * 100% In-Browser 9:16 Canvas Generation (Zero Network Uploads)
 */

export interface StoryDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

export const STORY_DIMENSIONS: StoryDimensions = {
  width: 1080,
  height: 1920,
  aspectRatio: "9:16",
};

export const STORY_STICKERS = [
  { id: "new-post", label: "✨ NEW POST", color: "#ec4899" },
  { id: "link-in-bio", label: "🔗 LINK IN BIO", color: "#3b82f6" },
  { id: "swipe-up", label: "👆 TAP HERE", color: "#10b981" },
  { id: "special-offer", label: "🔥 LIMITED OFFER", color: "#f97316" },
  { id: "announcement", label: "📢 BIG NEWS", color: "#8b5cf6" },
];

export interface StoryConfig {
  tagline: string;
  headline: string;
  body: string;
  ctaText: string;
  activeStickerId: string;
  gradientIndex: number;
  backgroundColor: string;
  textColor: string;
}

export const DEFAULT_STORY_CONFIG: StoryConfig = {
  tagline: "PRODUCT ANNOUNCEMENT",
  headline: "Everything You Need, 100% On Your Device",
  body: "Discover over 150+ privacy-first everyday tools running entirely in your browser with zero data retention.",
  ctaText: "Try Free Online",
  activeStickerId: "new-post",
  gradientIndex: 0,
  backgroundColor: "#0f172a",
  textColor: "#ffffff",
};

export function getStorySticker(id: string) {
  return STORY_STICKERS.find((s) => s.id === id) || STORY_STICKERS[0];
}
