"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, ArrowRight, X, Sparkles, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToolBySlug, getToolUrl } from "@/lib/registry/tools";
import {
  setPipelineHandoff,
  getRecommendedPipelineTargets,
} from "@/lib/pipeline/handoff";

interface SendToPipelineButtonProps {
  sourceSlug: string;
  sourceToolName: string;
  dataType: "text" | "file";
  textData?: string;
  fileName?: string;
  fileType?: string;
  fileDataUrl?: string;
  title?: string;
  customTargets?: string[];
  className?: string;
}

export function SendToPipelineButton({
  sourceSlug,
  sourceToolName,
  dataType,
  textData,
  fileName,
  fileType,
  fileDataUrl,
  title,
  customTargets,
  className = "",
}: SendToPipelineButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [sendingSlug, setSendingSlug] = useState<string | null>(null);

  const targetSlugs = customTargets && customTargets.length > 0
    ? customTargets
    : getRecommendedPipelineTargets(sourceSlug, dataType);

  const resolvedTargets = targetSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const handleSend = (targetSlug: string) => {
    setSendingSlug(targetSlug);
    try {
      setPipelineHandoff({
        sourceSlug,
        sourceToolName,
        targetSlug,
        dataType,
        textData,
        fileName,
        fileType,
        fileDataUrl,
        title: title || (fileName ? `File from ${sourceToolName}` : `Data from ${sourceToolName}`),
      });

      const target = getToolBySlug(targetSlug);
      if (target) {
        const url = getToolUrl(target);
        router.push(url);
      }
    } catch (err: any) {
      alert(`Pipeline transfer failed: ${err.message || "Storage error"}`);
      setSendingSlug(null);
    }
  };

  const hasData = Boolean((dataType === "text" && textData && textData.trim().length > 0) || (dataType === "file" && (fileDataUrl || fileName)));

  if (!hasData || resolvedTargets.length === 0) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-medium gap-1.5 border-blue-200 dark:border-blue-900 bg-blue-50/50 hover:bg-blue-100/60 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300"
      >
        <GitFork className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>Send to Next Tool</span>
        <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Workflow Pipeline Targets
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {resolvedTargets.map((tool) => (
              <button
                key={tool.slug}
                type="button"
                onClick={() => handleSend(tool.slug)}
                disabled={sendingSlug !== null}
                className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {tool.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {tool.category.replace("-", " ")}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}
          </div>

          <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
            Zero-upload in-browser memory hand-off
          </div>
        </div>
      )}
    </div>
  );
}
