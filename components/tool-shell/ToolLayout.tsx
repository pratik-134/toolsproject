"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ToolMetadata } from "@/lib/registry/types";
import { getCategoryById } from "@/lib/registry/categories";
import { getRelatedTools, getToolUrl } from "@/lib/registry/tools";
import { getCategoryTheme } from "@/lib/category-theme";
import { ToolContextProvider } from "@/lib/tool-context";
import { CategoryId } from "@/lib/registry/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RelatedToolsDrawer } from "@/components/tools/RelatedToolsDrawer";
import { PipelineReceiverBanner } from "@/components/pipeline/PipelineReceiverBanner";
import { BRAND } from "@/lib/brand";
import { useToolsPreferenceStore } from "@/lib/store/use-tools-preference-store";
import {
  ChevronRight,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  Layers,
  Star,
  Sparkles,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Lock,
  QrCode,
  Video,
  Mic,
  Code2,
  Wrench,
  Calculator,
  Cloud,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

const CATEGORY_ICON_MAP: Record<CategoryId, React.ElementType> = {
  "document-pdf": FileText,
  image: ImageIcon,
  security: Lock,
  "url-cloud": Cloud,
  codes: QrCode,
  video: Video,
  audio: Mic,
  builders: Layers,
  developer: Code2,
  utilities: Wrench,
  calculators: Calculator,
};

export interface ToolLayoutProps {
  tool: ToolMetadata;
  children: React.ReactNode;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ tool, children }) => {
  const category = getCategoryById(tool.category);
  const relatedTools = getRelatedTools(tool);
  const theme = getCategoryTheme(tool.category);
  const CategoryIcon = CATEGORY_ICON_MAP[tool.category] || Layers;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const { addRecent, toggleFavorite, isFavorite } = useToolsPreferenceStore();
  const [isFav, setIsFav] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  useEffect(() => {
    addRecent(tool.slug);
    setIsFav(isFavorite(tool.slug));
  }, [tool.slug, addRecent, isFavorite]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Z -> Toggle Zen Mode
      if (e.altKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
        return;
      }

      // Esc -> Exit Zen Mode
      if (e.key === "Escape" && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toolUrl = getToolUrl(tool);
  const baseUrl = BRAND.domain ? `https://${BRAND.domain}` : "https://qwertygen.com";
  const isStudioWorkspace = tool.slug === "pdf-editor";

  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8F9FA] dark:bg-slate-950 overflow-y-auto p-4 sm:p-8">
        {/* Floating Zen Mode Exit Pill */}
        <div className="fixed top-4 right-6 z-50 flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-semibold text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Zen Focus Mode</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-mono">
            Alt+Z / Esc
          </kbd>
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="ml-1 p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title="Exit Zen Mode"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {tool.name}
            </h1>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              100% In-Browser Privacy
            </span>
          </div>

          <ToolContextProvider categoryId={tool.category}>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm p-4 sm:p-6 min-h-[calc(100vh-140px)]">
              {children}
            </div>
          </ToolContextProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* ── Page Header ────────────────────────────────────── */}
        <div className="border-b border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">

            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-[13px] text-[#94A3B8] dark:text-slate-400 flex-wrap"
            >
              <Link
                href="/"
                className="hover:text-[#475569] dark:hover:text-slate-200 transition-colors duration-150"
              >
                Home
              </Link>
              <ChevronRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
              <Link
                href="/tools"
                className="hover:text-[#475569] dark:hover:text-slate-200 transition-colors duration-150"
              >
                Tools
              </Link>
              {category && (
                <>
                  <ChevronRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                  <Link
                    href={`/tools/${category.id}`}
                    className="hover:text-[#475569] dark:hover:text-slate-200 transition-colors duration-150"
                  >
                    {category.shortName}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-semibold text-[#0F172A] dark:text-slate-100 truncate">
                {tool.name}
              </span>
            </nav>

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Category accent bar */}
                <div
                  className="hidden sm:block w-1 self-stretch rounded-full shrink-0"
                  style={{ backgroundColor: theme.primary }}
                  aria-hidden="true"
                />
                <h1 className="text-[22px] xs:text-[26px] sm:text-[34px] leading-[1.2] font-bold text-[#0F172A] dark:text-slate-100 tracking-[-0.02em]">
                  {tool.seo.h1 || tool.name}
                </h1>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Zen / Focus Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsZenMode((prev) => !prev)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors shrink-0"
                  title="Zen / Focus Mode (Alt+Z)"
                  aria-label="Zen / Focus Mode"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>

                {/* Save tool icon on top right corner of banner */}
                <button
                  type="button"
                  onClick={() => {
                    toggleFavorite(tool.slug);
                    setIsFav(!isFav);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors shrink-0"
                  title={isFav ? "Remove from Pinned Favorites" : "Save to Favorites"}
                  aria-label={isFav ? "Remove from Pinned Favorites" : "Save to Favorites"}
                >
                  <Star className={`w-6 h-6 transition-colors ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* Category chip + intro */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-[6px]
                      px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.05em] uppercase border bg-[var(--cat-tint)] dark:bg-slate-800 border-[var(--cat-border)] dark:border-slate-700 text-[var(--cat-primary)] dark:text-slate-200"
                    style={{
                      "--cat-tint": theme.tint,
                      "--cat-border": theme.border,
                      "--cat-primary": theme.primary,
                    } as React.CSSProperties}
                  >
                    <CategoryIcon className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                    {category.shortName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.05em] uppercase border bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span>Offline Ready · Zero Uploads</span>
                </span>
              </div>
              <p className="text-[15px] leading-[1.5] text-[#475569] dark:text-slate-300 max-w-3xl">
                {tool.seo.intro}
              </p>
              {tool.category === "document-pdf" && tool.slug !== "pdf-editor" && (
                <div className="pt-1">
                  <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-medium">
                    <span>Looking for complete multi-page editing, signatures, and annotations?</span>
                    <Link
                      href="/tools/document-pdf/pdf-editor"
                      className="font-semibold underline hover:text-blue-900 dark:hover:text-blue-200 inline-flex items-center gap-0.5"
                    >
                      Open Full PDF Editor →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Pipeline Handoff Receiver Banner ── */}
        <div className="pt-6 px-4 sm:px-6">
          <PipelineReceiverBanner currentToolSlug={tool.slug} />
        </div>

        {/* ── Studio Workspace for Flagship Editors (Resume Builder style) ── */}
        {isStudioWorkspace ? (
          <div className="w-full max-w-[1800px] mx-auto px-2 sm:px-4 pt-4 space-y-8">
            <ToolContextProvider categoryId={tool.category}>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm overflow-hidden min-h-[820px]">
                {children}
              </div>
            </ToolContextProvider>

            {/* Recommended Next Step in Workflow */}
            {relatedTools.length > 0 && relatedTools[0] && (
              <div className="max-w-7xl mx-auto bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-900/90 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Recommended Next Step
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      Continue your workflow with <strong>{relatedTools[0].name}</strong>.
                    </p>
                  </div>
                </div>
                <Link
                  href={getToolUrl(relatedTools[0])}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs self-start sm:self-auto shrink-0"
                >
                  <span>Open Next Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Disclaimer */}
            {tool.disclaimer && (
              <div
                className="max-w-7xl mx-auto rounded-[8px] border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40
                  px-3.5 py-3 flex items-start gap-2.5 text-[13px] text-amber-900 dark:text-amber-200"
              >
                <AlertTriangle
                  className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <p>
                  <strong>Disclaimer:</strong> {tool.disclaimer}
                </p>
              </div>
            )}

            {/* ── FAQ ──────────────────────────────────────────── */}
            {tool.seo.faq && tool.seo.faq.length > 0 && (
              <section className="max-w-7xl mx-auto mt-10 space-y-4" aria-labelledby="faq-heading">
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
                  <HelpCircle
                    className={`h-5 w-5 shrink-0 ${theme.text}`}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <h2
                    id="faq-heading"
                    className="text-[18px] font-semibold text-[#0F172A] dark:text-slate-100 tracking-[-0.01em]"
                  >
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                  {tool.seo.faq.map((item, idx) => (
                    <div key={idx}>
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between text-left gap-3
                          px-4 sm:px-5 py-4 focus:outline-none
                          focus-visible:ring-2 focus-visible:ring-inset
                          hover:bg-[#F8F9FA] dark:hover:bg-slate-800/60 transition-colors duration-150"
                        aria-expanded={openFaqIndex === idx}
                      >
                        <span className="text-[15px] font-semibold text-[#0F172A] dark:text-slate-100 leading-snug">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-[#94A3B8] dark:text-slate-400 transition-transform duration-200 shrink-0 ${
                            openFaqIndex === idx
                              ? `rotate-180 ${theme.text}`
                              : ""
                          }`}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="px-4 sm:px-5 pb-4 border-t border-[#E2E8F0] dark:border-slate-800">
                          <p className="pt-3 text-[13px] sm:text-[15px] leading-[1.5] text-[#475569] dark:text-slate-300">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Bottom Related Tools Grid ─────────────────────── */}
            {relatedTools.length > 0 && (
              <section className="max-w-7xl mx-auto mt-10 space-y-4" aria-labelledby="related-heading">
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
                  <div
                    className="h-5 w-5 shrink-0 rounded-[4px] flex items-center justify-center"
                    style={{ backgroundColor: theme.primary }}
                    aria-hidden="true"
                  >
                    <ArrowRight
                      className="h-3 w-3 text-white"
                      strokeWidth={2}
                    />
                  </div>
                  <h2
                    id="related-heading"
                    className="text-[18px] font-semibold text-[#0F172A] dark:text-slate-100 tracking-[-0.01em]"
                  >
                    Related Privacy-First Utilities
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relatedTools.map((rel) => {
                    const relTheme = getCategoryTheme(rel.category);
                    const RelIcon = CATEGORY_ICON_MAP[rel.category] || Layers;
                    return (
                      <Link
                        key={rel.slug}
                        href={getToolUrl(rel)}
                        className="group flex flex-col justify-between p-4 rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-md transition-all duration-200 ease-in-out"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="h-6 w-6 rounded-[6px] border flex items-center justify-center shrink-0 bg-[var(--rel-tint)] dark:bg-slate-800 border-[var(--rel-border)] dark:border-slate-700 text-[var(--rel-primary)] dark:text-white"
                                style={{
                                  "--rel-tint": relTheme.tint,
                                  "--rel-border": relTheme.border,
                                  "--rel-primary": relTheme.primary,
                                } as React.CSSProperties}
                              >
                                <RelIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                              </div>
                              <span
                                className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-semibold tracking-[0.05em] uppercase border bg-[var(--rel-tint)] dark:bg-slate-800 border-[var(--rel-border)] dark:border-slate-700 text-[var(--rel-primary)] dark:text-slate-200"
                                style={{
                                  "--rel-tint": relTheme.tint,
                                  "--rel-border": relTheme.border,
                                  "--rel-primary": relTheme.primary,
                                } as React.CSSProperties}
                              >
                                {rel.category.replace("-", " ")}
                              </span>
                            </div>
                            <ArrowRight
                              className="h-3.5 w-3.5 text-[#94A3B8] dark:text-slate-500 group-hover:text-[#0F172A] dark:group-hover:text-white
                                group-hover:translate-x-0.5 transition-all duration-150"
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                          </div>
                          <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-slate-100 leading-snug tracking-[-0.01em]">
                            {rel.name}
                          </h3>
                          <p className="mt-1 text-[13px] leading-[1.4] text-[#475569] dark:text-slate-400 line-clamp-2">
                            {rel.seo.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Standard 2-column drawer layout for other tools */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex flex-col lg:flex-row gap-8">
            {/* Main Content Workspace */}
            <div className="flex-1 min-w-0 space-y-6">
              <ToolContextProvider categoryId={tool.category}>
                <div
                  className="bg-white dark:bg-slate-900 rounded-xl border border-[#E2E8F0] dark:border-slate-800
                    shadow-[0_1px_3px_rgba(15,23,42,0.05)] p-4 sm:p-6"
                >
                  {children}
                </div>
              </ToolContextProvider>

              {/* Recommended Next Step in Workflow */}
              {relatedTools.length > 0 && relatedTools[0] && (
                <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-900/90 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Recommended Next Step
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                        Continue your workflow with <strong>{relatedTools[0].name}</strong>.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={getToolUrl(relatedTools[0])}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs self-start sm:self-auto shrink-0"
                  >
                    <span>Open Next Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Disclaimer */}
              {tool.disclaimer && (
                <div
                  className="rounded-[8px] border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30
                    px-3.5 py-3 flex items-start gap-2.5 text-[13px] text-amber-900 dark:text-amber-200"
                >
                  <AlertTriangle
                    className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <p>
                    <strong>Disclaimer:</strong> {tool.disclaimer}
                  </p>
                </div>
              )}

              {/* ── FAQ ──────────────────────────────────────────── */}
              {tool.seo.faq && tool.seo.faq.length > 0 && (
                <section className="mt-10 space-y-4" aria-labelledby="faq-heading">
                  <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
                    <HelpCircle
                      className={`h-5 w-5 shrink-0 ${theme.text}`}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <h2
                      id="faq-heading"
                      className="text-[18px] font-semibold text-[#0F172A] dark:text-slate-100 tracking-[-0.01em]"
                    >
                      Frequently Asked Questions
                    </h2>
                  </div>

                  <div className="divide-y divide-[#E2E8F0] dark:divide-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                    {tool.seo.faq.map((item, idx) => (
                      <div key={idx}>
                        <button
                          type="button"
                          onClick={() => toggleFaq(idx)}
                          className="w-full flex items-center justify-between text-left gap-3
                            px-4 sm:px-5 py-4 focus:outline-none
                            focus-visible:ring-2 focus-visible:ring-inset
                            hover:bg-[#F8F9FA] dark:hover:bg-slate-800/60 transition-colors duration-150"
                          aria-expanded={openFaqIndex === idx}
                        >
                          <span className="text-[15px] font-semibold text-[#0F172A] dark:text-slate-100 leading-snug">
                            {item.q}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-[#94A3B8] dark:text-slate-400 transition-transform duration-200 shrink-0 ${
                              openFaqIndex === idx
                                ? `rotate-180 ${theme.text}`
                                : ""
                            }`}
                            strokeWidth={1.75}
                            aria-hidden="true"
                          />
                        </button>
                        {openFaqIndex === idx && (
                          <div className="px-4 sm:px-5 pb-4 border-t border-[#E2E8F0] dark:border-slate-800">
                            <p className="pt-3 text-[13px] sm:text-[15px] leading-[1.5] text-[#475569] dark:text-slate-300">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Bottom Related Tools Grid ─────────────────────── */}
              {relatedTools.length > 0 && (
                <section className="mt-10 space-y-4" aria-labelledby="related-heading">
                  <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-slate-800 pb-3">
                    <div
                      className="h-5 w-5 shrink-0 rounded-[4px] flex items-center justify-center"
                      style={{ backgroundColor: theme.primary }}
                      aria-hidden="true"
                    >
                      <ArrowRight
                        className="h-3 w-3 text-white"
                        strokeWidth={2}
                      />
                    </div>
                    <h2
                      id="related-heading"
                      className="text-[18px] font-semibold text-[#0F172A] dark:text-slate-100 tracking-[-0.01em]"
                    >
                      Related Privacy-First Utilities
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {relatedTools.map((rel) => {
                      const relTheme = getCategoryTheme(rel.category);
                      const RelIcon = CATEGORY_ICON_MAP[rel.category] || Layers;
                      return (
                        <Link
                          key={rel.slug}
                          href={getToolUrl(rel)}
                          className="group flex flex-col justify-between p-4 rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all duration-200 ease-in-out"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="h-6 w-6 rounded-[6px] border flex items-center justify-center shrink-0 bg-[var(--rel-tint)] dark:bg-slate-800 border-[var(--rel-border)] dark:border-slate-700 text-[var(--rel-primary)] dark:text-white"
                                  style={{
                                    "--rel-tint": relTheme.tint,
                                    "--rel-border": relTheme.border,
                                    "--rel-primary": relTheme.primary,
                                  } as React.CSSProperties}
                                >
                                  <RelIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                                </div>
                                <span
                                  className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-semibold tracking-[0.05em] uppercase border bg-[var(--rel-tint)] dark:bg-slate-800 border-[var(--rel-border)] dark:border-slate-700 text-[var(--rel-primary)] dark:text-slate-200"
                                  style={{
                                    "--rel-tint": relTheme.tint,
                                    "--rel-border": relTheme.border,
                                    "--rel-primary": relTheme.primary,
                                  } as React.CSSProperties}
                                >
                                  {rel.category.replace("-", " ")}
                                </span>
                              </div>
                              <ArrowRight
                                className="h-3.5 w-3.5 text-[#94A3B8] dark:text-slate-400 group-hover:text-[#0F172A] dark:group-hover:text-slate-100
                                  group-hover:translate-x-0.5 transition-all duration-150"
                                strokeWidth={1.75}
                                aria-hidden="true"
                              />
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-slate-100 leading-snug tracking-[-0.01em]">
                              {rel.name}
                            </h3>
                            <p className="mt-1 text-[13px] leading-[1.4] text-[#475569] dark:text-slate-400 line-clamp-2">
                              {rel.seo.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Desktop Side Drawer & Mobile Sheet */}
            <RelatedToolsDrawer
              currentCategory={tool.category}
              relatedTools={relatedTools}
            />
          </div>
        )}
      </main>
      <Footer />

      {/* Google Structured Data / JSON-LD for SEO (WebApplication + FAQPage + BreadcrumbList) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                name: tool.name,
                url: `${baseUrl}${toolUrl}`,
                applicationCategory: "UtilityApplication",
                operatingSystem: "Web Browser",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
                description: tool.seo.description,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: `${baseUrl}/`,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Tools",
                    item: `${baseUrl}/tools`,
                  },
                  ...(category
                    ? [
                        {
                          "@type": "ListItem",
                          position: 3,
                          name: category.name,
                          item: `${baseUrl}/tools/${category.id}`,
                        },
                      ]
                    : []),
                  {
                    "@type": "ListItem",
                    position: category ? 4 : 3,
                    name: tool.name,
                    item: `${baseUrl}${toolUrl}`,
                  },
                ],
              },
              ...(tool.seo.faq && tool.seo.faq.length > 0
                ? [
                    {
                      "@type": "FAQPage",
                      mainEntity: tool.seo.faq.map((item) => ({
                        "@type": "Question",
                        name: item.q,
                        acceptedAnswer: {
                          "@type": "Answer",
                          text: item.a,
                        },
                      })),
                    },
                  ]
                : []),
            ],
          }),
        }}
      />
    </div>
  );
};
