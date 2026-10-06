import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, ArrowRight, EyeOff } from "lucide-react";
import { TOOLS_COUNT_DISPLAY } from "@/lib/registry/tools";

import { constructToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = constructToolMetadata({
  title: `Privacy Policy — ${BRAND.name} & ${BRAND.resumeProduct.name}`,
  description:
    `${BRAND.name} is built on a 100% client-side privacy architecture. Learn how our platform guarantees zero server storage of user files, no tracking cookies, and complete local execution.`,
  slug: "/privacy",
  keywords: [
    "qwertygen privacy policy",
    "private web tools",
    "client-side privacy",
    "gdpr compliant tools",
    "no tracking resume builder",
  ],
});

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-slate-900 dark:selection:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-blue-50/40 via-slate-50/60 to-white dark:from-blue-950/20 dark:via-slate-900/40 dark:to-slate-950 py-14 sm:py-18 relative overflow-hidden border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>100% Client-Side Privacy Architecture</span>
            </div>
            <h1 className="font-headings text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="font-body text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-medium">
              Effective Date: September 2026 • Privacy by Architecture, Not Just by Policy
            </p>
          </div>
        </section>

        {/* Content Container */}
        <section className="py-12 sm:py-16 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10 font-body text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed">
            {/* Quick Summary Box */}
            <div className="rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 p-5 sm:p-6 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-base">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Our Privacy Promise</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {BRAND.name} was intentionally engineered so that we <strong className="text-slate-900 dark:text-white">cannot</strong> see, store, or sell your documents, text, or files. When you create, edit, calculate, or convert files across our {TOOLS_COUNT_DISPLAY} live tools and {BRAND.resumeProduct.name}, all computation happens locally inside your browser sandbox. No user content is ever transmitted to or stored on our servers.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                1. Architectural Overview: How Your Data is Handled
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Traditional online utility platforms send your documents, employment history, financial details, and code snippets to centralized cloud servers where they are vulnerable to breaches, AI training scraping, and tracking.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {BRAND.name} replaces this model with <strong className="text-slate-900 dark:text-white">client-side local execution</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                <li>
                  <strong>Multiple Resumes & Local Storage:</strong> All resumes, titles, and index metadata are saved directly in your browser using standard HTML5 <code className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-xs font-mono text-slate-800 dark:text-slate-200">localStorage</code> (<code className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-xs font-mono text-slate-800 dark:text-slate-200">{BRAND.storagePrefix}resumes_index</code> and individual records). You can create, switch, and duplicate documents with zero account registration.
                </li>
                <li>
                  <strong>Local In-Browser Compilers:</strong> PDF and Word (.DOCX) documents are compiled directly in your web browser using client-side vector and OOXML rendering engines. Your files never touch a cloud conversion API.
                </li>
                <li>
                  <strong>File Processing:</strong> JSON formatting, Base64 conversion, word analysis, and document parsing run 100% in-memory using Web Workers and HTML5 APIs.
                </li>
                <li>
                  No user content, files, personal identifiers, or inputs are transmitted over the network to any database owned by {BRAND.name}.
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                2. Data We Do NOT Collect
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <EyeOff className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Personal Identifiers
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">We do not collect names, phone numbers, home addresses, or social media handles.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <EyeOff className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Uploaded Files
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Files and inputs are processed exclusively in your machine&apos;s RAM.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <EyeOff className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Financial Information
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">We never ask for credit cards, billing addresses, or payment credentials.</p>
                </div>
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <EyeOff className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Passwords & Accounts
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">You do not need an account or password to use our client-side tools.</p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                3. Cookies and Local Storage
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {BRAND.name} does not use third-party advertising cookies, behavioral tracking scripts, or cross-site fingerprinting mechanisms.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                <li>
                  <strong className="text-slate-900 dark:text-white">Local Storage:</strong> We use browser <code className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-xs font-mono text-slate-800 dark:text-slate-200">localStorage</code> solely to preserve your documents and settings locally on your device so your work is not lost between visits.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">No Ad Networks:</strong> We do not deploy third-party advertising tracking pixels or retargeting beacons.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                4. Third-Party Infrastructure
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                To deliver our web application globally with sub-second speeds, {BRAND.name} relies on standard content delivery networks (CDNs). These providers may process standard technical server logs (such as IP addresses and browser user-agents) strictly for network security and DDoS mitigation.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                5. How to Delete Your Data
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Because your data is stored exclusively in your browser, you have complete control over its deletion at any time by clearing your browser site data or cookies.
              </p>
            </div>

            {/* Call to action */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center space-y-4">
              <Link href="/editor">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm gap-2">
                  Open {BRAND.resumeProduct.name} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Streamlined Footer */}
      <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 py-8 font-body text-xs">
        <div className="max-w-container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-headings font-bold text-slate-900 dark:text-white">{BRAND.name}</span>
            <span className="text-slate-500 dark:text-slate-400">— {BRAND.tagline}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
            <Link href="/tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">All Tools</Link>
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
            <Link href="/editor" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Start Builder</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
