/**
 * ClearTrix Converter Preset Registry
 * Maps converter tool slugs to typed engine presets.
 */

export type ConverterEngineType =
  | "canvas-image"
  | "images-to-pdf"
  | "pdf-to-images"
  | "pdf-text"
  | "heic"
  | "ico"
  | "ffmpeg-media"
  | "data-transform"
  | "text-transform"
  | "color"
  | "ocr";

export interface ConverterPreset {
  slug: string;
  engine: ConverterEngineType;
  inputFormats: string[];
  inputMimeTypes: string[];
  outputFormat: string;
  defaultOptions: {
    quality?: number; // 0.1 to 1.0
    backgroundColor?: string; // hex or 'transparent'
    scale?: number; // e.g. 1, 2, 3
    pageSize?: "a4" | "letter" | "fit";
    margin?: number; // in pt or mm
    orientation?: "portrait" | "landscape";
    icoSizes?: number[];
    [key: string]: any;
  };
  maxFileSizeMB: number;
  multiFile: boolean;
  actionLabel: string;
  downloadFilenameExtension: string;
}

export const CONVERTER_PRESETS: Record<string, ConverterPreset> = {
  // Wave 1: Image Converters
  "webp-to-png": {
    slug: "webp-to-png",
    engine: "canvas-image",
    inputFormats: [".webp"],
    inputMimeTypes: ["image/webp"],
    outputFormat: "png",
    defaultOptions: { backgroundColor: "transparent" },
    maxFileSizeMB: 50,
    multiFile: true,
    actionLabel: "Convert WebP to PNG",
    downloadFilenameExtension: ".png",
  },
  "webp-to-jpg": {
    slug: "webp-to-jpg",
    engine: "canvas-image",
    inputFormats: [".webp"],
    inputMimeTypes: ["image/webp"],
    outputFormat: "jpeg",
    defaultOptions: { quality: 0.92, backgroundColor: "#FFFFFF" },
    maxFileSizeMB: 50,
    multiFile: true,
    actionLabel: "Convert WebP to JPG",
    downloadFilenameExtension: ".jpg",
  },
  "png-to-jpg": {
    slug: "png-to-jpg",
    engine: "canvas-image",
    inputFormats: [".png"],
    inputMimeTypes: ["image/png"],
    outputFormat: "jpeg",
    defaultOptions: { quality: 0.92, backgroundColor: "#FFFFFF" },
    maxFileSizeMB: 50,
    multiFile: true,
    actionLabel: "Convert PNG to JPG",
    downloadFilenameExtension: ".jpg",
  },
  "jpg-to-png": {
    slug: "jpg-to-png",
    engine: "canvas-image",
    inputFormats: [".jpg", ".jpeg"],
    inputMimeTypes: ["image/jpeg"],
    outputFormat: "png",
    defaultOptions: { backgroundColor: "transparent" },
    maxFileSizeMB: 50,
    multiFile: true,
    actionLabel: "Convert JPG to PNG",
    downloadFilenameExtension: ".png",
  },
  "svg-to-png": {
    slug: "svg-to-png",
    engine: "canvas-image",
    inputFormats: [".svg"],
    inputMimeTypes: ["image/svg+xml"],
    outputFormat: "png",
    defaultOptions: { scale: 2, backgroundColor: "transparent" },
    maxFileSizeMB: 20,
    multiFile: true,
    actionLabel: "Convert SVG to High-Res PNG",
    downloadFilenameExtension: ".png",
  },
  "image-to-ico": {
    slug: "image-to-ico",
    engine: "ico",
    inputFormats: [".png", ".jpg", ".jpeg", ".webp", ".svg"],
    inputMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    outputFormat: "ico",
    defaultOptions: { icoSizes: [16, 32, 48, 64, 128, 256] },
    maxFileSizeMB: 20,
    multiFile: false,
    actionLabel: "Generate Favicon ICO Package",
    downloadFilenameExtension: ".ico",
  },
  "heic-to-jpg": {
    slug: "heic-to-jpg",
    engine: "heic",
    inputFormats: [".heic", ".heif"],
    inputMimeTypes: ["image/heic", "image/heif"],
    outputFormat: "jpeg",
    defaultOptions: { quality: 0.92, backgroundColor: "#FFFFFF" },
    maxFileSizeMB: 50,
    multiFile: true,
    actionLabel: "Convert HEIC Photos to JPG",
    downloadFilenameExtension: ".jpg",
  },

  // Wave 1: PDF Converters
  "jpg-to-pdf": {
    slug: "jpg-to-pdf",
    engine: "images-to-pdf",
    inputFormats: [".jpg", ".jpeg", ".png", ".webp"],
    inputMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    outputFormat: "pdf",
    defaultOptions: { pageSize: "a4", margin: 10, orientation: "portrait" },
    maxFileSizeMB: 100,
    multiFile: true,
    actionLabel: "Convert Images to PDF Document",
    downloadFilenameExtension: ".pdf",
  },
  "pdf-to-jpg": {
    slug: "pdf-to-jpg",
    engine: "pdf-to-images",
    inputFormats: [".pdf"],
    inputMimeTypes: ["application/pdf"],
    outputFormat: "jpeg",
    defaultOptions: { scale: 2, quality: 0.92 },
    maxFileSizeMB: 100,
    multiFile: false,
    actionLabel: "Render PDF Pages to JPG Images",
    downloadFilenameExtension: ".zip",
  },
  "pdf-to-png": {
    slug: "pdf-to-png",
    engine: "pdf-to-images",
    inputFormats: [".pdf"],
    inputMimeTypes: ["application/pdf"],
    outputFormat: "png",
    defaultOptions: { scale: 2 },
    maxFileSizeMB: 100,
    multiFile: false,
    actionLabel: "Render PDF Pages to High-Res PNG",
    downloadFilenameExtension: ".zip",
  },
  "pdf-to-text": {
    slug: "pdf-to-text",
    engine: "pdf-text",
    inputFormats: [".pdf"],
    inputMimeTypes: ["application/pdf"],
    outputFormat: "txt",
    defaultOptions: {},
    maxFileSizeMB: 50,
    multiFile: false,
    actionLabel: "Extract Text from PDF Document",
    downloadFilenameExtension: ".txt",
  },

  // Wave 1: Media Converters
  "mp4-to-mp3": {
    slug: "mp4-to-mp3",
    engine: "ffmpeg-media",
    inputFormats: [".mp4", ".m4v"],
    inputMimeTypes: ["video/mp4"],
    outputFormat: "mp3",
    defaultOptions: { audioBitrate: "192k" },
    maxFileSizeMB: 200,
    multiFile: false,
    actionLabel: "Extract MP3 Audio from MP4 Video",
    downloadFilenameExtension: ".mp3",
  },
  "mov-to-mp4": {
    slug: "mov-to-mp4",
    engine: "ffmpeg-media",
    inputFormats: [".mov", ".qt"],
    inputMimeTypes: ["video/quicktime"],
    outputFormat: "mp4",
    defaultOptions: {},
    maxFileSizeMB: 200,
    multiFile: false,
    actionLabel: "Convert QuickTime MOV to MP4",
    downloadFilenameExtension: ".mp4",
  },
  "wav-to-mp3": {
    slug: "wav-to-mp3",
    engine: "ffmpeg-media",
    inputFormats: [".wav"],
    inputMimeTypes: ["audio/wav", "audio/x-wav"],
    outputFormat: "mp3",
    defaultOptions: { audioBitrate: "192k" },
    maxFileSizeMB: 100,
    multiFile: false,
    actionLabel: "Convert WAV Audio to Compact MP3",
    downloadFilenameExtension: ".mp3",
  },

  // Wave 2: Media Converters
  "webm-to-mp4": {
    slug: "webm-to-mp4",
    engine: "ffmpeg-media",
    inputFormats: [".webm"],
    inputMimeTypes: ["video/webm"],
    outputFormat: "mp4",
    defaultOptions: {},
    maxFileSizeMB: 200,
    multiFile: false,
    actionLabel: "Convert WebM Video to MP4",
    downloadFilenameExtension: ".mp4",
  },
  "m4a-to-mp3": {
    slug: "m4a-to-mp3",
    engine: "ffmpeg-media",
    inputFormats: [".m4a", ".aac"],
    inputMimeTypes: ["audio/m4a", "audio/mp4", "audio/aac"],
    outputFormat: "mp3",
    defaultOptions: { audioBitrate: "192k" },
    maxFileSizeMB: 100,
    multiFile: false,
    actionLabel: "Convert M4A Audio to MP3",
    downloadFilenameExtension: ".mp3",
  },
  "flac-to-mp3": {
    slug: "flac-to-mp3",
    engine: "ffmpeg-media",
    inputFormats: [".flac"],
    inputMimeTypes: ["audio/flac", "audio/x-flac"],
    outputFormat: "mp3",
    defaultOptions: { audioBitrate: "320k" },
    maxFileSizeMB: 150,
    multiFile: false,
    actionLabel: "Convert Lossless FLAC to MP3",
    downloadFilenameExtension: ".mp3",
  },
  "gif-to-mp4": {
    slug: "gif-to-mp4",
    engine: "ffmpeg-media",
    inputFormats: [".gif"],
    inputMimeTypes: ["image/gif"],
    outputFormat: "mp4",
    defaultOptions: {},
    maxFileSizeMB: 50,
    multiFile: false,
    actionLabel: "Convert Animated GIF to MP4 Video",
    downloadFilenameExtension: ".mp4",
  },

  // Wave 2: Developer & Data Converters
  "markdown-to-html": {
    slug: "markdown-to-html",
    engine: "data-transform",
    inputFormats: [".md", ".markdown", ".txt"],
    inputMimeTypes: ["text/markdown", "text/plain"],
    outputFormat: "html",
    defaultOptions: { sanitize: true },
    maxFileSizeMB: 10,
    multiFile: false,
    actionLabel: "Convert Markdown to HTML",
    downloadFilenameExtension: ".html",
  },
  "html-to-markdown": {
    slug: "html-to-markdown",
    engine: "data-transform",
    inputFormats: [".html", ".htm"],
    inputMimeTypes: ["text/html"],
    outputFormat: "md",
    defaultOptions: {},
    maxFileSizeMB: 10,
    multiFile: false,
    actionLabel: "Convert HTML to Clean Markdown",
    downloadFilenameExtension: ".md",
  },
  "csv-to-excel": {
    slug: "csv-to-excel",
    engine: "data-transform",
    inputFormats: [".csv", ".tsv", ".txt"],
    inputMimeTypes: ["text/csv", "text/tab-separated-values", "text/plain"],
    outputFormat: "xlsx",
    defaultOptions: {},
    maxFileSizeMB: 20,
    multiFile: false,
    actionLabel: "Convert CSV to Excel .XLSX Spreadsheet",
    downloadFilenameExtension: ".xlsx",
  },
  "json-to-typescript": {
    slug: "json-to-typescript",
    engine: "text-transform",
    inputFormats: [".json"],
    inputMimeTypes: ["application/json"],
    outputFormat: "ts",
    defaultOptions: { rootName: "RootObject" },
    maxFileSizeMB: 10,
    multiFile: false,
    actionLabel: "Generate TypeScript Interfaces",
    downloadFilenameExtension: ".ts",
  },
  "xml-to-csv": {
    slug: "xml-to-csv",
    engine: "data-transform",
    inputFormats: [".xml"],
    inputMimeTypes: ["application/xml", "text/xml"],
    outputFormat: "csv",
    defaultOptions: {},
    maxFileSizeMB: 20,
    multiFile: false,
    actionLabel: "Convert XML Data to CSV Table",
    downloadFilenameExtension: ".csv",
  },

  // Wave 2: Utility & Math Converters
  "color-converter": {
    slug: "color-converter",
    engine: "color",
    inputFormats: [],
    inputMimeTypes: [],
    outputFormat: "css",
    defaultOptions: { defaultColor: "#3B82F6" },
    maxFileSizeMB: 0,
    multiFile: false,
    actionLabel: "Convert Color Formats & Copy CSS",
    downloadFilenameExtension: ".txt",
  },
  "text-to-binary": {
    slug: "text-to-binary",
    engine: "text-transform",
    inputFormats: [".txt"],
    inputMimeTypes: ["text/plain"],
    outputFormat: "bin",
    defaultOptions: { mode: "text-to-binary" },
    maxFileSizeMB: 10,
    multiFile: false,
    actionLabel: "Convert Text to Binary / Hex",
    downloadFilenameExtension: ".txt",
  },
  "roman-numeral-converter": {
    slug: "roman-numeral-converter",
    engine: "text-transform",
    inputFormats: [],
    inputMimeTypes: [],
    outputFormat: "txt",
    defaultOptions: { mode: "number-to-roman" },
    maxFileSizeMB: 0,
    multiFile: false,
    actionLabel: "Convert Roman Numerals",
    downloadFilenameExtension: ".txt",
  },
  "number-to-words": {
    slug: "number-to-words",
    engine: "text-transform",
    inputFormats: [],
    inputMimeTypes: [],
    outputFormat: "txt",
    defaultOptions: {},
    maxFileSizeMB: 0,
    multiFile: false,
    actionLabel: "Convert Number to English Words",
    downloadFilenameExtension: ".txt",
  },
};

export function getConverterPreset(slug: string): ConverterPreset | undefined {
  return CONVERTER_PRESETS[slug];
}
