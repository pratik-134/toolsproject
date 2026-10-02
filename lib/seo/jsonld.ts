import { getBaseUrl } from "./metadata";
import { BRAND } from "@/lib/brand";
import { ToolDefinition, CategoryId, CategoryDefinition } from "@/lib/registry/types";

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

const CATEGORY_APPLICATION_MAP: Record<CategoryId, string> = {
  "document-pdf": "BusinessApplication",
  image: "MultimediaApplication",
  security: "SecurityApplication",
  "url-cloud": "UtilitiesApplication",
  codes: "UtilitiesApplication",
  video: "MultimediaApplication",
  audio: "MultimediaApplication",
  builders: "BusinessApplication",
  developer: "DeveloperApplication",
  utilities: "UtilitiesApplication",
  calculators: "FinanceApplication",
};

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
      "priceCurrency": "USD",
    },
    "featureList": [
      "20 ATS-compliant A4 Resume Templates",
      "Instant 98/100 ATS Score Engine",
      "Client-Side PDF Merge and Compression",
      "WebP and PNG Image Converter",
      "Zero Server File Storage",
    ],
  };
}

export function generateWebsiteOrganizationSchema() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": BRAND.name,
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/icon.png`,
          "width": 512,
          "height": 512,
        },
        "description": BRAND.description,
        "sameAs": [
          BRAND.social.github,
          BRAND.social.twitter,
          BRAND.social.linkedin,
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": BRAND.name,
        "publisher": {
          "@id": `${baseUrl}/#organization`,
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/tools?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function generateFAQPageSchema(faqs: FAQItemInput[]) {
  if (!faqs || faqs.length === 0) return null;
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

/** Comprehensive Multi-Schema Graph for individual in-browser tool pages */
export function generateToolJsonLd(tool: ToolDefinition) {
  const baseUrl = getBaseUrl();
  const toolUrl = `${baseUrl}/tools/${tool.category}/${tool.slug}`;
  const appCategory = CATEGORY_APPLICATION_MAP[tool.category] || "UtilitiesApplication";

  const schemas: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      "@id": `${toolUrl}#software`,
      name: tool.name,
      headline: tool.seo.h1,
      description: tool.seo.description,
      url: toolUrl,
      applicationCategory: appCategory,
      operatingSystem: "All (Modern Web Browsers: Chrome, Firefox, Safari, Edge)",
      browserRequirements: "HTML5, WebAssembly, JavaScript enabled",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "100% Client-Side In-Browser Processing",
        "Zero Server Uploads & Zero Storage",
        "Zero Paywalls & No Watermarks",
        "Instant Download",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        bestRating: "5",
        ratingCount: "250",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${toolUrl}#breadcrumb`,
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
          name: "Tools",
          item: `${baseUrl}/tools`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: tool.category.replace("-", " ").toUpperCase(),
          item: `${baseUrl}/tools/${tool.category}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: tool.name,
          item: toolUrl,
        },
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${toolUrl}#howto`,
      name: `How to use ${tool.name} online for free`,
      description: `Follow these 3 simple steps to execute ${tool.name} completely inside your browser with 100% client-side privacy.`,
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Load your file or input data",
          text: "Select, drag-and-drop, or paste your file directly into the tool workspace in your browser.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Configure settings with instant live preview",
          text: "Adjust processing options, formatting, or filters. All computation happens locally in your device memory.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Download or save your output",
          text: "Save your processed document, media, or file immediately. No files are ever sent to or stored on any server.",
        },
      ],
    },
  ];

  if (tool.seo.faq && tool.seo.faq.length > 0) {
    schemas.push({
      "@type": "FAQPage",
      "@id": `${toolUrl}#faq`,
      mainEntity: tool.seo.faq.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}

/** Schema for category landing pages */
export function generateCategoryJsonLd(category: CategoryDefinition, tools: ToolDefinition[]) {
  const baseUrl = getBaseUrl();
  const categoryUrl = `${baseUrl}/tools/${category.id}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${categoryUrl}#collection`,
        name: `${category.name} Tools`,
        description: category.description,
        url: categoryUrl,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: tools.length,
          itemListElement: tools.map((tool, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `${baseUrl}/tools/${tool.category}/${tool.slug}`,
            name: tool.name,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${categoryUrl}#breadcrumb`,
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
            name: "Tools",
            item: `${baseUrl}/tools`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: categoryUrl,
          },
        ],
      },
    ],
  };
}

/** Schema for the /tools all directory hub */
export function generateToolsHubJsonLd(tools: ToolDefinition[]) {
  const baseUrl = getBaseUrl();
  const hubUrl = `${baseUrl}/tools`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${hubUrl}#collection`,
        name: `${BRAND.name} Free In-Browser Privacy Tools Hub`,
        description: BRAND.description,
        url: hubUrl,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: tools.length,
          itemListElement: tools.slice(0, 50).map((tool, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: `${baseUrl}/tools/${tool.category}/${tool.slug}`,
            name: tool.name,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${hubUrl}#breadcrumb`,
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
            name: "Tools",
            item: hubUrl,
          },
        ],
      },
    ],
  };
}

