"use client";

import React from "react";
import { Sparkles, Trash2, X, FileText, ArrowRight } from "lucide-react";
import { HandoffFile } from "@/lib/tool-chains";

interface ToolHandoffBannerProps {
  handoff: HandoffFile;
  onClear: () => void;
  onDismiss: () => void;
  formatSize?: (bytes: number) => string;
}

export function ToolHandoffBanner({
  handoff,
  onClear,
  onDismiss,
  formatSize,
}: ToolHandoffBannerProps) {
  const displaySize = formatSize
    ? formatSize(handoff.size)
    : `${(handoff.size / 1024).toFixed(1)} KB`;

  return (
    <aside
      aria-label="Chained file banner"
      className="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/70 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-xs animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                1-Click Chained File
              </span>
              {handoff.sourceToolSlug && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  from{" "}
                  <code className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    {handoff.sourceToolSlug}
                  </code>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {handoff.name} <span className="font-normal text-slate-500">({displaySize})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold shadow-2xs transition-colors"
            title="Clear handoff file and start fresh"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear files
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
