import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { CATEGORY_LIST } from "@/lib/registry/categories";
import { getAllTools } from "@/lib/registry/tools";

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

  // Tool dynamic pages (111+ routes)
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

  return [...coreRoutes, ...categoryRoutes, ...toolRoutes, ...templateRoutes];
}
