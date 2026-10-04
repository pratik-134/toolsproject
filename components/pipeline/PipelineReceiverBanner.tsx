"use client";

import React, { useState, useEffect } from "react";
import { GitFork, Check, Copy, X, Sparkles, Download, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPipelineHandoff,
  clearPipelineHandoff,
  PipelineHandoff,
} from "@/lib/pipeline/handoff";

interface PipelineReceiverBannerProps {
  currentToolSlug: string;
}

export function PipelineReceiverBanner({ currentToolSlug }: PipelineReceiverBannerProps) {
  const [handoff, setHandoff] = useState<PipelineHandoff | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const incoming = getPipelineHandoff(currentToolSlug);
    if (incoming) {
      setHandoff(incoming);
    }
  }, [currentToolSlug]);

  if (!handoff) {
    return null;
  }

  const handleCopy = () => {
    if (handoff.textData) {
      navigator.clipboard.writeText(handoff.textData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    // 1. Copy to clipboard automatically as a universal fallback
    if (handoff.textData) {
      navigator.clipboard.writeText(handoff.textData);
    }

    // 2. Dispatch custom event that tool sandboxes can listen to
    window.dispatchEvent(
      new CustomEvent("pipeline-apply-data", {
        detail: handoff,
      })
    );

    setApplied(true);
    setTimeout(() => {
      clearPipelineHandoff();
      setHandoff(null);
    }, 1500);
  };

  const handleDismiss = () => {
    clearPipelineHandoff();
    setHandoff(null);
  };

  const previewSnippet = handoff.textData
    ? handoff.textData.length > 120
      ? `${handoff.textData.slice(0, 120)}...`
      : handoff.textData
    : handoff.fileName || "Incoming file payload";

  return (
    <div className="max-w-7xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 dark:border-blue-400/20 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info & Source */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pipeline Handoff Received
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                From <strong>{handoff.sourceToolName}</strong>
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 line-clamp-1 mt-0.5">
              {previewSnippet}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {handoff.textData && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs gap-1.5 h-8"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Data"}</span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={applied}
            className="text-xs gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Applied!</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Apply Input</span>
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-1"
            title="Dismiss handoff"
            aria-label="Dismiss pipeline handoff"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
