"use client";

import React from "react";
import dynamic from "next/dynamic";
function ToolLoadingState({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-muted-foreground font-medium">
        Loading {name} sandbox...
      </p>
    </div>
  );
}

const CanvasImageEngine = dynamic(
  () => import("@/components/tools/engines/CanvasImageEngine").then((m) => m.CanvasImageEngine),
  { ssr: false, loading: () => <ToolLoadingState name="Image Engine" /> }
);
const ImagesToPdfEngine = dynamic(
  () => import("@/components/tools/engines/ImagesToPdfEngine").then((m) => m.ImagesToPdfEngine),
  { ssr: false, loading: () => <ToolLoadingState name="PDF Engine" /> }
);
const PdfImageEngine = dynamic(
  () => import("@/components/tools/engines/PdfImageEngine").then((m) => m.PdfImageEngine),
  { ssr: false, loading: () => <ToolLoadingState name="PDF Image Engine" /> }
);
const PdfTextEngine = dynamic(
  () => import("@/components/tools/engines/PdfTextEngine").then((m) => m.PdfTextEngine),
  { ssr: false, loading: () => <ToolLoadingState name="PDF Text Engine" /> }
);
const HeicEngine = dynamic(
  () => import("@/components/tools/engines/HeicEngine").then((m) => m.HeicEngine),
  { ssr: false, loading: () => <ToolLoadingState name="HEIC Engine" /> }
);
const IcoEngine = dynamic(
  () => import("@/components/tools/engines/IcoEngine").then((m) => m.IcoEngine),
  { ssr: false, loading: () => <ToolLoadingState name="ICO Engine" /> }
);
const FfmpegMediaEngine = dynamic(
  () => import("@/components/tools/engines/FfmpegMediaEngine").then((m) => m.FfmpegMediaEngine),
  { ssr: false, loading: () => <ToolLoadingState name="Media Conversion Engine" /> }
);
const DataTransformEngine = dynamic(
  () => import("@/components/tools/engines/DataTransformEngine").then((m) => m.DataTransformEngine),
  { ssr: false, loading: () => <ToolLoadingState name="Data Transform Engine" /> }
);
const TextTransformEngine = dynamic(
  () => import("@/components/tools/engines/TextTransformEngine").then((m) => m.TextTransformEngine),
  { ssr: false, loading: () => <ToolLoadingState name="Text Engine" /> }
);
const ColorConverterEngine = dynamic(
  () => import("@/components/tools/engines/ColorConverterEngine").then((m) => m.ColorConverterEngine),
  { ssr: false, loading: () => <ToolLoadingState name="Color Engine" /> }
);
const OcrEngine = dynamic(
  () => import("@/components/tools/engines/OcrEngine").then((m) => m.OcrEngine),
  { ssr: false, loading: () => <ToolLoadingState name="OCR Engine" /> }
);
import { getConverterPreset } from "@/lib/registry/converter-presets";

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  // Wave 1 Converter Tools
  "webp-to-png": () => <CanvasImageEngine preset={getConverterPreset("webp-to-png")!} />,
  "webp-to-jpg": () => <CanvasImageEngine preset={getConverterPreset("webp-to-jpg")!} />,
  "png-to-jpg": () => <CanvasImageEngine preset={getConverterPreset("png-to-jpg")!} />,
  "jpg-to-png": () => <CanvasImageEngine preset={getConverterPreset("jpg-to-png")!} />,
  "png-to-webp": () => <CanvasImageEngine preset={getConverterPreset("png-to-webp")!} />,
  "jpg-to-webp": () => <CanvasImageEngine preset={getConverterPreset("jpg-to-webp")!} />,
  "svg-to-png": () => <CanvasImageEngine preset={getConverterPreset("svg-to-png")!} />,
  "svg-to-jpg": () => <CanvasImageEngine preset={getConverterPreset("svg-to-jpg")!} />,
  "svg-to-webp": () => <CanvasImageEngine preset={getConverterPreset("svg-to-webp")!} />,
  "gif-to-jpg": () => <CanvasImageEngine preset={getConverterPreset("gif-to-jpg")!} />,
  "gif-to-webp": () => <CanvasImageEngine preset={getConverterPreset("gif-to-webp")!} />,
  "bmp-to-webp": () => <CanvasImageEngine preset={getConverterPreset("bmp-to-webp")!} />,
  "image-to-ico": () => <IcoEngine preset={getConverterPreset("image-to-ico")!} />,
  "heic-to-jpg": () => <HeicEngine preset={getConverterPreset("heic-to-jpg")!} />,
  "heic-to-png": () => <HeicEngine preset={getConverterPreset("heic-to-png")!} />,
  "jpg-to-pdf": () => <ImagesToPdfEngine preset={getConverterPreset("jpg-to-pdf")!} />,
  "pdf-to-jpg": () => <PdfImageEngine preset={getConverterPreset("pdf-to-jpg")!} />,
  "pdf-to-png": () => <PdfImageEngine preset={getConverterPreset("pdf-to-png")!} />,
  "pdf-to-text": () => <PdfTextEngine preset={getConverterPreset("pdf-to-text")!} />,
  "mp4-to-mp3": () => <FfmpegMediaEngine preset={getConverterPreset("mp4-to-mp3")!} />,
  "mov-to-mp4": () => <FfmpegMediaEngine preset={getConverterPreset("mov-to-mp4")!} />,
  "wav-to-mp3": () => <FfmpegMediaEngine preset={getConverterPreset("wav-to-mp3")!} />,

  // Wave 2 Converter Tools
  "webm-to-mp4": () => <FfmpegMediaEngine preset={getConverterPreset("webm-to-mp4")!} />,
  "m4a-to-mp3": () => <FfmpegMediaEngine preset={getConverterPreset("m4a-to-mp3")!} />,
  "flac-to-mp3": () => <FfmpegMediaEngine preset={getConverterPreset("flac-to-mp3")!} />,
  "gif-to-mp4": () => <FfmpegMediaEngine preset={getConverterPreset("gif-to-mp4")!} />,
  "markdown-to-html": () => <DataTransformEngine preset={getConverterPreset("markdown-to-html")!} />,
  "html-to-markdown": () => <DataTransformEngine preset={getConverterPreset("html-to-markdown")!} />,
  "csv-to-excel": () => <DataTransformEngine preset={getConverterPreset("csv-to-excel")!} />,
  "xml-to-csv": () => <DataTransformEngine preset={getConverterPreset("xml-to-csv")!} />,
  "json-to-typescript": () => <TextTransformEngine preset={getConverterPreset("json-to-typescript")!} />,
  "text-to-binary": () => <TextTransformEngine preset={getConverterPreset("text-to-binary")!} />,
  "roman-numeral-converter": () => <TextTransformEngine preset={getConverterPreset("roman-numeral-converter")!} />,
  "number-to-words": () => <TextTransformEngine preset={getConverterPreset("number-to-words")!} />,
  "color-converter": () => <ColorConverterEngine preset={getConverterPreset("color-converter")!} />,

  // Wave 3 Converter Tools
  "image-to-text": () => <OcrEngine preset={getConverterPreset("image-to-text")!} />,
  "mkv-to-mp4": () => <FfmpegMediaEngine preset={getConverterPreset("mkv-to-mp4")!} />,
  "avi-to-mp4": () => <FfmpegMediaEngine preset={getConverterPreset("avi-to-mp4")!} />,
  "flv-to-mp4": () => <FfmpegMediaEngine preset={getConverterPreset("flv-to-mp4")!} />,
  "ogg-to-mp3": () => <FfmpegMediaEngine preset={getConverterPreset("ogg-to-mp3")!} />,
  "aac-to-mp3": () => <FfmpegMediaEngine preset={getConverterPreset("aac-to-mp3")!} />,
  "wma-to-mp3": () => <FfmpegMediaEngine preset={getConverterPreset("wma-to-mp3")!} />,
  "bmp-to-jpg": () => <CanvasImageEngine preset={getConverterPreset("bmp-to-jpg")!} />,
  "bmp-to-png": () => <CanvasImageEngine preset={getConverterPreset("bmp-to-png")!} />,
  "gif-to-png": () => <CanvasImageEngine preset={getConverterPreset("gif-to-png")!} />,
  "tsv-to-csv": () => <DataTransformEngine preset={getConverterPreset("tsv-to-csv")!} />,

  // Pilot Tools
  "json-formatter": dynamic(() => import("@/components/tools/pilot/json-formatter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="JSON Formatter & Validator" />,
  }),
  "base64-converter": dynamic(() => import("@/components/tools/pilot/base64-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Base64 Encoder / Decoder" />,
  }),
  "word-counter": dynamic(() => import("@/components/tools/pilot/word-counter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Word & Character Counter" />,
  }),
  "mortgage-calculator": dynamic(() => import("@/components/tools/pilot/mortgage-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Mortgage Calculator" />,
  }),
  "qr-generator": dynamic(() => import("@/components/tools/pilot/qr-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="QR Code Generator" />,
  }),

  // Phase 1 Tools
  "csv-json-converter": dynamic(() => import("@/components/tools/phase1/csv-json"), {
    ssr: false,
    loading: () => <ToolLoadingState name="CSV to JSON Converter" />,
  }),
  "hash-generator": dynamic(() => import("@/components/tools/phase1/hash-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Hash Generator" />,
  }),
  "password-generator": dynamic(() => import("@/components/tools/phase1/password-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Password Generator" />,
  }),
  "case-converter": dynamic(() => import("@/components/tools/phase1/case-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Case Converter" />,
  }),
  "compound-interest-calculator": dynamic(() => import("@/components/tools/phase1/compound-interest"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Compound Interest Calculator" />,
  }),
  "url-encoder": dynamic(() => import("@/components/tools/phase1/url-encoder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="URL Encoder / Decoder" />,
  }),
  "lorem-generator": dynamic(() => import("@/components/tools/phase1/lorem-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Lorem Ipsum Generator" />,
  }),
  "percentage-calculator": dynamic(() => import("@/components/tools/phase1/percentage-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Percentage Calculator" />,
  }),
  "bmi-calculator": dynamic(() => import("@/components/tools/phase1/bmi-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Body Mass Index Calculator" />,
  }),
  "barcode-generator": dynamic(() => import("@/components/tools/phase1/barcode-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Barcode Generator" />,
  }),
  "duplicate-line-remover": dynamic(() => import("@/components/tools/phase1/duplicate-line-remover"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Duplicate Line Remover" />,
  }),
  "html-beautifier": dynamic(() => import("@/components/tools/phase1/html-beautifier"), {
    ssr: false,
    loading: () => <ToolLoadingState name="HTML/CSS/JS Beautifier & Minifier" />,
  }),
  "text-diff": dynamic(() => import("@/components/tools/phase1/text-diff"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Text & Code Diff Comparator" />,
  }),
  "date-calculator": dynamic(() => import("@/components/tools/phase1/date-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Date Calculator & Day Counter" />,
  }),
  "unit-converter": dynamic(() => import("@/components/tools/phase1/unit-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Universal Unit Converter" />,
  }),
  "regex-tester": dynamic(() => import("@/components/tools/phase1/regex-tester"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Regex Tester & Debugger" />,
  }),
  "html-entity-encoder": dynamic(() => import("@/components/tools/phase1/html-entity-encoder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="HTML Entity Encoder / Decoder" />,
  }),
  "age-calculator": dynamic(() => import("@/components/tools/phase1/age-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Age Calculator" />,
  }),
  "discount-calculator": dynamic(() => import("@/components/tools/phase1/discount-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Discount & Savings Calculator" />,
  }),
  "json-xml-converter": dynamic(() => import("@/components/tools/phase1/json-xml-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="JSON to XML Converter" />,
  }),
  "epoch-converter": dynamic(() => import("@/components/tools/phase1/epoch-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Unix Epoch & Timestamp Converter" />,
  }),
  "base-converter": dynamic(() => import("@/components/tools/phase1/base-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Binary & Hex Base Converter" />,
  }),
  "sales-tax-calculator": dynamic(() => import("@/components/tools/phase1/sales-tax-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Sales Tax & VAT Calculator" />,
  }),
  "freelance-rate-calculator": dynamic(() => import("@/components/tools/phase1/freelance-rate-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Freelance Rate Calculator" />,
  }),
  "unicode-normalizer": dynamic(() => import("@/components/tools/phase1/unicode-normalizer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Unicode Normalizer" />,
  }),
  "sql-formatter": dynamic(() => import("@/components/tools/phase1/sql-formatter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="SQL Formatter & Minifier" />,
  }),
  "hmac-generator": dynamic(() => import("@/components/tools/phase1/hmac-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="HMAC Keyed Hash Generator" />,
  }),
  "calorie-calculator": dynamic(() => import("@/components/tools/phase1/calorie-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Calorie & Macro Calculator" />,
  }),
  "water-intake-calculator": dynamic(() => import("@/components/tools/phase1/water-intake-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Water Intake Calculator" />,
  }),
  "json-yaml-converter": dynamic(() => import("@/components/tools/phase1/json-yaml-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="JSON to YAML Converter" />,
  }),
  "checksum-verifier": dynamic(() => import("@/components/tools/phase1/checksum-verifier"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Checksum Verifier" />,
  }),
  "auto-loan-calculator": dynamic(() => import("@/components/tools/phase1/auto-loan-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Auto Loan Calculator" />,
  }),
  "scientific-calculator": dynamic(() => import("@/components/tools/phase1/scientific-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Scientific Calculator" />,
  }),
  "json-schema-validator": dynamic(() => import("@/components/tools/phase1/json-schema-validator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="JSON Schema Validator" />,
  }),
  "aspect-ratio-calculator": dynamic(() => import("@/components/tools/phase1/aspect-ratio-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Aspect Ratio Calculator" />,
  }),
  "code-minifier": dynamic(() => import("@/components/tools/phase1/code-minifier"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Code Minifier" />,
  }),
  "chmod-calculator": dynamic(() => import("@/components/tools/phase1/chmod-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Chmod Calculator" />,
  }),
  "bmr-tdee-calculator": dynamic(() => import("@/components/tools/phase1/bmr-tdee-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="BMR & TDEE Calculator" />,
  }),
  "inflation-calculator": dynamic(() => import("@/components/tools/phase1/inflation-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Inflation Calculator" />,
  }),
  "ip-subnet-calculator": dynamic(() => import("@/components/tools/phase1/ip-subnet-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="IP Subnet Calculator" />,
  }),
  "statistics-calculator": dynamic(() => import("@/components/tools/phase1/statistics-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Statistics Calculator" />,
  }),
  "fraction-simplifier": dynamic(() => import("@/components/tools/phase1/fraction-simplifier"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Fraction Simplifier & Calculator" />,
  }),
  "geometry-calculator": dynamic(() => import("@/components/tools/phase1/geometry-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Geometry Calculator" />,
  }),
  "time-card-calculator": dynamic(() => import("@/components/tools/phase1/time-card-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Time Card Calculator" />,
  }),
  "world-clock-converter": dynamic(() => import("@/components/tools/phase1/world-clock-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="World Clock & Timezone Converter" />,
  }),
  "bandwidth-calculator": dynamic(() => import("@/components/tools/phase1/bandwidth-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Bandwidth & Download Time Calculator" />,
  }),
  "sip-calculator": dynamic(() => import("@/components/tools/phase1/sip-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="SIP Calculator" />,
  }),
  "retirement-401k-calculator": dynamic(() => import("@/components/tools/phase1/retirement-401k-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="401(k) & Retirement Calculator" />,
  }),
  "debt-payoff-calculator": dynamic(() => import("@/components/tools/phase1/debt-payoff-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Debt Payoff Calculator" />,
  }),
  "roi-calculator": dynamic(() => import("@/components/tools/phase1/roi-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="ROI Calculator" />,
  }),
  "profit-margin-calculator": dynamic(() => import("@/components/tools/phase1/profit-margin-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Profit Margin & Markup Calculator" />,
  }),
  "break-even-calculator": dynamic(() => import("@/components/tools/phase1/break-even-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Break-Even Point Calculator" />,
  }),
  "payroll-paycheck-calculator": dynamic(() => import("@/components/tools/phase1/payroll-paycheck-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Payroll & Paycheck Calculator" />,
  }),
  "body-fat-calculator": dynamic(() => import("@/components/tools/phase1/body-fat-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Body Fat Calculator" />,
  }),
  "target-heart-rate-calculator": dynamic(() => import("@/components/tools/phase1/target-heart-rate-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Target Heart Rate Calculator" />,
  }),
  "pregnancy-due-date-calculator": dynamic(() => import("@/components/tools/phase1/pregnancy-due-date-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Pregnancy Due Date Calculator" />,
  }),
  "sql-dump-to-csv": dynamic(() => import("@/components/tools/phase1/sql-dump-to-csv"), {
    ssr: false,
    loading: () => <ToolLoadingState name="SQL Dump to CSV & JSON Converter" />,
  }),
  "excel-to-json-csv": dynamic(() => import("@/components/tools/phase1/excel-to-json-csv"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Excel to JSON & CSV Converter" />,
  }),
  "archive-extractor": dynamic(() => import("@/components/tools/phase1/archive-extractor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Archive Extractor & Viewer" />,
  }),
  "archive-packer": dynamic(() => import("@/components/tools/phase1/archive-packer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Archive Packer & ZIP Creator" />,
  }),
  "barcode-scanner": dynamic(() => import("@/components/tools/phase1/barcode-scanner"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Barcode Scanner & Reader" />,
  }),
  "qr-scanner": dynamic(() => import("@/components/tools/phase1/qr-scanner"), {
    ssr: false,
    loading: () => <ToolLoadingState name="QR Code Scanner & Reader" />,
  }),
  "ats-resume-checker": dynamic(() => import("@/components/tools/phase1/ats-resume-checker"), {
    ssr: false,
    loading: () => <ToolLoadingState name="ATS Resume Checker & Score Analyzer" />,
  }),
  "resume-import-viewer": dynamic(() => import("@/components/tools/phase1/resume-import-viewer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Resume PDF & DOCX Import Inspector" />,
  }),
  "pdf-merger": dynamic(() => import("@/components/tools/phase2/pdf-merger"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Merger & Combiner" />,
  }),
  "pdf-splitter": dynamic(() => import("@/components/tools/phase2/pdf-splitter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Splitter & Page Extractor" />,
  }),
  "pdf-page-rotator": dynamic(() => import("@/components/tools/phase2/pdf-page-rotator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Page Rotator" />,
  }),
  "pdf-page-organizer": dynamic(() => import("@/components/tools/phase2/pdf-page-organizer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Page Organizer & Reorder" />,
  }),
  "pdf-compressor": dynamic(() => import("@/components/tools/phase2/pdf-compressor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Compressor & Optimizer" />,
  }),
  "pdf-bates-stamper": dynamic(() => import("@/components/tools/phase2/pdf-bates-stamper"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Bates Numbering & Stamper" />,
  }),
  "pdf-flattener": dynamic(() => import("@/components/tools/phase2/pdf-flattener"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Form Flattener" />,
  }),
  "pdf-form-extractor": dynamic(() => import("@/components/tools/phase2/pdf-form-extractor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Form Field Extractor" />,
  }),
  "pdf-form-builder": dynamic(() => import("@/components/tools/phase2/pdf-form-builder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Fillable Form Builder" />,
  }),
  "pdf-digital-signer": dynamic(() => import("@/components/tools/phase2/pdf-digital-signer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Digital Signer" />,
  }),

  // Phase 2 Batch 3: Image Suite
  "image-converter": dynamic(() => import("@/components/tools/phase2/image-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Image Format Converter" />,
  }),
  "aspect-ratio-cropper": dynamic(() => import("@/components/tools/phase2/aspect-ratio-cropper"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Aspect Ratio Cropper" />,
  }),
  "canvas-resizer": dynamic(() => import("@/components/tools/phase2/canvas-resizer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Canvas Resizer" />,
  }),
  "batch-image-compressor": dynamic(() => import("@/components/tools/phase2/batch-image-compressor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Batch Image Compressor" />,
  }),
  "exif-stripper": dynamic(() => import("@/components/tools/phase2/exif-stripper"), {
    ssr: false,
    loading: () => <ToolLoadingState name="EXIF Metadata Stripper" />,
  }),

  // Phase 2 Batch 4: Document Converters & Editors
  "markdown-to-pdf": dynamic(() => import("@/components/tools/phase2/markdown-to-pdf"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Markdown to PDF Converter" />,
  }),
  "html-to-pdf": dynamic(() => import("@/components/tools/phase2/html-to-pdf"), {
    ssr: false,
    loading: () => <ToolLoadingState name="HTML to PDF Converter" />,
  }),
  "direct-txt-editor": dynamic(() => import("@/components/tools/phase2/direct-txt-editor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Direct TXT Notepad & Editor" />,
  }),
  "direct-markdown-editor": dynamic(() => import("@/components/tools/phase2/direct-markdown-editor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Direct Markdown Live Editor" />,
  }),
  "direct-html-editor": dynamic(() => import("@/components/tools/phase2/direct-html-editor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Direct HTML & CSS Playground" />,
  }),

  // Phase 2 Batch 5: Local Security & Privacy Suite
  "file-encryptor": dynamic(() => import("@/components/tools/phase2/file-encryptor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="AES-256 File Locker & Encryptor" />,
  }),
  "file-decryptor": dynamic(() => import("@/components/tools/phase2/file-decryptor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="AES-256 File Decryptor & Unlocker" />,
  }),
  "steganography-tool": dynamic(() => import("@/components/tools/phase2/steganography-tool"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Image Steganography" />,
  }),
  "pdf-redaction-tool": dynamic(() => import("@/components/tools/phase2/pdf-redaction-tool"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Permanent PDF Redaction Tool" />,
  }),
  "image-base64-converter": dynamic(() => import("@/components/tools/phase2/image-base64-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Image to Base64 Data URI Converter" />,
  }),

  // Phase 2 Batch 6: Vector, Favicon & Transform Suite
  "svg-minifier": dynamic(() => import("@/components/tools/phase2/svg-minifier"), {
    ssr: false,
    loading: () => <ToolLoadingState name="SVG Minifier & Vector Optimizer" />,
  }),
  "favicon-generator": dynamic(() => import("@/components/tools/phase2/favicon-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Multi-Resolution Favicon Generator" />,
  }),
  "image-rotator-flipper": dynamic(() => import("@/components/tools/phase2/image-rotator-flipper"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Image Rotator & Flipper" />,
  }),
  "photo-filter-studio": dynamic(() => import("@/components/tools/phase2/photo-filter-studio"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Photo Filter Studio & Color Balancer" />,
  }),
  "image-watermarker": dynamic(() => import("@/components/tools/phase2/image-watermarker"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Image Watermark & Stamp Tool" />,
  }),
  "metadata-stripper": dynamic(() => import("@/components/tools/phase2/metadata-stripper"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Universal Metadata Stripper" />,
  }),
  "direct-rtf-creator": dynamic(() => import("@/components/tools/phase2/direct-rtf-creator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Direct RTF Document Creator" />,
  }),
  "direct-docx-editor": dynamic(() => import("@/components/tools/phase2/direct-docx-editor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Direct Word Document Creator & Editor" />,
  }),
  "pdf-annotator": dynamic(() => import("@/components/tools/phase2/pdf-annotator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="In-Browser PDF Vector Annotator" />,
  }),
  "markdown-note-maker": dynamic(() => import("@/components/tools/phase2/markdown-note-maker"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Markdown Note Maker" />,
  }),
  "excel-to-pdf": dynamic(() => import("@/components/tools/phase2/excel-to-pdf"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Spreadsheet & Excel to PDF Converter" />,
  }),
  "docx-to-pdf": dynamic(() => import("@/components/tools/phase2/docx-to-pdf"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Word DOCX to Vector PDF Converter" />,
  }),
  "pdf-to-docx": dynamic(() => import("@/components/tools/phase2/pdf-to-docx"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF to Word DOCX Converter" />,
  }),
  "pdf-encryptor": dynamic(() => import("@/components/tools/phase2/pdf-encryptor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Password Locker & Encryptor" />,
  }),
  "pdf-decryptor": dynamic(() => import("@/components/tools/phase2/pdf-decryptor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Password Remover & Decryptor" />,
  }),
  "powerpoint-to-pdf": dynamic(() => import("@/components/tools/phase2/powerpoint-to-pdf"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PowerPoint to Vector PDF Converter" />,
  }),
  "pdf-editor": dynamic(() => import("@/components/tools/phase3/pdf-editor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Professional In-Browser PDF Editor" />,
  }),
  "invoice-receipt-generator": dynamic(() => import("@/components/tools/phase3/invoice-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Invoice & Receipt Generator" />,
  }),
  "estimate-quote-builder": dynamic(() => import("@/components/tools/phase3/estimate-quote-builder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Estimate & Quote Builder" />,
  }),
  "certificate-diploma-generator": dynamic(() => import("@/components/tools/phase3/certificate-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Certificate & Diploma Generator" />,
  }),
  "proposal-builder": dynamic(() => import("@/components/tools/phase3/proposal-builder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Proposal & Agreement Builder" />,
  }),
  "desktop-screen-recorder": dynamic(() => import("@/components/tools/phase3/desktop-screen-recorder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Full Desktop Screen Recorder" />,
  }),
  "web-tab-recorder": dynamic(() => import("@/components/tools/phase3/web-tab-recorder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Web Tab Recorder" />,
  }),
  "webcam-overlay-recorder": dynamic(() => import("@/components/tools/phase3/webcam-overlay-recorder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Webcam & Screen Overlay Recorder" />,
  }),
  "social-post-maker": dynamic(() => import("@/components/tools/phase3/social-post-maker"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Social Media Post Maker" />,
  }),
  "story-reels-maker": dynamic(() => import("@/components/tools/phase3/story-reels-maker"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Story & Reels Canvas Maker" />,
  }),
  "chart-graph-visualizer": dynamic(() => import("@/components/tools/phase3/chart-graph-visualizer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Chart & Graph Visualizer" />,
  }),
  "meme-caption-generator": dynamic(() => import("@/components/tools/phase3/meme-caption-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Meme Caption Generator" />,
  }),
  "latex-editor": dynamic(() => import("@/components/tools/phase3/latex-editor"), {
    ssr: false,
    loading: () => <ToolLoadingState name="LaTeX Equation & Paper Editor" />,
  }),
  "camera-to-pdf-scanner": dynamic(() => import("@/components/tools/phase3/camera-to-pdf-scanner"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Camera to PDF Scanner" />,
  }),
  "passport-photo-generator": dynamic(() => import("@/components/tools/phase3/passport-photo-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Passport Photo Generator & Biometric Studio" />,
  }),
  "jwt-decoder": dynamic(() => import("@/components/tools/phase3/jwt-decoder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="JSON Web Token (JWT) Decoder" />,
  }),
  "job-keyword-matcher": dynamic(() => import("@/components/tools/phase3/job-keyword-matcher"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Job Description Keyword Matcher" />,
  }),
  "pdf-page-numberer": dynamic(() => import("@/components/tools/phase3/pdf-page-numberer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Page Numberer" />,
  }),
  "cron-expression-builder": dynamic(() => import("@/components/tools/phase3/cron-expression-builder"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Cron Expression Builder & Explainer" />,
  }),
  "curl-to-code-converter": dynamic(() => import("@/components/tools/phase3/curl-to-code-converter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="cURL to Code Converter" />,
  }),
  "salary-tax-calculator": dynamic(() => import("@/components/tools/phase3/salary-tax-calculator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="2026 Salary & Tax Calculator" />,
  }),
  "burn-after-read-secret": dynamic(() => import("@/components/tools/phase3/burn-after-read-secret"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Burn-After-Read Secret Sharer" />,
  }),
  "client-pastebin": dynamic(() => import("@/components/tools/phase3/client-pastebin"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Encrypted Client Pastebin" />,
  }),
  "link-protector": dynamic(() => import("@/components/tools/phase3/link-protector"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Password-Protected Link Redirector" />,
  }),
  "code-snapshot-studio": dynamic(() => import("@/components/tools/phase3/code-snapshot-studio"), {
    ssr: false,
    loading: () => <ToolLoadingState name="High-Res Code Snapshot Studio" />,
  }),
  "svg-pattern-generator": dynamic(() => import("@/components/tools/phase3/svg-pattern-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Vector SVG Wave & Pattern Studio" />,
  }),
  "json-graph-visualizer": dynamic(() => import("@/components/tools/phase3/json-graph-visualizer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Interactive JSON Graph & Tree Visualizer" />,
  }),
  "color-palette-generator": dynamic(() => import("@/components/tools/phase3/color-palette-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Harmonic Color Palette Studio" />,
  }),
  "css-mesh-gradient-generator": dynamic(() => import("@/components/tools/phase3/css-mesh-gradient-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="CSS Mesh Gradient Studio" />,
  }),
  "image-background-remover": dynamic(() => import("@/components/tools/phase3/image-background-remover"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Smart Image Background Remover" />,
  }),
  "visual-diff-studio": dynamic(() => import("@/components/tools/phase3/visual-diff-studio"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Multi-Format Visual Diff Studio" />,
  }),
  "regex-visualizer": dynamic(() => import("@/components/tools/phase3/regex-visualizer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Interactive RegEx Visualizer" />,
  }),
  "pdf-watermark-stamper": dynamic(() => import("@/components/tools/phase3/pdf-watermark-stamper"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF Watermark & Page Stamp Studio" />,
  }),
  "audio-waveform-visualizer": dynamic(() => import("@/components/tools/phase3/audio-waveform-visualizer"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Audio Waveform Visualizer" />,
  }),
  "box-shadow-generator": dynamic(() => import("@/components/tools/phase3/box-shadow-generator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="CSS Box Shadow Generator" />,
  }),
  "pdf-to-svg": dynamic(() => import("@/components/tools/phase3/pdf-to-svg"), {
    ssr: false,
    loading: () => <ToolLoadingState name="PDF to SVG Vector Converter" />,
  }),
  "audio-pitch-tempo-shifter": dynamic(() => import("@/components/tools/phase3/audio-pitch-tempo-shifter"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Audio Pitch & Tempo Shifter" />,
  }),
  "language-translator": dynamic(() => import("@/components/tools/phase3/language-translator"), {
    ssr: false,
    loading: () => <ToolLoadingState name="Offline Language & Text Translator" />,
  }),
};

interface ErrorBoundaryProps {
  slug: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ToolErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || "An unexpected error occurred in this tool.",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ToolErrorBoundary] Caught error in tool "${this.props.slug}":`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto my-8 border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-lg font-bold">
            !
          </div>
          <div>
            <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Tool Sandbox Error
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 max-w-md break-words">
              {this.state.errorMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, errorMessage: "" })}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
          >
            Reset Tool Sandbox
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ToolView({ slug }: { slug: string }) {
  const Component = TOOL_COMPONENTS[slug];

  if (!Component) {
    return (
      <div className="p-8 text-center text-slate-500 font-body text-sm">
        Tool workspace is initializing...
      </div>
    );
  }

  return (
    <ToolErrorBoundary slug={slug}>
      <Component />
    </ToolErrorBoundary>
  );
}
