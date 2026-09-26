"use client";

import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  extractStructuredBlocks,
  parseDocxBuffer,
  convertBlocksToPdf,
  SAMPLE_DOCX_MARKDOWN,
  DocxToPdfOptions,
} from "./logic";
import {
  FileText,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Palette,
  FileCheck,
  Settings2,
} from "lucide-react";

const ACCENT_COLORS = [
  { name: "Executive Navy", hex: "1E3A8A" },
  { name: "Mindkit Blue", hex: "2563EB" },
  { name: "Emerald Slate", hex: "065F46" },
  { name: "Modern Crimson", hex: "991B1B" },
  { name: "Neutral Graphite", hex: "1F2937" },
];

export default function DocxToPdfTool() {
  const [docTitle, setDocTitle] = useState<string>("Mindkit Executive Summary");
  const [textInput, setTextInput] = useState<string>(SAMPLE_DOCX_MARKDOWN);
  const [pageSize, setPageSize] = useState<"letter" | "a4">("letter");
  const [fontSize, setFontSize] = useState<number>(11);
  const [lineHeight, setLineHeight] = useState<number>(1.4);
  const [accentColor, setAccentColor] = useState<string>("2563EB");
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract structured blocks from current text
  const blocks = useMemo(() => {
    return extractStructuredBlocks(textInput);
  }, [textInput]);

  const wordCount = useMemo(() => {
    return textInput.trim().split(/\s+/).filter(Boolean).length;
  }, [textInput]);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage("Reading DOCX binary in memory...");
    try {
      const buffer = await file.arrayBuffer();
      const parsed = await parseDocxBuffer(buffer);
      setTextInput(parsed.rawText);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
      setDocTitle(cleanTitle);
      setStatusMessage("Document parsed successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not parse DOCX";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (blocks.length === 0) return;
    setIsProcessing(true);
    try {
      const options: DocxToPdfOptions = {
        pageSize,
        fontSize,
        lineHeight,
        headerTitle: docTitle,
        includePageNumbers,
        accentColorHex: accentColor,
      };

      const pdfBytes = await convertBlocksToPdf(blocks, options);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "PDF generation failed";
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>100% Client-Side Privacy:</strong> Your Word DOCX documents are parsed and converted to vector PDF exclusively inside your browser memory. Zero bytes leave your device.
          </span>
        </div>
        <span className="font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded text-[10px]">
          CLIENT RAM ONLY
        </span>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor & Input Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Word Document Content & Source</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload DOCX
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setTextInput(SAMPLE_DOCX_MARKDOWN);
                    setDocTitle("Mindkit Executive Summary");
                    setStatusMessage("");
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Sample
                </Button>
              </div>
            </div>

            {/* Document Header Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Document Header & Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Document Title (Printed on PDF running header)"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Document Content Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Extracted Document Text (Headings, Paragraphs, Bullet points)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {wordCount} words • {blocks.length} blocks
                </span>
              </div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={12}
                className="w-full p-3 font-mono text-xs leading-relaxed bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                placeholder="Paste or type document text with '# Title', '## Section', or '• Bullet point'..."
              />
            </div>

            {statusMessage && (
              <p className="text-xs text-muted-foreground font-medium">{statusMessage}</p>
            )}
          </div>
        </div>

        {/* Right Column: PDF Settings & Live Generation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Settings2 className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">PDF Vector Formatting</h2>
            </div>

            {/* Page Size & Layout */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Standard Paper Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPageSize("letter")}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    pageSize === "letter"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  US Letter (8.5 × 11 in)
                </button>
                <button
                  type="button"
                  onClick={() => setPageSize("a4")}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    pageSize === "a4"
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  ISO A4 (210 × 297 mm)
                </button>
              </div>
            </div>

            {/* Typography Sizing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Body Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={10}>10 pt (Compact)</option>
                  <option value={11}>11 pt (Standard Office)</option>
                  <option value={12}>12 pt (Large / Executive)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Line Spacing</label>
                <select
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={1.2}>1.2× (Tight)</option>
                  <option value={1.4}>1.4× (Balanced)</option>
                  <option value={1.6}>1.6× (Spacious)</option>
                </select>
              </div>
            </div>

            {/* Accent Theme Color */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">
                  Document Accent Color
                </label>
              </div>
              <div className="flex items-center gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => setAccentColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      accentColor === c.hex ? "scale-110 border-primary" : "border-transparent"
                    }`}
                    style={{ backgroundColor: `#${c.hex}` }}
                  />
                ))}
              </div>
            </div>

            {/* Options Toggles */}
            <div className="pt-2 border-t border-border space-y-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => setIncludePageNumbers(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-foreground">Print running footer page numbers (&quot;Page X of Y&quot;)</span>
              </label>
            </div>

            {/* Download CTA */}
            <div className="pt-4 border-t border-border space-y-2">
              <Button
                onClick={handleDownload}
                disabled={isProcessing || blocks.length === 0}
                className="w-full gap-2 py-5 font-semibold text-sm shadow-md"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Vector PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Formatted Vector PDF
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero rasterization • Pure vector PDF output</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
