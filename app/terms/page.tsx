import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: `Terms of Service — ${BRAND.name}`,
  description:
    `Review the Terms of Service for ${BRAND.name}. Learn about our 100% free web utilities, user content ownership, client-side architecture, and privacy-first commitments.`,
  keywords: [
    "Cleartrix terms of service",
    "free web tools terms",
    "content ownership",
    "client-side privacy terms",
  ],
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-slate-900 dark:selection:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-blue-50/40 via-slate-50/60 to-white dark:from-blue-950/20 dark:via-slate-900/40 dark:to-slate-950 py-14 sm:py-18 relative overflow-hidden border-b border-slate-100 dark:border-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Legal Documentation</span>
            </div>
            <h1 className="font-headings text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="font-body text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-medium">
              Effective Date: September 2026 • {BRAND.name} Platform & {BRAND.resumeProduct.name}
            </p>
          </div>
        </section>

        {/* Content Container */}
        <section className="py-12 sm:py-16 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10 font-body text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed">
            
            {/* Quick Summary Box */}
            <div className="rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 p-5 sm:p-6 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-base">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Summary in Plain English</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {BRAND.name} is 100% free with no hidden paywalls. You own 100% of your documents, files, data, and exported content. Because {BRAND.name} runs locally in your web browser, we do not store, view, or sell your personal data.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                By accessing or using {BRAND.name} (&quot;the Service&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) at {BRAND.domain} or any associated domains, you agree to be bound by these Terms of Service. If you do not agree to these Terms, please do not access or use the application.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                2. Free Service & Zero-Paywall Commitment
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {BRAND.name} is provided to you completely free of charge. We do not require payment, credit card numbers, trial sign-ups, or subscriptions to access tools, features, customization options, or document downloads. We reserve the right to introduce optional, non-intrusive value-added features in the future, but our core promise of providing free, unlocked client-side tools will remain intact.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                3. Ownership of Your Content
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                You retain complete and exclusive ownership of all text, data, information, job history, qualifications, and files that you input into {BRAND.name} (&quot;User Content&quot;).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                <li>We claim no intellectual property rights over your content or uploaded files.</li>
                <li>Any PDF, print, or text document exported from {BRAND.name} is 100% yours to distribute, print, submit to employers, or publish as you see fit.</li>
                <li>Because your files are processed in your client browser, {BRAND.name} does not claim any license to store, inspect, or reuse your personal information.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                4. Client-Side Operation & User Responsibility
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {BRAND.name} operates primarily as a client-side web application. This means:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                <li>Your drafts and session states are saved locally in your browser&apos;s <code className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded text-xs font-mono text-slate-800 dark:text-slate-200">localStorage</code>.</li>
                <li>Clearing your browser cache or cookies, or using private/incognito browsing modes, may permanently remove your locally saved data unless you export your document or maintain a separate backup.</li>
                <li>You are solely responsible for keeping backups of your documents and information.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                5. Acceptable Use
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                You agree not to use {BRAND.name} to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                <li>Violate any applicable local, national, or international law.</li>
                <li>Create documents containing fraudulent, defamatory, or intentionally deceptive credentials.</li>
                <li>Attempt to reverse-engineer, compromise, or overload the application infrastructure.</li>
                <li>Automate requests or scrape the application using unauthorized bots or automated scripts.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                6. Disclaimer of Warranties
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {BRAND.name} is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. While our calculators, converters, and resume templates are designed and verified against standard specifications, we do not guarantee specific employment, financial, or tax outcomes resulting from their use.
              </p>
            </div>

            {/* Section 7 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                7. Limitation of Liability
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                To the maximum extent permitted by applicable law, {BRAND.name} and its contributors shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service, including data loss due to browser storage resets.
              </p>
            </div>

            {/* Section 8 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                8. Modifications to Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                We reserve the right to revise these Terms of Service at any time. Changes become effective immediately upon posting to this page. Your continued use of {BRAND.name} signifies your acceptance of any updated terms.
              </p>
            </div>

            {/* Section 9 */}
            <div className="space-y-3">
              <h2 className="font-headings text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                9. Contact
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                If you have questions regarding these Terms of Service, please reach out via our official repository or contact channels.
              </p>
            </div>

            {/* Call to action */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center space-y-4">
              <Link href="/tools">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm gap-2">
                  Explore Free Tools Directory <ArrowRight className="h-4 w-4" />
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
            <Link href="/tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tools</Link>
            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link href="/editor" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Resume Builder</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
