import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { CATEGORY_LIST } from "@/lib/registry/categories";
import { getAllTools } from "@/lib/registry/tools";
import { getAllPosts } from "@/lib/blog/posts";

export async function generateSitemaps() {
  return [
    { id: "pages" },
    { id: "categories" },
    { id: "tools" },
    { id: "blog" },
  ];
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const rawDomain =
    process.env.NEXT_PUBLIC_SITE_URL || BRAND.domain || "https://qwertygen.com";
  const baseUrl = rawDomain.startsWith("http")
    ? rawDomain
    : `https://${rawDomain}`;

  // Stable baseline date for tools and static legal pages
  const baselineDate = new Date("2026-03-15T00:00:00.000Z");

  if (id === "pages") {
    return [
      {
        url: `${baseUrl}`,
        lastModified: baselineDate,
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/tools`,
        lastModified: baselineDate,
        changeFrequency: "daily",
        priority: 0.95,
      },
      {
        url: `${baseUrl}/editor`,
        lastModified: baselineDate,
        changeFrequency: "daily",
        priority: 0.95,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: baselineDate,
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: baselineDate,
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ];
  }

  if (id === "categories") {
    return CATEGORY_LIST.map((cat) => ({
      url: `${baseUrl}/tools/${cat.id}`,
      lastModified: baselineDate,
      changeFrequency: "weekly",
      priority: 0.85,
    }));
  }

  if (id === "tools") {
    const liveTools = getAllTools().filter(
      (t) => t.status === "live" && t.slug !== "resume-builder"
    );
    return liveTools.map((tool) => ({
      url: `${baseUrl}/tools/${tool.category}/${tool.slug}`,
      lastModified: baselineDate,
      changeFrequency: "weekly",
      priority: 0.85,
    }));
  }

  if (id === "blog") {
    const posts = getAllPosts();
    return [
      {
        url: `${baseUrl}/blog`,
        lastModified: baselineDate,
        changeFrequency: "daily",
        priority: 0.85,
      },
      ...posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  }

  return [];
}
