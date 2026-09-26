import React from "react";
import Link from "next/link";
import { MindkitLogo } from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";
import { Lock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/design-tokens";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200/80 pt-16 pb-12 font-body text-xs sm:text-small">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Column 1: Brand & Privacy Commitment */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <MindkitLogo size={32} isLight={false} />
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed">
              {BRAND.description}
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-[11px] text-blue-900 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>100% Client-Side Sandbox</span>
            </div>
            <div className="pt-1">
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>Browse All 111 Tools</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Column 2: PDF & Document Suite */}
          <div className="space-y-3">
            <h4 className="font-headings text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS.pdf.primary }}
                aria-hidden="true"
              />
              <span>PDF & Documents</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/tools/document-pdf/docx-to-pdf" className="hover:text-slate-900 hover:underline transition-colors">
                  Word DOCX to PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/pdf-to-docx" className="hover:text-slate-900 hover:underline transition-colors">
                  PDF to Word DOCX
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/excel-to-pdf" className="hover:text-slate-900 hover:underline transition-colors">
                  Excel CSV to PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/powerpoint-to-pdf" className="hover:text-slate-900 hover:underline transition-colors">
                  PowerPoint to PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/pdf-merger" className="hover:text-slate-900 hover:underline transition-colors">
                  PDF Merger
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/pdf-splitter" className="hover:text-slate-900 hover:underline transition-colors">
                  PDF Splitter
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/pdf-annotator" className="hover:text-slate-900 hover:underline transition-colors">
                  PDF Vector Annotator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Image Studio & Codes */}
          <div className="space-y-3">
            <h4 className="font-headings text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS.image.primary }}
                aria-hidden="true"
              />
              <span>Images & Codes</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/tools/image/favicon-generator" className="hover:text-slate-900 hover:underline transition-colors">
                  Favicon Generator
                </Link>
              </li>
              <li>
                <Link href="/tools/image/batch-image-compressor" className="hover:text-slate-900 hover:underline transition-colors">
                  Batch Image Compressor
                </Link>
              </li>
              <li>
                <Link href="/tools/image/image-watermarker" className="hover:text-slate-900 hover:underline transition-colors">
                  Image Watermarker
                </Link>
              </li>
              <li>
                <Link href="/tools/image/svg-minifier" className="hover:text-slate-900 hover:underline transition-colors">
                  SVG XML Minifier
                </Link>
              </li>
              <li>
                <Link href="/tools/image/photo-filter-studio" className="hover:text-slate-900 hover:underline transition-colors">
                  Photo Filter Studio
                </Link>
              </li>
              <li>
                <Link href="/tools/codes/qr-generator" className="hover:text-slate-900 hover:underline transition-colors">
                  Custom QR Generator
                </Link>
              </li>
              <li>
                <Link href="/tools/codes/barcode-generator" className="hover:text-slate-900 hover:underline transition-colors">
                  Barcode Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Calculators & Security */}
          <div className="space-y-3">
            <h4 className="font-headings text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS.security.primary }}
                aria-hidden="true"
              />
              <span>Security & Math</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/tools/document-pdf/pdf-encryptor" className="hover:text-slate-900 hover:underline transition-colors">
                  PDF Password Locker
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/pdf-decryptor" className="hover:text-slate-900 hover:underline transition-colors">
                  PDF Password Remover
                </Link>
              </li>
              <li>
                <Link href="/tools/security/file-encryptor" className="hover:text-slate-900 hover:underline transition-colors">
                  AES-256 File Locker
                </Link>
              </li>
              <li>
                <Link href="/tools/calculators/auto-loan-calculator" className="hover:text-slate-900 hover:underline transition-colors">
                  Auto Loan Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/calculators/mortgage-calculator" className="hover:text-slate-900 hover:underline transition-colors">
                  Mortgage Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools/calculators/compound-interest-calculator" className="hover:text-slate-900 hover:underline transition-colors">
                  Compound Interest
                </Link>
              </li>
              <li>
                <Link href="/tools/calculators/scientific-calculator" className="hover:text-slate-900 hover:underline transition-colors">
                  Scientific Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Resume Builder & Legal */}
          <div className="space-y-3">
            <h4 className="font-headings text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS.document.primary }}
                aria-hidden="true"
              />
              <span>Builder & Trust</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/editor" className="hover:text-slate-900 hover:underline transition-colors font-medium text-slate-800">
                  ATS Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 hover:underline transition-colors">
                  Resume Dashboard
                </Link>
              </li>
              <li>
                <Link href="/tools/document-pdf/ats-resume-checker" className="hover:text-slate-900 hover:underline transition-colors">
                  ATS Scanner & Auditor
                </Link>
              </li>
              <li>
                <Link href="/brand" className="hover:text-slate-900 hover:underline transition-colors">
                  Brand Guidelines
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900 hover:underline transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900 hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Zero Tracking Cookies</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Mindkit. All 111 web tools execute 100% in-browser with zero server tracking.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/tools" className="hover:text-blue-600 transition-colors font-semibold text-blue-600">
              All 111 Tools
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">
              Terms
            </Link>
            <Link href="/brand" className="hover:text-blue-600 transition-colors">
              Brand
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
