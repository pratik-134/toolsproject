"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, Check, Copy, Eye, FileDiff, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

export interface DiffInspectorProps {
  originalText: string;
  modifiedText: string;
  originalLabel?: string;
  modifiedLabel?: string;
  title?: string;
  className?: string;
}

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
  origLineNo?: number;
  modLineNo?: number;
}

/**
 * Computes a fast unified diff between two text strings using standard LCS
 */
export function computeLineDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split(/\r?\n/);
  const modLines = modified.split(/\r?\n/);

  // If text is excessively large (> 2500 lines), fallback to chunked comparison to prevent lag
  if (origLines.length > 2500 || modLines.length > 2500) {
    const diff: DiffLine[] = [];
    diff.push({ type: "removed", text: `--- (Original: ${origLines.length} lines) ---`, origLineNo: 1 });
    diff.push({ type: "added", text: `+++ (Transformed: ${modLines.length} lines) +++`, modLineNo: 1 });
    return diff;
  }

  const n = origLines.length;
  const m = modLines.length;

  // Build DP matrix for LCS
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (origLines[i - 1] === modLines[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  // Backtrack to build diff
  let i = n;
  let j = m;
  const result: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      result.unshift({
        type: "unchanged",
        text: origLines[i - 1]!,
        origLineNo: i,
        modLineNo: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      result.unshift({
        type: "added",
        text: modLines[j - 1]!,
        modLineNo: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i]![j - 1]! < dp[i - 1]![j]!)) {
      result.unshift({
        type: "removed",
        text: origLines[i - 1]!,
        origLineNo: i,
      });
      i--;
    }
  }

  return result;
}

export function DiffInspector({
  originalText,
  modifiedText,
  originalLabel = "Original",
  modifiedLabel = "Transformed",
  title = "Diff & Space Savings",
  className = "",
}: DiffInspectorProps) {
  const [viewMode, setViewMode] = useState<"unified" | "side-by-side">("unified");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const origBytes = new Blob([originalText]).size;
    const modBytes = new Blob([modifiedText]).size;
    const savedBytes = origBytes - modBytes;
    const percentChange = origBytes > 0 ? ((savedBytes / origBytes) * 100).toFixed(1) : "0.0";
    const isReduction = savedBytes > 0;

    return {
      origBytes,
      modBytes,
      savedBytes,
      percentChange,
      isReduction,
    };
  }, [originalText, modifiedText]);

  const diffLines = useMemo(() => {
    return computeLineDiff(originalText, modifiedText);
  }, [originalText, modifiedText]);

  const handleCopyDiff = async () => {
    const patchText = diffLines
      .map((d) => {
        const prefix = d.type === "added" ? "+ " : d.type === "removed" ? "- " : "  ";
        return prefix + d.text;
      })
      .join("\n");

    await navigator.clipboard.writeText(patchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs ${className}`}>
      {/* Header Bar with Savings Metric Badges */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <FileDiff className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{title}</span>
          </div>

          {/* Savings Badge */}
          {stats.origBytes > 0 && stats.modBytes > 0 && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                stats.isReduction
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
              }`}
            >
              {stats.isReduction ? (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>{stats.percentChange}% reduction ({Math.abs(stats.savedBytes).toLocaleString()} bytes saved)</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>+{Math.abs(Number(stats.percentChange))}% expansion (formatted)</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* View Controls & Copy Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode("unified")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                viewMode === "unified"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Unified
            </button>
            <button
              type="button"
              onClick={() => setViewMode("side-by-side")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                viewMode === "side-by-side"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Side-by-Side
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyDiff}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-[11px] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied Diff" : "Copy Diff"}</span>
          </button>
        </div>
      </div>

      {/* Diff View Body */}
      {viewMode === "unified" ? (
        <div className="font-mono text-xs overflow-x-auto max-h-96 divide-y divide-slate-100 dark:divide-slate-800/60 bg-slate-950 text-slate-200 p-2">
          {diffLines.length === 0 ? (
            <div className="p-4 text-center text-slate-400 italic">No differences found. Texts are identical.</div>
          ) : (
            diffLines.map((line, idx) => {
              const isAdded = line.type === "added";
              const isRemoved = line.type === "removed";

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 px-2 py-0.5 leading-relaxed font-mono ${
                    isAdded
                      ? "bg-emerald-950/60 text-emerald-300 border-l-2 border-emerald-500"
                      : isRemoved
                      ? "bg-rose-950/60 text-rose-300 border-l-2 border-rose-500 opacity-80"
                      : "text-slate-300 border-l-2 border-transparent"
                  }`}
                >
                  <span className="w-5 shrink-0 text-slate-500 select-none text-right text-[10px]">
                    {isAdded ? "+" : isRemoved ? "-" : " "}
                  </span>
                  <span className="w-7 shrink-0 text-slate-600 select-none text-right text-[10px]">
                    {line.modLineNo || line.origLineNo || ""}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-all">{line.text || "\u00A0"}</span>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-xs">
          {/* Left Column: Original */}
          <div className="p-3 overflow-x-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2 border-b border-slate-800 pb-1">
              {originalLabel} ({stats.origBytes.toLocaleString()} bytes)
            </div>
            <pre className="whitespace-pre-wrap break-all text-slate-300 leading-relaxed">
              {originalText || "<empty>"}
            </pre>
          </div>

          {/* Right Column: Modified */}
          <div className="p-3 overflow-x-auto bg-slate-900/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2 border-b border-slate-800 pb-1">
              {modifiedLabel} ({stats.modBytes.toLocaleString()} bytes)
            </div>
            <pre className="whitespace-pre-wrap break-all text-emerald-200/90 leading-relaxed">
              {modifiedText || "<empty>"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
