"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAllTools, getToolUrl } from "@/lib/registry/tools";
import { getCategoryById } from "@/lib/registry/categories";
import { CATEGORY_COLORS } from "@/lib/design-tokens";
import { Search, Command, X, ArrowRight, CornerDownLeft } from "lucide-react";

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

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

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

  // Handle keyboard navigation inside search dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      const targetTool = results[selectedIndex];
      if (targetTool) {
        onClose();
        router.push(getToolUrl(targetTool));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search all ClearTrix tools"
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
            placeholder={`Search ${tools.length}+ free tools (e.g. PDF merge, WebP, AES, JSON)...`}
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

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800">
          {results.length > 0 ? (
            results.map((tool, idx) => {
              const categoryDef = getCategoryById(tool.category);
              const colorToken = CATEGORY_COLORS[categoryDef?.colorKey || "security"];
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={tool.slug}
                  onClick={() => {
                    onClose();
                    router.push(getToolUrl(tool));
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
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
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{tool.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.seo.description}</p>
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
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No matching tools found for "{query}".
            </div>
          )}
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
            <span>ClearTrix Index ({tools.length})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
