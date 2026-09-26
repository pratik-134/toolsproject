"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Download, Wand2, Minimize2, FileCode, Code, Sparkles } from "lucide-react";
import { processCode, CodeLanguage } from "./logic";

const SAMPLES: Record<CodeLanguage, string> = {
  html: '<!DOCTYPE html><html><head><title>Mindkit</title></head><body><header><h1>Welcome</h1><nav><ul><li><a href="/">Home</a></li><li><a href="/tools">Tools</a></li></ul></nav></header><main><p>Zero-upload privacy first platform.</p></main></body></html>',
  css: 'body{margin:0;font-family:sans-serif;background-color:#f8fafc;color:#0f172a;}.container{max-width:1200px;margin:0 auto;padding:1rem;}.btn{display:inline-flex;align-items:center;padding:0.5rem 1rem;background-color:#2563eb;color:#ffffff;border-radius:0.5rem;}',
  javascript: '{"name":"mindkit","version":"1.0.0","private":true,"scripts":{"build":"next build","check":"npm run check"},"features":["100% Client-Side","Zero Trackers","Instant Local Execution"]}',
};

export default function HtmlBeautifierTool() {
  const [language, setLanguage] = useState<CodeLanguage>("html");
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const [indentSize, setIndentSize] = useState<2 | 4 | "tab">(2);
  const [inputCode, setInputCode] = useState<string>(SAMPLES.html);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    return processCode(inputCode, mode, { language, indentSize });
  }, [inputCode, mode, language, indentSize]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const ext = language === "html" ? "html" : language === "css" ? "css" : "js";
    const mime =
      language === "html" ? "text/html" : language === "css" ? "text/css" : "application/javascript";
    const blob = new Blob([result.output], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLanguageChange = (lang: CodeLanguage) => {
    setLanguage(lang);
    setInputCode(SAMPLES[lang]);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Language Selector */}
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
            <button
              type="button"
              onClick={() => handleLanguageChange("html")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                language === "html"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              HTML
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("css")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                language === "css"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CSS
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("javascript")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                language === "javascript"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              JS / JSON
            </button>
          </div>

          {/* Mode Switcher: Beautify vs Minify */}
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
            <button
              type="button"
              onClick={() => setMode("beautify")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                mode === "beautify"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Beautify
            </button>
            <button
              type="button"
              onClick={() => setMode("minify")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                mode === "minify"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Minify
            </button>
          </div>

          {/* Indent Options (if beautify) */}
          {mode === "beautify" && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium">Indent:</span>
              <div className="inline-flex rounded-md border border-border p-0.5 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setIndentSize(2)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    indentSize === 2
                      ? "bg-background text-foreground shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  2 Spaces
                </button>
                <button
                  type="button"
                  onClick={() => setIndentSize(4)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    indentSize === 4
                      ? "bg-background text-foreground shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  4 Spaces
                </button>
                <button
                  type="button"
                  onClick={() => setIndentSize("tab")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    indentSize === "tab"
                      ? "bg-background text-foreground shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tab
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Compression / Size Stats */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Original:</span>
            <span className="font-mono font-bold text-foreground">
              {result.originalBytes} B
            </span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Processed:</span>
            <span className="font-mono font-bold text-foreground">
              {result.formattedBytes} B
            </span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Difference:</span>
            <span
              className={`font-mono font-bold ${
                result.ratio < 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {result.ratio > 0 ? `+${result.ratio}%` : `${result.ratio}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Editor Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Source Code ({language.toUpperCase()})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInputCode(SAMPLES[language])}
                className="text-xs text-primary hover:underline font-medium"
              >
                Sample Code
              </button>
              <span className="text-muted-foreground text-xs">•</span>
              <button
                type="button"
                onClick={() => setInputCode("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={`Paste raw ${language.toUpperCase()} code here...`}
            rows={14}
            className="w-full rounded-xl border border-border bg-background p-3.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {mode === "beautify" ? "Beautified Result" : "Minified Result"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!result.output}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save File</span>
              </button>
              <span className="text-muted-foreground text-xs">•</span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result.output}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-40 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={result.output}
            placeholder="Processed output will appear here..."
            rows={14}
            className="w-full rounded-xl border border-border bg-muted/40 p-3.5 font-mono text-xs focus:outline-none select-all resize-y text-foreground"
          />
        </div>
      </div>
    </div>
  );
}
