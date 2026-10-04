"use client";

import React from "react";
import { History, RotateCcw, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DraftRestoredBannerProps {
  isRestored: boolean;
  savedAtFormatted?: string;
  onReset: () => void;
  onDismiss: () => void;
  className?: string;
}

/**
 * Visual banner displayed when an auto-saved draft was restored on tool launch.
 */
export function DraftRestoredBanner({
  isRestored,
  savedAtFormatted = "recently",
  onReset,
  onDismiss,
  className = "",
}: DraftRestoredBannerProps) {
  if (!isRestored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 dark:border-amber-800/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 transition-all animate-fade-in ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
          <History className="h-3.5 w-3.5" />
        </div>
        <div className="truncate">
          <span className="font-semibold">Draft restored</span>
          <span className="text-amber-700/80 dark:text-amber-300/70 ml-1">
            from your previous session ({savedAtFormatted})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-7 px-2.5 text-xs gap-1 border-amber-300 dark:border-amber-800 bg-white/80 dark:bg-slate-900/80 hover:bg-amber-100/60 dark:hover:bg-amber-950/60 text-amber-900 dark:text-amber-200"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset to Default</span>
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors"
          title="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
