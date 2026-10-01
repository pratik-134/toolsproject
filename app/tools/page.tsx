import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { CATEGORY_LIST } from "@/lib/registry/categories";
import { getAllTools } from "@/lib/registry/tools";
import { getCategoryTheme } from "@/lib/category-theme";
import { CATEGORY_ICON_MAP } from "@/lib/tool-icons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";
import { ArrowRight, Sparkles, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: `Free Privacy-First Online Tools Hub | ${BRAND.name}`,
  description: BRAND.description,
};

export default function ToolsHubPage() {
  const allTools = getAllTools();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 selection:bg-blue-500/20">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hub Header */}
        <section className="bg-gradient-to-b from-blue-50/50 via-slate-50/40 to-[#F8FAFC] dark:from-slate-900/60 dark:via-slate-950/70 dark:to-slate-950 py-12 sm:py-16 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="max-w-container mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-4 py-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{allTools.length} Tools · 100% In-Browser · Zero Uploads</span>
            </div>

            <h1 className="font-headings text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              All {BRAND.name} Tools
            </h1>

            <p className="font-body text-slate-700 dark:text-slate-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
              Every utility runs inside your browser. Zero file uploads, zero
              watermarks, zero paywalls.
            </p>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="max-w-container mx-auto px-4 sm:px-6 pt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Browse by Category
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium mt-0.5">
                Specialized suites built for speed and complete data privacy
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-3 py-1 rounded-full shadow-sm">
              {CATEGORY_LIST.length} categories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORY_LIST.map((cat) => {
              const IconComp = CATEGORY_ICON_MAP[cat.id] || Wrench;
              const catTools = allTools.filter((t) => t.category === cat.id);
              const theme = getCategoryTheme(cat.id);
              const toolCount = catTools.length;

              return (
                <Link
                  key={cat.id}
                  href={`/tools/${cat.id}`}
                  className="group relative flex flex-col h-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_28px_-4px_rgba(15,23,42,0.14)] dark:shadow-none dark:hover:shadow-none overflow-hidden transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--cat-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none motion-reduce:hover:transform-none"
                  style={{
                    "--cat-primary": theme.primary,
                    "--cat-border": theme.border,
                    "--cat-glow": theme.glow,
                  } as React.CSSProperties}
                >
                  {/* Tinted header band */}
                  <div
                    className="relative px-6 pt-6 pb-5 overflow-hidden"
                    style={{ backgroundColor: theme.tint }}
                  >
                    {/* Watermark */}
                    <div
                      className="absolute -right-5 -top-5 pointer-events-none opacity-[0.13] -rotate-12 transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-[0.20] group-hover:-rotate-6 select-none"
                      style={{ color: theme.primary }}
                      aria-hidden="true"
                    >
                      <IconComp className="w-32 h-32" strokeWidth={1.25} />
                    </div>

                    {/* Icon tile */}
                    <div
                      className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.80)",
                        borderColor: theme.border,
                        color: theme.primary,
                      }}
                    >
                      <IconComp className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 pt-4 pb-3 flex flex-col flex-1 gap-2">
                    <h3 className="font-headings text-lg font-bold text-slate-900 dark:text-white leading-snug transition-colors duration-200 group-hover:text-[var(--cat-primary)]">
                      {cat.name}
                    </h3>
                    <p className="font-body text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pb-5 pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full border"
                      style={{
                        backgroundColor: theme.tint,
                        borderColor: theme.border,
                        color: theme.primary,
                      }}
                    >
                      {toolCount > 0
                        ? `${toolCount} ${toolCount === 1 ? "tool" : "tools"}`
                        : "Upcoming"}
                    </span>

                    {/* Slide-in CTA pill */}
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out shadow-sm"
                      style={{ backgroundColor: theme.primary }}
                      aria-hidden="true"
                    >
                      Explore
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Search & Tools Grid */}
        <section className="max-w-container mx-auto px-4 sm:px-6 pt-14">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Search &amp; Launch Tools
              </h2>
            </div>
          </div>

          <React.Suspense
            fallback={
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-body text-sm">
                Loading tools directory…
              </div>
            }
          >
            <ToolsDirectoryClient tools={allTools} />
          </React.Suspense>
        </section>
      </main>

      <Footer />
    </div>
  );
}
