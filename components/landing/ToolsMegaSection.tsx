"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  Layers,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ToolSearchBar } from "@/components/tools/ToolSearchBar";
import { CATEGORY_COLORS } from "@/lib/design-tokens";
import { getAllTools, getToolsByCategory, TOOLS_COUNT_LABEL, TOOLS_COUNT_DISPLAY } from "@/lib/registry/tools";

export const ToolsMegaSection: React.FC = () => {
  const allTools = getAllTools();
  const totalCount = allTools.length;

  const getCatCount = (catId: string) => {
    return getToolsByCategory(catId as any).length;
  };

  const categoryCards = [
    {
      key: "pdf" as const,
      name: "PDF Suite",
      categoryId: "document-pdf",
      count: `${getCatCount("document-pdf")} tools`,
      icon: FileText,
      description: "Merge, split, compress, flatten, and convert PDFs 100% inside your browser sandbox.",
      featured: "PDF Merger",
    },
    {
      key: "image" as const,
      name: "Image & Media",
      categoryId: "image",
      count: `${getCatCount("image")} tools`,
      icon: ImageIcon,
      description: "Convert, compress, crop, remove EXIF metadata, and resize with zero server uploads.",
      featured: "Batch Compressor",
    },
    {
      key: "builders" as const,
      name: "Document & Builders",
      categoryId: "builders",
      count: `${getCatCount("builders")} tools`,
      icon: Layers,
      description: "ATS resume builder, invoices, cover letters, and markdown tools with live vector export.",
      featured: "ATS Resume Builder",
    },
    {
      key: "security" as const,
      name: "Security & Privacy",
      categoryId: "security",
      count: `${getCatCount("security")} tools`,
      icon: ShieldCheck,
      description: "AES-256 client-side file locker, metadata scrubbing, steganography, and privacy verification.",
      featured: "File Locker (AES-256)",
    },
    {
      key: "calculators" as const,
      name: "Calculators & Dev",
      categoryId: "calculators",
      count: `${getCatCount("calculators") + getCatCount("developer")} tools`,
      icon: Calculator,
      description: "Financial and health calculators, JSON formatter, regex tester, and daily unit converters.",
      featured: "JSON Formatter",
    },
  ];

  return (
    <section
      id="tools-suite"
      className="scroll-mt-20 py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50/70 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 relative"
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-800 px-4 py-1.5 font-body text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 shadow-2xs mb-4">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Privacy Utility Suite · {TOOLS_COUNT_LABEL} Running in Browser</span>
        </div>

        <h2 className="font-headings text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          One platform. <span className="font-mono text-blue-600 dark:text-blue-400">{TOOLS_COUNT_DISPLAY}</span> free tools.
        </h2>

        <p className="font-body text-slate-700 dark:text-slate-200 text-sm sm:text-base max-w-2xl mx-auto mt-3.5 leading-relaxed font-medium">
          Runs <span className="font-mono font-bold text-slate-900 dark:text-white">100%</span> inside your browser sandbox. Zero file uploads, zero accounts required, and zero usage limits.
        </p>

        <div className="max-w-xl mx-auto mt-8 mb-10 sm:mb-12 relative z-30">
          <ToolSearchBar
            size="large"
            placeholder={`Search ${TOOLS_COUNT_LABEL}... (e.g. PDF merge, image compress, BMI calculator)`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 text-left">
          {categoryCards.map((card) => {
            const color = CATEGORY_COLORS[card.key] || CATEGORY_COLORS.utility;
            const Icon = card.icon;

            return (
              <Link
                key={card.key}
                href={`/tools/${card.categoryId}`}
                className="group relative flex flex-col h-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_28px_-4px_rgba(15,23,42,0.14)] dark:shadow-none dark:hover:shadow-none overflow-hidden transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--cat-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none motion-reduce:hover:transform-none"
                style={{
                  "--cat-primary": color.primary,
                  "--cat-border": color.border,
                  "--cat-tint": color.tint,
                  "--cat-glow": color.glow,
                } as React.CSSProperties}
              >
                {/* Tinted header band with watermark */}
                <div
                  className="relative px-5 pt-5 pb-4 overflow-hidden bg-[var(--cat-tint)] dark:bg-slate-800/60 dark:border-b dark:border-slate-800 transition-colors"
                >
                  <div
                    className="absolute -right-4 -top-4 pointer-events-none opacity-[0.14] dark:opacity-[0.08] -rotate-12 transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-[0.20] group-hover:-rotate-6 select-none"
                    style={{ color: color.primary }}
                    aria-hidden="true"
                  >
                    <Icon className="w-28 h-28" strokeWidth={1.25} />
                  </div>
                  <div
                    className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs transition-all duration-300 group-hover:scale-105 bg-white/80 dark:bg-slate-900/90 border-[var(--cat-border)] dark:border-slate-700 text-[var(--cat-primary)] dark:text-white"
                  >
                    <Icon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 pt-4 pb-3 flex flex-col flex-1 gap-2">
                  <h3 className="font-headings text-base sm:text-[17px] font-bold text-slate-900 dark:text-white leading-snug transition-colors duration-200 group-hover:text-[var(--cat-primary)]">
                    {card.name}
                  </h3>
                  <p className="font-body text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-5 pb-4 pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full border bg-[var(--cat-tint)] dark:bg-slate-800 border-[var(--cat-border)] dark:border-slate-700 text-[var(--cat-primary)] dark:text-slate-200"
                  >
                    {card.count}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-250 ease-out shadow-sm"
                    style={{ backgroundColor: color.primary }}
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

        <div className="mt-12 sm:mt-14 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 sm:px-7 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 font-body">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-900 dark:text-white"><strong className="font-mono font-bold">{totalCount}</strong> Tools Live</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-slate-800 dark:text-slate-200"><strong className="font-mono font-bold">0 Bytes</strong> Uploaded</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-slate-800 dark:text-slate-200"><strong className="font-mono font-bold">100%</strong> Free Forever</span>
          </span>
        </div>

        <div className="mt-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all"
          >
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Browse Complete <span className="font-mono font-bold">{totalCount}</span> Tools Directory</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          </Link>
        </div>
      </div>
    </section>
  );
};
