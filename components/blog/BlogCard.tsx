"use client";

import React from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/blog/types";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";

export interface BlogCardProps {
  post: BlogPost;
  isFeatured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, isFeatured = false }) => {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (isFeatured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Gradient Banner / Visual Column */}
          <div
            className={`lg:col-span-5 bg-gradient-to-br ${
              post.coverGradient || "from-blue-600 to-indigo-600"
            } p-8 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden`}
          >
            {/* Cover Image Background */}
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-25 mix-blend-overlay pointer-events-none"
              />
            )}

            {/* Subtle decorative circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-white/20 backdrop-blur-md text-white border border-white/30">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Article
              </span>
            </div>

            <div className="relative z-10 my-6">
              <span className="text-white/80 font-mono text-xs uppercase tracking-wider block mb-2">
                {post.category}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-headings tracking-tight">
                {post.title}
              </h3>
            </div>

            <div className="relative z-10 flex items-center gap-4 text-xs font-medium text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed line-clamp-3 font-body">
                {post.excerpt}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-6">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm shrink-0">
                  {post.author.name.charAt(0)}
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {post.author.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {post.author.role}
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform shrink-0">
                <span className="hidden xs:inline">Read Full Guide</span>
                <span className="xs:hidden">Read</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Visual Header / Cover Banner */}
      <div
        className={`h-40 sm:h-44 bg-gradient-to-br ${
          post.coverGradient || "from-slate-700 to-slate-900"
        } p-5 flex flex-col justify-between relative overflow-hidden text-white`}
      >
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-30 mix-blend-overlay pointer-events-none"
          />
        )}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
            {post.category}
          </span>
          <span className="text-xs text-white/80 font-medium inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readingTime}
          </span>
        </div>

        <div className="relative z-10">
          <span className="text-xs text-white/90 font-medium inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2.5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-headings group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-body line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
              {post.author.name.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
              {post.author.name}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform shrink-0">
            <span>Read</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
