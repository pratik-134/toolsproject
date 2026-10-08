import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-static";

export async function GET() {
  const rawDomain =
    process.env.NEXT_PUBLIC_SITE_URL || BRAND.domain || "https://qwertygen.com";
  const baseUrl = rawDomain.startsWith("http")
    ? rawDomain
    : `https://${rawDomain}`;

  const today = new Date().toISOString().split("T")[0];

  const sitemaps = [
    { loc: `${baseUrl}/sitemap/pages.xml`, lastmod: today },
    { loc: `${baseUrl}/sitemap/categories.xml`, lastmod: today },
    { loc: `${baseUrl}/sitemap/tools.xml`, lastmod: today },
    { loc: `${baseUrl}/sitemap/blog.xml`, lastmod: today },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
