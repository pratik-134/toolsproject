import { CategoryDefinition, CategoryId } from "./types";
import { CATEGORY_COLORS, CategoryColorToken } from "../design-tokens";

export const CATEGORIES: Record<CategoryId, CategoryDefinition> = {
  "document-pdf": {
    id: "document-pdf",
    name: "Document & PDF Tools",
    shortName: "PDF & Docs",
    description:
      "Merge, split, compress, encrypt, redact, and convert PDFs and office documents 100% locally in your browser sandbox.",
    iconName: "FileText",
    expectedToolCount: 34,
    colorKey: "pdf",
  },
  image: {
    id: "image",
    name: "Image Tools & Optimizers",
    shortName: "Images",
    description:
      "Crop, convert, resize, compress, retouch, remove EXIF metadata, and generate app favicons with zero server uploads.",
    iconName: "Image",
    expectedToolCount: 26,
    colorKey: "image",
  },
  security: {
    id: "security",
    name: "Security & Privacy Tools",
    shortName: "Security",
    description:
      "Client-side file locker encryption (AES-256), metadata scrubbing, steganography, and privacy verification utilities.",
    iconName: "ShieldCheck",
    expectedToolCount: 4,
    colorKey: "security",
  },
  "url-cloud": {
    id: "url-cloud",
    name: "URL & Cloud Tools",
    shortName: "URL & Cloud",
    description:
      "Protected links, burn-after-read secret sharing, and temporary client-side encrypted text vaults.",
    iconName: "Cloud",
    expectedToolCount: 0,
    colorKey: "codes",
  },
  codes: {
    id: "codes",
    name: "QR & Barcode Utilities",
    shortName: "Codes & QR",
    description:
      "Generate and scan custom QR codes and retail barcodes (UPC-A, EAN-13, Code 128) instantly on your device.",
    iconName: "QrCode",
    expectedToolCount: 4,
    colorKey: "codes",
  },
  video: {
    id: "video",
    name: "Screen Capture & Video",
    shortName: "Video",
    description:
      "Record desktop, windows, and webcam; trim, crop, compress, and transcode video without data ever leaving your browser.",
    iconName: "Video",
    expectedToolCount: 10,
    colorKey: "video",
  },
  audio: {
    id: "audio",
    name: "Audio & Voice Tools",
    shortName: "Audio",
    description:
      "Transcode audio, trim waveforms, record voice memos, boost volume, and edit ID3 tags in your browser memory.",
    iconName: "Mic",
    expectedToolCount: 6,
    colorKey: "audio",
  },
  builders: {
    id: "builders",
    name: "Business & Document Builders",
    shortName: "Builders",
    description:
      "Craft ATS-friendly resumes, professional invoices, proposals, certificates, and cover letters with real-time vector preview.",
    iconName: "Layers",
    expectedToolCount: 5,
    colorKey: "builders",
  },
  developer: {
    id: "developer",
    name: "Developer, Data & Code",
    shortName: "Developer",
    description:
      "Format, validate, beautify, and convert JSON, XML, YAML, SQL, regex, Base64, and code diffs with complete local secrecy.",
    iconName: "Code2",
    expectedToolCount: 27,
    colorKey: "developer",
  },
  utilities: {
    id: "utilities",
    name: "Everyday Utilities",
    shortName: "Utilities",
    description:
      "Word counter, case converter, password generator, checksum verifier, unit converter, and duplicate line cleaner.",
    iconName: "Wrench",
    expectedToolCount: 13,
    colorKey: "utility",
  },
  calculators: {
    id: "calculators",
    name: "Calculators (Finance, Health, Math, Tech)",
    shortName: "Calculators",
    description:
      "Mortgage amortization, compound interest, ROI, BMI, calorie split, date math, subnetting, and unit converters.",
    iconName: "Calculator",
    expectedToolCount: 33,
    colorKey: "calculators",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export function getCategoryById(id: string): CategoryDefinition | undefined {
  return CATEGORIES[id as CategoryId];
}

/**
 * Returns the CategoryColorToken for a given category ID or color key.
 * Defaults to security (Navy) if category is unknown.
 */
export function getCategoryColor(categoryId: string): CategoryColorToken {
  const cat = getCategoryById(categoryId);
  const key = cat?.colorKey ?? "security";
  return CATEGORY_COLORS[key];
}
