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
import { getAllTools, getToolsByCategory } from "@/lib/registry/tools";

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
      className="scroll-mt-20 py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50/70 to-white relative"
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 border border-slate-200/80 px-4 py-1.5 font-body text-xs font-semibold text-slate-700 shadow-2xs mb-4">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>✦ Privacy Utility Suite · {totalCount} Tools Running in Browser</span>
        </div>

        <h2 className="font-headings text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          One platform. <span className="font-mono text-blue-600">{totalCount}</span> free tools.
        </h2>

        <p className="font-body text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3.5 leading-relaxed">
          Runs <span className="font-mono font-bold text-slate-800">100%</span> inside your browser sandbox. Zero file uploads, zero accounts required, and zero usage limits.
        </p>

        <div className="max-w-xl mx-auto mt-8 mb-10 sm:mb-12 relative z-30">
          <ToolSearchBar
            size="large"
            placeholder={`Search ${totalCount} tools... (e.g. PDF merge, image compress, BMI calculator)`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 text-left">
          {categoryCards.map((card) => {
            const color = CATEGORY_COLORS[card.key] || CATEGORY_COLORS.utility;
            const Icon = card.icon;

            return (
              <Link
                key={card.key}
                href={`/tools/${card.categoryId}`}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_35px_-5px_rgba(15,23,42,0.1)] transition-all duration-300 ease-out overflow-hidden"
              >
                {/* Background Watermark */}
                <div
                  className="absolute -right-6 -top-6 pointer-events-none opacity-[0.06] -rotate-12 transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-[0.09] group-hover:-rotate-6 select-none"
                  style={{ color: color.primary }}
                  aria-hidden="true"
                >
                  <Icon className="h-36 w-36" strokeWidth={1.25} />
                </div>

                <div className="relative z-10 space-y-4">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs group-hover:scale-105 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${color.tint} 0%, #FFFFFF 100%)`,
                      borderColor: color.border,
                      color: color.primary,
                    }}
                  >
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>

                  <div>
                    <h3 className="font-headings text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {card.name}
                    </h3>
                    <p className="font-body text-xs text-slate-500 leading-relaxed mt-1.5 line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
                  <span
                    className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                    style={{ backgroundColor: color.tint, borderColor: color.border, color: color.primary }}
                  >
                    {card.count}
                  </span>
                  <div
                    className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white"
                  >
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 sm:mt-14 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 sm:px-7 py-3 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs text-xs sm:text-sm font-medium text-slate-600 font-body">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-800"><strong className="font-mono font-bold">{totalCount}</strong> Tools Live</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-slate-800"><strong className="font-mono font-bold">0 Bytes</strong> Uploaded</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-slate-800"><strong className="font-mono font-bold">100%</strong> Free Forever</span>
          </span>
        </div>

        <div className="mt-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Browse Complete <span className="font-mono font-bold">{totalCount}</span> Tools Directory</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </section>
  );
};
