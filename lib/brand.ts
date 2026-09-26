/**
 * Mindkit Brand Configuration — Single Source of Truth
 * All product names, taglines, domain references, and storage prefixes are defined here.
 */

export const BRAND = {
  name: "Mindkit",
  tagline: "Free tools that stay on your device.",
  description:
    "Free online tools for PDFs, images, documents, resumes, calculators and more. Everything runs in your browser and your files never leave your device.",
  domain: "https://mindkit.dev", // Owner to update once production domain is finalized
  storagePrefix: "mk_",
  resumeProduct: {
    name: "Mindkit Resume Builder",
    legacyName: "Resume Builder Lab",
  },
  colors: {
    primary: "#2563EB", // Brand Blue
    primaryDark: "#1E3A8A", // Deep Navy
    cyanAccent: "#00D2FF",
    canvas: "#F8FAFC",
  },
} as const;

export type BrandConfig = typeof BRAND;
