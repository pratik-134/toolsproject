import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { CATEGORY_LIST } from "@/lib/registry/categories";
import { getAllTools } from "@/lib/registry/tools";
import { prisma } from "@/lib/db";

const TEMPLATE_IDS = [
  "modern",
  "ats-safe",
  "classic",
  "minimal",
  "tech",
  "executive",
  "two-column",
  "compact",
  "creative",
  "academic",
  "timeline",
  "elegant",
  "bold",
  "startup",
  "infographic-light",
  "simple",
  "corporate",
  "nordic",
  "swiss",
  "hybrid",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || BRAND.domain;
  const currentDate = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/editor`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Category pages
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_LIST.map((cat) => ({
    url: `${baseUrl}/tools/${cat.id}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Tool dynamic pages
  const liveTools = getAllTools().filter(
    (t) => t.status === "live" && t.slug !== "resume-builder"
  );
  const toolRoutes: MetadataRoute.Sitemap = liveTools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.category}/${tool.slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Resume template pages
  const templateRoutes: MetadataRoute.Sitemap = TEMPLATE_IDS.map((id) => ({
    url: `${baseUrl}/editor?template=${id}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Blog posts — only PUBLISHED
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const publishedPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });
    blogRoutes = publishedPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch {
    // DB not available at build time — blog routes will be omitted from sitemap
  }

  return [...coreRoutes, ...categoryRoutes, ...toolRoutes, ...templateRoutes, ...blogRoutes];
}
