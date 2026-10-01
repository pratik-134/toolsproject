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
  Sparkles,
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
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 selection:bg-blue-500/20">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Category Header — tinted band */}
        <section
          className="relative border-b border-slate-200/80 dark:border-slate-800 py-10 sm:py-14 overflow-hidden"
          style={{ backgroundColor: theme.tint }}
        >
          {/* Watermark */}
          <div
            className="absolute -right-8 -top-8 pointer-events-none opacity-[0.10] -rotate-12 select-none"
            style={{ color: theme.primary }}
            aria-hidden="true"
          >
            <CategoryIcon className="w-56 h-56" strokeWidth={1} />
          </div>

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10 space-y-4">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
              <Link href="/tools" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Tools</Link>
              <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
              <span className="font-semibold" style={{ color: theme.primary }}>{category.shortName}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Frosted icon tile */}
                <div
                  className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-md"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderColor: theme.border,
                    color: theme.primary,
                  }}
                >
                  <CategoryIcon className="w-7 h-7" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <h1 className="font-headings text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {category.name}
                  </h1>
                  <p className="font-body text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xl mt-1">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Stat badges */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderColor: theme.border,
                    color: theme.primary,
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  {liveTools.length} live {liveTools.length === 1 ? "tool" : "tools"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm">
                  <ShieldCheck className="w-3 h-3" />
                  In-browser only
                </span>
              </div>
            </div>
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
