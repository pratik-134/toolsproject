/**
 * app/admin/login/page.tsx
 * Public admin login page — accessible without a session.
 */

import { Metadata } from "next";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-lg mb-3">
            M
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Mindkit Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage blog posts</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
