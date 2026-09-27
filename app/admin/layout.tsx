/**
 * app/admin/layout.tsx
 * Admin shell layout — plain, functional, distinct from public site.
 * No marketing styling, no Navbar/Footer from public site.
 */

import React from "react";
import Link from "next/link";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check session in layout (middleware handles the hard redirect, this is a safety net)
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 sm:px-6 gap-4 shrink-0">
        <Link href="/admin" className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-white text-xs font-bold">
            M
          </span>
          Admin
        </Link>

        <nav className="flex items-center gap-4 text-sm text-slate-600 ml-2">
          <Link href="/admin" className="hover:text-slate-900 transition-colors">
            Posts
          </Link>
          <Link href="/" target="_blank" className="hover:text-slate-900 transition-colors text-xs text-slate-400">
            View Site ↗
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <span>{session.email}</span>
          <AdminLogoutButton />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
