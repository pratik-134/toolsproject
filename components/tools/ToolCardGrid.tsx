"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ToolDefinition } from "@/lib/registry/types";
import { CATEGORY_LIST, getCategoryById } from "@/lib/registry/categories";
import { getToolUrl } from "@/lib/registry/tools";
import { CATEGORY_COLORS, CategoryColorToken } from "@/lib/design-tokens";
import {
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Cloud,
  QrCode,
  Video,
  Mic,
  Layers,
  Code2,
  Wrench,
  Calculator,
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Image: ImageIcon,
  ShieldCheck,
  Cloud,
  QrCode,
  Video,
  Mic,
  Layers,
  Code2,
  Wrench,
  Calculator,
};

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

  return (
    <div className="w-full space-y-6 font-body">
      {(title || subtitle || showSearchBar) && (
        <div className="space-y-4">
          {title && (
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-sm text-slate-600 max-w-2xl">{subtitle}</p>}
            </div>
          )}

          {/* Search Filter input */}
          {showSearchBar && (
            <div className="relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter 111+ utilities by name or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
            </div>
          )}
        </div>
      )}

      {/* Category Pills Filter */}
      {showCategoryFilter && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All Tools ({tools.length})
          </button>
          {CATEGORY_LIST.map((cat) => {
            const count = tools.filter((t) => t.category === cat.id).length;
            if (count === 0) return null;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>{cat.shortName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Tools */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            const categoryDef = getCategoryById(tool.category);
            const colorToken: CategoryColorToken =
              CATEGORY_COLORS[categoryDef?.colorKey || "security"];
            const IconComponent =
              (categoryDef && ICON_MAP[categoryDef.iconName]) || FileText;

            return (
              <Link
                key={tool.slug}
                href={getToolUrl(tool)}
                className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-500 hover:shadow-lg transition-all duration-200 ease-in-out"
              >
                <div>
                  {/* Category Accent Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: colorToken.primary }}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: colorToken.tint,
                          borderColor: colorToken.border,
                          color: colorToken.primary,
                        }}
                      >
                        {categoryDef?.shortName || tool.category}
                      </span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Tool Action Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {tool.name}
                  </h3>

                  {/* Tool Description */}
                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tool.seo.description}
                  </p>
                </div>

                {/* Card Footer Overlay Action Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 group-hover:text-blue-600">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-500" />
                    <span>100% Client-Side</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 text-white px-2.5 py-1 text-[11px] font-bold opacity-90 group-hover:opacity-100 transition-opacity">
                    Open Utility
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <p className="text-sm font-semibold">No tools found matching your filter.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="text-xs text-blue-600 hover:underline font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
