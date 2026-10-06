"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAllTools, getToolUrl, getToolBySlug } from "@/lib/registry/tools";
import { getCategoryById } from "@/lib/registry/categories";
import { CATEGORY_COLORS } from "@/lib/design-tokens";
import { detectInputType, DetectedAction } from "@/lib/detect-input-type";
import { setPipelineHandoff } from "@/lib/pipeline/handoff";
import {
  Search,
  Command,
  X,
  ArrowRight,
  CornerDownLeft,
  Sparkles,
  Zap,
} from "lucide-react";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tools = useMemo(() => getAllTools(), []);

  // 1. Smart Input Auto-Detection
  const detected = useMemo(() => detectInputType(query), [query]);

  // 2. Regular Filtered Tools
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return tools.slice(0, 12); // Show top 12 when search is empty

    return tools.filter((tool) => {
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.seo.description.toLowerCase().includes(q) ||
        tool.slug.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
      );
    });
  }, [tools, query]);

  const smartCount = detected ? detected.suggestedTools.length : 0;
  const totalCount = smartCount + results.length;

  // Reset selected index when query or results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Execute smart action handoff
  const handleSelectSmartAction = (action: DetectedAction) => {
    const targetTool = getToolBySlug(action.toolSlug);
    if (!targetTool) return;

    try {
      setPipelineHandoff({
        sourceSlug: "omnibar",
        sourceToolName: "Quick Input",
        targetSlug: action.toolSlug,
        dataType: "text",
        textData: query.trim(),
        title: `Pasted ${detected?.label || "Content"}`,
      });
    } catch {
      // Ignore if quota exceeded
    }

    onClose();
    router.push(getToolUrl(targetTool));
  };

  // Handle keyboard navigation inside search dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1));
    } else if (e.key === "Enter" && totalCount > 0) {
      e.preventDefault();
      if (detected && selectedIndex < smartCount) {
        const smartAction = detected.suggestedTools[selectedIndex];
        if (smartAction) {
          handleSelectSmartAction(smartAction);
        }
      } else {
        const toolIndex = selectedIndex - smartCount;
        const targetTool = results[toolIndex];
        if (targetTool) {
          onClose();
          router.push(getToolUrl(targetTool));
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search all Qwertygen tools"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 animate-fade-in font-body"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-0 relative animate-scale-up"
      >
        {/* Search Header Input */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tools.length}+ tools, or paste JSON, JWT, SQL, Color, Cron, Timestamp...`}
            className="w-full bg-transparent pl-3 pr-10 text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
          {/* 🌟 SMART INPUT AUTO-DETECTION HERO CARD */}
          {detected && (
            <div className="p-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border border-blue-200/80 dark:border-blue-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded-md bg-blue-600 text-white shrink-0 shadow-xs">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Detected: {detected.label}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
                        {detected.badge}
                      </span>
                    </div>
                    {detected.previewValue && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono truncate mt-0.5">
                        {detected.previewValue}
                      </p>
                    )}
                  </div>
                </div>

                {detected.colorSwatch && (
                  <div
                    className="h-6 w-6 rounded-md border border-slate-300 dark:border-slate-600 shrink-0 shadow-xs"
                    style={{ backgroundColor: detected.colorSwatch }}
                    title={detected.colorSwatch}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                {detected.suggestedTools.map((action, sIdx) => {
                  const isSelected = selectedIndex === sIdx;

                  return (
                    <div
                      key={action.toolSlug}
                      onClick={() => handleSelectSmartAction(action)}
                      onMouseEnter={() => setSelectedIndex(sIdx)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white dark:bg-slate-800 border border-blue-400 dark:border-blue-600 shadow-xs"
                          : "bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {action.actionTitle}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                          • {action.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded px-1.5 py-0.5">
                          Pre-fill Data
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                            Enter <CornerDownLeft className="h-2.5 w-2.5" />
                          </span>
                        )}
                        <ArrowRight className={`h-3.5 w-3.5 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section Heading if smart suggestions are present */}
          {detected && results.length > 0 && (
            <div className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Other Matching Tools
            </div>
          )}

          {/* Regular Results List */}
          {results.length > 0 ? (
            results.map((tool, idx) => {
              const categoryDef = getCategoryById(tool.category);
              const colorToken = CATEGORY_COLORS[categoryDef?.colorKey || "security"];
              const itemIndex = smartCount + idx;
              const isSelected = itemIndex === selectedIndex;

              return (
                <div
                  key={tool.slug}
                  onClick={() => {
                    onClose();
                    router.push(getToolUrl(tool));
                  }}
                  onMouseEnter={() => setSelectedIndex(itemIndex)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0"
                      style={{
                        backgroundColor: colorToken.tint,
                        borderColor: colorToken.border,
                        color: colorToken.primary,
                      }}
                    >
                      {categoryDef?.shortName || tool.category}
                    </span>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {tool.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {tool.seo.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 shrink-0">
                    {isSelected && (
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/60 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                        Press Enter <CornerDownLeft className="h-3 w-3" />
                      </span>
                    )}
                    <ArrowRight className={`h-4 w-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : ""}`} />
                  </div>
                </div>
              );
            })
          ) : !detected ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No matching tools found for &quot;{query}&quot;.
            </div>
          ) : null}
        </div>

        {/* Footer shortcuts helper */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {/* Desktop keyboard shortcuts */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded font-mono text-[10px]">
                ↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded font-mono text-[10px]">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded font-mono text-[10px]">
                Esc
              </kbd>
              Close
            </span>
          </div>

          {/* Mobile touch helper */}
          <div className="sm:hidden text-[10px] text-slate-400">
            Tap tool to launch
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            <Command className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            <span>Qwertygen Index ({tools.length})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
