import React from "react";
import Link from "next/link";
import { QwertygenLogo } from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";
import { ShieldCheck, Cpu, Lock, Sparkles } from "lucide-react";
import { getAllTools, TOOLS_COUNT_LABEL } from "@/lib/registry/tools";

export const Footer: React.FC = () => {

  return (
    <footer className="relative bg-slate-50/80 dark:bg-[#070B14] border-t border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 overflow-hidden">
      {/* Ambient Top Glow Effect */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-36 bg-gradient-to-r from-blue-500/10 via-cyan-400/10 to-teal-400/10 dark:from-blue-600/15 dark:via-cyan-500/15 dark:to-teal-500/15 blur-3xl pointer-events-none -z-0"
      />

      {/* Subtle Top Gradient Divider Line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/30 dark:via-cyan-400/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-10">
        {/* Top Status & Feature Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 sm:pb-10 mb-8 sm:mb-10 border-b border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              All Systems Operational <span className="text-slate-400 dark:text-slate-500">·</span> 100% Client-Side Runtime
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-2xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero Cloud Uploads</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-2xs font-medium">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span>WASM & Web Workers</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 font-medium">
              <span>{TOOLS_COUNT_LABEL}</span>
            </span>
          </div>
        </div>

        {/* Main Columns Grid - Optimized for Mobile Screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 sm:gap-6 lg:gap-10">
          {/* Brand Info Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block transition-transform hover:opacity-90">
              <QwertygenLogo size={28} isLight={false} />
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              The high-performance, private in-browser utility suite. Convert, format, manipulate, and secure documents, code, and media without uploading data to external servers.
            </p>
            <div className="pt-1 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-medium tracking-tight text-slate-600 dark:text-slate-300">
                  Client Memory Isolation Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-[11px] font-medium tracking-tight text-slate-600 dark:text-slate-300">
                  Zero Tracking Cookies
                </span>
              </div>
            </div>
          </div>

          {/* Column 1: Document & PDF */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              PDF & Documents
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/tools/document-pdf/pdf-editor"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group"
                >
                  <span>PDF Editor Studio</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold group-hover:bg-blue-200 transition-colors">
                    PRO
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/docx-to-pdf" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  DOCX to PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/pdf-to-docx" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  PDF to DOCX
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/pdf-merger" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  PDF Merger
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/pdf-compressor" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  PDF Compressor
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/direct-markdown-editor" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Markdown Editor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Developer Studio */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Developer Studio
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tools/developer/json-formatter" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  JSON Formatter & Diff
                </Link>
              </li>
              <li>
                <Link href="/tools/developer/sql-formatter" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  SQL Formatter
                </Link>
              </li>
              <li>
                <Link href="/tools/developer/code-minifier" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Code Minifier
                </Link>
              </li>
              <li>
                <Link href="/tools/developer/regex-tester" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Regex Tester
                </Link>
              </li>
              <li>
                <Link href="/tools/developer/jwt-decoder" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  JWT Decoder
                </Link>
              </li>
              <li>
                <Link href="/tools/developer/code-snapshot-studio" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Code Snapshot Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Media & Graphics */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Media & Graphics
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tools/image/batch-image-compressor" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Image Compressor
                </Link>
              </li>
              <li>
                <Link href="/tools/image/image-background-remover" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Background Remover
                </Link>
              </li>
              <li>
                <Link href="/tools/image/favicon-generator" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Favicon Generator
                </Link>
              </li>
              <li>
                <Link href="/tools/image/image-watermarker" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Image Watermarker
                </Link>
              </li>
              <li>
                <Link href="/tools/image/css-mesh-gradient-generator" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Mesh Gradient Studio
                </Link>
              </li>
              <li>
                <Link href="/tools/codes/qr-generator" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Custom QR Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Legal */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Platform & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/editor"
                  className="font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group"
                >
                  <span>ATS Resume Builder</span>
                  <Sparkles className="w-3 h-3 text-amber-500 group-hover:scale-110 transition-transform" />
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Directory ({TOOLS_COUNT_LABEL})
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/brand" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Brand Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar (Clean mobile stack + no git icon per user instructions) */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span>© {new Date().getFullYear()} {BRAND.name}.</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>All web tools execute 100% in-browser with zero server tracking.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Terms
            </Link>
            <Link href="/tools" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Tools
            </Link>
            <Link href="/blog" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Blog
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>Isolated Memory</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
