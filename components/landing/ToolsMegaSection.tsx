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
      className="scroll-mt-20 py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50/70 to-white relative"
    >
      {/* Subtle top & bottom boundary lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent pointer-events-none" />

      {/* Consistent max-w-container matching Hero and other landing sections */}
      <div className="max-w-container mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* 3a. Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 font-body text-xs font-medium text-slate-600 shadow-2xs mb-4">
          <span>✦ Privacy utility suite · 111 tools running right in your browser</span>
        </div>

        {/* Section Heading */}
        <h2 className="font-headings text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          One platform. <span className="font-mono text-blue-600">111+</span> free tools.
        </h2>

        {/* Section Subtitle */}
        <p className="font-body text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3.5 leading-relaxed">
          Runs <span className="font-mono font-medium text-slate-800">100%</span> inside your browser sandbox. Zero file uploads, zero accounts required, and zero usage limits.
        </p>

        {/* 3b. Suite Search Bar */}
        <div className="max-w-xl mx-auto mt-8 mb-10 sm:mb-12 relative z-30">
          <ToolSearchBar
            size="large"
            placeholder="Search 111+ tools... (e.g. PDF merge, image compress, BMI calculator)"
          />
        </div>

        {/* 3c. 5 Spacious, Elegant Category Suite Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 text-left">
          {CATEGORY_CARDS.map((card) => {
            const color = CATEGORY_COLORS[card.key];
            const Icon = card.icon;

            return (
              <Link
                key={card.key}
                href={`/tools/${card.categoryId}`}
                className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400/60 hover:shadow-lg transition-all duration-300 ease-out"
              >
                <div>
                  {/* Card Header Row: Icon + Count Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: color.tint,
                        borderColor: color.border,
                        color: color.primary,
                      }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>

                    <span
                      className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border shadow-2xs"
                      style={{
                        backgroundColor: color.tint,
                        borderColor: color.border,
                        color: color.primary,
                      }}
                    >
                      {card.count}
                    </span>
                  </div>

                  {/* Card Title with Animated Arrow */}
                  <h3 className="font-headings text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-4 flex items-center justify-between">
                    <span>{card.name}</span>
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600 shrink-0 ml-1" />
                  </h3>

                  {/* Description */}
                  <p className="font-body text-xs sm:text-[13px] text-slate-500 leading-relaxed mt-2 line-clamp-3">
                    {card.description}
                  </p>
                </div>

                {/* Card Footer: Featured Tool + Micro Badge */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="truncate pr-1 text-slate-500">
                    Featured: <strong className="text-slate-800 font-semibold">{card.featured}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-full shrink-0">
                    Runs locally
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 3d. Modern Floating Metrics Strip */}
        <div className="mt-12 sm:mt-14 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-5 sm:px-7 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs sm:text-sm font-medium text-slate-600 font-body">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-800"><strong className="font-mono font-bold">111</strong> Tools Live</span>
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
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-slate-800"><strong className="font-mono font-bold">5</strong> Core Suites</span>
          </span>
        </div>

        {/* Directory Link */}
        <div className="mt-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Browse Complete <span className="font-mono font-bold">111</span> In-Browser Tools Directory</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </section>
  );
};
