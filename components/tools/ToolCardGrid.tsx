"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ToolDefinition } from "@/lib/registry/types";
import { CATEGORY_LIST, getCategoryById } from "@/lib/registry/categories";
import { getToolUrl } from "@/lib/registry/tools";
import { getCategoryTheme } from "@/lib/category-theme";
import { getToolIcon } from "@/lib/tool-icons";
import { ArrowUpRight, Search, ShieldCheck } from "lucide-react";

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

  const isSingleCategoryHub = initialCategory !== "all" && !showCategoryFilter;

  return (
    <div className="w-full space-y-6 font-body">
      {(title || subtitle || showSearchBar) && (
        <div className="space-y-4">
          {title && (
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {showSearchBar && (
            <div className="relative max-w-xl">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${tools.length} utilities by name or keyword...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                aria-label="Filter tools by keyword"
              />
            </div>
          )}
        </div>
      )}

      {/* Category Pills Filter */}
      {showCategoryFilter && (
        <div
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
          aria-label="Category filter"
        >
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
              selectedCategory === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
                : "bg-white dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
            }`}
          >
            All ({tools.length})
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
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border ${
                  isSelected
                    ? "text-white shadow-sm border-transparent"
                    : "bg-white dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
                }`}
                style={{
                  backgroundColor: isSelected ? theme.primary : undefined,
                  borderColor: isSelected ? theme.primary : undefined,
                }}
              >
                <span>{cat.shortName}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono leading-tight font-bold ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tool Cards Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredTools.map((tool) => {
            const categoryDef = getCategoryById(tool.category);
            const theme = getCategoryTheme(tool.category);
            const ToolIcon = getToolIcon(tool);

            return (
              <Link
                key={tool.slug}
                href={getToolUrl(tool)}
                className="group relative flex flex-col h-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_28px_-4px_rgba(15,23,42,0.14)] dark:shadow-none dark:hover:shadow-none overflow-hidden transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--cat-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none motion-reduce:hover:transform-none"
                style={{
                  "--cat-primary": theme.primary,
                  "--cat-border": theme.border,
                  "--cat-tint": theme.tint,
                  "--cat-glow": theme.glow,
                } as React.CSSProperties}
              >
                {/* Subtle top accent stripe that appears on hover */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)` }}
                />

                <div className="p-5 sm:p-6 flex flex-col flex-1 gap-4">
                  {/* Header row: icon + category badge */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Icon tile */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105 bg-[var(--cat-tint)] dark:bg-slate-800/90 border-[var(--cat-border)] dark:border-slate-700 text-[var(--cat-primary)] dark:text-white"
                    >
                      <ToolIcon className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
                    </div>

                    {/* Category badge */}
                    {!isSingleCategoryHub && categoryDef && (
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full border shrink-0 mt-0.5 leading-tight bg-[var(--cat-tint)] dark:bg-slate-800 border-[var(--cat-border)] dark:border-slate-700 text-[var(--cat-primary)] dark:text-slate-200"
                      >
                        {categoryDef.shortName}
                      </span>
                    )}
                  </div>

                  {/* Title + description */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-headings text-base sm:text-[17px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[var(--cat-primary)] transition-colors duration-200">
                      {tool.name}
                    </h3>
                    <p className="font-body text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed line-clamp-2">
                      {tool.seo.description}
                    </p>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-5 sm:px-6 pb-4 sm:pb-5 flex items-center justify-between gap-2">
                  {/* Privacy badge */}
                  <div className="flex items-center gap-1.5" title="Runs 100% in your browser">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      In-browser
                    </span>
                  </div>

                  {/* CTA pill — slides in from right on hover */}
                  <span
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-250 ease-out shadow-sm shrink-0"
                    style={{ backgroundColor: theme.primary }}
                    aria-hidden="true"
                  >
                    Open
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : tools.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-headings text-base font-bold text-slate-900 dark:text-slate-100">
              Tools in Development
            </h3>
            <p className="font-body text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Utilities for this category are being built and tested for upcoming phases.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
          >
            Browse All Live Utilities
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No tools found matching your filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold focus:outline-none"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
