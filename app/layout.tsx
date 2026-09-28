import type { Metadata, Viewport } from "next";
import { fontClassNames } from "./fonts";
import { ToastProvider } from "@/components/ui/toast";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || BRAND.domain;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [
    "cleartrix",
    "free online tools",
    "privacy-first tools",
    "client-side pdf tools",
    "free resume builder",
    "ats resume builder",
    "json formatter",
    "base64 encoder",
    "word counter",
    "mortgage calculator",
    "qr code generator",
  ],
  authors: [{ name: `${BRAND.name} Team` }],
  creator: BRAND.name,
  publisher: BRAND.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    url: siteUrl,
    siteName: BRAND.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  robots: {
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: BRAND.name,
      url: siteUrl,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: BRAND.description,
    },
    {
      "@type": "WebApplication",
      name: BRAND.resumeProduct.name,
      url: `${siteUrl}/editor`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "100% free client-side ATS resume builder with 20 professional templates, vector PDF compilation, and native Word DOCX export.",
      featureList: [
        "20 ATS-Optimized Resume Templates",
        "100% Client-Side Privacy",
        "Vector A4 PDF Export",
        "Native Word (.docx) Export",
        "PDF and Word Resume Import",
        "Real-time Preview",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontClassNames}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-surface-white font-body antialiased text-text-primary selection:bg-blue-500/20 selection:text-slate-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
