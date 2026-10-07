"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { CATEGORY_LIST, getCategoryById } from "@/lib/registry/categories";
import { getAllTools, getToolUrl, TOOLS_COUNT_LABEL, TOOLS_COUNT_DISPLAY } from "@/lib/registry/tools";
import { getToolIcon, CATEGORY_ICON_MAP } from "@/lib/tool-icons";
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wrench,
  X,
  ChevronRight,
  Zap,
} from "lucide-react";

interface NavbarMegaMenuProps {
  onClose?: () => void;
}

// Curated priority slugs for the "Featured in this Category" spotlight row
const FEATURED_SLUGS_SET = new Set<string>([
  "pdf-compressor",
  "merge-pdf",
  "pdf-to-word",
  "png-to-webp",
  "image-compressor",
  "image-cropper",
  "file-encryptor",
  "hash-generator",
  "password-generator",
  "url-encoder-decoder",
  "slug-generator",
  "qr-code-generator",
  "barcode-generator",
  "barcode-scanner",
  "screen-recorder",
  "video-to-gif",
  "video-trimmer",
  "audio-trimmer",
  "audio-converter",
  "voice-recorder",
  "resume-builder",
  "invoice-generator",
  "cover-letter-builder",
  "json-formatter",
  "html-beautifier-minifier",
  "base64-converter",
  "word-counter",
  "unit-converter",
  "case-converter",
  "mortgage-calculator",
  "compound-interest-calculator",
  "bmi-calculator",
]);

// Popular search query suggestions for empty / discovery states
const POPULAR_SEARCH_SUGGESTIONS = [
  "PDF Compressor",
  "Image to WebP",
  "Resume Builder",
  "JSON Formatter",
  "Word Counter",
  "QR Code Generator",
  "Mortgage Calculator",
];

export function NavbarMegaMenu({ onClose }: NavbarMegaMenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("document-pdf");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFilterCategory, setSearchFilterCategory] = useState<string>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allTools = useMemo(() => getAllTools(), []);

  // Category info
  const activeCategory = useMemo(() => getCategoryById(activeCategoryId), [activeCategoryId]);

  // Tools belonging to the currently selected category
  const activeCategoryTools = useMemo(() => {
    return allTools.filter((t) => t.category === activeCategoryId);
  }, [allTools, activeCategoryId]);

  // Curated 3 featured tools for the active category
  const featuredTools = useMemo(() => {
    const matched = activeCategoryTools.filter((t) => FEATURED_SLUGS_SET.has(t.slug));
    if (matched.length >= 3) {
      return matched.slice(0, 3);
    }
    const remaining = activeCategoryTools.filter((t) => !FEATURED_SLUGS_SET.has(t.slug));
    return [...matched, ...remaining].slice(0, 3);
  }, [activeCategoryTools]);

  // Search filtered tools across all categories
  const searchedTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return allTools.filter((t) => {
      const matchText =
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.seo.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);

      if (!matchText) return false;
      if (searchFilterCategory !== "all") {
        return t.category === searchFilterCategory;
      }
      return true;
    });
  }, [allTools, searchQuery, searchFilterCategory]);

  // Categories present in search results (for category filter chips)
  const searchCategoryCounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return new Map<string, number>();
    const counts = new Map<string, number>();
    allTools.forEach((t) => {
      const match =
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.seo.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      if (match) {
        counts.set(t.category, (counts.get(t.category) || 0) + 1);
      }
    });
    return counts;
  }, [allTools, searchQuery]);

  return (
    <div
      role="region"
      aria-label="All Tools Mega Menu"
      className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-150 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 space-y-4">
        {/* Top Control Bar: Command Search & Quick Category Shortcuts */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Search Input Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchFilterCategory("all");
              }}
              placeholder={`Search all ${TOOLS_COUNT_LABEL} (e.g. PDF compressor, WebP, JSON)...`}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchFilterCategory("all");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-0.5"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Shortcuts & Security Trust Badge */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Quick jump pills */}
            <div className="hidden sm:flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 dark:text-slate-300 mr-0.5">
                Popular:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategoryId("document-pdf");
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-800 dark:text-slate-200 transition-colors font-semibold text-xs border border-slate-200 dark:border-slate-700"
              >
                PDF Tools
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategoryId("image");
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-800 dark:text-slate-200 transition-colors font-semibold text-xs border border-slate-200 dark:border-slate-700"
              >
                Image Tools
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategoryId("developer");
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-800 dark:text-slate-200 transition-colors font-semibold text-xs border border-slate-200 dark:border-slate-700"
              >
                Developer
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategoryId("calculators");
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-800 dark:text-slate-200 transition-colors font-semibold text-xs border border-slate-200 dark:border-slate-700"
              >
                Calculators
              </button>
            </div>

            {/* Privacy trust pill */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold shadow-2xs ml-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% In-Browser Privacy</span>
            </span>
          </div>
        </div>

        {/* Content Workspace */}
        {searchQuery ? (
          /* =========================================================================
             1. SEARCH RESULTS WORKSPACE
             ========================================================================= */
          <div className="space-y-4 min-h-[380px]">
            {/* Search Header & Category Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Matching Tools for &ldquo;<span className="text-slate-900 dark:text-white font-extrabold">{searchQuery}</span>&rdquo; ({searchedTools.length})
              </div>

              {/* Category filter pills if multiple categories matched */}
              {searchCategoryCounts.size > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setSearchFilterCategory("all")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      searchFilterCategory === "all"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    All ({Array.from(searchCategoryCounts.values()).reduce((a, b) => a + b, 0)})
                  </button>
                  {Array.from(searchCategoryCounts.entries()).map(([catId, count]) => {
                    const catObj = getCategoryById(catId);
                    const isSelected = searchFilterCategory === catId;
                    return (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => setSearchFilterCategory(catId)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs font-bold"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {catObj?.shortName || catObj?.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Results Grid or Empty State */}
            {searchedTools.length === 0 ? (
              <div className="py-14 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    No matching tools found
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                    We could not find any tools matching &ldquo;{searchQuery}&rdquo;. Try another search term or pick a popular tool below.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto pt-2">
                  {POPULAR_SEARCH_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setSearchQuery(sug)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto pr-2 scrollbar-thin">
                {searchedTools.map((tool) => {
                  const Icon = getToolIcon(tool);
                  const url = getToolUrl(tool);
                  const cat = getCategoryById(tool.category);

                  return (
                    <Link
                      key={tool.slug}
                      href={url}
                      onClick={onClose}
                      className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                          {tool.name}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5 leading-relaxed font-normal">
                          {tool.seo.description}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          {cat?.shortName || cat?.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             2. SOLID TWO-PANE WORKSPACE (100% OPAQUE & HIGH CONTRAST)
             ========================================================================= */
          <div className="grid grid-cols-12 gap-6 min-h-[440px]">
            {/* Left Pane: Categories Navigation (3 Cols) */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3 pr-0 md:pr-4 border-r-0 md:border-r border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between px-2.5 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Categories ({CATEGORY_LIST.length})
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {TOOLS_COUNT_DISPLAY}
                </span>
              </div>

              <div className="space-y-1">
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                        isSelected
                          ? "bg-blue-600 text-white font-bold shadow-sm border border-blue-500"
                          : "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-semibold border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          }`}
                        >
                          <CatIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs truncate font-bold">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            isSelected
                              ? "bg-white/25 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {catToolsCount}
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isSelected
                              ? "text-white translate-x-0.5"
                              : "text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Sub-Menu Tools Canvas (9 Cols) */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Active Category Header Banner - 100% Solid & Opaque */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {activeCategory?.name}
                      </h3>
                      <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                        {activeCategoryTools.length} {activeCategoryTools.length === 1 ? "Tool" : "Tools"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
                      {activeCategory?.description}
                    </p>
                  </div>

                  <Link
                    href={`/tools/${activeCategoryId}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 shadow-sm transition-all shrink-0 self-start sm:self-center"
                  >
                    <span>Explore Category Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Popular / Featured Row (3 Highlight Cards) */}
                {featuredTools.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Popular in {activeCategory?.shortName || activeCategory?.name}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {featuredTools.map((tool) => {
                        const Icon = getToolIcon(tool);
                        const url = getToolUrl(tool);
                        return (
                          <Link
                            key={tool.slug}
                            href={url}
                            onClick={onClose}
                            className="group flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                Popular
                              </span>
                            </div>

                            <div className="mt-2.5">
                              <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                {tool.name}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5 leading-relaxed font-normal">
                                {tool.seo.description}
                              </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                              <span>Launch tool</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Category Tools Grid (Solid, High-Contrast 3-Column Grid) */}
                <div className="space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    All {activeCategory?.name} ({activeCategoryTools.length})
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {activeCategoryTools.map((tool) => {
                      const Icon = getToolIcon(tool);
                      const url = getToolUrl(tool);

                      return (
                        <Link
                          key={tool.slug}
                          href={url}
                          onClick={onClose}
                          className="group flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-400 hover:shadow-sm transition-all"
                        >
                          <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-2xs">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                              {tool.name}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5 leading-tight font-normal">
                              {tool.seo.description}
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mega Menu Footer Bar */}
        <div className="pt-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              All <strong className="text-slate-900 dark:text-white">{TOOLS_COUNT_LABEL}</strong> run locally in WebAssembly &amp; JavaScript. Zero server uploads.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:inline-block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-800 dark:text-slate-200 font-bold">Esc</kbd> to close
            </span>
            <Link
              href="/tools"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
            >
              <span>Browse Complete Directory ({TOOLS_COUNT_LABEL})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
