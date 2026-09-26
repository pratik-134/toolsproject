/**
 * Category Accent Color & Theme System
 *
 * Single source of truth for category styling derived directly from
 * CATEGORY_COLORS in lib/design-tokens.ts and CATEGORIES in lib/registry/categories.ts.
 *
 * Consumed by ToolLayout, UploadBox, ProgressBar, ResultPanel, tool cards, and category pages.
 */

import { CategoryId } from "./registry/types";
import { CATEGORIES } from "./registry/categories";
import {
  CATEGORY_COLORS,
  CategoryColorKey,
  CategoryColorToken,
} from "./design-tokens";

export interface CategoryTheme {
  /** The 5-key design token key ('pdf' | 'image' | 'document' | 'security' | 'utility') */
  colorKey: CategoryColorKey;
  /** Primary accent hex — used for icon, progress fill, drag-over border, primary buttons */
  primary: string;
  /** Tint background hex */
  tint: string;
  /** Border accent hex */
  border: string;
  /** Tailwind bg tint class */
  tintBg: string;
  /** Tailwind border class */
  tintBorder: string;
  /** Tailwind text class for primary accent */
  text: string;
  /** Tailwind bg class for primary buttons / filled badges */
  buttonBg: string;
  /** Tailwind hover:bg class for primary buttons */
  buttonHover: string;
  /** Tailwind ring / focus class */
  ring: string;
  /** Human-readable label for the accent */
  label: string;
}

interface ColorKeyThemeConfig {
  tintBg: string;
  tintBorder: string;
  text: string;
  buttonBg: string;
  buttonHover: string;
  ring: string;
}

const COLOR_KEY_CONFIG: Record<CategoryColorKey, ColorKeyThemeConfig> = {
  pdf: {
    tintBg: "bg-red-50",
    tintBorder: "border-red-200",
    text: "text-red-600",
    buttonBg: "bg-red-600",
    buttonHover: "hover:bg-red-700",
    ring: "focus-visible:ring-red-500",
  },
  image: {
    tintBg: "bg-orange-50",
    tintBorder: "border-orange-200",
    text: "text-orange-600",
    buttonBg: "bg-orange-600",
    buttonHover: "hover:bg-orange-700",
    ring: "focus-visible:ring-orange-500",
  },
  document: {
    tintBg: "bg-emerald-50",
    tintBorder: "border-emerald-200",
    text: "text-emerald-700",
    buttonBg: "bg-emerald-700",
    buttonHover: "hover:bg-emerald-800",
    ring: "focus-visible:ring-emerald-500",
  },
  security: {
    tintBg: "bg-blue-50",
    tintBorder: "border-blue-200",
    text: "text-blue-700",
    buttonBg: "bg-blue-700",
    buttonHover: "hover:bg-blue-800",
    ring: "focus-visible:ring-blue-600",
  },
  utility: {
    tintBg: "bg-violet-50",
    tintBorder: "border-violet-200",
    text: "text-violet-700",
    buttonBg: "bg-violet-700",
    buttonHover: "hover:bg-violet-800",
    ring: "focus-visible:ring-violet-500",
  },
};

/**
 * Creates a CategoryTheme from a CategoryColorKey
 */
export function getColorKeyTheme(key: CategoryColorKey): CategoryTheme {
  const token = CATEGORY_COLORS[key];
  const config = COLOR_KEY_CONFIG[key];

  return {
    colorKey: key,
    primary: token.primary,
    tint: token.tint,
    border: token.border,
    label: token.label,
    ...config,
  };
}

/** Precomputed themes for all 11 registry categories */
export const CATEGORY_THEMES: Record<CategoryId, CategoryTheme> = {
  "document-pdf": getColorKeyTheme(CATEGORIES["document-pdf"].colorKey),
  image: getColorKeyTheme(CATEGORIES["image"].colorKey),
  security: getColorKeyTheme(CATEGORIES["security"].colorKey),
  "url-cloud": getColorKeyTheme(CATEGORIES["url-cloud"].colorKey),
  codes: getColorKeyTheme(CATEGORIES["codes"].colorKey),
  video: getColorKeyTheme(CATEGORIES["video"].colorKey),
  audio: getColorKeyTheme(CATEGORIES["audio"].colorKey),
  builders: getColorKeyTheme(CATEGORIES["builders"].colorKey),
  developer: getColorKeyTheme(CATEGORIES["developer"].colorKey),
  utilities: getColorKeyTheme(CATEGORIES["utilities"].colorKey),
  calculators: getColorKeyTheme(CATEGORIES["calculators"].colorKey),
};

const DEFAULT_THEME = getColorKeyTheme("security");

/**
 * Returns the full CategoryTheme for a given category ID or color key.
 * Falls back to security (Navy) if unknown.
 */
export function getCategoryTheme(categoryId: string): CategoryTheme {
  if (categoryId in CATEGORY_THEMES) {
    return CATEGORY_THEMES[categoryId as CategoryId];
  }
  if (categoryId in CATEGORY_COLORS) {
    return getColorKeyTheme(categoryId as CategoryColorKey);
  }
  return DEFAULT_THEME;
}
