"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Lock,
  Calculator,
  Code2,
  QrCode,
  Wrench,
  Sparkles,
  Cloud,
  Zap,
} from "lucide-react";
import { getLiveTools, getToolBySlug, getToolUrl, TOOLS_COUNT_LABEL } from "@/lib/registry/tools";
import { ToolDefinition, CategoryId } from "@/lib/registry/types";
import { getCategoryTheme } from "@/lib/category-theme";
import { KbdShortcut } from "@/components/ui/KbdShortcut";
import { detectInputType, DetectedAction } from "@/lib/detect-input-type";
import { setPipelineHandoff } from "@/lib/pipeline/handoff";

const CATEGORY_ICON_MAP: Record<CategoryId, React.ElementType> = {
  "document-pdf": FileText,
  image: ImageIcon,
  security: Lock,
  "url-cloud": Cloud,
  calculators: Calculator,
  developer: Code2,
  codes: QrCode,
  utilities: Wrench,
  builders: FileText,
  video: ImageIcon,
  audio: Wrench,
};

const CATEGORY_LABEL_MAP: Record<CategoryId, string> = {
  "document-pdf": "PDF",
  image: "Image",
  security: "Security",
  "url-cloud": "Cloud",
  calculators: "Calculator",
  developer: "Dev",
  codes: "Code",
  utilities: "Utility",
  builders: "Builder",
  video: "Video",
  audio: "Audio",
};

export interface ToolSearchBarProps {
  placeholder?: string;
  size?: "default" | "large";
  className?: string;
}

export const ToolSearchBar: React.FC<ToolSearchBarProps> = ({
  placeholder,
  size = "default",
  className = "",
}) => {
  const resolvedPlaceholder = placeholder || `Search ${TOOLS_COUNT_LABEL}... (e.g. PDF merge, BMI calculator, hash generator)`;
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allTools = useMemo(() => getLiveTools(), []);

  // Intelligent relevance scoring for fast and accurate search indexing
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const scored: { tool: ToolDefinition; score: number }[] = [];

    for (const tool of allTools) {
      const name = tool.name.toLowerCase();
      const slug = tool.slug.toLowerCase();
      const cat = tool.category.toLowerCase();
      const desc = tool.seo.description.toLowerCase();
      let score = 0;

      // Exact name or slug match
      if (name === q || slug === q) {
        score += 100;
      } else if (name.startsWith(q)) {
        score += 65;
      } else if (name.split(/\s+/).some((w) => w.startsWith(q))) {
        score += 45;
      } else if (name.includes(q)) {
        score += 30;
      }

      // Slug match
      if (slug.startsWith(q)) {
        score += 25;
      } else if (slug.includes(q)) {
        score += 15;
      }

      // Category match
      if (cat.includes(q) || CATEGORY_LABEL_MAP[tool.category]?.toLowerCase().includes(q)) {
        score += 15;
      }

      // Description match
      if (desc.includes(q)) {
        score += 5;
      }

      if (score > 0) {
        scored.push({ tool, score });
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.tool);
  }, [allTools, query]);

  // Global Cmd+K / Ctrl+K shortcut to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Close dropdown when interacting outside on desktop (mouse) or mobile (touch)
  useEffect(() => {
    const handleOutsideInteraction = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideInteraction);
    document.addEventListener("touchstart", handleOutsideInteraction, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("touchstart", handleOutsideInteraction);
    };
  }, []);

  const detected = useMemo(() => detectInputType(query), [query]);
  const smartCount = detected ? detected.suggestedTools.length : 0;
  const totalCount = smartCount + results.length;

  const handleSelectTool = (tool: ToolDefinition) => {
    setIsOpen(false);
    setQuery("");
    if (tool.slug === "resume-builder") {
      router.push("/editor");
    } else {
      router.push(`/tools/${tool.category}/${tool.slug}`);
    }
  };

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
      // Ignore if storage full
    }

    setIsOpen(false);
    setQuery("");
    router.push(getToolUrl(targetTool));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen && totalCount > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
        return;
      }
      setSelectedIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (detected && selectedIndex >= 0 && selectedIndex < smartCount) {
        const smartAction = detected.suggestedTools[selectedIndex];
        if (smartAction) {
          handleSelectSmartAction(smartAction);
          return;
        }
      }
      if (results.length > 0) {
        const toolIdx = selectedIndex >= smartCount ? selectedIndex - smartCount : 0;
        const targetTool = results[toolIdx] || results[0];
        if (targetTool) {
          handleSelectTool(targetTool);
          return;
        }
      }
      const q = query.trim();
      setIsOpen(false);
      if (q) {
        router.push(`/tools?q=${encodeURIComponent(q)}`);
      } else {
        router.push("/tools");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const isLarge = size === "large";

  return (
    <div ref={containerRef} className={`relative w-full z-40 ${className}`}>
      <div className="relative flex items-center">
        <div
          className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${
            isLarge ? "left-4 sm:left-5 text-blue-600" : "left-3.5 text-slate-400"
          }`}
        >
          <Search className={isLarge ? "h-5 w-5" : "h-4 w-4"} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPlaceholder}
          className={`w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all font-body ${
            isLarge
              ? "pl-12 sm:pl-14 pr-16 py-3.5 sm:py-4 rounded-2xl border-2 border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm text-sm sm:text-base focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              : "pl-10 pr-14 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-xs sm:text-sm shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          }`}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && results.length > 0}
          aria-controls="tool-search-results-listbox"
          aria-haspopup="listbox"
          aria-label="Search tools"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 ${
              isLarge ? "right-4 text-base p-1" : "right-3 text-xs px-1"
            }`}
            title="Clear search"
          >
            ×
          </button>
        ) : (
          <div
            className={`absolute top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center ${
              isLarge ? "right-4" : "right-3"
            }`}
          >
            <KbdShortcut
              shortcut="K"
              className={isLarge ? "px-2 py-1 text-xs" : "px-1.5 py-0.5 text-[10px]"}
            />
          </div>
        )}
      </div>

      {/* Dropdown Results — Layered z-50, touch-safe, responsive max-height */}
      {isOpen && query.trim().length > 0 && (
        <div
          id="tool-search-results-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-fade-in font-body max-h-[75vh] sm:max-h-[460px] overflow-y-auto overscroll-contain"
        >
          {/* 🌟 SMART INPUT AUTO-DETECTION HERO CARD */}
          {detected && (
            <div className="p-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border-b border-blue-200/80 dark:border-blue-800/80 space-y-2">
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
                    <button
                      key={action.toolSlug}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handleSelectSmartAction(action);
                      }}
                      onClick={() => handleSelectSmartAction(action)}
                      onMouseEnter={() => setSelectedIndex(sIdx)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        isSelected
                          ? "bg-white dark:bg-slate-800 border border-blue-400 dark:border-blue-600 shadow-xs"
                          : "bg-white/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
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
                        <ArrowRight className={`h-3.5 w-3.5 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {results.length > 0 ? (
            <div className="py-1 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="px-3.5 sm:px-4 py-2 bg-slate-50/80 dark:bg-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{detected ? "Other Matching Tools" : "Matching Tools"} ({results.length})</span>
                <span className="text-[10px] text-slate-400 font-normal hidden xs:inline">
                  Press Enter to open #1
                </span>
              </div>
              {results.map((tool, idx) => {
                const IconComponent = CATEGORY_ICON_MAP[tool.category] || Wrench;
                const theme = getCategoryTheme(tool.category);
                const itemIndex = smartCount + idx;
                const isSelected = selectedIndex === itemIndex;
                return (
                  <button
                    key={tool.slug}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleSelectTool(tool);
                    }}
                    onClick={() => handleSelectTool(tool)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`w-full flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm transition-colors ${
                      isSelected ? "bg-blue-50/70 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`h-7 w-7 rounded-md border flex items-center justify-center shrink-0 ${theme.tintBg} ${theme.tintBorder} ${theme.text}`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                          {tool.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                          {tool.seo.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded border uppercase tracking-wider ${theme.tintBg} ${theme.tintBorder} ${theme.text}`}
                      >
                        {CATEGORY_LABEL_MAP[tool.category] || tool.category}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    </div>
                  </button>
                );
              })}
              <Link
                href={`/tools?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors"
              >
                See all results for &quot;{query}&quot; →
              </Link>
            </div>
          ) : !detected ? (
            <div className="p-5 text-center space-y-2">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                No direct tool match for &quot;<span className="font-semibold text-slate-700 dark:text-slate-200">{query}</span>&quot;
              </p>
              <Link
                href={`/tools?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Search all 111 tools directory</span>
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
