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
  /** The design token key */
  colorKey: CategoryColorKey;
  /** Primary accent hex — used for icon, progress fill, drag-over border, primary buttons */
  primary: string;
  /** Tint background hex */
  tint: string;
  /** Border accent hex */
  border: string;
  /** Background gradient from tint to white */
  gradient: string;
  /** Soft ambient glow shadow hex/rgba */
  glow: string;
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
    tintBg: "bg-indigo-50",
    tintBorder: "border-indigo-200",
    text: "text-indigo-900",
    buttonBg: "bg-indigo-900",
    buttonHover: "hover:bg-indigo-950",
    ring: "focus-visible:ring-indigo-700",
  },
  codes: {
    tintBg: "bg-purple-50",
    tintBorder: "border-purple-200",
    text: "text-purple-600",
    buttonBg: "bg-purple-600",
    buttonHover: "hover:bg-purple-700",
    ring: "focus-visible:ring-purple-500",
  },
  video: {
    tintBg: "bg-amber-50",
    tintBorder: "border-amber-200",
    text: "text-amber-600",
    buttonBg: "bg-amber-600",
    buttonHover: "hover:bg-amber-700",
    ring: "focus-visible:ring-amber-500",
  },
  audio: {
    tintBg: "bg-pink-50",
    tintBorder: "border-pink-200",
    text: "text-pink-600",
    buttonBg: "bg-pink-600",
    buttonHover: "hover:bg-pink-700",
    ring: "focus-visible:ring-pink-500",
  },
  builders: {
    tintBg: "bg-emerald-50",
    tintBorder: "border-emerald-200",
    text: "text-emerald-600",
    buttonBg: "bg-emerald-600",
    buttonHover: "hover:bg-emerald-700",
    ring: "focus-visible:ring-emerald-500",
  },
  developer: {
    tintBg: "bg-cyan-50",
    tintBorder: "border-cyan-200",
    text: "text-cyan-600",
    buttonBg: "bg-cyan-600",
    buttonHover: "hover:bg-cyan-700",
    ring: "focus-visible:ring-cyan-500",
  },
  utility: {
    tintBg: "bg-indigo-50",
    tintBorder: "border-indigo-200",
    text: "text-indigo-600",
    buttonBg: "bg-indigo-600",
    buttonHover: "hover:bg-indigo-700",
    ring: "focus-visible:ring-indigo-500",
  },
  calculators: {
    tintBg: "bg-teal-50",
    tintBorder: "border-teal-200",
    text: "text-teal-600",
    buttonBg: "bg-teal-600",
    buttonHover: "hover:bg-teal-700",
    ring: "focus-visible:ring-teal-500",
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
    gradient: token.gradient,
    glow: token.glow,
    label: token.label,
    ...config,
  };
}

/** Precomputed themes for all 10 registry categories */
export const CATEGORY_THEMES: Record<CategoryId, CategoryTheme> = {
  "document-pdf": getColorKeyTheme(CATEGORIES["document-pdf"].colorKey),
  image: getColorKeyTheme(CATEGORIES["image"].colorKey),
  security: getColorKeyTheme(CATEGORIES["security"].colorKey),
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
 * Falls back to security (Navy/Indigo) if unknown.
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
