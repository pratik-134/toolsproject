"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PrintOptions,
  TEMPLATES,
  validateHtmlString,
  injectPrintStyles,
  extractDocumentTitle,
  sanitizeHtmlForPrint,
} from "./logic";
import {
  FileCode,
  Printer,
  Download,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileCheck,
} from "lucide-react";

export default function HtmlToPdfTool() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("invoice");
  const [htmlCode, setHtmlCode] = useState<string>(TEMPLATES.invoice?.html || "");
  const [pageSize, setPageSize] = useState<PrintOptions["pageSize"]>("A4");
  const [margin, setMargin] = useState<PrintOptions["margin"]>("normal");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Update HTML when template changes
  const handleTemplateChange = (tmplKey: string) => {
    setSelectedTemplate(tmplKey);
    const tmpl = TEMPLATES[tmplKey];
    if (tmpl) {
      setHtmlCode(tmpl.html);
      setError(null);
    }
  };

  // Compile full HTML with injected print styles
  const compiledHtml = React.useMemo(() => {
    const sanitized = sanitizeHtmlForPrint(htmlCode);
    return injectPrintStyles(sanitized, { pageSize, margin });
  }, [htmlCode, pageSize, margin]);

  // Update iframe content smoothly
  useEffect(() => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(compiledHtml);
        doc.close();
      }
    } catch {
      // In case of any cross-origin sandbox edge-case
    }
  }, [compiledHtml]);

  const handlePrint = () => {
    const val = validateHtmlString(htmlCode);
    if (!val.valid) {
      setError(val.error || "HTML code cannot be empty.");
      return;
    }
    setError(null);

    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      setError("Preview frame not ready for printing.");
      return;
    }

    try {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } catch (err: any) {
      setError(err?.message || "Failed to trigger print dialog.");
    }
  };

  const handleDownloadHtml = () => {
    const title = extractDocumentTitle(htmlCode);
    const blob = new Blob([compiledHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9_-]/g, "_") || "document"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">
            100% In-Browser Rendering & Native Vector Print Engine
          </div>
        </div>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
          Zero Server Uploads
        </span>
      </div>

      {/* Control Bar: Templates & Print Settings */}
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Preset Selector */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Preset Templates
            </label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger className="w-full h-10 text-xs bg-background border rounded-lg px-3 py-2 text-foreground">
                <SelectValue placeholder="Select Template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <SelectItem key={key} value={key}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Size */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" /> Page Size
            </label>
            <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-lg border">
              {(["A4", "Letter", "Legal"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPageSize(size)}
                  className={`text-xs font-medium py-1.5 rounded transition ${
                    pageSize === size
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" /> Margins
            </label>
            <div className="grid grid-cols-4 gap-1 bg-muted/40 p-1 rounded-lg border">
              {(["normal", "narrow", "wide", "none"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMargin(m)}
                  className={`text-xs capitalize font-medium py-1.5 rounded transition ${
                    margin === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="gap-2 bg-primary text-primary-foreground font-semibold shadow-sm hover:opacity-95"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadHtml}
              className="gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export HTML
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" /> Copied
                </>
              ) : (
                <>
                  <FileCode className="w-3.5 h-3.5 mr-1" /> Copy HTML
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTemplateChange(selectedTemplate)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Code
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Split Screen Workspace: Editor + Sandbox Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[580px]">
        {/* HTML Source Editor */}
        <div className="flex flex-col border rounded-xl overflow-hidden bg-card shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-primary" />
              HTML & Inline CSS Source
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {htmlCode.length.toLocaleString()} characters
            </span>
          </div>
          <div className="flex-1 p-3 bg-muted/10">
            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder="Paste or write your HTML & CSS here..."
              className="w-full h-full min-h-[460px] p-3 text-xs font-mono bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Live Sandboxed Print Preview */}
        <div className="flex flex-col border rounded-xl overflow-hidden bg-card shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              Print Preview ({pageSize}, {margin} margins)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <FileCheck className="w-3 h-3" /> Live Sandbox
            </span>
          </div>
          <div className="flex-1 p-4 bg-muted/20 flex justify-center items-start overflow-auto">
            <div className="w-full bg-white text-black shadow-lg rounded border border-neutral-300 min-h-[500px] overflow-hidden">
              <iframe
                ref={iframeRef}
                title="Print Preview Frame"
                className="w-full h-[520px] border-0 bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
