import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { CATEGORY_LIST, getCategoryById } from "@/lib/registry/categories";
import { getToolsByCategory } from "@/lib/registry/tools";
import { CategoryId } from "@/lib/registry/types";
import { getCategoryTheme } from "@/lib/category-theme";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Clock,
  FileText,
  Image as ImageIcon,
  Lock,
  Cloud,
  QrCode,
  Video,
  Mic,
  Layers,
  Code2,
  Wrench,
  Calculator,
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

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return CATEGORY_LIST.map((cat) => ({
    category: cat.id,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: catId } = await params;
  const category = getCategoryById(catId);
  if (!category) return {};

  return {
    title: `${category.name} — 100% Free & Private | ${BRAND.name}`,
    description: category.description,
  };
}

export default async function CategoryHubPage({ params }: CategoryPageProps) {
  const { category: catId } = await params;
  const category = getCategoryById(catId);

  if (!category) {
    notFound();
  }

  const theme = getCategoryTheme(category.id);
  const tools = getToolsByCategory(catId as CategoryId);
  const liveTools = tools.filter((t) => t.status === "live");
  const CategoryIcon = CATEGORY_ICON_MAP[category.id] || Wrench;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] text-[#0F172A] selection:bg-blue-500/20">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Category Header */}
        <section className="bg-white border-b border-slate-200/80 py-8 sm:py-12">
          <div className="max-w-container mx-auto px-4 sm:px-6 space-y-4">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <Link href="/tools" className="hover:text-slate-900 transition-colors">
                Tools
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="font-semibold" style={{ color: theme.primary }}>
                {category.shortName}
              </span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="h-12 w-12 rounded-[12px] border flex items-center justify-center shrink-0 shadow-xs"
                  style={{
                    backgroundColor: theme.tint,
                    borderColor: theme.border,
                    color: theme.primary,
                  }}
                >
                  <CategoryIcon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-1.5 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: theme.primary }}
                    aria-hidden="true"
                  />
                  <h1 className="font-headings text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                    {category.name}
                  </h1>
                </div>
              </div>

              {/* Uniform Security Privacy Badge */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-body text-xs font-medium text-slate-600 shadow-xs shrink-0 self-start sm:self-auto"
              >
                <span className="text-emerald-500 text-[10px] leading-none">●</span>
                <span>Runs locally · zero uploads</span>
              </div>
            </div>

            <p className="font-body text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              {category.description}
            </p>
          </div>
        </section>

        {/* Live Tools Section */}
        <section className="max-w-container mx-auto px-4 sm:px-6 pt-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5" style={{ color: theme.primary }} />
            <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900">
              Available Now
            </h2>
            <span
              className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-[6px] border ml-1"
              style={{
                backgroundColor: theme.tint,
                borderColor: theme.border,
                color: theme.primary,
              }}
            >
              {liveTools.length} {liveTools.length === 1 ? "tool" : "tools"}
            </span>
          </div>

          {liveTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={
                    tool.slug === "resume-builder"
                      ? "/editor"
                      : `/tools/${tool.category}/${tool.slug}`
                  }
                  className="group flex flex-col justify-between p-5 rounded-2xl border border-slate-100/90 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:border-blue-400/60 hover:shadow-[0_10px_30px_-5px_rgba(37,99,235,0.12)] transition-all duration-300 ease-out overflow-hidden"
                  style={{ borderTop: `3px solid ${theme.primary}` }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className="h-8 w-8 rounded-xl border-0 flex items-center justify-center shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: theme.tint,
                          color: theme.primary,
                        }}
                      >
                        <CategoryIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: theme.tint, color: theme.primary }}
                        >
                          <span className="text-emerald-500 text-[9px]">●</span> Runs locally
                        </span>
                      </div>
                    </div>
                    <h3 className="font-headings font-bold text-slate-900 text-base mt-3 group-hover:text-blue-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="font-body text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {tool.seo.description}
                    </p>
                  </div>

                  <div
                    className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs font-semibold"
                    style={{ color: theme.primary }}
                  >
                    <span>Launch</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-2">
              <Clock className="h-6 w-6 text-slate-400 mx-auto" />
              <p className="font-headings font-bold text-slate-700 text-sm">
                Tools in this category are scheduled across upcoming phases.
              </p>
              <p className="font-body text-xs text-slate-500">
                Check the roadmap below or explore live tools in other categories.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
