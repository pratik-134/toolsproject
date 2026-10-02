import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `My Resumes & Documents Dashboard | ${BRAND.name}`,
  description:
    "Manage your client-side resume drafts, documents, and exported files securely in private browser storage.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
