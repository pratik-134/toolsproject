"use client";

import React from "react";
import {
  Archive,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  FileText,
  Sliders,
  Sparkles,
} from "lucide-react";
import { BatchItem, BatchItemStatus } from "@/lib/batch-processor";

interface BatchWorkspaceProps<TOutput> {
  title: string;
  actionLabel: string;
  items: BatchItem<TOutput>[];
  isProcessing: boolean;
  onProcessAll: () => void;
  onClear: () => void;
  onDownloadItem: (item: BatchItem<TOutput>) => void;
  onDownloadAllZip: () => void;
  renderItemStats?: (item: BatchItem<TOutput>) => React.ReactNode;
}

export function BatchWorkspace<TOutput>({
  title,
  actionLabel,
  items,
  isProcessing,
  onProcessAll,
  onClear,
  onDownloadItem,
  onDownloadAllZip,
  renderItemStats,
}: BatchWorkspaceProps<TOutput>) {
  const completedCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const totalCount = items.length;

  const overallProgress =
    totalCount > 0
      ? Math.round(
          items.reduce((sum, item) => sum + (item.progress || 0), 0) / totalCount
        )
      : 0;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Batch Header & Controls */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Batch Mode
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Worker Pool: 3 Parallel Tasks
              </span>
            </div>
            <h3 className="font-headings text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              {title} ({totalCount} files queued)
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onClear}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Queue
            </button>

            {completedCount > 0 && (
              <button
                type="button"
                onClick={onDownloadAllZip}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                <Archive className="w-4 h-4" />
                Download All as ZIP ({completedCount})
              </button>
            )}

            <button
              type="button"
              onClick={onProcessAll}
              disabled={isProcessing || completedCount === totalCount}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Batch ({overallProgress}%)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {actionLabel}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Overall Progress Meter */}
        {isProcessing && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Batch Progress: {completedCount} / {totalCount} completed</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-200"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                {idx + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{formatBytes(item.size)}</span>
                  {renderItemStats && renderItemStats(item)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              {item.status === "idle" && (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Queued
                </span>
              )}

              {item.status === "processing" && (
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{item.progress}%</span>
                </div>
              )}

              {item.status === "error" && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400" title={item.error}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="max-w-[150px] truncate">{item.error || "Failed"}</span>
                </div>
              )}

              {item.status === "done" && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Done
                  </span>
                  <button
                    type="button"
                    onClick={() => onDownloadItem(item)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                    title="Download this file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
