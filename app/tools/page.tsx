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
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-500/20">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hub Header */}
        <section className="bg-gradient-to-b from-blue-50/40 via-slate-50/60 to-white py-12 sm:py-16">
          <div className="max-w-container mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 border border-slate-200/80 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>✦ {allTools.length} Tools · 100% Client-Side In-Browser Execution</span>
            </div>

            <h1 className="font-headings text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              All {BRAND.name} Tools
            </h1>

            <p className="font-body text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              Every utility processes completely inside your local browser memory.
              Zero file uploads, zero watermarks, zero tracking cookies, zero paywalls.
            </p>
          </div>
        </section>

        {/* Categories Grid (Clean Soft-Tech Grid Layout) */}
        <section className="max-w-container mx-auto px-4 sm:px-6 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Browse by Category
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Explore specialized utility suites optimized for speed and complete data secrecy
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              {CATEGORY_LIST.length} Categories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORY_LIST.map((cat) => {
              const IconComp = CATEGORY_ICON_MAP[cat.id] || Wrench;
              const catTools = allTools.filter((t) => t.category === cat.id);
              const theme = getCategoryTheme(cat.id);

              return (
                <Link
                  key={cat.id}
                  href={`/tools/${cat.id}`}
                  className="group relative flex flex-col justify-between h-full min-h-[230px] p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-[0_16px_36px_-8px_var(--cat-glow)] hover:-translate-y-1 hover:border-[var(--cat-border)] transition-all duration-300 ease-out overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none motion-reduce:hover:transform-none"
                  style={{
                    '--cat-primary': theme.primary,
                    '--cat-border': theme.border,
                    '--cat-glow': theme.glow,
                  } as React.CSSProperties}
                >
                  {/* Background Soft Faint Watermark Icon (144px, clipped by overflow-hidden) */}
                  <div
                    className="absolute -right-3 -top-3 pointer-events-none opacity-[0.06] -rotate-12 transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-[0.10] group-hover:-rotate-6 group-hover:translate-x-1 group-hover:-translate-y-1 select-none"
                    style={{ color: theme.primary }}
                    aria-hidden="true"
                  >
                    <IconComp className="w-36 h-36" strokeWidth={1.25} />
                  </div>

                  <div className="space-y-4 relative z-10">
                    {/* Hero Icon 64x64 Tile */}
                    <div
                      className="w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${theme.tint} 0%, #FFFFFF 100%)`,
                        borderColor: theme.border,
                        color: theme.primary,
                      }}
                    >
                      <IconComp className="w-8 h-8 transition-transform duration-300 ease-out group-hover:scale-105" strokeWidth={1.75} aria-hidden="true" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-headings text-lg font-semibold text-slate-900 tracking-tight transition-colors duration-200 group-hover:text-blue-600">
                        {cat.name}
                      </h3>

                      <p className="font-body text-sm text-slate-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Tool Count Footer Row */}
                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <span
                      className="text-xs font-medium font-mono px-3 py-1 rounded-full border shadow-sm transition-all duration-200 group-hover:shadow-xs"
                      style={{
                        backgroundColor: theme.tint,
                        borderColor: theme.border,
                        color: theme.primary,
                      }}
                    >
                      {catTools.length > 0
                        ? `${catTools.length} ${catTools.length === 1 ? "tool" : "tools"}`
                        : "Upcoming Phase"}
                    </span>

                    <div
                      className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center transition-all duration-300 ease-out group-hover:bg-[var(--cat-primary)] group-hover:text-white shadow-sm group-hover:scale-110 group-hover:shadow-md shrink-0"
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" strokeWidth={2} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Interactive Directory Search & Live Tools */}
        <section className="max-w-container mx-auto px-4 sm:px-6 pt-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Search & Launch Tools
            </h2>
          </div>

          <React.Suspense
            fallback={
              <div className="p-8 text-center text-slate-400 font-body text-sm">
                Loading tools directory...
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
