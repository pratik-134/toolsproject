"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, RefreshCw, FileText, Code2, List, AlignLeft } from "lucide-react";
import { generateLorem, LoremType } from "./logic";

export default function LoremGeneratorTool() {
  const [type, setType] = useState<LoremType>("paragraphs");
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [asHtml, setAsHtml] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    // seed triggers regeneration
    return generateLorem({
      type,
      count,
      startWithLorem,
      asHtml,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, count, startWithLorem, asHtml, seed]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRegenerate = () => {
    setSeed((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Controls */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        {/* Unit Type Selection */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
            Generate Unit:
          </label>
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
            <button
              type="button"
              onClick={() => setType("paragraphs")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                type === "paragraphs"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              Paragraphs
            </button>
            <button
              type="button"
              onClick={() => setType("sentences")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                type === "sentences"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Sentences
            </button>
            <button
              type="button"
              onClick={() => setType("words")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                type === "words"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Words
            </button>
            <button
              type="button"
              onClick={() => setType("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                type === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>
        </div>

        {/* Count Selector & Quick Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Quantity ({type})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex items-center gap-1">
                {[1, 3, 5, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      count === n
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Options: Start with Lorem & HTML */}
          <div className="flex flex-col justify-end space-y-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-foreground">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>Start with &ldquo;Lorem ipsum dolor sit amet...&rdquo;</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-foreground">
              <input
                type="checkbox"
                checked={asHtml}
                onChange={(e) => setAsHtml(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
                Format as HTML tags ({type === "list" ? "<ul><li>" : "<p>"})
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Statistics */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground font-semibold">{result.wordsCount}</strong> words
            </span>
            <span>•</span>
            <span>
              <strong className="text-foreground font-semibold">{result.charsCount}</strong> characters
            </span>
            <span>•</span>
            <span>
              <strong className="text-foreground font-semibold">{result.paragraphsCount}</strong> {type}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
            <button
              type="button"
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text Area / Code Display */}
        <div className="p-4 bg-muted/40 rounded-lg min-h-[220px] font-sans text-sm leading-relaxed border border-border/50 text-foreground whitespace-pre-wrap select-all">
          {result.text}
        </div>
      </div>
    </div>
  );
}
