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
                  className="group relative flex flex-col justify-between h-full p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_35px_-5px_rgba(15,23,42,0.1)] transition-all duration-300 ease-out overflow-hidden focus:outline-none focus-visible:ring-2"
                >
                  {/* Background Soft Faint Watermark Icon */}
                  <div
                    className="absolute -right-3 -top-3 pointer-events-none opacity-[0.05] -rotate-12 transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-[0.08] group-hover:-rotate-6 select-none"
                    style={{ color: theme.primary }}
                    aria-hidden="true"
                  >
                    <IconComp className="h-28 w-28 sm:h-32 sm:w-32" strokeWidth={1.25} />
                  </div>

                  <div className="space-y-4 relative z-10">
                    {/* Hero Icon Tile */}
                    <div
                      className="h-13 w-13 sm:h-14 sm:w-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${theme.tint} 0%, #FFFFFF 100%)`,
                        borderColor: theme.border,
                        color: theme.primary,
                      }}
                    >
                      <IconComp className="h-6.5 w-6.5 sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden="true" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-headings text-lg font-bold text-slate-900 tracking-tight transition-colors duration-200 group-hover:text-blue-600">
                        {cat.name}
                      </h3>

                      <p className="font-body text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Tool Count Footer Row */}
                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <span
                      className="text-xs font-semibold font-mono px-3 py-1 rounded-full border shadow-2xs"
                      style={{
                        backgroundColor: theme.tint,
                        borderColor: theme.border,
                        color: theme.primary,
                      }}
                    >
                      {catTools.length} {catTools.length === 1 ? "tool" : "tools"}
                    </span>

                    <div
                      className="h-8.5 w-8.5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white shadow-2xs group-hover:scale-105"
                      aria-hidden="true"
                    >
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
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
