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
import { ToolCardGrid } from "@/components/tools/ToolCardGrid";
import {
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Clock,
  FileText,
  Image as ImageIcon,
  Lock,
  QrCode,
  Video,
  Mic,
  Layers,
  Code2,
  Wrench,
  Calculator,
  Cloud,
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
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: theme.tint,
                    borderColor: theme.border,
                    color: theme.primary,
                  }}
                >
                  <CategoryIcon className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
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
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-body text-xs font-medium text-slate-600 shadow-sm shrink-0 self-start sm:self-auto"
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

        {/* Category Tools Grid */}
        <section className="max-w-container mx-auto px-4 sm:px-6 pt-10">
          <ToolCardGrid
            tools={tools}
            initialCategory={category.id}
            showCategoryFilter={false}
            showSearchBar={true}
            title={`All ${category.name}`}
            subtitle={`Select any ${category.shortName.toLowerCase()} utility below to process your files 100% locally in your browser memory.`}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
