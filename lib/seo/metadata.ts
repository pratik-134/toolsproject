import { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export interface ConstructMetadataOptions {
  title: string;
  description: string;
  slug?: string;
  categorySlug?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || BRAND.domain || "https://cleartrix.com";
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

export function constructToolMetadata({
  title,
  description,
  slug,
  categorySlug,
  keywords = [],
  ogImage = "/og-default.png",
  noIndex = false,
}: ConstructMetadataOptions): Metadata {
  const baseUrl = getBaseUrl();
  let path = "";
  
  if (categorySlug && slug) {
    path = `/tools/${categorySlug}/${slug}`;
  } else if (categorySlug) {
    path = `/tools/${categorySlug}`;
  } else if (slug) {
    path = slug.startsWith("/") ? slug : `/${slug}`;
  }

  const canonicalUrl = `${baseUrl}${path}`;
  const fullTitle = title.includes(BRAND.name) ? title : `${title} | ${BRAND.name}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      "free ATS resume builder",
      "no server upload",
      "privacy first tools",
      "client side browser tools",
      "free pdf tools online",
      ...keywords,
    ],
    authors: [{ name: BRAND.name, url: baseUrl }],
    creator: BRAND.name,
    publisher: BRAND.name,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: BRAND.name,
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: `${title} - ${BRAND.name}`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`],
      creator: BRAND.twitterHandle,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}
