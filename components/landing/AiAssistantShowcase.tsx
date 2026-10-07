"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, Zap, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BulletExample {
  role: string;
  before: string;
  after: string;
  atsDelta: string;
  verbs: string[];
}

const EXAMPLES: BulletExample[] = [
  {
    role: "Software Engineer",
    before: "Worked on website backend, fixed bugs, and wrote unit tests with the team.",
    after: "Architected 14 resilient backend microservices with Next.js & PostgreSQL, reducing P99 latency by 42% and raising unit test coverage to 94%.",
    atsDelta: "+48% ATS Match",
    verbs: ["Architected", "Reduced", "Raised"],
  },
  {
    role: "Product Manager",
    before: "Helped manage product roadmaps and talked to customers about new features.",
    after: "Spearheaded end-to-end product roadmap for B2B analytics platform; conducted 60+ user interviews to launch automated reporting, driving $1.2M in net-new ARR.",
    atsDelta: "+54% ATS Match",
    verbs: ["Spearheaded", "Conducted", "Drove"],
  },
  {
    role: "Marketing Manager",
    before: "Ran email campaigns and posted updates to social media channels.",
    after: "Orchestrated multi-channel lifecycle email campaigns across 350k subscribers, elevating open rates by 28% and generating 1,400 qualified sales leads in Q3.",
    atsDelta: "+41% ATS Match",
    verbs: ["Orchestrated", "Elevated", "Generated"],
  },
];

export const AiAssistantShowcase: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = EXAMPLES[activeIdx] ?? EXAMPLES[0]!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
      {/* Left Column: Context & Value */}
      <div className="lg:col-span-5 space-y-4">
        <h3 className="font-headings text-xl sm:text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white leading-tight">
          Turn passive task lists into quantifiable career wins.
        </h3>

        <p className="font-body text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mt-2 font-normal">
          Recruiters scan for strong action verbs and measurable business results.
          Our integrated AI assistant refines your raw draft into authoritative,
          bulletproof statements—without inventing fake credentials or hallucinating data.
        </p>

        {/* Feature Checkpoints */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 text-small text-slate-800 dark:text-slate-200 font-medium">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span>Power action verbs calibrated for executive and tech roles</span>
          </div>
          <div className="flex items-center gap-3 text-small text-slate-800 dark:text-slate-200 font-medium">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span>Framework prompts that guide you to quantify real metrics (% and $)</span>
          </div>
          <div className="flex items-center gap-3 text-small text-slate-800 dark:text-slate-200 font-medium">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span>Context-aware tailoring for targeted job descriptions</span>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/editor" className="w-full sm:w-auto inline-block">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-sm font-bold gap-2 shadow-xs transition-all">
              Try AI Bullet Enhancer Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Column: Interactive Before/After Transformation Card */}
      <div className="lg:col-span-7 relative">
        {/* Subtle Flowing Lines connecting left column to right AI panel */}
        <svg
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-24 h-48 text-blue-400/30 pointer-events-none hidden lg:block z-0"
          viewBox="0 0 80 160"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0,20 C40,20 40,80 80,80"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path
            d="M0,80 L80,80"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M0,140 C40,140 40,80 80,80"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <circle cx="80" cy="80" r="3" fill="#2563EB" />
        </svg>

        <div className="rounded-2xl border border-blue-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-xl dark:shadow-none p-5 sm:p-7 space-y-6 relative overflow-hidden z-10">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

          {/* Header & Role Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                <Wand2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-headings text-sm font-bold text-slate-900 dark:text-white">
                  Live Bullet Transformation
                </h4>
                <p className="font-body text-[11px] text-slate-500 dark:text-slate-400">
                  Select a role to see real before vs. after optimizations
                </p>
              </div>
            </div>

            {/* Role Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex.role}
                  onClick={() => setActiveIdx(i)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeIdx === i
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {ex.role}
                </button>
              ))}
            </div>
          </div>

          {/* Before & After Cards */}
          <div className="space-y-4">
            {/* Before Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 relative text-left">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Original User Draft (Passive & Vague)
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Score: 48/100
                </span>
              </div>
              <p className="font-body text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                "{current.before}"
              </p>
            </div>

            {/* AI Arrow Indicator */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs">
                <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                <span>AI Enhancement Applied • {current.atsDelta}</span>
              </div>
            </div>

            {/* After Box */}
            <div className="rounded-xl border-2 border-blue-500/40 dark:border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/30 p-4 relative text-left shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  Optimized for ATS & Hiring Managers
                </span>
                <span className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  Score: 98/100
                </span>
              </div>
              <p className="font-body text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                "{current.after}"
              </p>

              {/* Action Verbs Highlight Bar */}
              <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-900/60 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Power Verbs Used:
                </span>
                {current.verbs.map((verb) => (
                  <span
                    key={verb}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-2xs"
                  >
                    {verb}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
