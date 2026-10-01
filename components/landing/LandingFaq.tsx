"use client";

import React, { useState } from "react";
import { HelpCircle, FileText, Wrench } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

import { RESUME_FAQS, TOOLS_FAQS, type FaqItem } from "./faq-data";
export type { FaqItem };

export const LandingFaq: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"resume" | "tools">("resume");

  const currentFaqs = activeTab === "resume" ? RESUME_FAQS : TOOLS_FAQS;

  return (
    <div className="space-y-10">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border-0 shadow-2xs font-body">
          <button
            type="button"
            onClick={() => setActiveTab("resume")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "resume"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs border-0"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <FileText className={`h-4 w-4 ${activeTab === "resume" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
            <span>Resume Builder ({RESUME_FAQS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tools")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "tools"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs border-0"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Wrench className={`h-4 w-4 ${activeTab === "tools" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
            <span>In-Browser Tools ({TOOLS_FAQS.length})</span>
          </button>
        </div>
      </div>

      {/* FAQ Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {currentFaqs.map((faq, idx) => (
          <Reveal key={`${activeTab}-${faq.num}`} variant="fade-up" delay={idx * 40}>
            <div className="rounded-xl border border-slate-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-blue-200/60 dark:hover:border-blue-500/40 transition-all space-y-2.5 h-full">
              <h3 className="font-headings text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-start gap-2.5">
                <span
                  className={`font-headings text-sm shrink-0 mt-0.5 font-bold ${
                    activeTab === "resume" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {faq.num}
                </span>
                <span>{faq.q}</span>
              </h3>
              <p className="font-body text-small text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};
