"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Layers, Sparkles, RefreshCw } from "lucide-react";
import { getChainSuggestions, saveHandoff, ToolChainSuggestion } from "@/lib/tool-chains";

interface ToolChainActionsProps {
  sourceToolSlug: string;
  fileName: string;
  mimeType: string;
  fileData: Uint8Array | ArrayBuffer | Blob;
}

export function ToolChainActions({
  sourceToolSlug,
  fileName,
  mimeType,
  fileData,
}: ToolChainActionsProps) {
  const router = useRouter();
  const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null);
  const suggestions: ToolChainSuggestion[] = getChainSuggestions(sourceToolSlug);

  if (suggestions.length === 0) {
    return null;
  }

  const handleChainClick = async (suggestion: ToolChainSuggestion) => {
    try {
      setNavigatingSlug(suggestion.targetSlug);
      await saveHandoff(
        {
          name: fileName,
          type: mimeType,
          data: fileData,
          sourceToolSlug,
        },
        suggestion.targetSlug
      );
      router.push(suggestion.url);
    } catch (err) {
      console.error("[ToolChain] Failed to handoff file", err);
      setNavigatingSlug(null);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/80">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
          <Layers className="w-4 h-4" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Next Step: 1-Click Pipeline Chaining
        </h4>
        <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
          Zero Upload
        </span>
      </div>

      <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 mb-3">
        Send this output file directly into another tool in memory without downloading or re-uploading:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {suggestions.map((sug) => {
          const isLoading = navigatingSlug === sug.targetSlug;
          return (
            <button
              key={sug.targetSlug}
              type="button"
              disabled={Boolean(navigatingSlug)}
              onClick={() => handleChainClick(sug)}
              className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-left transition-all group disabled:opacity-60 text-[16px]"
            >
              <div>
                <p className="text-[16px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {sug.label}
                </p>
                <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {sug.description}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[16px] font-semibold text-indigo-600 dark:text-indigo-400">
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Handoff in memory...</span>
                  </>
                ) : (
                  <>
                    <span>Chain file</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
