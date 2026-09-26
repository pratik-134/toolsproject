"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ToolDefinition, CategoryId } from "@/lib/registry/types";
import { CATEGORY_LIST } from "@/lib/registry/categories";
import { getCategoryTheme } from "@/lib/category-theme";
import {
  Search,
  ArrowRight,
  Sparkles,
  Filter,
  X,
  FileText,
  Image as ImageIcon,
  Lock,
  Cloud,
  QrCode,
  Video,
  Mic,
  Layers,
  Code2,
  Wrench,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_ICON_MAP: Record<CategoryId, React.ElementType> = {
  "document-pdf": FileText,
  image: ImageIcon,
  security: Lock,
  "url-cloud": Cloud,
  codes: QrCode,
  video: Video,
  audio: Mic,
  builders: Layers,
  developer: Code2,
  utilities: Wrench,
  calculators: Calculator,
};

interface ToolsDirectoryClientProps {
  tools: ToolDefinition[];
}

export const ToolsDirectoryClient: React.FC<ToolsDirectoryClientProps> = ({ tools }) => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">("all");

  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam !== null) {
      setSearchQuery(qParam);
    }
  }, [searchParams]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tools.filter((t) => {
      const matchesCategory =
        selectedCategory === "all" || t.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.seo.description.toLowerCase().includes(q)
      );
    });
  }, [tools, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Search Input & Category Pills */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all 111 live tools (e.g. 'docx', 'pdf', 'qr', 'mortgage', 'encrypt')..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-body text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-[8px] font-semibold transition-all whitespace-nowrap border ${
              selectedCategory === "all"
                ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xs"
                : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
            }`}
          >
            All Categories
          </button>

          {CATEGORY_LIST.map((cat) => {
            const catTheme = getCategoryTheme(cat.id);
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={
                  isSelected
                    ? { backgroundColor: catTheme.primary, borderColor: catTheme.primary }
                    : undefined
                }
                className={`px-3 py-1.5 rounded-[8px] font-semibold transition-all whitespace-nowrap border ${
                  isSelected
                    ? "text-white shadow-xs"
                    : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                }`}
              >
                {cat.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {filteredTools.length} {filteredTools.length === 1 ? "Tool" : "Tools"} Found
        </span>
        {(searchQuery || selectedCategory !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const isLive = tool.status === "live";
            const theme = getCategoryTheme(tool.category);
            const IconComp = CATEGORY_ICON_MAP[tool.category] || FileText;
            const targetHref =
              tool.slug === "resume-builder"
                ? "/editor"
                : `/tools/${tool.category}/${tool.slug}`;

            return (
              <Link
                key={tool.slug}
                href={isLive ? targetHref : `/tools/${tool.category}`}
                className={`group flex flex-col justify-between p-4 rounded-[12px] border transition-all ${
                  isLive
                    ? "border-slate-200 bg-white hover:border-slate-300 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] cursor-pointer"
                    : "border-slate-200/60 bg-slate-50/50 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-6 w-6 rounded-[6px] border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: theme.tint,
                          borderColor: theme.border,
                          color: theme.primary,
                        }}
                      >
                        <IconComp className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] uppercase tracking-wider border"
                        style={{
                          backgroundColor: theme.tint,
                          borderColor: theme.border,
                          color: theme.primary,
                        }}
                      >
                        {tool.category}
                      </span>
                    </div>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[6px] border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-[6px] border border-slate-200">
                        Phase {tool.phase}
                      </span>
                    )}
                  </div>

                  <h3 className="font-headings font-bold text-slate-900 text-sm mt-2.5 group-hover:text-slate-700 transition-colors">
                    {tool.name}
                  </h3>

                  <p className="font-body text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tool.seo.description}
                  </p>
                </div>

                <div
                  className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs font-semibold"
                  style={{ color: theme.primary }}
                >
                  <span>{isLive ? "Launch Tool" : "View Roadmap"}</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white space-y-3">
          <p className="font-headings font-bold text-slate-700 text-base">
            No tools matched &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="font-body text-xs text-slate-500 max-w-sm mx-auto">
            Try checking for typos or clear your search query to see all available tools.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="text-xs mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
