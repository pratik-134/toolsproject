"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Download, Trash2, ArrowUpDown, Filter, Sparkles } from "lucide-react";
import { deduplicateLines, SortOrder } from "./logic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DuplicateLineRemoverTool() {
  const [inputText, setInputText] = useState<string>(
    "alpha\nbeta\ngamma\nalpha\nDELTA\ndelta\n\nbeta\nepsilon\ngamma\n"
  );
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [trimWhitespace, setTrimWhitespace] = useState<boolean>(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    return deduplicateLines(inputText, {
      caseSensitive,
      trimWhitespace,
      removeEmptyLines,
      sortOrder,
    });
  }, [inputText, caseSensitive, trimWhitespace, removeEmptyLines, sortOrder]);

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
    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deduplicated-list-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Options Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-foreground font-medium">Case sensitive</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={trimWhitespace}
                onChange={(e) => setTrimWhitespace(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-foreground font-medium">Trim whitespace</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={removeEmptyLines}
                onChange={(e) => setRemoveEmptyLines(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-foreground font-medium">Remove empty lines</span>
            </label>
          </div>

          {/* Sort Order Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <label htmlFor="sort-order" className="text-xs text-muted-foreground font-medium">Sort:</label>
            <Select
              value={sortOrder}
              onValueChange={(val) => setSortOrder(val as SortOrder)}
            >
              <SelectTrigger id="sort-order" className="h-8 w-44 text-xs font-medium bg-background border-border">
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Original Order (Keep order)</SelectItem>
                <SelectItem value="asc">A → Z (Alphabetical)</SelectItem>
                <SelectItem value="desc">Z → A (Reverse Alphabetical)</SelectItem>
                <SelectItem value="length-asc">Shortest First</SelectItem>
                <SelectItem value="length-desc">Longest First</SelectItem>
                <SelectItem value="reverse">Invert Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Real-time Statistics Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Original:</span>
            <span className="font-mono font-bold text-foreground">{result.originalCount}</span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Unique:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {result.uniqueCount}
            </span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Duplicates Removed:</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              {result.duplicatesRemoved}
            </span>
          </div>
          {result.emptyLinesRemoved > 0 && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span>Blank lines purged:</span>
                <span className="font-mono font-semibold">{result.emptyLinesRemoved}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor Split Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="raw-input-list" className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Input List
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setInputText(
                    "apple\nbanana\norange\napple\nbanana\ngrape\ncherry\norange\nmango\npeach\npeach\npear\n"
                  )
                }
                className="text-xs text-primary hover:underline font-medium"
              >
                Sample Data
              </button>
              <span className="text-muted-foreground text-xs">•</span>
              <button
                type="button"
                onClick={() => setInputText("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            id="raw-input-list"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your lines here, one item per line..."
            rows={12}
            className="w-full rounded-xl border border-border bg-background p-3.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          />
        </div>

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Clean Deduplicated List
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!result.output}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .txt</span>
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
            placeholder="Deduplicated output will appear here in real-time..."
            rows={12}
            className="w-full rounded-xl border border-border bg-muted/40 p-3.5 font-mono text-xs focus:outline-none select-all resize-y text-foreground"
          />
        </div>
      </div>
    </div>
  );
}
