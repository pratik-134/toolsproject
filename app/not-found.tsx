import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { FileQuestion, Wrench, Sparkles, Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body selection:bg-blue-500/20">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Badge & Icon */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 shadow-md">
              <FileQuestion className="w-10 h-10" strokeWidth={1.75} />
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Error 404
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-3">
            <h1 className="font-headings text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Page Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-medium">
              The page or tool URL you requested does not exist or may have been moved. Everything else on {BRAND.name} remains operational.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/tools" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full gap-2 font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl h-11 px-6 text-sm shadow-md transition-all"
              >
                <Wrench className="h-4 w-4" />
                <span>Explore All Tools</span>
              </Button>
            </Link>

            <Link href="/editor" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl h-11 px-6 text-sm transition-all"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Resume Builder</span>
              </Button>
            </Link>

            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="lg"
                className="w-full gap-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl h-11 px-5 text-sm transition-all"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
