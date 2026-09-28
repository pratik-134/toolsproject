/**
 * ClearTrix Brand Configuration — Single Source of Truth
 * All product names, taglines, domain references, and brand colors are defined here.
 * Aligned with official ClearTrix Brand Guidelines asset specs.
 */

export const BRAND = {
  name: "ClearTrix",
  tagline: "Tools for a Smarter You",
  description:
    "Free online privacy-first tools for PDFs, images, documents, resumes, calculators and developer tools. 100% in-browser execution.",
  domain: "https://cleartrix.com",
  storagePrefix: "ct_",
  resumeProduct: {
    name: "ClearTrix Resume Builder",
    legacyName: "ClearTrix Resume Builder",
  },
  colors: {
    primary: "#3B82F6",     // Primary Blue (#3B82F6)
    accentTeal: "#06D6A0",  // Accent Teal (#06D6A0)
    primaryDark: "#0F172A", // Dark Navy (#0F172A)
    gray: "#94A3B8",       // Gray (#94A3B8)
    canvas: "#F8FAFC",     // Light (#F8FAFC)
  },
} as const;

export type BrandConfig = typeof BRAND;
