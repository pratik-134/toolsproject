"use client";

import React, { useState } from "react";
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
import { BRAND } from "@/lib/brand";
import {
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  Layers,
  FileText,
  Image as ImageIcon,
  Lock,
  QrCode,
  Video,
  Mic,
  Code2,
  Wrench,
  Calculator,
} from "lucide-react";

const CATEGORY_ICON_MAP: Record<CategoryId, React.ElementType> = {
  "document-pdf": FileText,
  image: ImageIcon,
  security: Lock,
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

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toolUrl = getToolUrl(tool);
  const baseUrl = BRAND.domain ? `https://${BRAND.domain}` : "https://cleartrix.com";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* ── Page Header ────────────────────────────────────── */}
        <div className="border-b border-[#E2E8F0] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">

            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-[13px] text-[#94A3B8] flex-wrap"
            >
              <Link
                href="/"
                className="hover:text-[#475569] transition-colors duration-150"
              >
                Home
              </Link>
              <ChevronRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
              <Link
                href="/tools"
                className="hover:text-[#475569] transition-colors duration-150"
              >
                Tools
              </Link>
              {category && (
                <>
                  <ChevronRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                  <Link
                    href={`/tools/${category.id}`}
                    className={`hover:text-[#475569] transition-colors duration-150`}
                  >
                    {category.shortName}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-semibold text-[#0F172A] truncate">
                {tool.name}
              </span>
            </nav>

            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Category accent bar */}
                <div
                  className="hidden sm:block w-1 self-stretch rounded-full shrink-0"
                  style={{ backgroundColor: theme.primary }}
                  aria-hidden="true"
                />
                <h1 className="text-[28px] sm:text-[34px] leading-[1.2] font-bold text-[#0F172A] tracking-[-0.02em]">
                  {tool.seo.h1 || tool.name}
                </h1>
              </div>

              {/* Privacy badge & Trust line */}
              <div
                className="inline-flex items-center gap-1.5 rounded-[6px]
                  border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] px-2.5 py-1 text-[11px] font-semibold tracking-[0.05em] uppercase shrink-0
                  self-start sm:self-auto"
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#1D4ED8]" strokeWidth={1.75} aria-hidden="true" />
                <span>Files never leave your browser • 100% Client-Side</span>
              </div>
            </div>

            {/* Category chip + intro */}
            <div className="space-y-2">
              {category && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-[6px]
                    px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.05em] uppercase border"
                  style={{
                    backgroundColor: theme.tint,
                    borderColor: theme.border,
                    color: theme.primary,
                  }}
                >
                  <CategoryIcon className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                  {category.shortName}
                </span>
              )}
              <p className="text-[15px] leading-[1.5] text-[#475569] max-w-3xl">
                {tool.seo.intro}
              </p>
            </div>
          </div>
        </div>

        {/* ── Workspace Area with Sidebar Drawer ─────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex flex-col lg:flex-row gap-8">
          {/* Main Content Workspace */}
          <div className="flex-1 min-w-0 space-y-6">
            <ToolContextProvider categoryId={tool.category}>
              <div
                className="bg-white rounded-xl border border-[#E2E8F0]
                  shadow-[0_1px_3px_rgba(15,23,42,0.05)] p-4 sm:p-6"
              >
                {children}
              </div>
            </ToolContextProvider>

            {/* Disclaimer */}
            {tool.disclaimer && (
              <div
                className="rounded-[8px] border border-amber-200 bg-amber-50/80
                  px-3.5 py-3 flex items-start gap-2.5 text-[13px] text-amber-900"
              >
                <AlertTriangle
                  className="h-4 w-4 text-amber-600 shrink-0 mt-0.5"
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
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                  <HelpCircle
                    className={`h-5 w-5 shrink-0 ${theme.text}`}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <h2
                    id="faq-heading"
                    className="text-[18px] font-semibold text-[#0F172A] tracking-[-0.01em]"
                  >
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                  {tool.seo.faq.map((item, idx) => (
                    <div key={idx}>
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between text-left gap-3
                          px-4 sm:px-5 py-4 focus:outline-none
                          focus-visible:ring-2 focus-visible:ring-inset
                          hover:bg-[#F8F9FA] transition-colors duration-150"
                        aria-expanded={openFaqIndex === idx}
                      >
                        <span className="text-[15px] font-semibold text-[#0F172A] leading-snug">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                            openFaqIndex === idx
                              ? `rotate-180 ${theme.text}`
                              : ""
                          }`}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="px-4 sm:px-5 pb-4 border-t border-[#E2E8F0]">
                          <p className="pt-3 text-[13px] sm:text-[15px] leading-[1.5] text-[#475569]">
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
                <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
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
                    className="text-[18px] font-semibold text-[#0F172A] tracking-[-0.01em]"
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
                        className="group flex flex-col justify-between p-4 rounded-[12px] border border-slate-200 bg-white hover:border-blue-500/50 hover:shadow-md transition-all duration-200 ease-in-out"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="h-6 w-6 rounded-[6px] border flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: relTheme.tint,
                                  borderColor: relTheme.border,
                                  color: relTheme.primary,
                                }}
                              >
                                <RelIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                              </div>
                              <span
                                className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-semibold tracking-[0.05em] uppercase border"
                                style={{
                                  backgroundColor: relTheme.tint,
                                  borderColor: relTheme.border,
                                  color: relTheme.primary,
                                }}
                              >
                                {rel.category.replace("-", " ")}
                              </span>
                            </div>
                            <ArrowRight
                              className="h-3.5 w-3.5 text-[#94A3B8] group-hover:text-[#0F172A]
                                group-hover:translate-x-0.5 transition-all duration-150"
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                          </div>
                          <h3 className="text-[15px] font-semibold text-[#0F172A] leading-snug tracking-[-0.01em]">
                            {rel.name}
                          </h3>
                          <p className="mt-1 text-[13px] leading-[1.4] text-[#475569] line-clamp-2">
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
