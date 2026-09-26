"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MarkdownPdfOptions,
  compileMarkdownToPdf,
} from "./logic";
import {
  FileText,
  Download,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";

const SAMPLE_MARKDOWN = `# Executive Summary & Project Brief

This document outlines the strategic roadmap for the **Mindkit Privacy-First Web Platform**.

## Key Objectives
- Complete client-side sandboxing for all user documents
- Zero telemetry, zero uploads, zero tracking cookies
- High-fidelity vector PDF generation in local browser memory

### Technical Architecture
The core system leverages WebAssembly and HTML5 Canvas compilation engines.

> "Privacy is not an added feature; it is the fundamental architectural constraint."

\`\`\`
// Pure client-side execution sample
const pdfBytes = await compileMarkdownToPdf(markdownText);
\`\`\`

1. Phase 1: Foundation utilities and calculators
2. Phase 2: PDF, Image, and Document manipulation
3. Phase 3: Screen capture and media generation

---
*Generated privately with Mindkit Document Engine.*
`;

export default function MarkdownToPdfTool() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
  const [theme, setTheme] = useState<MarkdownPdfOptions["theme"]>("minimalist");
  const [pageSize, setPageSize] = useState<MarkdownPdfOptions["pageSize"]>("a4");
  const [margin, setMargin] = useState<MarkdownPdfOptions["margin"]>("normal");
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);

  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleCompile = async () => {
    if (!markdown.trim()) {
      setError("Please enter some Markdown text to compile.");
      return;
    }

    setIsCompiling(true);
    setError(null);

    try {
      const pdfBytes = await compileMarkdownToPdf(markdown, {
        theme,
        pageSize,
        margin,
        includePageNumbers,
      });

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });

      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to compile Markdown into PDF.");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `document_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-body">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-headings text-sm sm:text-base font-bold text-slate-900">
              Markdown to PDF Document Compiler
            </h2>
            <p className="text-xs text-slate-600">
              Transform Markdown notes and technical documentation into formatted vector PDFs.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-semibold shrink-0 shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>100% Client-Side Privacy</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Editor & Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Markdown Input (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Markdown Source
              </span>
              <div className="text-[11px] text-slate-500 font-medium">
                {wordCount} words • {charCount} chars
              </div>
            </div>

            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type or paste Markdown here..."
              rows={16}
              className="w-full p-3 font-mono text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y bg-slate-50/50"
            />

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMarkdown(SAMPLE_MARKDOWN)}
                className="text-xs text-slate-600"
              >
                Reset to Sample
              </Button>
              <Button
                onClick={handleCompile}
                disabled={isCompiling}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                {isCompiling ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Compiling PDF...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" /> Compile to PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: PDF Options & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Options Panel */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Sliders className="h-4 w-4 text-blue-600" />
              <h3 className="font-headings text-xs font-bold text-slate-800 uppercase tracking-wider">
                Document Formatting
              </h3>
            </div>

            {/* Theme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Typography & Color Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "minimalist", name: "Minimalist" },
                  { id: "technical", name: "Technical (Teal)" },
                  { id: "academic", name: "Academic (Crimson)" },
                  { id: "corporate", name: "Corporate (Navy)" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as MarkdownPdfOptions["theme"])}
                    className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all ${
                      theme === t.id
                        ? "border-blue-600 bg-blue-50 text-blue-800 font-bold"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Size & Margins */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as MarkdownPdfOptions["pageSize"])}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="a4">Standard A4</option>
                  <option value="letter">US Letter</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Margins</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(e.target.value as MarkdownPdfOptions["margin"])}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal (0.75 in)</option>
                  <option value="narrow">Narrow (0.5 in)</option>
                  <option value="wide">Wide (1.0 in)</option>
                </select>
              </div>
            </div>

            {/* Page Numbers Checkbox */}
            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={includePageNumbers}
                onChange={(e) => setIncludePageNumbers(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                Include footer page numbers (e.g. Page 1 of 2)
              </span>
            </label>
          </div>

          {/* Compiled Output Preview & Action */}
          {pdfUrl && pdfBlob && (
            <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-white shadow-md space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-headings text-xs font-bold text-slate-900 uppercase tracking-wider">
                    PDF Compiled Successfully
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">
                  {((pdfBlob.size) / 1024).toFixed(1)} KB
                </span>
              </div>

              {/* PDF Preview Frame */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 h-64 flex items-center justify-center">
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  className="w-full h-full border-0"
                />
              </div>

              <Button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Download className="h-4 w-4" /> Download Vector PDF
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
