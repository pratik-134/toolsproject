import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { CATEGORY_LIST } from "@/lib/registry/categories";
import { getAllTools } from "@/lib/registry/tools";
import { getAllPosts } from "@/lib/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const rawDomain = process.env.NEXT_PUBLIC_SITE_URL || BRAND.domain || "https://cleartrix.com";
  const baseUrl = rawDomain.startsWith("http") ? rawDomain : `https://${rawDomain}`;
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
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/brand`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
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

  // Category suite pages
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_LIST.map((cat) => ({
    url: `${baseUrl}/tools/${cat.id}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Tool dynamic pages (all 167 in-browser tools)
  const liveTools = getAllTools().filter(
    (t) => t.status === "live" && t.slug !== "resume-builder"
  );
  const toolRoutes: MetadataRoute.Sitemap = liveTools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.category}/${tool.slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Blog routes
  const blogRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.85,
    },
    ...getAllPosts().map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return [...coreRoutes, ...categoryRoutes, ...toolRoutes, ...blogRoutes];
}
