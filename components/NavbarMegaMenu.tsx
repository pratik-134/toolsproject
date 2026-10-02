"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { CATEGORY_LIST, getCategoryById } from "@/lib/registry/categories";
import { getAllTools, getToolUrl } from "@/lib/registry/tools";
import { getToolIcon, CATEGORY_ICON_MAP } from "@/lib/tool-icons";
import { ToolDefinition } from "@/lib/registry/types";
import {
  ChevronDown,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";

interface NavbarMegaMenuProps {
  onClose?: () => void;
}

export function NavbarMegaMenu({ onClose }: NavbarMegaMenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("document-pdf");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allTools = useMemo(() => getAllTools(), []);

  // Filter tools based on search query or active category
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return allTools.filter((t) => t.category === activeCategoryId);
    }
    return allTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.seo.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [allTools, activeCategoryId, searchQuery]);

  const activeCategory = useMemo(() => getCategoryById(activeCategoryId), [activeCategoryId]);

  return (
    <div
      role="region"
      aria-label="All Tools Mega Menu"
      className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-2xl transition-all animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Top Bar: Search Input & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all 168+ privacy tools..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-300 font-semibold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% In-Browser</span>
            </span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Showing <strong className="text-slate-900 dark:text-white">{filteredTools.length}</strong> {filteredTools.length === 1 ? "tool" : "tools"}
            </span>
          </div>
        </div>

        {/* Two-Pane Mega Menu Workspace */}
        {searchQuery ? (
          /* Search Results Grid View */
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Search Results for &ldquo;{searchQuery}&rdquo; ({filteredTools.length})
            </div>
            {filteredTools.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                No tools match your query. Try searching for &ldquo;pdf&rdquo;, &ldquo;json&rdquo;, or &ldquo;resume&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredTools.map((tool) => {
                  const Icon = getToolIcon(tool);
                  const url = getToolUrl(tool);
                  return (
                    <Link
                      key={tool.slug}
                      href={url}
                      onClick={onClose}
                      className="group flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/90 hover:bg-blue-50/80 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500/80 transition-all shadow-2xs hover:shadow-xs"
                    >
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform shadow-2xs group-hover:border-blue-300 dark:group-hover:border-blue-500/50">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                            {tool.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-300 line-clamp-1 mt-0.5">
                          {tool.seo.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Normal Categorized Two-Pane Layout */
          <div className="grid grid-cols-12 gap-6 min-h-[380px]">
            {/* Left Pane: Categories List (4 Cols) */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r-0 md:border-r border-slate-200/70 dark:border-slate-800 pr-0 md:pr-4 space-y-1 max-h-[420px] overflow-y-auto scrollbar-thin">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-1">
                Tool Categories
              </div>
              {CATEGORY_LIST.map((cat) => {
                const CatIcon = CATEGORY_ICON_MAP[cat.id] || Wrench;
                const catToolsCount = allTools.filter((t) => t.category === cat.id).length;
                const isSelected = activeCategoryId === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    onMouseEnter={() => setActiveCategoryId(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-blue-600 dark:bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 dark:shadow-blue-500/25 border border-blue-500 dark:border-blue-400"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/90 hover:text-blue-600 dark:hover:text-blue-400 font-semibold border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CatIcon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? "text-white" : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                      <span className="text-xs truncate">{cat.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700 font-bold"
                      }`}
                    >
                      {catToolsCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Pane: Selected Category Tools Grid (8-9 Cols) */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{activeCategory?.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      {activeCategory?.description}
                    </p>
                  </div>
                  <Link
                    href={`/tools/${activeCategoryId}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline shrink-0"
                  >
                    <span>View Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredTools.map((tool) => {
                    const Icon = getToolIcon(tool);
                    const url = getToolUrl(tool);

                    return (
                      <Link
                        key={tool.slug}
                        href={url}
                        onClick={onClose}
                        className="group flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/90 hover:bg-blue-50/80 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500/80 transition-all shadow-2xs hover:shadow-xs"
                      >
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform shadow-2xs group-hover:border-blue-300 dark:group-hover:border-blue-500/50">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                            {tool.name}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-300 line-clamp-1 mt-0.5">
                            {tool.seo.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mega Menu Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>
              All 168+ tools run locally in WebAssembly & JavaScript. Zero cloud storage.
            </span>
          </div>
          <Link
            href="/tools"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline shrink-0"
          >
            <span>Browse Full Tools Directory ({allTools.length} Tools)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
