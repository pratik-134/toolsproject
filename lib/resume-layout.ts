/**
 * Mindkit Single Source of Truth Layout Engine
 *
 * Unifies layout dimensions, margins, typography, line-heights, density,
 * bullet formatting, and page-break rules between:
 *  1. Live Preview Canvas (HTML / Tailwind CSS DOM @ 96 DPI)
 *  2. React-PDF Renderer (@react-pdf/renderer @ 72 DPI)
 *
 * Mathematical Equivalence:
 *  1 pt (PDF) = 96/72 px = 1.3333333333333333 px (CSS)
 *  1 px (CSS) = 72/96 pt = 0.75 pt (PDF)
 */

import { ThemeConfig } from "./schema";

// Physical A4 Constants
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

// React-PDF 72 DPI Points
export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;

// Web Browser CSS 96 DPI Pixels
export const PT_TO_PX = 4 / 3;
export const PX_TO_PT = 3 / 4;

export const A4_WIDTH_PX = Math.round(A4_WIDTH_PT * PT_TO_PX); // 794 px
export const A4_HEIGHT_PX = Math.round(A4_HEIGHT_PT * PT_TO_PX); // 1123 px

export function ptToPx(pt: number): number {
  return Math.round(pt * PT_TO_PX * 100) / 100;
}

export function pxToPt(px: number): number {
  return Math.round(px * PX_TO_PT * 100) / 100;
}

// Margins (in PDF pt and CSS px)
export interface MarginProfile {
  topPt: number;
  bottomPt: number;
  horizontalPt: number;
  topPx: number;
  bottomPx: number;
  horizontalPx: number;
}

export const MARGIN_PROFILES: Record<"narrow" | "normal" | "wide", MarginProfile> = {
  narrow: {
    topPt: 28,
    bottomPt: 28,
    horizontalPt: 28,
    topPx: ptToPx(28), // 37.33 px
    bottomPx: ptToPx(28),
    horizontalPx: ptToPx(28),
  },
  normal: {
    topPt: 36,
    bottomPt: 36,
    horizontalPt: 36,
    topPx: ptToPx(36), // 48 px
    bottomPx: ptToPx(36),
    horizontalPx: ptToPx(36),
  },
  wide: {
    topPt: 48,
    bottomPt: 48,
    horizontalPt: 48,
    topPx: ptToPx(48), // 64 px
    bottomPx: ptToPx(48),
    horizontalPx: ptToPx(48),
  },
};

// Density Profiles
export interface DensityProfile {
  sectionSpacingPt: number;
  sectionSpacingPx: number;
  itemSpacingPt: number;
  itemSpacingPx: number;
  bulletSpacingPt: number;
  bulletSpacingPx: number;
  headerMarginBottomPt: number;
  headerMarginBottomPx: number;
  lineHeight: number;
  fontSize: {
    namePt: number;
    namePx: number;
    titlePt: number;
    titlePx: number;
    sectionHeadingPt: number;
    sectionHeadingPx: number;
    itemTitlePt: number;
    itemTitlePx: number;
    itemSubtitlePt: number;
    itemSubtitlePx: number;
    bodyPt: number;
    bodyPx: number;
    captionPt: number;
    captionPx: number;
  };
}

export const DENSITY_PROFILES: Record<"compact" | "comfortable" | "spacious", DensityProfile> = {
  compact: {
    sectionSpacingPt: 8,
    sectionSpacingPx: ptToPx(8), // ~10.67px
    itemSpacingPt: 5,
    itemSpacingPx: ptToPx(5), // ~6.67px
    bulletSpacingPt: 1.5,
    bulletSpacingPx: ptToPx(1.5), // 2px
    headerMarginBottomPt: 8,
    headerMarginBottomPx: ptToPx(8),
    lineHeight: 1.32,
    fontSize: {
      namePt: 20,
      namePx: ptToPx(20), // 26.67px
      titlePt: 10,
      titlePx: ptToPx(10), // 13.33px
      sectionHeadingPt: 10,
      sectionHeadingPx: ptToPx(10), // 13.33px
      itemTitlePt: 9.5,
      itemTitlePx: ptToPx(9.5), // 12.67px
      itemSubtitlePt: 8.5,
      itemSubtitlePx: ptToPx(8.5), // 11.33px
      bodyPt: 8.5,
      bodyPx: ptToPx(8.5), // 11.33px
      captionPt: 8,
      captionPx: ptToPx(8), // 10.67px
    },
  },
  comfortable: {
    sectionSpacingPt: 12,
    sectionSpacingPx: ptToPx(12), // 16px
    itemSpacingPt: 7.5,
    itemSpacingPx: ptToPx(7.5), // 10px
    bulletSpacingPt: 2.5,
    bulletSpacingPx: ptToPx(2.5), // 3.33px
    headerMarginBottomPt: 12,
    headerMarginBottomPx: ptToPx(12),
    lineHeight: 1.42,
    fontSize: {
      namePt: 23,
      namePx: ptToPx(23), // 30.67px
      titlePt: 11,
      titlePx: ptToPx(11), // 14.67px
      sectionHeadingPt: 11,
      sectionHeadingPx: ptToPx(11), // 14.67px
      itemTitlePt: 10,
      itemTitlePx: ptToPx(10), // 13.33px
      itemSubtitlePt: 9,
      itemSubtitlePx: ptToPx(9), // 12px
      bodyPt: 9.2,
      bodyPx: ptToPx(9.2), // 12.27px
      captionPt: 8.5,
      captionPx: ptToPx(8.5), // 11.33px
    },
  },
  spacious: {
    sectionSpacingPt: 16,
    sectionSpacingPx: ptToPx(16), // 21.33px
    itemSpacingPt: 10,
    itemSpacingPx: ptToPx(10), // 13.33px
    bulletSpacingPt: 3.5,
    bulletSpacingPx: ptToPx(3.5), // 4.67px
    headerMarginBottomPt: 16,
    headerMarginBottomPx: ptToPx(16),
    lineHeight: 1.52,
    fontSize: {
      namePt: 25,
      namePx: ptToPx(25), // 33.33px
      titlePt: 12,
      titlePx: ptToPx(12), // 16px
      sectionHeadingPt: 12,
      sectionHeadingPx: ptToPx(12), // 16px
      itemTitlePt: 10.5,
      itemTitlePx: ptToPx(10.5), // 14px
      itemSubtitlePt: 9.5,
      itemSubtitlePx: ptToPx(9.5), // 12.67px
      bodyPt: 9.8,
      bodyPx: ptToPx(9.8), // 13.07px
      captionPt: 9,
      captionPx: ptToPx(9), // 12px
    },
  },
};

// Font Pairing Map
export interface FontPairingConfig {
  pdfPrimaryFont: string;
  pdfSecondaryFont: string;
  domHeadingFamily: string;
  domBodyFamily: string;
}

export const FONT_PAIRING_MAP: Record<string, FontPairingConfig> = {
  "inter-roboto": {
    pdfPrimaryFont: "Inter",
    pdfSecondaryFont: "Inter",
    domHeadingFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    domBodyFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  "poppins-lato": {
    pdfPrimaryFont: "Poppins",
    pdfSecondaryFont: "Poppins",
    domHeadingFamily: "var(--font-inter), 'Segoe UI', sans-serif",
    domBodyFamily: "var(--font-inter), 'Segoe UI', sans-serif",
  },
  "lora-opensans": {
    pdfPrimaryFont: "Lora",
    pdfSecondaryFont: "Lora",
    domHeadingFamily: "var(--font-inter), Georgia, 'Times New Roman', serif",
    domBodyFamily: "var(--font-inter), Georgia, 'Times New Roman', serif",
  },
  "playfair-source": {
    pdfPrimaryFont: "Playfair",
    pdfSecondaryFont: "Playfair",
    domHeadingFamily: "var(--font-inter), Georgia, serif",
    domBodyFamily: "var(--font-inter), Georgia, serif",
  },
  "fira-jetbrains": {
    pdfPrimaryFont: "JetBrainsMono",
    pdfSecondaryFont: "JetBrainsMono",
    domHeadingFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    domBodyFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};

// Controlled Bullet Tokens
export const BULLET_TOKENS = {
  widthPt: 10,
  widthPx: ptToPx(10), // 13.33px
  markerDot: "•",
  markerHyphen: "-",
  spacingPt: 2,
  spacingPx: ptToPx(2),
};

// Computed layout result for both DOM and PDF
export interface ComputedResumeLayout {
  margins: MarginProfile;
  density: DensityProfile;
  fonts: FontPairingConfig;
  accentColor: string;
  showIcons: boolean;
  dom: {
    containerStyle: React.CSSProperties;
    sectionStyle: React.CSSProperties;
    itemStyle: React.CSSProperties;
    bulletListStyle: React.CSSProperties;
    bulletItemStyle: React.CSSProperties;
    bulletMarkerStyle: React.CSSProperties;
    bulletTextStyle: React.CSSProperties;
    heading1Style: React.CSSProperties;
    heading2Style: React.CSSProperties;
    subheadingStyle: React.CSSProperties;
    bodyStyle: React.CSSProperties;
  };
  pdf: {
    pageStyle: {
      paddingTop: number;
      paddingBottom: number;
      paddingHorizontal: number;
      fontFamily: string;
      fontSize: number;
      lineHeight?: number;
      color: string;
    };
    sectionStyle: {
      marginBottom: number;
    };
    itemStyle: {
      marginBottom: number;
    };
    itemDescription: {
      fontSize: number;
      color: string;
      marginTop: number;
      marginBottom: number;
    };
    bulletRow: {
      flexDirection: "row";
      marginBottom: number;
    };
    bulletMarker: {
      width: number;
      fontSize: number;
    };
    bulletText: {
      flex: number;
      fontSize: number;
      color: string;
    };
  };
}

export function getComputedResumeLayout(theme?: Partial<ThemeConfig>): ComputedResumeLayout {
  const marginKey = (theme?.marginSize || "normal") as "narrow" | "normal" | "wide";
  const densityKey = (theme?.density || "comfortable") as "compact" | "comfortable" | "spacious";
  const fontKey = theme?.fontPair || "inter-roboto";
  const rawAccent = theme?.accentColor;
  const accentColor = (!rawAccent || rawAccent.toLowerCase() === "#4f46e5" || rawAccent.toLowerCase() === "#16a34a") ? "#2563EB" : rawAccent;
  const showIcons = theme?.showIcons ?? true;

  const margins = MARGIN_PROFILES[marginKey] || MARGIN_PROFILES.normal;
  const density = DENSITY_PROFILES[densityKey] || DENSITY_PROFILES.comfortable;
  const fonts: FontPairingConfig = FONT_PAIRING_MAP[fontKey] || FONT_PAIRING_MAP["inter-roboto"]!;

  return {
    margins,
    density,
    fonts,
    accentColor,
    showIcons,
    dom: {
      containerStyle: {
        paddingTop: `${margins.topPx}px`,
        paddingBottom: `${margins.bottomPx}px`,
        paddingLeft: `${margins.horizontalPx}px`,
        paddingRight: `${margins.horizontalPx}px`,
        fontFamily: fonts.domBodyFamily,
        fontSize: `${density.fontSize.bodyPx}px`,
        lineHeight: density.lineHeight,
      },
      sectionStyle: {
        marginBottom: `${density.sectionSpacingPx}px`,
        breakInside: "avoid",
        pageBreakInside: "avoid",
      },
      itemStyle: {
        marginBottom: `${density.itemSpacingPx}px`,
        breakInside: "avoid",
        pageBreakInside: "avoid",
      },
      bulletListStyle: {
        marginTop: `${density.bulletSpacingPx}px`,
        display: "flex",
        flexDirection: "column",
        gap: `${density.bulletSpacingPx}px`,
      },
      bulletItemStyle: {
        display: "flex",
        alignItems: "flex-start",
        gap: "6px",
        lineHeight: density.lineHeight,
      },
      bulletMarkerStyle: {
        flexShrink: 0,
        width: `${BULLET_TOKENS.widthPx}px`,
        textAlign: "center",
        color: accentColor,
        userSelect: "none",
      },
      bulletTextStyle: {
        flex: 1,
        fontSize: `${density.fontSize.bodyPx}px`,
        lineHeight: density.lineHeight,
      },
      heading1Style: {
        fontFamily: fonts.domHeadingFamily,
        fontSize: `${density.fontSize.namePx}px`,
        lineHeight: 1.15,
        fontWeight: 800,
        color: accentColor,
      },
      heading2Style: {
        fontFamily: fonts.domHeadingFamily,
        fontSize: `${density.fontSize.sectionHeadingPx}px`,
        lineHeight: 1.25,
        fontWeight: 700,
        color: accentColor,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        borderBottom: `1.5px solid ${accentColor}`,
        paddingBottom: "3px",
        marginBottom: `${density.itemSpacingPx}px`,
      },
      subheadingStyle: {
        fontFamily: fonts.domHeadingFamily,
        fontSize: `${density.fontSize.titlePx}px`,
        lineHeight: 1.3,
        fontWeight: 600,
      },
      bodyStyle: {
        fontSize: `${density.fontSize.bodyPx}px`,
        lineHeight: density.lineHeight,
      },
    },
    pdf: {
      pageStyle: {
        paddingTop: margins.topPt,
        paddingBottom: margins.bottomPt,
        paddingHorizontal: margins.horizontalPt,
        fontFamily: fonts.pdfPrimaryFont,
        fontSize: density.fontSize.bodyPt,
        color: "#1e293b",
      },
      sectionStyle: {
        marginBottom: density.sectionSpacingPt,
      },
      itemStyle: {
        marginBottom: density.itemSpacingPt,
      },
      itemDescription: {
        fontSize: density.fontSize.bodyPt,
        color: "#334155",
        marginTop: 2,
        marginBottom: density.bulletSpacingPt,
      },
      bulletRow: {
        flexDirection: "row" as const,
        marginBottom: density.bulletSpacingPt,
      },
      bulletMarker: {
        width: BULLET_TOKENS.widthPt,
        fontSize: density.fontSize.bodyPt,
      },
      bulletText: {
        flex: 1,
        fontSize: density.fontSize.bodyPt,
        color: "#334155",
      },
    },
  };
}
