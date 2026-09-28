"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Download,
  FileText,
  Wrench,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const HeroMockupPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"resume" | "tools">("resume");

  return (
    <div className="relative w-full">
      {/* Luminous Ambient Backdrop Glow */}
      <div className="pointer-events-none absolute -inset-4 sm:-inset-8 rounded-3xl bg-gradient-to-tr from-blue-600/20 via-sky-400/15 to-emerald-400/20 blur-3xl -z-10 animate-pulse duration-1000" />

      {/* Floating Badge Top-Right: ATS Score */}
      <div className="absolute -top-4 sm:-top-5 -right-2 sm:-right-4 z-30 hidden xs:block transform hover:scale-105 transition-transform">
        <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 px-3.5 py-2 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.1)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span>ATS Score</span>
              <span className="font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">98/100</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500">Greenhouse & Workday Ready</p>
          </div>
        </div>
      </div>

      {/* Floating Badge Bottom-Left: Privacy Guarantee */}
      <div className="absolute -bottom-4 sm:-bottom-5 -left-2 sm:-left-4 z-30 hidden xs:block transform hover:scale-105 transition-transform">
        <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 px-3.5 py-2 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.1)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span>100% Client-Side</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-medium text-slate-500">Zero Server Storage • Instant PDF</p>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(226,232,240,0.8)]">
        {/* Window Chrome Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-3 py-2 bg-slate-50/90 rounded-t-xl gap-2">
          {/* Traffic Lights */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>

          {/* Dynamic Interactive Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("resume")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === "resume"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <span>ATS Builder</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === "tools"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Wrench className="h-3.5 w-3.5 text-blue-600" />
              <span>111+ Tools</span>
            </button>
          </div>

          {/* URL Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-white px-2.5 py-0.5 text-[11px] font-mono font-medium text-slate-600 border border-slate-200/80 shadow-2xs">
            <span className="text-slate-400">https://</span>
            <span className="text-slate-800 font-semibold">cleartrix.com/{activeTab}</span>
          </div>
        </div>

        {/* Dynamic Card Body Content */}
        {activeTab === "resume" ? (
          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 bg-slate-50/60 rounded-b-xl transition-all">
            {/* Form Inputs Controls (Desktop/Tablet) */}
            <div className="hidden sm:block sm:col-span-5 space-y-2 text-left text-xs">
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-2.5 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Live Form Editor
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Auto-Saved
                  </span>
                </div>
                <p className="font-headings text-sm text-slate-900 font-bold">
                  Staff Software Engineer
                </p>
                <p className="text-[11px] text-slate-500">
                  Stripe • San Francisco, CA
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Impact Bullets
                </span>
                <p className="text-[11px] text-slate-800 leading-snug">
                  • Reduced P99 latency by <span className="font-bold text-blue-600">42%</span> via Redis indexing.
                </p>
                <p className="text-[11px] text-slate-800 leading-snug">
                  • Scaled microservices handling <span className="font-bold text-blue-600">65k req/sec</span>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Verified Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {["TypeScript", "Next.js 15", "PostgreSQL", "Tailwind"].map((sk) => (
                    <span key={sk} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[10px]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* A4 Paper Document Preview */}
            <div className="col-span-1 sm:col-span-7 bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(15,23,42,0.06)] text-left space-y-2 text-[10px]">
              <div className="border-b-2 border-blue-600 pb-2">
                <h4 className="font-headings text-base font-bold text-slate-900 leading-none">
                  Alex Rivera
                </h4>
                <p className="font-body text-[11px] font-semibold text-blue-600 mt-1">
                  Staff Software Engineer
                </p>
                <p className="font-body text-[9.5px] text-slate-500 mt-0.5">
                  alex@rivera.dev • (415) 890-1234 • San Francisco, CA
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[9px] block border-b border-slate-200 pb-0.5 mb-1">
                  Professional Experience
                </span>
                <div className="flex justify-between font-bold text-slate-900 text-[10.5px]">
                  <span>Staff Software Engineer — Acme Corp</span>
                  <span className="text-slate-500 font-normal">2022–Present</span>
                </div>
                <p className="text-[9.5px] text-slate-600 leading-snug mt-0.5">
                  Architected real-time streaming pipelines processing 10M+ events daily. Reduced infrastructure costs by 35%.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[9px] block border-b border-slate-200 pb-0.5 mb-1">
                  Education & Certifications
                </span>
                <div className="flex justify-between font-bold text-slate-900 text-[10px]">
                  <span>B.S. Computer Science — UC Berkeley</span>
                  <span className="text-slate-500 font-normal">3.95 GPA</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> 100% ATS Parser Safe
                </span>
                <Link href="/editor" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Open Builder →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Tools Sandbox Preview Mode */
          <div className="p-3 sm:p-4 bg-slate-50/60 rounded-b-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900">PDF Merge</span>
                </div>
                <p className="text-[11px] text-slate-500">Combine multiple PDF files instantly in your browser.</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900">Image Compress</span>
                </div>
                <p className="text-[11px] text-slate-500">Reduce WebP, PNG & JPG sizes up to 80% without quality loss.</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <Lock className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-900">Security Tools</span>
                </div>
                <p className="text-[11px] text-slate-500">Client-side password generator, hashing & base64 tools.</p>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-4 text-center">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mb-2">
                <Sparkles className="h-4 w-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">Drop your files here to process privately</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">100% In-Browser Engine • No File Uploads to Server</p>
              <Link href="/tools">
                <button type="button" className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-all">
                  <span>Explore All 111+ Tools</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
