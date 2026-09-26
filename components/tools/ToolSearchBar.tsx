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
} from "lucide-react";
import { getLiveTools } from "@/lib/registry/tools";
import { ToolDefinition, CategoryId } from "@/lib/registry/types";
import { getCategoryTheme } from "@/lib/category-theme";

const CATEGORY_ICON_MAP: Record<CategoryId, React.ElementType> = {
  "document-pdf": FileText,
  image: ImageIcon,
  security: Lock,
  calculators: Calculator,
  developer: Code2,
  codes: QrCode,
  utilities: Wrench,
  builders: FileText,
  "url-cloud": Lock,
  video: ImageIcon,
  audio: Wrench,
};

const CATEGORY_LABEL_MAP: Record<CategoryId, string> = {
  "document-pdf": "PDF",
  image: "Image",
  security: "Security",
  calculators: "Calculator",
  developer: "Dev",
  codes: "Code",
  utilities: "Utility",
  builders: "Builder",
  "url-cloud": "Cloud",
  video: "Video",
  audio: "Audio",
};

export interface ToolSearchBarProps {
  placeholder?: string;
  size?: "default" | "large";
  className?: string;
}

export const ToolSearchBar: React.FC<ToolSearchBarProps> = ({
  placeholder = "Search 111+ tools... (e.g. PDF merge, BMI calculator, hash generator)",
  size = "default",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const allTools = useMemo(() => getLiveTools(), []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return allTools
      .filter((tool) => {
        return (
          tool.name.toLowerCase().includes(q) ||
          tool.slug.toLowerCase().includes(q) ||
          tool.category.toLowerCase().includes(q) ||
          tool.seo.description.toLowerCase().includes(q)
        );
      })
      .slice(0, 5);
  }, [allTools, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTool = (tool: ToolDefinition) => {
    setIsOpen(false);
    setQuery("");
    if (tool.slug === "resume-builder") {
      router.push("/editor");
    } else {
      router.push(`/tools/${tool.category}/${tool.slug}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen && results.length > 0) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedTool = selectedIndex >= 0 && selectedIndex < results.length ? results[selectedIndex] : undefined;
      const firstTool = results.length === 1 ? results[0] : undefined;

      if (selectedTool) {
        handleSelectTool(selectedTool);
      } else if (firstTool && firstTool.name.toLowerCase() === query.toLowerCase().trim()) {
        handleSelectTool(firstTool);
      } else {
        const q = query.trim();
        setIsOpen(false);
        if (q) {
          router.push(`/tools?q=${encodeURIComponent(q)}`);
        } else {
          router.push("/tools");
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isLarge = size === "large";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <div
          className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${
            isLarge ? "left-4 sm:left-5 text-slate-400" : "left-3.5"
          }`}
        >
          <Search className={isLarge ? "h-5 w-5 text-blue-600" : "h-4 w-4"} />
        </div>
        <input
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
          placeholder={placeholder}
          className={`w-full bg-white text-slate-800 placeholder:text-slate-400 transition-all font-body ${
            isLarge
              ? "pl-12 sm:pl-14 pr-11 py-3.5 sm:py-4 rounded-[14px] border-2 border-slate-200/90 shadow-sm text-sm sm:text-base focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              : "pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-xs text-xs sm:text-sm shadow-2xs hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          }`}
          aria-label="Search tools"
          aria-expanded={isOpen && results.length > 0}
          aria-haspopup="listbox"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${
              isLarge ? "right-4 text-base p-1" : "right-3 text-xs px-1"
            }`}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fade-in font-body">
          {results.length > 0 ? (
            <div className="py-1 divide-y divide-slate-100">
              <div className="px-3.5 py-2 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Matching In-Browser Tools</span>
                <span className="text-[10px] text-slate-400 font-normal">Press Enter to browse all</span>
              </div>
              {results.map((tool, idx) => {
                const IconComponent = CATEGORY_ICON_MAP[tool.category] || Wrench;
                const theme = getCategoryTheme(tool.category);
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={tool.slug}
                    type="button"
                    onClick={() => handleSelectTool(tool)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left text-xs sm:text-sm transition-colors ${
                      isSelected ? "bg-slate-50 text-slate-900" : "text-slate-700 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`h-7 w-7 rounded-md border flex items-center justify-center shrink-0 ${theme.tintBg} ${theme.tintBorder} ${theme.text}`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate text-xs sm:text-sm">
                          {tool.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {tool.seo.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${theme.tintBg} ${theme.tintBorder} ${theme.text}`}
                      >
                        {CATEGORY_LABEL_MAP[tool.category] || tool.category}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </button>
                );
              })}
              <Link
                href={`/tools?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-center text-xs font-semibold text-blue-600 hover:bg-blue-50/50 transition-colors"
              >
                See all results for &quot;{query}&quot; →
              </Link>
            </div>
          ) : (
            <div className="p-5 text-center space-y-2">
              <p className="text-xs sm:text-sm text-slate-500">
                No direct tool match for &quot;<span className="font-semibold text-slate-700">{query}</span>&quot;
              </p>
              <Link
                href={`/tools?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Search all 111 tools directory</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
