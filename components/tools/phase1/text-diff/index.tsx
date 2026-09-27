"use client";

import React, { useState, useMemo } from "react";
import { GitCompare, Plus, Minus, ArrowRightLeft, RefreshCw, Copy, Check } from "lucide-react";
import { computeDiff, DiffResult } from "./logic";

const SAMPLE_ORIGINAL = `// Cleartrix Analytics Config
export const config = {
  platform: "Cleartrix",
  clientSide: true,
  trackingCookies: true,
  storageQuotaMb: 5,
};`;

const SAMPLE_MODIFIED = `// Cleartrix Privacy-First Config
export const config = {
  platform: "Cleartrix",
  clientSide: true,
  trackingCookies: false, // Zero tracking policy
  storageQuotaMb: 10,
  encryption: "AES-256-GCM",
};`;

export default function TextDiffTool() {
  const [originalText, setOriginalText] = useState<string>(SAMPLE_ORIGINAL);
  const [modifiedText, setModifiedText] = useState<string>(SAMPLE_MODIFIED);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [caseSensitive, setCaseSensitive] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const diffResult: DiffResult = useMemo(() => {
    return computeDiff(originalText, modifiedText, {
      ignoreWhitespace,
      caseSensitive,
    });
  }, [originalText, modifiedText, ignoreWhitespace, caseSensitive]);

  const handleCopyUnified = async () => {
    const formatted = diffResult.lines
      .map((l) => {
        const prefix = l.type === "added" ? "+ " : l.type === "removed" ? "- " : "  ";
        return prefix + l.text;
      })
      .join("\n");
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Options Header */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Comparison Controls
            </span>
          </div>

          {/* Action and Swap buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Swap Left / Right
            </button>

            <button
              type="button"
              onClick={() => {
                setOriginalText(SAMPLE_ORIGINAL);
                setModifiedText(SAMPLE_MODIFIED);
              }}
              className="text-xs text-primary hover:underline font-medium px-2 py-1"
            >
              Sample Diff
            </button>
          </div>
        </div>

        {/* Options and Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-muted-foreground font-medium">Ignore trailing/leading whitespace</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-muted-foreground font-medium">Case sensitive</span>
            </label>
          </div>

          {/* Diff Stats */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-900">
              <Plus className="w-3 h-3" />
              {diffResult.additions} added
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-mono font-bold text-xs border border-rose-200 dark:border-rose-900">
              <Minus className="w-3 h-3" />
              {diffResult.deletions} removed
            </span>
            <span className="text-muted-foreground text-xs font-mono">
              {diffResult.unchanged} unchanged
            </span>
          </div>
        </div>
      </div>

      {/* Inputs: Original vs Modified */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Original Version
            </span>
            <button
              type="button"
              onClick={() => setOriginalText("")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste original version here..."
            rows={8}
            className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>

        {/* Modified */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Modified Version
            </span>
            <button
              type="button"
              onClick={() => setModifiedText("")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste modified version here..."
            rows={8}
            className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>
      </div>

      {/* Visual Line-by-Line Diff Viewer */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-3 bg-muted/60 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase tracking-wide">
            Unified Line-by-Line Difference
          </span>
          <button
            type="button"
            onClick={handleCopyUnified}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">Copied Diff</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Unified Diff</span>
              </>
            )}
          </button>
        </div>

        <div className="font-mono text-xs overflow-x-auto divide-y divide-border/40 max-h-[460px] overflow-y-auto">
          {diffResult.lines.map((line, idx) => {
            const isAdded = line.type === "added";
            const isRemoved = line.type === "removed";

            return (
              <div
                key={idx}
                className={`flex items-stretch hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                  isAdded
                    ? "bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-semibold"
                    : isRemoved
                    ? "bg-rose-500/10 text-rose-900 dark:text-rose-300 font-semibold"
                    : "text-foreground"
                }`}
              >
                {/* Original line number */}
                <span className="w-10 shrink-0 text-right pr-2 py-1 select-none text-muted-foreground/60 border-r border-border/40 text-[11px]">
                  {line.originalLineNum ?? ""}
                </span>

                {/* Modified line number */}
                <span className="w-10 shrink-0 text-right pr-2 py-1 select-none text-muted-foreground/60 border-r border-border/40 text-[11px]">
                  {line.modifiedLineNum ?? ""}
                </span>

                {/* Diff Symbol (+, -, or space) */}
                <span className="w-6 shrink-0 text-center py-1 select-none font-bold">
                  {isAdded ? "+" : isRemoved ? "−" : " "}
                </span>

                {/* Code / Text Content */}
                <span className="flex-1 py-1 pr-3 whitespace-pre-wrap break-all">
                  {line.text || " "}
                </span>
              </div>
            );
          })}

          {diffResult.lines.length === 0 && (
            <div className="p-8 text-center text-muted-foreground italic">
              Paste or type text into both versions above to see the difference.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
