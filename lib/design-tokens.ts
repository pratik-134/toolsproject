/**
 * Cleartrix Design Tokens — Single Source of Truth
 *
 * Establishes typed constants for base neutrals and 10 category accents
 * per the deliberate Cleartrix soft-tech editorial design system.
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
  ambientGlow: "radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 45%), radial-gradient(circle at 95% 80%, rgba(6, 214, 160, 0.1) 0%, transparent 40%)",
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
   2. Category Accents (10 Distinct Category Keys)
   ========================================================================= */
export const CATEGORY_COLORS = {
  pdf: {
    primary: "#DC2626", // Ruby Red (Red 600)
    tint: "#FEF2F2",    // Red 50
    border: "#FECACA",  // Red 200
    gradient: "linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)",
    glow: "rgba(220, 38, 38, 0.15)",
    label: "PDF Operations Suite",
    heroText: "#DC2626",
  },
  image: {
    primary: "#EA580C", // Amber / Warm Orange (Orange 600)
    tint: "#FFF7ED",    // Orange 50
    border: "#FED7AA",  // Orange 200
    gradient: "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)",
    glow: "rgba(234, 88, 12, 0.15)",
    label: "Image & Media",
    heroText: "#C2410C",
  },
  document: {
    primary: "#059669", // Emerald Green
    tint: "#ECFDF5",    // Emerald 50
    border: "#A7F3D0",  // Emerald 200
    gradient: "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)",
    glow: "rgba(5, 150, 105, 0.15)",
    label: "Document & Text Utilities",
    heroText: "#047857",
  },
  security: {
    primary: "#312E81", // Deep Indigo-Slate (Indigo 900)
    tint: "#EEF2FF",    // Indigo 50
    border: "#C7D2FE",  // Indigo 200
    gradient: "linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)",
    glow: "rgba(49, 46, 129, 0.15)",
    label: "Security & Privacy",
    heroText: "#312E81",
  },
  codes: {
    primary: "#7C3AED", // Vivid Purple (Purple 600)
    tint: "#F5F3FF",    // Purple 50
    border: "#DDD6FE",  // Purple 200
    gradient: "linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 100%)",
    glow: "rgba(124, 58, 237, 0.15)",
    label: "QR & Barcode Utilities",
    heroText: "#7C3AED",
  },
  video: {
    primary: "#D97706", // Warm Amber (Amber 600)
    tint: "#FFFBEB",    // Amber 50
    border: "#FDE68A",  // Amber 200
    gradient: "linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)",
    glow: "rgba(217, 119, 6, 0.15)",
    label: "Screen Capture & Video",
    heroText: "#D97706",
  },
  audio: {
    primary: "#DB2777", // Vibrant Pink (Pink 600)
    tint: "#FDF2F8",    // Pink 50
    border: "#FBCFE8",  // Pink 200
    gradient: "linear-gradient(135deg, #FDF2F8 0%, #FFFFFF 100%)",
    glow: "rgba(219, 39, 119, 0.15)",
    label: "Audio & Voice Tools",
    heroText: "#DB2777",
  },
  builders: {
    primary: "#10B981", // Emerald 500
    tint: "#ECFDF5",    // Emerald 50
    border: "#A7F3D0",  // Emerald 200
    gradient: "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)",
    glow: "rgba(16, 185, 129, 0.15)",
    label: "Business & Resume Builders",
    heroText: "#047857",
  },
  developer: {
    primary: "#0891B2", // Cyan 600
    tint: "#ECFEFF",    // Cyan 50
    border: "#A5F3FC",  // Cyan 200
    gradient: "linear-gradient(135deg, #ECFEFF 0%, #FFFFFF 100%)",
    glow: "rgba(8, 145, 178, 0.15)",
    label: "Developer, Data & Code",
    heroText: "#0891B2",
  },
  utility: {
    primary: "#4F46E5", // Indigo 600
    tint: "#EEF2FF",    // Indigo 50
    border: "#C7D2FE",  // Indigo 200
    gradient: "linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)",
    glow: "rgba(79, 70, 229, 0.15)",
    label: "Everyday Utilities",
    heroText: "#4F46E5",
  },
  calculators: {
    primary: "#0D9488", // Soft Teal (Teal 600)
    tint: "#F0FDFA",    // Teal 50
    border: "#99F6E4",  // Teal 200
    gradient: "linear-gradient(135deg, #F0FDFA 0%, #FFFFFF 100%)",
    glow: "rgba(13, 148, 136, 0.15)",
    label: "Calculators (Finance, Health, Math, Tech)",
    heroText: "#0D9488",
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
