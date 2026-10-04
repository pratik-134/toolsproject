"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  LATEX_SNIPPETS,
  DEFAULT_LATEX_DOC,
  validateLatexBrackets,
  latexToSimpleMathML,
} from "./logic";
import {
  Binary,
  Copy,
  Check,
  Download,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Printer,
  Sparkles,
} from "lucide-react";

const STORAGE_KEY = "ct_latex_draft";

export default function LatexEditorTool() {
  const [latexCode, setLatexCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
      } catch {
        // fallback
      }
    }
    return DEFAULT_LATEX_DOC;
  });

  const [copied, setCopied] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, latexCode);
    } catch {
      // quota guard
    }
  }, [latexCode]);

  const validation = validateLatexBrackets(latexCode);

  const insertSnippet = (snippetLatex: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setLatexCode((prev) => `${prev}\n${snippetLatex}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = latexCode.substring(0, start);
    const after = latexCode.substring(end);
    const nextCode = `${before}${snippetLatex}${after}`;
    setLatexCode(nextCode);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippetLatex.length, start + snippetLatex.length);
    }, 10);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSvg = () => {
    const mathml = latexToSimpleMathML(latexCode);
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: 24px; font-family: serif; color: #0f172a; padding: 40px; background: white;">
          ${mathml}
        </div>
      </foreignObject>
    </svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `latex-equation-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="leading-relaxed">LaTeX Equation & Paper Editor — 100% In-Browser MathML & Vector rendering.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setLatexCode(DEFAULT_LATEX_DOC);
              localStorage.removeItem(STORAGE_KEY);
            }}
            className="h-7 text-xs gap-1 border-emerald-300 dark:border-emerald-700"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-7 text-xs gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy Code"}
          </Button>
          <Button
            size="sm"
            onClick={handleExportSvg}
            className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-3 h-3" /> Export SVG
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-7 text-xs gap-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <Printer className="w-3 h-3" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Syntax Error Notice if unclosed bracket */}
      {!validation.valid && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{validation.error}</span>
        </div>
      )}

      {/* Symbol Toolbar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Math & Greek Symbols
          </span>
          <span className="text-[11px] text-slate-400 font-normal">Click to insert at cursor</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LATEX_SNIPPETS.map((snip) => (
            <button
              key={snip.id}
              type="button"
              onClick={() => insertSnippet(snip.latex)}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              title={snip.latex}
            >
              {snip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editor Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              LaTeX Equation Source
            </h3>
            <span className="text-xs font-mono text-slate-400">{latexCode.length} chars</span>
          </div>
          <textarea
            ref={textareaRef}
            rows={16}
            value={latexCode}
            onChange={(e) => setLatexCode(e.target.value)}
            className="w-full font-mono text-xs p-3.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-y"
          />
        </div>

        {/* Live Vector / MathML Preview */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Semantic Equation Output
            </h3>
            <span className="text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium">
              Native MathML
            </span>
          </div>

          <div
            id="printable-latex"
            className="min-h-[360px] p-8 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-center space-y-6"
          >
            <div
              className="text-2xl font-serif text-slate-900 dark:text-white leading-loose overflow-x-auto max-w-full"
              dangerouslySetInnerHTML={{
                __html: latexToSimpleMathML(latexCode),
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Equations render natively with zero external server latency.
          </p>
        </div>
      </div>
    </div>
  );
}
