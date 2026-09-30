import { getBaseUrl } from "./metadata";
import { BRAND } from "@/lib/brand";

export interface FAQItemInput {
  question?: string;
  answer?: string;
  q?: string;
  a?: string;
}

export interface BreadcrumbStep {
  name: string;
  url: string;
}

export function generateWebApplicationSchema() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${BRAND.name} ${BRAND.resumeProduct.shortName} & In-Browser Privacy Tools`,
    "url": baseUrl,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any (Browser Based)",
    "browserRequirements": "Requires WebAssembly and JavaScript enabled. Compatible with Chrome, Firefox, Safari, Edge.",
    "description": "100% Free, Client-Side Career & Document Engine. Create ATS-optimized resumes and process PDFs with zero server uploads, zero watermarks, and zero paywalls.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "20 ATS-compliant A4 Resume Templates",
      "Instant 98/100 ATS Score Engine",
      "Client-Side PDF Merge and Compression",
      "WebP and PNG Image Converter",
      "Zero Server File Storage"
    ]
  };
}

export function generateFAQPageSchema(faqs: FAQItemInput[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question || faq.q || "",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer || faq.a || "",
      },
    })),
  };
}

export function generateBreadcrumbSchema(steps: BreadcrumbStep[]) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": steps.map((step, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": step.name,
      "item": step.url.startsWith("http") ? step.url : `${baseUrl}${step.url}`,
    })),
  };
}

export function generateHowToSchema(title: string, description: string, steps: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "step": steps.map((stepText, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": `Step ${idx + 1}`,
      "text": stepText,
    })),
  };
}
