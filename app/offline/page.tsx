import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { WifiOff, RotateCcw, FileText, Wrench, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Offline Mode",
  description: "Cleartrix works offline. All client-side tools run in-memory inside your browser with zero network required.",
};

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
            Offline Mode Active
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            You appear to be disconnected from the internet, but {BRAND.name} is built privacy-first for offline execution.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% In-Browser RAM Execution</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All cached document processors, PDF utilities, calculators, and developer tools run entirely on your device with zero server dependency. Any tool you have already visited remains fully functional.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/tools"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Wrench className="w-4 h-4" />
            <span>Browse Cached Tools</span>
          </Link>

          <Link
            href="/editor"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Open Resume Builder</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
