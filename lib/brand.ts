/**
 * Cleartrix Brand Configuration — Single Source of Truth
 * All product names, taglines, domain references, and storage prefixes are defined here.
 */

export const BRAND = {
  name: "Cleartrix",
  tagline: "Free tools that stay on your device.",
  description:
    "Free online tools for PDFs, images, documents, resumes, calculators and more. Everything runs in your browser and your files never leave your device.",
  domain: "https://cleartrix.com", // Owner to update once production domain is finalized
  storagePrefix: "ct_",
  resumeProduct: {
    name: "Cleartrix Resume Builder",
    legacyName: "Cleartrix Resume Builder",
  },
  colors: {
    primary: "#2563EB", // Brand Blue
    primaryDark: "#1E3A8A", // Deep Navy
    cyanAccent: "#00D2FF",
    canvas: "#F8FAFC",
  },
} as const;

export type BrandConfig = typeof BRAND;
