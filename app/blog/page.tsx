import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Calendar, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Blog | ${BRAND.name}`,
  description: `Articles, guides, and updates from the ${BRAND.name} team.`,
};

export default async function BlogPage() {
  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    publishedAt: Date | null;
  }> = [];
  let dbError: string | null = null;

  try {
    posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
      },
    });
  } catch (err: any) {
    dbError = err?.message || "Failed to reach database";
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA]">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="border-b border-[#E2E8F0] bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <h1 className="text-[34px] sm:text-[40px] font-bold text-[#0F172A] tracking-[-0.025em] leading-[1.2]">
              Blog
            </h1>
            <p className="mt-3 text-[15px] leading-[1.5] text-[#475569] max-w-xl">
              Articles, guides, and updates from the {BRAND.name} team.
            </p>
          </div>
        </div>

        {/* Post grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {dbError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-base font-semibold text-amber-900">Database Connection Notice</h3>
              <p className="text-sm text-amber-800">
                The database server at <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">localhost:5432</code> is currently unreachable.
              </p>
              <p className="text-xs text-amber-700">
                Please ensure your PostgreSQL server or Docker container is running and your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">DATABASE_URL</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> is configured.
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[15px] text-[#475569]">No posts published yet.</p>
              <p className="text-[13px] text-[#94A3B8] mt-1">Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-xl border border-[#E2E8F0]
                    shadow-[0_1px_3px_rgba(15,23,42,0.05)]
                    hover:border-[#CBD5E1] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]
                    hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  {/* Cover image */}
                  {post.coverImageUrl ? (
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <span className="text-[28px] font-bold text-slate-300 select-none">
                        {post.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <h2 className="text-[15px] font-semibold text-[#0F172A] leading-snug
                      group-hover:text-blue-700 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-[13px] leading-[1.5] text-[#475569] line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      {post.publishedAt && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                          <Calendar className="h-3 w-3" strokeWidth={1.75} />
                          {post.publishedAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      <ArrowRight
                        className="h-3.5 w-3.5 text-[#94A3B8] group-hover:text-blue-600
                          group-hover:translate-x-0.5 transition-all duration-150"
                        strokeWidth={1.75}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
