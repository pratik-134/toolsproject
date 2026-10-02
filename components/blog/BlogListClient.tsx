"use client";

import React, { useState, useMemo } from "react";
import { BlogPost } from "@/lib/blog/types";
import { BlogCard } from "./BlogCard";
import { Search, Sparkles, BookOpen } from "lucide-react";

export interface BlogListClientProps {
  initialPosts: BlogPost[];
  categories: string[];
}

export const BlogListClient: React.FC<BlogListClientProps> = ({
  initialPosts,
  categories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.author.name.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    if (selectedCategory !== "All" || searchQuery.trim()) return null;
    return initialPosts.find((p) => p.featured) || initialPosts[0];
  }, [initialPosts, selectedCategory, searchQuery]);

  const gridPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter((p) => p.slug !== featuredPost.slug);
  }, [filteredPosts, featuredPost]);

  return (
    <div className="space-y-10">
      {/* Category Pills & Search Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides & articles..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Featured Spotlight (only shown on 'All' without active search filter) */}
      {featuredPost && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Spotlight Guide</span>
          </div>
          <BlogCard post={featuredPost} isFeatured />
        </div>
      )}

      {/* Articles Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-headings font-bold text-slate-900 dark:text-slate-100 text-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>{selectedCategory === "All" ? "Latest Articles & Guides" : `${selectedCategory} Articles`}</span>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {gridPosts.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No articles found matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search terms or browse another category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-2 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
