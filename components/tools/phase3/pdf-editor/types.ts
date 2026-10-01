export type EditorMode =
  | "organize"
  | "annotate"
  | "content"
  | "sign"
  | "stamp"
  | "forms"
  | "redact"
  | "security"
  | "convert"
  | "ocr"
  | "compare";

export type EditorTool =
  | "select"
  | "hand"
  | "text"
  | "whiteout"
  | "image"
  | "draw"
  | "highlight"
  | "underline"
  | "strike"
  | "squiggly"
  | "sticky"
  | "shape-rect"
  | "shape-circle"
  | "line"
  | "arrow"
  | "sign"
  | "stamp"
  | "eraser"
  | "form-text"
  | "form-check"
  | "form-radio"
  | "form-dropdown"
  | "form-listbox"
  | "form-button"
  | "form-sig"
  | "redact-box";

export interface PageMeta {
  id: string;
  pageNumber: number; // 1-indexed display
  originalIndex: number; // 0-indexed in source file, -1 if inserted blank
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  cropBox?: { x: number; y: number; width: number; height: number } | null;
  label?: string;
  thumbnailUrl?: string | null;
}

export type AnnotationType =
  | "highlight"
  | "underline"
  | "strikethrough"
  | "squiggly"
  | "sticky-note"
  | "freehand"
  | "shape-rect"
  | "shape-circle"
  | "line"
  | "arrow"
  | "stamp";

export interface AnnotationObject {
  id: string;
  type: AnnotationType;
  pageIndex: number;
  x: number; // points
  y: number; // points
  width: number;
  height: number;
  points?: { x: number; y: number }[]; // for freehand or line endpoints
  color: string;
  opacity: number;
  strokeWidth: number;
  fillColor?: string;
  text?: string;
  comment?: string;
  author?: string;
  createdAt: string;
}

export type ContentElementType =
  | "text"
  | "whiteout"
  | "image"
  | "signature"
  | "initials"
  | "date"
  | "link";

export interface ContentElement {
  id: string;
  type: ContentElementType;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: "Helvetica" | "Helvetica-Bold" | "Times-Roman" | "Courier";
  color?: string;
  backgroundColor?: string;
  imageDataUrl?: string;
  url?: string;
}

// --- TIER 2: FORMS ---
export type FormFieldType =
  | "text"
  | "checkbox"
  | "radio"
  | "dropdown"
  | "listbox"
  | "button-submit"
  | "button-reset"
  | "signature-placeholder";

export interface FormFieldDef {
  id: string;
  name: string;
  type: FormFieldType;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string | boolean;
  defaultValue?: string | boolean;
  options?: string[]; // For dropdown, listbox, radio
  isMultiline?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isPassword?: boolean;
  actionUrl?: string; // For submit button
}

// --- TIER 2: REDACTION ---
export interface RedactionItem {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string; // e.g. "[REDACTED]" or "FOIA (b)(4)"
  applied?: boolean;
}

// --- TIER 2: SECURITY & METADATA ---
export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
}

export interface SecurityConfig {
  isEncrypted: boolean;
  userPassword?: string;
  permissions: {
    allowPrinting: boolean;
    allowCopying: boolean;
    allowModifying: boolean;
    allowAnnotating: boolean;
  };
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  color: string;
  opacity: number;
  fontSize: number;
  rotation: number;
}

export interface PageNumberConfig {
  enabled: boolean;
  format: "page" | "page-of-total" | "simple";
  position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  fontSize: number;
  color: string;
}

export interface BatesConfig {
  enabled: boolean;
  prefix: string;
  suffix: string;
  startNumber: number;
  digits: number;
  position: "top-right" | "bottom-right" | "bottom-left";
}

export interface HeaderFooterConfig {
  enabled: boolean;
  headerText: string;
  footerText: string;
  fontSize: number;
  color: string;
}

export interface PageBackgroundConfig {
  enabled: boolean;
  color: string;
}

export interface DocumentHistoryEntry {
  pages: PageMeta[];
  annotations: AnnotationObject[];
  elements: ContentElement[];
  formFields: FormFieldDef[];
  redactions: RedactionItem[];
  metadata: PdfMetadata;
  security: SecurityConfig;
  isFlattened: boolean;
  watermark: WatermarkConfig | null;
  pageNumbering: PageNumberConfig | null;
  bates: BatesConfig | null;
  headerFooter: HeaderFooterConfig | null;
  pageBackground: PageBackgroundConfig | null;
}

// Tier 3 Types
export interface OcrWordBox {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface OcrPageResult {
  pageIndex: number;
  fullText: string;
  words: OcrWordBox[];
}

export interface ComparisonDiff {
  pageIndex: number;
  diffScore: number;
  diffCanvasDataUrl?: string;
}

export type ConversionTarget =
  | "docx"
  | "xlsx"
  | "pptx"
  | "jpg"
  | "png"
  | "txt"
  | "html";

