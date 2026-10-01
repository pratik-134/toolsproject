"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ToolDefinition } from "@/lib/registry/types";
import { CATEGORY_LIST, getCategoryById } from "@/lib/registry/categories";
import { getToolUrl } from "@/lib/registry/tools";
import { getCategoryTheme } from "@/lib/category-theme";
import { getToolIcon } from "@/lib/tool-icons";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";

export interface ToolCardGridProps {
  tools: ToolDefinition[];
  initialCategory?: string;
  showCategoryFilter?: boolean;
  showSearchBar?: boolean;
  title?: string;
  subtitle?: string;
}

export const ToolCardGrid: React.FC<ToolCardGridProps> = ({
  tools,
  initialCategory = "all",
  showCategoryFilter = true,
  showSearchBar = true,
  title,
  subtitle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.seo.description.toLowerCase().includes(query) ||
        tool.slug.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [tools, selectedCategory, searchQuery]);

  // Determine whether to show category pills on cards (hide on single-category hub)
  const isSingleCategoryHub = initialCategory !== "all" && !showCategoryFilter;

  return (
    <div className="w-full space-y-6 font-body">
      {(title || subtitle || showSearchBar) && (
        <div className="space-y-4">
          {title && (
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-sm text-slate-600 max-w-2xl font-medium">{subtitle}</p>}
            </div>
          )}

          {/* Search Filter input */}
          {showSearchBar && (
            <div className="relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${tools.length} utilities by name or keyword...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                aria-label="Filter tools by keyword"
              />
            </div>
          )}
        </div>
      )}

      {/* Category Pills Filter */}
      {showCategoryFilter && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none" aria-label="Category filter">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All Tools ({tools.length})
          </button>
          {CATEGORY_LIST.map((cat) => {
            const count = tools.filter((t) => t.category === cat.id).length;
            if (count === 0) return null;
            const isSelected = selectedCategory === cat.id;
            const theme = getCategoryTheme(cat.id);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
                style={{
                  backgroundColor: isSelected ? theme.primary : undefined,
                }}
              >
                <span>{cat.shortName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Soft-Tech Editorial Grid of Tool Cards */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool) => {
            const categoryDef = getCategoryById(tool.category);
            const theme = getCategoryTheme(tool.category);
            const ToolIcon = getToolIcon(tool);

            return (
              <Link
                key={tool.slug}
                href={getToolUrl(tool)}
                className="group relative flex flex-col justify-between h-full min-h-[200px] p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white hover:-translate-y-1 hover:border-[var(--cat-border)] hover:shadow-[0_14px_32px_-6px_var(--cat-glow)] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none motion-reduce:hover:transform-none"
                style={{
                  '--cat-primary': theme.primary,
                  '--cat-border': theme.border,
                  '--cat-glow': theme.glow,
                } as React.CSSProperties}
              >
                <div className="space-y-3.5">
                  {/* Hero Icon Tile (48x48px) + Category Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-md"
                      style={{
                        backgroundColor: theme.tint,
                        borderColor: theme.border,
                        color: theme.primary,
                      }}
                    >
                      <ToolIcon className="w-6 h-6 transition-transform duration-300 ease-out group-hover:scale-105" strokeWidth={1.75} aria-hidden="true" />
                    </div>

                    {!isSingleCategoryHub && categoryDef && (
                      <span
                        className="text-[11px] font-mono font-medium lowercase tracking-wide px-2.5 py-0.5 rounded-full border shadow-sm shrink-0 transition-all duration-200 group-hover:shadow-xs"
                        style={{
                          backgroundColor: theme.tint,
                          borderColor: theme.border,
                          color: theme.primary,
                        }}
                      >
                        {categoryDef.shortName}
                      </span>
                    )}
                  </div>

                  {/* Tool Title & Description with rigid height matching */}
                  <div>
                    <h3 className="font-headings text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 leading-snug line-clamp-2 h-11 flex items-center">
                      {tool.name}
                    </h3>
                    <p className="font-body text-xs sm:text-[13px] text-slate-500 leading-relaxed line-clamp-2 h-10 mt-1 overflow-hidden">
                      {tool.seo.description}
                    </p>
                  </div>
                </div>

                {/* Footer Bar: Runs in Browser indicator + Circular Arrow */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs" title="Runs in your browser">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                    <span className="text-[11px] text-slate-500 font-medium">Runs in browser</span>
                  </div>

                  <div
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-[var(--cat-primary)] group-hover:text-white transition-all duration-300 ease-out flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:shadow-md"
                    aria-hidden="true"
                  >
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" strokeWidth={2} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <p className="text-sm font-semibold text-slate-700">No tools found matching your filter criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="text-xs text-blue-600 hover:underline font-bold focus:outline-none"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
