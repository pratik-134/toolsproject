"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ToolSearchBar } from "@/components/tools/ToolSearchBar";
import { ResumeImportModal } from "@/components/import/ResumeImportModal";
import { INDEX_STORAGE_KEY, safeLocalStorageGet } from "@/lib/store/storage-utils";
import {
  FileText,
  FileUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Code2,
  Check,
  ChevronRight,
  HardDrive,
  Cpu,
  Wrench,
} from "lucide-react";
import { AnimatedBannerBackground } from "./AnimatedBannerBackground";
import { HeroHeadlineTicker } from "./HeroHeadlineTicker";

export const BrandNewHeroBanner: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"resume" | "pdf" | "tools">("resume");
  const [hasExistingResumes, setHasExistingResumes] = useState(false);

  React.useEffect(() => {
    try {
      const raw = safeLocalStorageGet(INDEX_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHasExistingResumes(true);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  return (
    <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden bg-[radial-gradient(120%_90%_at_50%_-10%,#EFF6FF_0%,#F8FAFC_55%,#FFFFFF_100%)]">
      {/* Silky Topographic Curve Wave Background */}
      <AnimatedBannerBackground variant="hero" />

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-500/15 via-sky-400/15 to-teal-400/10 blur-[130px] rounded-full -z-10" />

      <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          
          {/* 1. Live Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-blue-200/90 bg-white/90 px-3 sm:px-4 py-1.5 font-body text-[11px] sm:text-xs font-semibold text-slate-800 shadow-[0_2px_12px_rgba(37,99,235,0.08)] backdrop-blur-md max-w-full">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-600 font-extrabold shrink-0">
              100% In-Browser Privacy
            </span>
            <span className="text-slate-300 shrink-0 hidden xs:inline">•</span>
            <span className="text-slate-700 truncate hidden xs:inline">
              Free ATS Resume Engine & 111+ Client-Side Tools
            </span>
          </div>

          {/* 2. Centered Scroll-Up Headline Ticker */}
          <HeroHeadlineTicker centered={true} />

          {/* 3. Subtitle Description */}
          <p className="font-body text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Create ATS-optimized resumes with 20 professional templates, or run 111+ client-side privacy tools for PDFs, images, code, and security. Zero server uploads, zero watermarks, and zero paywalls—ever.
          </p>

          {/* 4. Commanding Search Bar */}
          <div className="max-w-xl mx-auto text-left relative z-30 pt-1">
            <ToolSearchBar
              size="large"
              placeholder="Search 111+ tools & ATS templates... (e.g. PDF merge, resume, compress)"
            />
          </div>

          {/* 5. Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href={hasExistingResumes ? "/dashboard" : "/editor"} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto justify-center gap-2.5 text-sm sm:text-base px-7 py-3.5 rounded-xl min-h-[52px] bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold transition-all duration-300 shadow-[0_12px_28px_-6px_rgba(59,130,246,0.4)] hover:shadow-[0_18px_36px_-6px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span>{hasExistingResumes ? "Go to My Resumes" : "Start Building Resume Free"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsImportModalOpen(true)}
              className="w-full sm:w-auto justify-center gap-2 text-sm sm:text-base px-6 py-3.5 rounded-xl min-h-[52px] bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/90 hover:bg-blue-50/80 hover:text-blue-600 hover:border-blue-300 font-bold transition-all duration-200 shadow-2xs hover:shadow-md active:scale-[0.98]"
            >
              <FileUp className="h-4 w-4 text-blue-600" />
              <span>Import Resume (PDF / DOCX)</span>
            </Button>

            <a href="#tools" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto justify-center gap-2 text-sm sm:text-base px-5 py-3.5 rounded-xl min-h-[52px] text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-bold transition-all duration-200 active:scale-[0.98]"
              >
                <span>Browse 111+ Tools</span>
              </Button>
            </a>
          </div>

          {/* 6. Proof Pills Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Instant High-Res Vector PDF</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>100% ATS Parser Verified</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Zero Server Uploads & Storage</span>
            </div>
          </div>
        </div>

        {/* 7. High-Fidelity Interactive Command Center Showcase Card (Modern Light Studio) */}
        <div className="mt-12 max-w-5xl mx-auto relative">
          {/* Ambient Glow behind Studio Card */}
          <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-blue-500/10 via-sky-400/10 to-teal-400/10 blur-xl -z-10" />

          <div className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.1),0_0_0_1px_rgba(226,232,240,0.8)] relative overflow-hidden backdrop-blur-xl">
            {/* Top Right Ambient Glow inside Card */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

            {/* Showcase Header Controls & Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200/80 pb-3 mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-400/90 shadow-xs" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/90 shadow-xs" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/90 shadow-xs" />
                </div>
                <span className="font-mono text-xs text-slate-500 font-semibold ml-2">
                  ClearTrix Engine Sandbox
                </span>
              </div>

              {/* Mode Switcher Buttons */}
              <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-1.5 bg-slate-100 p-1 rounded-xl text-[11px] sm:text-xs font-bold w-full sm:w-auto justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("resume")}
                  className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 rounded-lg transition-all ${
                    activeTab === "resume"
                      ? "bg-white text-blue-600 shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">ATS Resume</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("pdf")}
                  className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 rounded-lg transition-all ${
                    activeTab === "pdf"
                      ? "bg-white text-blue-600 shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">PDF Suite</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tools")}
                  className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 rounded-lg transition-all ${
                    activeTab === "tools"
                      ? "bg-white text-blue-600 shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">111+ Tools</span>
                </button>
              </div>
            </div>

            {/* Dynamic Interactive Card Content */}
            {activeTab === "resume" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200/70 text-left relative z-10">
                <div className="md:col-span-6 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>ATS Score: 98/100 Verified</span>
                  </div>
                  <h3 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Create Workday & Greenhouse Safe Resumes
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    20 pixel-perfect A4 templates formatted with clean single-column hierarchy, standard typography, and 100% vector text export.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs">
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                      <span>Instant PDF Export</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs">
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                      <span>Zero Watermarks</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs">
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                      <span>Local Storage Privacy</span>
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link href="/editor">
                      <Button className="gap-2 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl h-10 px-5 text-xs sm:text-sm shadow-md shadow-blue-600/20">
                        <span>Launch Resume Builder</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Simulated Light Mode A4 Document Live Sheet */}
                <div className="md:col-span-6 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] text-xs space-y-3 text-slate-800">
                  <div className="border-b-2 border-blue-600 pb-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-headings text-lg font-bold text-slate-900">Alex Rivera</h4>
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                        Senior Template #01
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">Staff Software Engineer</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-0.5 mb-1.5">
                      Experience Highlights
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      • Spearheaded microservices architecture reducing server latency by <span className="font-bold text-blue-600">42%</span>.
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">
                      • Managed cross-functional engineering team delivering $4.2M high-volume SaaS platform.
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Ready to print / export
                    </span>
                    <span className="font-mono text-slate-400">A4 Vector Standard</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pdf" && (
              <div className="bg-slate-50/70 p-4 sm:p-6 rounded-xl border border-slate-200/70 text-left space-y-4 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-headings text-lg sm:text-xl font-bold text-slate-900">
                      In-Browser PDF & Document Utilities
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Merge, split, compress, and edit PDF documents with 100% client-side privacy.
                    </p>
                  </div>
                  <Link href="/tools/document-pdf">
                    <Button variant="outline" className="gap-1.5 text-xs font-bold rounded-xl h-9 bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:text-blue-600">
                      <span>View All PDF Tools</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link href="/tools/document-pdf/pdf-merge" className="group">
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs group-hover:border-blue-300 group-hover:shadow-md transition-all">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-2">
                        <Layers className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">PDF Merge</h4>
                      <p className="text-xs text-slate-500 mt-1">Combine multiple PDF documents into one seamless file.</p>
                    </div>
                  </Link>

                  <Link href="/tools/document-pdf/pdf-compressor" className="group">
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs group-hover:border-blue-300 group-hover:shadow-md transition-all">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-2">
                        <Zap className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">PDF Compress</h4>
                      <p className="text-xs text-slate-500 mt-1">Reduce PDF file size up to 80% without losing text quality.</p>
                    </div>
                  </Link>

                  <Link href="/tools/document-pdf/pdf-split" className="group">
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs group-hover:border-blue-300 group-hover:shadow-md transition-all">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-2">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">PDF Split</h4>
                      <p className="text-xs text-slate-500 mt-1">Extract specific page ranges or split PDFs into individual files.</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "tools" && (
              <div className="bg-slate-50/70 p-4 sm:p-6 rounded-xl border border-slate-200/70 text-left space-y-4 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-headings text-lg sm:text-xl font-bold text-slate-900">
                      111+ In-Browser Privacy Utilities
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Images, Security, Developer Formatters, Calculators, and QR Code Generators.
                    </p>
                  </div>
                  <Link href="/tools">
                    <Button variant="outline" className="gap-1.5 text-xs font-bold rounded-xl h-9 bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:text-blue-600">
                      <span>Explore Tools Directory</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs text-left">
                    <ImageIcon className="h-4 w-4 text-blue-600 mb-1" />
                    <span className="font-bold text-xs text-slate-900 block">Image Converter</span>
                    <span className="text-[11px] text-slate-500">WebP, PNG, JPG</span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs text-left">
                    <Code2 className="h-4 w-4 text-purple-600 mb-1" />
                    <span className="font-bold text-xs text-slate-900 block">JSON Formatter</span>
                    <span className="text-[11px] text-slate-500">Beautify & Validate</span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs text-left">
                    <Lock className="h-4 w-4 text-emerald-600 mb-1" />
                    <span className="font-bold text-xs text-slate-900 block">Password Gen</span>
                    <span className="text-[11px] text-slate-500">Secure Random</span>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs text-left">
                    <Cpu className="h-4 w-4 text-amber-600 mb-1" />
                    <span className="font-bold text-xs text-slate-900 block">Hash Generator</span>
                    <span className="text-[11px] text-slate-500">SHA-256 & MD5</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <ResumeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </section>
  );
};
