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

interface CategoryCardItem {
  key: keyof typeof CATEGORY_COLORS;
  name: string;
  categoryId: string;
  count: string;
  icon: React.ElementType;
  description: string;
  featured: string;
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    key: "pdf",
    name: "PDF Suite",
    categoryId: "document-pdf",
    count: "28 tools",
    icon: FileText,
    description: "Merge, split, compress, flatten, and convert PDFs 100% inside your browser sandbox.",
    featured: "PDF Merger",
  },
  {
    key: "image",
    name: "Image & Media",
    categoryId: "image",
    count: "18 tools",
    icon: ImageIcon,
    description: "Convert, compress, crop, remove EXIF metadata, and resize with zero server uploads.",
    featured: "Batch Compressor",
  },
  {
    key: "document",
    name: "Document & Builders",
    categoryId: "builders",
    count: "21 tools",
    icon: Layers,
    description: "ATS resume builder, invoices, cover letters, and markdown tools with live vector export.",
    featured: "ATS Resume Builder",
  },
  {
    key: "security",
    name: "Security & Privacy",
    categoryId: "security",
    count: "8 tools",
    icon: ShieldCheck,
    description: "AES-256 client-side file locker, metadata scrubbing, steganography, and privacy verification.",
    featured: "File Locker (AES-256)",
  },
  {
    key: "utility",
    name: "Calculators & Dev",
    categoryId: "calculators",
    count: "45 tools",
    icon: Calculator,
    description: "Financial and health calculators, JSON formatter, regex tester, and daily unit converters.",
    featured: "JSON Formatter",
  },
];

export const ToolsMegaSection: React.FC = () => {
  return (
    <section
      id="tools-suite"
      className="scroll-mt-20 py-14 sm:py-20 bg-slate-50/70 border-y border-slate-200/80 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* 3a. Section Header */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 font-body text-xs font-semibold text-emerald-800 shadow-2xs mb-4">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span><span className="font-mono">111</span> Live In-Browser Tools</span>
        </div>

        <h2 className="font-headings text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          One platform. <span className="font-mono">111+</span> free tools.
        </h2>

        <p className="font-body text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
          Runs <span className="font-mono">100%</span> inside your browser sandbox. Zero file uploads, zero accounts required, and zero usage limits.
        </p>

        {/* 3b. Prominent Centered Search Bar */}
        <div className="max-w-2xl mx-auto mt-8 mb-10 sm:mb-12">
          <ToolSearchBar
            size="large"
            placeholder="Search 111+ tools... (e.g. PDF merge, image compress, BMI calculator)"
          />
        </div>

        {/* 3c. 5 Jewel-Toned Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 text-left">
          {CATEGORY_CARDS.map((card) => {
            const color = CATEGORY_COLORS[card.key];
            const Icon = card.icon;

            return (
              <Link
                key={card.key}
                href={`/tools/${card.categoryId}`}
                className="group relative flex flex-col justify-between p-5 rounded-[12px] bg-white border border-slate-200 hover:border-blue-500/50 hover:shadow-md transition-all duration-200 ease-in-out"
                style={{
                  borderTopWidth: "4px",
                  borderTopColor: color.primary,
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: color.tint,
                        borderColor: color.border,
                        color: color.primary,
                      }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        CLIENT-SIDE
                      </span>
                      <span
                        className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-[6px] border"
                        style={{
                          backgroundColor: color.tint,
                          borderColor: color.border,
                          color: color.primary,
                        }}
                      >
                        {card.count}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-headings text-base font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {card.name}
                  </h3>

                  <p className="font-body text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>

                <div
                  className="pt-3.5 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold"
                  style={{ color: color.primary }}
                >
                  <span className="truncate pr-1">Featured: {card.featured}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 3c Stats Row */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-500 font-body">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <strong className="font-semibold text-slate-800"><span className="font-mono">111</span> Tools</strong> Live
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <strong className="font-semibold text-slate-800"><span className="font-mono">0 Bytes</span></strong> Uploaded to Servers
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <strong className="font-semibold text-slate-800"><span className="font-mono">100%</span> Free</strong> Forever
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <strong className="font-semibold text-slate-800"><span className="font-mono">5</span> Categories</strong>
          </span>
        </div>

        {/* Directory Link */}
        <div className="mt-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Browse Complete <span className="font-mono">111</span> In-Browser Tools Directory</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </section>
  );
};
