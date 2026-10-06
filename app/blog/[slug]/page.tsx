import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog/posts";
import { getToolBySlug } from "@/lib/registry/tools";
import { BlogCard } from "@/components/blog/BlogCard";
import { ShareButtons } from "@/components/blog/ShareButtons";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  List,
} from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return {};

  const baseUrl = BRAND.domain ? `https://${BRAND.domain}` : "https://qwertygen.com";
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | ${BRAND.name} Blog`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: `${post.title} | ${BRAND.name}`,
      description: post.excerpt,
      type: "article",
      url: postUrl,
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, 3);
  const relatedTools = (post.relatedTools || [])
    .map((toolSlug) => getToolBySlug(toolSlug))
    .filter(Boolean);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const baseUrl = BRAND.domain ? `https://${BRAND.domain}` : "https://qwertygen.com";
  const articleUrl = `${baseUrl}/blog/${post.slug}`;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon.ico`,
      },
    },
    keywords: post.tags.join(", "),
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        {/* Article Hero Banner */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-10 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Articles</span>
              </Link>

              <ShareButtons title={post.title} url={articleUrl} />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                  {post.category}
                </span>

                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-white font-headings tracking-tight leading-[1.25]">
                {post.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-body leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>

              {/* Author and Date Meta Bar */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm shadow-2xs">
                    {post.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {post.author.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {post.author.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formattedDate}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readingTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Layout (Content + Sticky Sidebar) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Content Column */}
            <article className="lg:col-span-8">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-2xs">
                {/* Featured Cover Image with License Attribution */}
                {post.coverImage && (
                  <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 shadow-2xs">
                    <img
                      src={post.coverImage}
                      alt={post.coverImageAlt || post.title}
                      loading="lazy"
                      className="w-full h-64 sm:h-80 md:h-96 object-cover object-center"
                    />
                    {post.coverImageCredit && (
                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
                        <span>
                          Photo by{" "}
                          <a
                            href={post.coverImageCredit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                          >
                            {post.coverImageCredit.photographer}
                          </a>{" "}
                          on {post.coverImageCredit.platform}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          Free to use under {post.coverImageCredit.platform} License
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Embedded HTML Body */}
                <div
                  className="blog-prose"
                  dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                />

                {/* Author Bio Box */}
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-base shrink-0 shadow-sm">
                    {post.author.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Written by {post.author.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {post.author.role} at Qwertygen. Passionate about client-side document processing, data privacy invariants, and high-performance browser tooling.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Sticky TOC */}
              {post.tableOfContents.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs lg:sticky lg:top-24 space-y-3">
                  <div className="flex items-center gap-2 font-headings font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    <List className="w-4 h-4 text-blue-600" />
                    <span>Table of Contents</span>
                  </div>

                  <nav className="space-y-1 text-xs">
                    {post.tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block py-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                          item.level === 3 ? "pl-3 text-[11px]" : "font-medium"
                        }`}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>

                  {/* Contextual Qwertygen Tool Card */}
                  {relatedTools.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Recommended Free Tools</span>
                      </div>

                      <div className="space-y-2">
                        {relatedTools.map((tool) => {
                          if (!tool) return null;
                          return (
                            <Link
                              key={tool.slug}
                              href={tool.slug === "resume-builder" ? "/editor" : `/tools/${tool.category}/${tool.slug}`}
                              className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-all text-xs"
                            >
                              <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                                {tool.name}
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 ml-2" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Privacy Badge */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>All tools are 100% free and run locally in browser memory.</span>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-14">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-headings text-slate-900 dark:text-white">
                    Related Guides & Articles
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Explore more expert tutorials on client-side productivity and data security.
                  </p>
                </div>

                <Link
                  href="/blog"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>View All Articles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <BlogCard key={related.slug} post={related} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
