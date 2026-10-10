import { BrandLogoPresentation } from "@/components/brand/BrandLogoPresentation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { constructToolMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = constructToolMetadata({
  title: "Brand Guidelines & Logo System",
  description:
    "Official brand assets, vector logo marks, color tokens, and typography guidelines for Qwertygen.",
  slug: "/brand",
  keywords: [
    "Qwertygen brand assets",
    "Qwertygen logos",
    "vector brand kit",
    "color tokens",
  ],
});

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <BrandLogoPresentation />
      </main>
      <Footer />
    </div>
  );
}
