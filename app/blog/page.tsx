import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllPosts, getAllCategories } from "@/lib/blog/posts";
import { BlogListClient } from "@/components/blog/BlogListClient";
import { ShieldCheck, Sparkles, ArrowRight, Layers } from "lucide-react";
import { TOOLS_COUNT_LABEL } from "@/lib/registry/tools";

import { constructToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = constructToolMetadata({
  title: "Blog & Engineering Guides — Client-Side Privacy, ATS & PDF",
  description:
    "Comprehensive guides, technical deep dives, and tutorials on ATS resume optimization, true vector PDF redaction, client-side data privacy, and developer tools.",
  slug: "/blog",
  keywords: [
    "Qwertygen engineering blog",
    "ATS resume guides",
    "PDF redaction tutorials",
    "client-side privacy technical guides",
  ],
});

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body">
      <Navbar />

      <main className="flex-1">
        {/* Hero Header */}
        <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-slate-200">Blog</span>
              </nav>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Knowledge Base & Technical Guides</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-headings tracking-tight leading-tight">
                Qwertygen Insights & Guides
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-body">
                Expert tutorials on ATS resume optimization, cryptographic document privacy,
                client-side browser sandboxing, and data engineering. Zero fluff, 100% actionable.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content & Filters Container */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <BlogListClient initialPosts={posts} categories={categories} />

          {/* Bottom Callout Banner */}
          <div className="mt-16 rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/20">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>100% Client-Side Architecture</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-headings leading-snug">
                Experience the Power of Zero-Server-Upload Tools
              </h2>

              <p className="text-sm sm:text-base text-white/90 font-body leading-relaxed">
                Create executive ATS resumes, edit PDFs in our full two-panel studio, format JSON payloads,
                and convert media entirely in your browser memory.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/tools"
                  className="px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Browse All {TOOLS_COUNT_LABEL}</span>
                </Link>
                <Link
                  href="/editor"
                  className="px-6 py-3 rounded-xl bg-blue-700/60 border border-white/30 text-white font-bold text-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <span>Build Free Resume</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
