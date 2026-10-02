"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Clock, Sparkles, ArrowRight, X } from "lucide-react";
import { useToolsPreferenceStore } from "@/lib/store/use-tools-preference-store";
import { getToolBySlug, getToolUrl } from "@/lib/registry/tools";
import { getToolIcon } from "@/lib/tool-icons";

export function ToolsShelf() {
  const [mounted, setMounted] = useState(false);
  const { recentSlugs, favoriteSlugs, toggleFavorite, clearRecents } = useToolsPreferenceStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const favoriteTools = favoriteSlugs
    .map((slug) => getToolBySlug(slug))
    .filter(Boolean);

  const recentTools = recentSlugs
    .map((slug) => getToolBySlug(slug))
    .filter(Boolean);

  if (favoriteTools.length === 0 && recentTools.length === 0) {
    return null;
  }

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 pt-6 pb-2">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Favorites Section */}
        {favoriteTools.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Pinned Favorites ({favoriteTools.length})
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {favoriteTools.map((tool) => {
                if (!tool) return null;
                const IconComponent = getToolIcon(tool);
                const url = getToolUrl(tool);

                return (
                  <div
                    key={tool.slug}
                    className="group relative flex-shrink-0 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 transition-all shadow-sm"
                  >
                    <Link
                      href={url}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 whitespace-nowrap"
                    >
                      <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{tool.name}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(tool.slug)}
                      className="text-amber-400 hover:text-slate-400 transition-colors ml-1"
                      title="Unpin from favorites"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently Used Section */}
        {recentTools.length > 0 && (
          <div className={favoriteTools.length > 0 ? "pt-3 border-t border-slate-200/60 dark:border-slate-800/60" : ""}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Recently Visited
                </h3>
              </div>
              <button
                type="button"
                onClick={clearRecents}
                className="text-xs text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 font-medium"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {recentTools.map((tool) => {
                if (!tool) return null;
                const IconComponent = getToolIcon(tool);
                const url = getToolUrl(tool);
                const isFav = favoriteSlugs.includes(tool.slug);

                return (
                  <div
                    key={tool.slug}
                    className="group relative flex-shrink-0 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 transition-all shadow-sm"
                  >
                    <Link
                      href={url}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 whitespace-nowrap"
                    >
                      <IconComponent className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-500" />
                      <span>{tool.name}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(tool.slug)}
                      className="text-slate-300 hover:text-amber-400 transition-colors ml-1"
                      title={isFav ? "Unpin favorite" : "Pin to favorites"}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFav ? "fill-amber-400 text-amber-400" : "text-slate-400"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
