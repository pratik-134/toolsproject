import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Calendar, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let post = null;
  try {
    post = await prisma.blogPost.findUnique({ where: { slug } });
  } catch {
    return { title: `Blog | ${BRAND.name}` };
  }

  if (!post || post.status !== "PUBLISHED") {
    return { title: "Post Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || BRAND.domain;
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || `Read "${post.title}" on ${BRAND.name}.`;

  return {
    title: `${title} | ${BRAND.name}`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      url: `${siteUrl}/blog/${slug}`,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
    twitter: {
      card: post.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post = null;

  try {
    post = await prisma.blogPost.findUnique({ where: { slug } });
  } catch {
    notFound();
  }

  // 404 for drafts and non-existent posts — never leak draft content
  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA]">
      <Navbar />
      <main className="flex-1">
        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="relative h-[280px] sm:h-[380px] bg-slate-100 overflow-hidden">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#94A3B8]
              hover:text-[#475569] transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            All Posts
          </Link>

          {/* Meta */}
          <div className="mb-6 space-y-3">
            {post.publishedAt && (
              <div className="flex items-center gap-1.5 text-[13px] text-[#94A3B8]">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                {post.publishedAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
            <h1 className="text-[28px] sm:text-[36px] font-bold text-[#0F172A]
              leading-[1.2] tracking-[-0.02em]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-[17px] leading-[1.6] text-[#475569]">{post.excerpt}</p>
            )}
          </div>

          {/* Divider */}
          <hr className="border-[#E2E8F0] mb-8" />

          {/* Content */}
          <article className="prose prose-slate prose-base max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-code:bg-slate-100 prose-code:rounded prose-code:px-1 prose-code:py-0.5
            prose-code:text-slate-800 prose-code:text-sm
            prose-pre:bg-slate-900 prose-pre:text-slate-100">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </article>

          {/* Footer nav */}
          <div className="mt-14 pt-8 border-t border-[#E2E8F0]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold
                text-[#475569] hover:text-[#0F172A] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              Back to all posts
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
