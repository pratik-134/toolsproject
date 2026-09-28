import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { CATEGORY_LIST } from "@/lib/registry/categories";
import { getAllTools } from "@/lib/registry/tools";
import { getCategoryTheme } from "@/lib/category-theme";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
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

export const metadata: Metadata = {
  title: `Free Privacy-First Online Tools Hub | ${BRAND.name}`,
  description: BRAND.description,
};

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Image: ImageIcon,
  ShieldCheck: Lock,
  Cloud,
  QrCode,
  Video,
  Mic,
  Layers,
  Code2,
  Wrench,
  Calculator,
};

export default function ToolsHubPage() {
  const allTools = getAllTools();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] text-[#0F172A] selection:bg-blue-500/20">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hub Header */}
        <section className="bg-gradient-to-b from-blue-50/40 via-slate-50/60 to-white py-12 sm:py-16">
          <div className="max-w-container mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 border-0 px-3.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
              <span>✦ 111 tools · all running right in your browser</span>
            </div>

            <h1 className="font-headings text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              All {BRAND.name} Tools
            </h1>

            <p className="font-body text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              Every tool executes completely inside your browser memory.
              No uploads, no watermarks, no registration traps.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-container mx-auto px-4 sm:px-6 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900">
              Browse by Category
            </h2>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              11 Categories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORY_LIST.map((cat) => {
              const IconComp = ICON_MAP[cat.iconName] || Wrench;
              const catTools = allTools.filter((t) => t.category === cat.id);
              const theme = getCategoryTheme(cat.id);

              return (
                <Link
                  key={cat.id}
                  href={`/tools/${cat.id}`}
                  className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-slate-100/90 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:border-blue-400/60 hover:shadow-[0_10px_30px_-5px_rgba(37,99,235,0.12)] transition-all duration-300 ease-out overflow-hidden"
                  style={{ borderTop: `3px solid ${theme.primary}` }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="h-10 w-10 rounded-xl border-0 flex items-center justify-center transition-all shadow-2xs group-hover:scale-105"
                        style={{
                          backgroundColor: theme.tint,
                          color: theme.primary,
                        }}
                      >
                        <IconComp className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                      </div>
                      <span
                        className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border-0 shadow-2xs"
                        style={{
                          backgroundColor: theme.tint,
                          color: theme.primary,
                        }}
                      >
                        {cat.expectedToolCount} tools
                      </span>
                    </div>

                    <h3 className="font-headings text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>

                    <p className="font-body text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div
                    className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold"
                    style={{ color: theme.primary }}
                  >
                    <span>
                      {catTools.filter((t) => t.status === "live").length > 0
                        ? `${catTools.filter((t) => t.status === "live").length} Live Now`
                        : "Phase Pipeline"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={1.75} />
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
            <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900">
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
