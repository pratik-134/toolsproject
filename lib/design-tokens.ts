/**
 * Cleartrix Design Tokens — Single Source of Truth
 *
 * Establishes typed constants for base neutrals and 5 core category accents
 * per the deliberate Cleartrix design system.
 */

/* =========================================================================
   1. Base Neutrals
   ========================================================================= */
export const BRAND_TOKENS = {
  primaryBlue: "#3B82F6",
  accentTeal: "#06D6A0",
  darkNavy: "#0F172A",
  brandGray: "#94A3B8",
  lightCanvas: "#F8FAFC",
  darkSurface: "#1E293B",
} as const;

export const BRAND_GRADIENTS = {
  wordmark: "linear-gradient(90deg, #0EA5E9 0%, #06D6A0 100%)",
  buttonCard: "linear-gradient(135deg, #3B82F6 0%, #0EA5E9 100%)",
  ambientGlow: "radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 45%), radial-gradient(circle at 95% 80%, rgba(6, 214, 160, 0.12) 0%, transparent 40%)",
} as const;

export const BASE_NEUTRALS = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  borderSubtle: "#E2E8F0",
  borderStrong: "#94A3B8",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  darkSurface: "#1E293B",
} as const;

/* =========================================================================
   2. Category Accents (5 Core Keys)
   ========================================================================= */
export const CATEGORY_COLORS = {
  pdf: {
    primary: "#DC2626", // Ruby Red
    tint: "#FEF2F2",    // Red 50
    border: "#FECACA",  // Red 200
    label: "PDF Operations Suite",
    heroText: "#DC2626", // Contrast-safe for light hero background (4.88:1 vs #FFF - WCAG AA)
  },
  image: {
    primary: "#EA580C", // Amber / Warm Orange
    tint: "#FFF7ED",    // Orange 50
    border: "#FED7AA",  // Orange 200
    label: "Image & Media",
    heroText: "#C2410C", // Darkened Orange 700 (5.25:1 vs #FFF - WCAG AA compliant)
  },
  document: {
    primary: "#059669", // Emerald Green
    tint: "#ECFDF5",    // Emerald 50
    border: "#A7F3D0",  // Emerald 200
    label: "Document & Text Utilities",
    heroText: "#047857", // Darkened Emerald 700 (5.07:1 vs #FFF - WCAG AA compliant)
  },
  security: {
    primary: "#1D4ED8", // Classic Navy / Blue 700
    tint: "#EFF6FF",    // Blue 50
    border: "#BFDBFE",  // Blue 200
    label: "Security & Privacy",
    heroText: "#1D4ED8", // Contrast-safe for light hero background (6.64:1 vs #FFF - WCAG AAA)
  },
  utility: {
    primary: "#6D28D9", // Deep Violet
    tint: "#F5F3FF",    // Violet 50
    border: "#DDD6FE",  // Violet 200
    label: "Calculators, Dev Tools & Batch Processing",
    heroText: "#6D28D9", // Contrast-safe for light hero background (7.60:1 vs #FFF - WCAG AAA)
  },
} as const;

export type CategoryColorKey = keyof typeof CATEGORY_COLORS;
export type CategoryColorToken = (typeof CATEGORY_COLORS)[CategoryColorKey];

/* =========================================================================
   3. Flagship Brand Blue (Resume Builder & Global Actions)
   ========================================================================= */
export const BRAND_COLORS = {
  primary: "#2563EB",     // Blue 600
  primaryHover: "#1D4ED8",// Blue 700
  primaryActive: "#1E40AF",// Blue 800
  light: "#EFF6FF",       // Blue 50
  border: "#BFDBFE",      // Blue 200
} as const;

/* Legacy full design tokens compatibility export */
export const designTokens = {
  neutrals: BASE_NEUTRALS,
  categories: CATEGORY_COLORS,
  brand: BRAND_COLORS,
  colors: {
    brand: {
      primary: BRAND_COLORS.primary,
      primaryHover: BRAND_COLORS.primaryHover,
      primaryLight: BRAND_COLORS.light,
      primaryBorder: BRAND_COLORS.border,
    },
    canvas: {
      background: BASE_NEUTRALS.background,
      surface: BASE_NEUTRALS.surface,
    },
    neutral: {
      borderSubtle: BASE_NEUTRALS.borderSubtle,
      borderStrong: BASE_NEUTRALS.borderStrong,
    },
    text: {
      primary: BASE_NEUTRALS.textPrimary,
      secondary: BASE_NEUTRALS.textSecondary,
      muted: BASE_NEUTRALS.textMuted,
    },
  },
} as const;

export type DesignTokens = typeof designTokens;
