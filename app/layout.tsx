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
    "qwertygen",
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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${BRAND.name} — ${BRAND.tagline}`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: ["/og-image.png"],
    creator: BRAND.twitterHandle,
  },
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/icon.svg?v=3", type: "image/svg+xml" },
      { url: "/icon.png?v=3", type: "image/png" },
      { url: "/favicon.png?v=3", type: "image/png" },
      { url: "/favicon.ico?v=3" },
    ],
    shortcut: "/favicon.svg?v=3",
    apple: [
      { url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
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

import { ThemeProvider } from "@/components/theme-provider";
import { PwaProvider } from "@/components/pwa/PwaProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var t = localStorage.getItem('qg_theme') || localStorage.getItem('ct_theme');
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-body antialiased selection:bg-blue-500/20 selection:text-slate-900 dark:selection:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <PwaProvider>
            <ToastProvider>{children}</ToastProvider>
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
