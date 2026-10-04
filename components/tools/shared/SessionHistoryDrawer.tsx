"use client";

import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, History, Trash2, Undo2 } from "lucide-react";
import { SessionHistoryItem } from "@/lib/hooks/use-session-history";

interface SessionHistoryDrawerProps {
  items: SessionHistoryItem[];
  onClear: () => void;
  onRestore?: (value: string) => void;
  title?: string;
  className?: string;
}

export function SessionHistoryDrawer({
  items,
  onClear,
  onRestore,
  title = "Recent Generated Outputs",
  className = "",
}: SessionHistoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const handleCopy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  const formatTime = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 45) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return `${Math.floor(diffSec / 3600)}h ago`;
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs ${className}`}
    >
      {/* Header Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <History className="w-4 h-4 text-slate-500" />
          <span>{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
            {items.length}
          </span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Zero cloud egress • Memory only
          </span>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
            title="Clear session history"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Collapsible Items List */}
      {isOpen && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs transition-colors"
            >
              <div className="min-w-0 flex-1 flex items-center gap-2">
                {item.label && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-semibold">
                    {item.label}
                  </span>
                )}
                <span className="font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                  {item.value}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatTime(item.timestamp)}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onRestore && (
                  <button
                    type="button"
                    onClick={() => onRestore(item.value)}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                    title="Load this value back into the editor"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.value)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
