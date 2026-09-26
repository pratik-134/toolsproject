"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TemplateCardPreview } from "@/components/templates/TemplateCardPreview";
import { TEMPLATES_LIST, TemplateCategory } from "@/components/templates/registry";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  "ats-safe": "ATS-Safe",
  "modern": "Modern",
  "professional": "Professional",
  "specialized": "Specialized",
};

const CATEGORIES: { key: TemplateCategory; label: string }[] = [
  { key: "all", label: `All Templates (${TEMPLATES_LIST.length})` },
  { key: "ats-safe", label: `ATS-Safe (${TEMPLATES_LIST.filter((t) => t.category === "ats-safe").length})` },
  { key: "modern", label: `Modern Sans (${TEMPLATES_LIST.filter((t) => t.category === "modern").length})` },
  { key: "professional", label: `Professional (${TEMPLATES_LIST.filter((t) => t.category === "professional").length})` },
  { key: "specialized", label: `Specialized / Tech (${TEMPLATES_LIST.filter((t) => t.category === "specialized").length})` },
];

export const LandingTemplatesSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("all");

  const filteredTemplates =
    selectedCategory === "all"
      ? TEMPLATES_LIST
      : TEMPLATES_LIST.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:justify-start -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`whitespace-nowrap shrink-0 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Template Cards (All 20 Templates) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((t) => (
          <div
            key={t.id}
            className="rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between text-left overflow-hidden"
          >
            <div>
              {/* Live Scaled A4 Template Box */}
              <div className="relative overflow-hidden bg-slate-50 border-b border-slate-100">
                {/* Top Floating Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                  <span className="bg-white/95 backdrop-blur-xs text-slate-800 px-2.5 py-0.5 rounded-md font-body text-[10px] uppercase tracking-[1px] font-bold border border-slate-200 shadow-2xs">
                    {CATEGORY_DISPLAY_MAP[t.category] || t.category}
                  </span>
                  <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold shadow-2xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-blue-400" />
                    ATS {t.atsScore}%
                  </span>
                </div>

                {/* Scaled Template Visual */}
                <div className="transition-transform duration-500 group-hover:scale-[1.02]">
                  <TemplateCardPreview templateId={t.id} />
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2.5 p-4 z-20">
                  <Link
                    href={`/editor?template=${t.id}`}
                    className="w-full max-w-[190px]"
                  >
                    <Button
                      size="sm"
                      className="w-full gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 text-xs shadow-md"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Use This Template
                    </Button>
                  </Link>
                  <span className="text-[11px] text-slate-300 font-medium">
                    100% Free • No Account Needed
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-headings text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {t.name}
                  </h3>
                  <span className="font-body text-xs text-blue-600 font-bold shrink-0 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                    100% Free
                  </span>
                </div>
                <p className="font-body text-small text-slate-600 mt-2 leading-relaxed">
                  {t.description}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="font-body text-xs text-slate-500 font-medium">
                Vector PDF • DOCX Word
              </span>
              <Link href={`/editor?template=${t.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white text-slate-800 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 rounded-lg text-xs font-bold h-8 px-3 gap-1.5 transition-colors"
                >
                  Customize <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
