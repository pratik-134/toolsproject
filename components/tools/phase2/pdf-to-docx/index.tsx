"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  extractTextBlocksFromPdf,
  createDocxFromBlocks,
  ExtractedPdfBlock,
  SAMPLE_PDF_PARAGRAPHS,
  PdfToDocxOptions,
} from "./logic";
import {
  FileText,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileType,
  FileCheck2,
  CheckCircle2,
} from "lucide-react";

export default function PdfToDocxTool() {
  const [docTitle, setDocTitle] = useState<string>("Converted Word Document");
  const [fontFamily, setFontFamily] = useState<string>("Calibri");
  const [fontSize, setFontSize] = useState<number>(22); // 11pt
  const [blocks, setBlocks] = useState<ExtractedPdfBlock[]>(SAMPLE_PDF_PARAGRAPHS);
  const [fileName, setFileName] = useState<string>("sample-document.pdf");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage("Extracting text and structure in-browser memory...");
    try {
      const buffer = await file.arrayBuffer();
      const extracted = await extractTextBlocksFromPdf(buffer);
      if (extracted.length === 0) {
        setStatusMessage("Warning: No readable text found. PDF may be a scanned image.");
      } else {
        setBlocks(extracted);
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setDocTitle(cleanName);
        setFileName(file.name);
        setStatusMessage(`Successfully extracted ${extracted.length} blocks!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to extract PDF";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (blocks.length === 0) return;
    setIsProcessing(true);
    try {
      const options: PdfToDocxOptions = {
        title: docTitle,
        fontFamily,
        fontSizeHalfPoints: fontSize,
      };

      const docxBytes = await createDocxFromBlocks(blocks, options);
      const blob = new Blob([docxBytes as unknown as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "DOCX creation failed";
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
            <strong>100% In-Browser Privacy:</strong> PDF text extraction and Microsoft Word DOCX compilation execute 100% inside your device memory. Zero server uploads.
          </span>
        </div>
        <span className="font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded text-[10px]">
          CLIENT RAM ONLY
        </span>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Source PDF & Extracted Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileType className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Source PDF & Extracted Content</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
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
                  Upload PDF
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setBlocks(SAMPLE_PDF_PARAGRAPHS);
                    setDocTitle("Converted Word Document");
                    setFileName("sample-document.pdf");
                    setStatusMessage("");
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                  Sample
                </Button>
              </div>
            </div>

            {/* Document Details & Count */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>File: <strong>{fileName}</strong></span>
              <span>{blocks.length} structured blocks detected</span>
            </div>

            {/* Extracted Blocks Structured Preview */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 border border-border rounded-lg p-3 bg-muted/20 font-sans text-xs">
              {blocks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No text extracted yet. Upload a PDF or load the sample above.
                </div>
              ) : (
                blocks.map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded border transition-all ${
                      b.type.startsWith("heading")
                        ? "bg-primary/5 border-primary/20 font-semibold"
                        : b.type === "bullet"
                        ? "bg-background border-border pl-6 relative"
                        : "bg-background border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span className="uppercase font-mono px-1 py-0.2 bg-muted rounded">
                        {b.type}
                      </span>
                      <span>Page {b.pageNumber}</span>
                    </div>
                    {b.type === "bullet" && (
                      <span className="absolute left-2.5 top-7 text-primary font-bold">•</span>
                    )}
                    <p className={`text-xs ${b.type === "heading1" ? "text-sm font-bold text-foreground" : "text-foreground/90"}`}>
                      {b.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {statusMessage && (
              <p className="text-xs text-muted-foreground font-medium">{statusMessage}</p>
            )}
          </div>
        </div>

        {/* Right Column: Word DOCX Formatting Options */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Microsoft Word Settings</h2>
            </div>

            {/* Document Title Header */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Word Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Document Title"
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Typography Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Word Typography Family</label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="w-full text-xs bg-background border-border">
                  <SelectValue placeholder="Font Family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Calibri">Calibri (Standard Office)</SelectItem>
                  <SelectItem value="Arial">Arial (Clean Modern)</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman (Academic)</SelectItem>
                  <SelectItem value="Georgia">Georgia (Editorial Serif)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Sizing */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Body Text Size</label>
              <Select
                value={String(fontSize)}
                onValueChange={(val) => setFontSize(Number(val))}
              >
                <SelectTrigger className="w-full text-xs bg-background border-border">
                  <SelectValue placeholder="Font Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">10 pt (Compact)</SelectItem>
                  <SelectItem value="22">11 pt (Standard Word)</SelectItem>
                  <SelectItem value="24">12 pt (Large)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Compatibility Features */}
            <div className="p-3.5 bg-muted/40 rounded-lg space-y-2 border border-border text-xs">
              <span className="font-semibold text-foreground">OpenXML Native Formatting:</span>
              <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Preserves hierarchical headings (H1, H2, H3)
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Preserves bullet lists and paragraph spacing
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Opens cleanly in Word, Google Docs & LibreOffice
                </li>
              </ul>
            </div>

            {/* Download CTA */}
            <div className="pt-4 border-t border-border space-y-2">
              <Button
                onClick={handleDownloadDocx}
                disabled={isProcessing || blocks.length === 0}
                className="w-full gap-2 py-5 font-semibold text-sm shadow-md"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Compiling Word Document...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Editable Word (.docx)
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine OpenXML .docx format</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
