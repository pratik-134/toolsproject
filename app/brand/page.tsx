import { BrandLogoPresentation } from "@/components/brand/BrandLogoPresentation";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Brand Guidelines & Logo System | Cleartrix",
  description:
    "Official brand assets, vector logo marks, color tokens, and typography guidelines for Cleartrix.",
};

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <BrandLogoPresentation />
      </main>
    </div>
  );
}
