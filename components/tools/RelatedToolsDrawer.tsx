"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ToolMetadata } from "@/lib/registry/types";
import { getCategoryById } from "@/lib/registry/categories";
import { getToolUrl } from "@/lib/registry/tools";
import { CATEGORY_COLORS } from "@/lib/design-tokens";
import { Layers, ArrowRight, Grid, X, Sparkles, ChevronUp } from "lucide-react";

export interface RelatedToolsDrawerProps {
  currentCategory: string;
  relatedTools: ToolMetadata[];
}

export const RelatedToolsDrawer: React.FC<RelatedToolsDrawerProps> = ({
  currentCategory,
  relatedTools,
}) => {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const categoryDef = getCategoryById(currentCategory);
  const colorToken = CATEGORY_COLORS[categoryDef?.colorKey || "security"];

  if (relatedTools.length === 0) return null;

  return (
    <>
      {/* ── Desktop Sidebar Drawer (Visible on lg screens) ────────────────── */}
      <aside className="hidden lg:block w-72 shrink-0 space-y-4 font-body">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: colorToken.primary }}
              >
                <Layers className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Related {categoryDef?.shortName || "Category"} Tools
              </h3>
            </div>
            <Link
              href={`/tools/${currentCategory}`}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {relatedTools.slice(0, 6).map((tool) => (
              <Link
                key={tool.slug}
                href={getToolUrl(tool)}
                className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-xs"
              >
                <div className="truncate pr-2">
                  <p className="font-bold text-slate-800 group-hover:text-blue-600 truncate transition-colors">
                    {tool.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    100% Client-side
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Mobile Sticky Bottom Action Bar & Sheet (Visible on mobile/tablet) ──── */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 font-body">
        <button
          type="button"
          onClick={() => setIsMobileSheetOpen(true)}
          className="w-full bg-slate-900 text-white rounded-2xl p-3 shadow-xl border border-slate-700/80 flex items-center justify-between font-semibold text-xs transition-all active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <Grid className="h-4 w-4 text-blue-400" />
            <span>Switch Tool ({categoryDef?.shortName || "Category"})</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-blue-400 font-bold bg-slate-800 px-2.5 py-1 rounded-xl">
            <span>{relatedTools.length} Available</span>
            <ChevronUp className="h-3.5 w-3.5" />
          </span>
        </button>

        {/* Mobile Bottom Sheet Drawer */}
        {isMobileSheetOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end p-0 sm:p-4 animate-fade-in"
            onClick={() => setIsMobileSheetOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-5 border border-slate-200 shadow-2xl max-h-[80vh] overflow-y-auto space-y-4 animate-slide-up"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Related {categoryDef?.name || "Tools"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileSheetOpen(false)}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={getToolUrl(tool)}
                    onClick={() => setIsMobileSheetOpen(false)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{tool.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                        {tool.seo.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600 shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
