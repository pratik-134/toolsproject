/**
 * ClearTrix Brand Identity Configuration — Single Source of Truth
 * 
 * ALL product names, taglines, domain references, trust guarantees, 
 * metadata titles/descriptions, legal copyright text, and brand colors 
 * are defined here.
 * 
 * Rebranding Principle:
 * If the brand name or identity changes in the future (e.g. from "ClearTrix" to any new brand),
 * updating the properties in THIS SINGLE FILE will automatically update the entire application.
 */

export const BRAND = {
  /** Core Brand Identity */
  name: "ClearTrix",
  shortName: "ClearTrix",
  brandPrefix: "Clear",
  brandSuffix: "Trix",
  legalName: "ClearTrix Technologies Inc.",
  tagline: "Tools for a Smarter You",
  shortTagline: "Open & private · zero paywalls",
  description:
    "Free online privacy-first tools for PDFs, images, documents, resumes, calculators and developer tools. 100% in-browser execution with zero server uploads.",

  /** Domain & URLs */
  domain: "https://cleartrix.com",
  domainName: "cleartrix.com",
  supportEmail: "support@cleartrix.com",
  twitterHandle: "@cleartrix",

  /** Local Storage & State Prefixes */
  storagePrefix: "ct_",
  announcementStorageKey: "ct_announcement_dismissed_v1",
  brandMigratedFlag: "ct_brand_migrated_v1",

  /** Flagship Product: Resume Builder */
  resumeProduct: {
    name: "ClearTrix Resume Builder",
    shortName: "Resume Builder",
    legacyName: "ClearTrix Resume Builder",
    description:
      "Build executive-grade, ATS-optimized resumes with 20+ professional templates. 100% free with vector PDF and native Word export.",
  },

  /** Badges & Trust Guarantees */
  badges: {
    trustPill: "✦ Open & private · zero paywalls",
    securityBadge: "● Runs locally · zero uploads",
    freeTag: "100% Free & Private",
    zeroUploads: "100% Free, Zero Uploads & Zero Server Storage",
    localMemory:
      "Every tool executes completely inside your browser memory. No uploads, no watermarks, no registration traps.",
    noTracking: "Zero Tracking Cookies",
  },

  /** Platform Colors & Design Tokens */
  colors: {
    primary: "#3B82F6",     // Primary Blue (#3B82F6)
    accentTeal: "#06D6A0",  // Accent Teal (#06D6A0)
    primaryDark: "#0F172A", // Dark Navy (#0F172A)
    gray: "#94A3B8",        // Gray (#94A3B8)
    canvas: "#F8FAFC",      // Light Canvas (#F8FAFC)
  },

  /** Social Links */
  social: {
    github: "https://github.com/pratik-134/toolsproject",
    twitter: "https://twitter.com/cleartrix",
    linkedin: "https://linkedin.com/company/cleartrix",
  },
} as const;

/** Brand Helper Functions for Dynamic Metadata, Titles and Statements */
export function getMetaTitle(pageName?: string): string {
  if (!pageName) return `${BRAND.name} — ${BRAND.tagline}`;
  return pageName.includes(BRAND.name) ? pageName : `${pageName} | ${BRAND.name}`;
}

export function getCategoryMetaTitle(categoryName: string): string {
  return `${categoryName} — 100% Free & Private | ${BRAND.name}`;
}

export function getToolMetaTitle(toolTitle: string): string {
  if (toolTitle.includes(BRAND.name)) return toolTitle;
  return `${toolTitle} | ${BRAND.name}`;
}

export function getFooterCopyright(toolCount: number): string {
  return `© ${new Date().getFullYear()} ${BRAND.name}. All ${toolCount} web tools execute 100% in-browser with zero server tracking.`;
}

export type BrandConfig = typeof BRAND;
