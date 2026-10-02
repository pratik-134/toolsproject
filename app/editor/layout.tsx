import type { Metadata } from "next";
import { constructToolMetadata, getBaseUrl } from "@/lib/seo/metadata";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = constructToolMetadata({
  title: "Free ATS Resume & CV Builder — 20 Templates, Vector PDF & Word",
  description:
    "Build executive-grade, ATS-optimized resumes with 20+ professional templates. 100% free with vector PDF and native Word DOCX export. Zero watermarks, zero paywalls.",
  slug: "/editor",
  keywords: [
    "free ATS resume builder",
    "free cv maker online",
    "ats-friendly resume templates",
    "vector pdf resume download",
    "word docx resume export",
    "no watermark resume",
    "private resume builder",
  ],
});

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = getBaseUrl();
  const editorUrl = `${baseUrl}/editor`;

  const resumeAppSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${editorUrl}#webapp`,
        name: BRAND.resumeProduct.name,
        headline: "Free ATS Resume & CV Builder — 20 Templates, Vector PDF & Word",
        description:
          "Build executive-grade, ATS-optimized resumes with 20+ professional templates. 100% free with vector PDF and native Word DOCX export. Zero watermarks, zero paywalls.",
        url: editorUrl,
        applicationCategory: "BusinessApplication",
        operatingSystem: "All (Modern Web Browsers)",
        browserRequirements: "JavaScript, HTML5 Canvas, WebAssembly enabled",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "20 ATS-Compliant Resume Templates",
          "Real-time 98/100 ATS Score Engine",
          "Vector A4 PDF Export",
          "Native Word (.docx) Export",
          "100% Client-Side Privacy",
          "Zero Watermarks or Paywalls",
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.95",
          bestRating: "5",
          ratingCount: "820",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${editorUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Resume Builder",
            item: editorUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resumeAppSchema) }}
      />
      {children}
    </>
  );
}
