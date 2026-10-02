import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CleartrixLogo } from "@/components/BrandLogo";
import { BrandNewHeroBanner } from "@/components/landing/BrandNewHeroBanner";
import { ToolsMegaSection } from "@/components/landing/ToolsMegaSection";
import { LandingTemplatesSection } from "@/components/landing/LandingTemplatesSection";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { RESUME_FAQS, TOOLS_FAQS } from "@/components/landing/faq-data";
import { AiAssistantShowcase } from "@/components/landing/AiAssistantShowcase";
import { AtsAnalyzerPreview } from "@/components/landing/AtsAnalyzerPreview";
import { AnimatedBannerBackground } from "@/components/landing/AnimatedBannerBackground";
import { ModernWaveDivider } from "@/components/ui/ModernWaveDivider";
import { Reveal } from "@/components/ui/reveal";
import {
  GridPattern,
  DotPattern,
  Glow,
  FloatingBadge,
  DiagonalDecoration,
} from "@/components/ui/patterns";
import {
  ShieldCheck,
  Download,
  CheckCircle2,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Cpu,
  Lock,
  HelpCircle,
  Layers,
  HardDrive,
  FileUp,
} from "lucide-react";

import { getAllTools } from "@/lib/registry/tools";
import { generateWebApplicationSchema, generateFAQPageSchema } from "@/lib/seo/jsonld";

export default function HomePage() {
  const totalTools = getAllTools().length;
  const webAppSchema = generateWebApplicationSchema();
  const faqSchema = generateFAQPageSchema([...RESUME_FAQS, ...TOOLS_FAQS]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 text-text-primary selection:bg-blue-500/20 selection:text-slate-900">
      {/* Structured Data JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Navigation Header — Floating Rounded Sticky Menu */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* 2. Fully Brand New Centered Modern SaaS Hero Banner */}
        <BrandNewHeroBanner />

        {/* ========================================================================= */}
        {/* 2. In-Browser Tools Mega-Section (111+ Client-Side Tools)                 */}
        {/* ========================================================================= */}
        <ToolsMegaSection />

        {/* ========================================================================= */}
        {/* 3. Template Showcase Section — Crisp White Canvas with Category Filters   */}
        {/* ========================================================================= */}
        <section
          id="templates"
          className="scroll-mt-20 sm:scroll-mt-24 bg-gradient-to-b from-blue-50/40 via-slate-50/60 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 py-section-py-mob md:py-section-py-tab lg:py-section-py relative overflow-hidden"
        >
          <GridPattern size={56} strokeOpacity={0.025} strokeColor="#3B82F6" />

          {/* Ambient Glow Pool */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10">
            <Reveal variant="fade-up">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-section-mb-mob md:mb-12 lg:mb-section-mb gap-6">
                <div>
                  <span className="font-body text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-900/90 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>20 hand-crafted styles · Recruiter-tested & ATS-safe</span>
                  </span>
                  <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900 dark:text-slate-100">
                    Designed for recruiters, tested against ATS parsers.
                  </h2>
                  <p className="font-body text-subtitle text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                    Choose from 20 distinct design styles. Switch templates at any point
                    without losing a single word of your data.
                  </p>
                </div>

                <Link href="/editor">
                  <Button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg px-6 py-3 font-bold gap-2 shadow-xs hover:shadow-md shrink-0 transition-all">
                    Open All in Editor <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Reveal>

            {/* Interactive Template Filter Pills & Live Grid */}
            <Reveal variant="fade-up" delay={100}>
              <LandingTemplatesSection />
            </Reveal>
          </div>
        </section>

        {/* Dynamic Zig-Zag Section Wave Divider */}
        <ModernWaveDivider variant="zigzag" fillColor="fill-slate-50/70" className="dark:hidden" />

        {/* ========================================================================= */}
        {/* 4. Comparison Section — High-Impact Dark Navy & Vibrant Accent Feature    */}
        {/* ========================================================================= */}
        <section
          id="comparison"
          className="scroll-mt-20 sm:scroll-mt-24 bg-[#0F172A] text-white py-section-py-mob md:py-section-py-tab lg:py-section-py relative overflow-hidden"
        >
          <DotPattern size={24} dotOpacity={0.08} dotColor="#38BDF8" />

          {/* Luminous Mesh Glow Behind Table */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-r from-blue-600/25 via-teal-500/15 to-sky-400/20 blur-3xl" />

          <div className="max-w-container mx-auto px-4 sm:px-6 text-center relative z-10">
            <Reveal variant="fade-up">
              <div className="mb-section-mb-mob md:mb-12 lg:mb-section-mb max-w-3xl mx-auto space-y-3">
                <span className="font-body text-xs font-semibold text-cyan-300 bg-blue-500/20 border border-blue-500/30 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>The honest truth · Why job seekers leave traditional builders</span>
                </span>
                <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-white font-black tracking-tight">
                  Why job seekers are ditching traditional resume builders.
                </h2>
                <p className="font-body text-subtitle text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Most resume tools lure you with "free" templates, only to demand credit
                  cards, subscriptions, or slap huge watermarks when you try to download.
                  Cleartrix Resume Builder is genuinely 100% free.
                </p>
              </div>
            </Reveal>

            {/* Comparison Table Card */}
            <Reveal variant="fade-up" delay={150}>
              <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] text-left backdrop-blur-md">
                {/* Mobile Card-Based Comparison (< sm) */}
                <div className="block sm:hidden divide-y divide-slate-800">
                  {[
                    {
                      feature: "PDF Download",
                      cleartrix: "Free & Unlimited Vector PDF",
                      others: "Paywalled or recurring subscription ($24/mo)",
                    },
                    {
                      feature: "Template Access",
                      cleartrix: "All 20+ Templates Unlocked",
                      others: "Most designs locked behind pro paywall",
                    },
                    {
                      feature: "Watermarks",
                      cleartrix: "Zero watermarks on any export",
                      others: "Branding watermarks on free tier",
                    },
                    {
                      feature: "Account Required",
                      cleartrix: "None. Open & build immediately",
                      others: "Mandatory email registration & tracking",
                    },
                    {
                      feature: "Data Privacy",
                      cleartrix: "Saved privately on your device",
                      others: "Resume data stored on external servers",
                    },
                    {
                      feature: "ATS Compliance",
                      cleartrix: "100% Parser-Tested Single Column & Layouts",
                      others: "Complex multi-column layouts can fail ATS parsers",
                    },
                  ].map((row, idx) => (
                    <div key={idx} className="p-4 space-y-2.5 bg-slate-900/90">
                      <div className="font-headings text-sm font-bold text-white">
                        {row.feature}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2 bg-blue-500/15 border border-blue-500/30 rounded-lg p-2.5">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[3] mt-0.5" />
                          <div className="text-xs">
                            <span className="font-bold text-cyan-300 block mb-0.5">Cleartrix</span>
                            <span className="text-slate-200 font-medium">{row.cleartrix}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
                          <X className="h-4 w-4 text-red-400 shrink-0 stroke-[2.5] mt-0.5" />
                          <div className="text-xs">
                            <span className="font-medium text-slate-400 block mb-0.5">Others</span>
                            <span className="text-slate-400">{row.others}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop / Tablet Table (>= sm) */}
                <div className="hidden sm:block overflow-x-auto">
                  <div className="min-w-full">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 bg-slate-800/90 text-white border-b border-slate-700/80 p-4 font-headings text-xs font-bold uppercase tracking-wider">
                      <div className="col-span-4 text-slate-300">Feature</div>
                      <div className="col-span-4 text-cyan-300 font-extrabold flex items-center gap-2 bg-blue-600/20 -my-4 py-4 px-3 border-x border-blue-500/30">
                        <span>Cleartrix</span>
                        <span className="rounded-md bg-emerald-500 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
                          100% Free
                        </span>
                      </div>
                      <div className="col-span-4 text-slate-400 pl-3">
                        Subscription-Based Builders
                      </div>
                    </div>

                    {/* Table Rows */}
                    {[
                      {
                        feature: "PDF Download",
                        cleartrix: "Free & Unlimited Vector PDF",
                        others: "Paywalled or recurring subscription ($24/mo)",
                      },
                      {
                        feature: "Template Access",
                        cleartrix: "All 20+ Templates Unlocked",
                        others: "Most designs locked behind pro paywall",
                      },
                      {
                        feature: "Watermarks",
                        cleartrix: "Zero watermarks on any export",
                        others: "Branding watermarks on free tier",
                      },
                      {
                        feature: "Account Required",
                        cleartrix: "None. Open & build immediately",
                        others: "Mandatory email registration & tracking",
                      },
                      {
                        feature: "Data Privacy",
                        cleartrix: "Saved privately on your device",
                        others: "Resume data stored on external servers",
                      },
                      {
                        feature: "ATS Compliance",
                        cleartrix: "100% Parser-Tested Single Column & Layouts",
                        others: "Complex multi-column layouts can fail ATS parsers",
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 p-4 items-center text-sm border-b border-slate-800/60 last:border-0 ${
                          idx % 2 === 0 ? "bg-slate-900/90" : "bg-slate-800/40"
                        }`}
                      >
                        <div className="col-span-4 font-headings text-sm font-semibold text-white">
                          {row.feature}
                        </div>
                        <div className="col-span-4 font-body font-bold text-white flex items-center gap-2 bg-blue-600/15 -my-4 py-4 px-3 border-x border-blue-500/20">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[3]" />
                          <span className="text-slate-100">{row.cleartrix}</span>
                        </div>
                        <div className="col-span-4 font-body text-xs text-slate-400 flex items-center gap-2 pl-3">
                          <X className="h-4 w-4 text-red-400 shrink-0 stroke-[2.5]" />
                          <span>{row.others}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Cost Contrast Callout */}
                <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-slate-300 font-medium text-center sm:text-left">
                    Average competitor subscription:{" "}
                    <strong className="text-red-400">$24.95 / month</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-xs">
                    Cleartrix: $0.00 forever
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>



        {/* ========================================================================= */}
        {/* 5. Why Cleartrix: Features Bento & AI Bullet Enhancer Live Demo            */}
        {/* ========================================================================= */}
        <section
          id="features"
          className="scroll-mt-20 sm:scroll-mt-24 bg-gradient-to-b from-white via-slate-50/70 to-blue-50/20 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 text-slate-900 dark:text-slate-100 py-section-py-mob md:py-section-py-tab lg:py-section-py relative overflow-hidden"
        >
          <DotPattern size={28} dotOpacity={0.035} dotColor="#0F172A" />

          {/* Ambient Glow */}
          <div className="pointer-events-none absolute bottom-0 left-10 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10 space-y-12">
            {/* Section Header */}
            <Reveal variant="fade-up">
              <div className="text-center max-w-3xl mx-auto">
                <span className="font-body text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-900/90 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Under the hood · Built for applicants, not data brokers</span>
                </span>
                <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900 dark:text-slate-100">
                  Engineered for real careers. Backed by client-side intelligence.
                </h2>
                <p className="font-body text-subtitle text-slate-600 dark:text-slate-400 mt-3">
                  Native vector PDF compilation, client-side data isolation, strict ATS compliance, and instant AI bullet point polishing—completely private on your device.
                </p>
              </div>
            </Reveal>

            {/* Part A: 4 Core Feature Bento Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Block 1: Vector PDF Engine */}
              <Reveal variant="fade-up" delay={100} className="h-full">
                <div className="rounded-2xl border border-slate-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-blue-200/60 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-headings font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Core Architecture
                      </span>
                      <h3 className="font-headings text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        In-Browser Vector PDF Compilation Engine
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Compiles print-ready vector PDF documents directly inside browser memory with pin-sharp typography and zero server latency.
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-lg p-2">
                      <span className="block text-blue-600 dark:text-blue-400 font-headings text-sm font-bold font-mono">0 ms</span>
                      Server Wait
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-lg p-2">
                      <span className="block text-blue-600 dark:text-blue-400 font-headings text-sm font-bold font-mono">300 DPI</span>
                      Resolution
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-lg p-2">
                      <span className="block text-blue-600 dark:text-blue-400 font-headings text-sm font-bold font-mono">A4</span>
                      Print Standard
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-lg p-2">
                      <span className="block text-blue-600 dark:text-blue-400 font-headings text-sm font-bold">Embedded</span>
                      Web Fonts
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Block 2: 100% Privacy by Default */}
              <Reveal variant="fade-up" delay={150} className="h-full">
                <div className="rounded-2xl border border-slate-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-blue-200/60 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-headings font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Client-Side Isolation
                      </span>
                      <h3 className="font-headings text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        <span className="font-mono">100%</span> Privacy by Default
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Your personal contact info, achievements, and drafts remain isolated in local device storage—never uploaded to external servers.
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 px-2.5 py-1 rounded-full text-[11px]">
                      <span className="font-mono">0 Bytes</span> uploaded
                    </span>
                    <span className="font-body text-[11px] font-medium text-slate-500 dark:text-slate-400">Local Sandbox Architecture</span>
                  </div>
                </div>
              </Reveal>

              {/* Block 3: PDF & DOCX Multi-Format */}
              <Reveal variant="fade-up" delay={200} className="h-full">
                <div className="rounded-2xl border border-slate-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-blue-200/60 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                      <FileUp className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-headings font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Document Interoperability
                      </span>
                      <h3 className="font-headings text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        PDF & DOCX Export & Import
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Import and export between vector-clean PDF and editable Word (.docx) formats with lossless layout fidelity.
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 px-2.5 py-1 rounded-full text-[11px]">
                      Bi-directional DOCX & PDF
                    </span>
                    <span className="font-body text-[11px] font-medium text-slate-500 dark:text-slate-400">Lossless Formatting</span>
                  </div>
                </div>
              </Reveal>

              {/* Block 4: Custom Sections & ATS Verification */}
              <Reveal variant="fade-up" delay={250} className="h-full">
                <div className="rounded-2xl border border-slate-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-blue-200/60 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-headings font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Applicant Tracking
                      </span>
                      <h3 className="font-headings text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        Custom Sections & ATS Verification
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Every layout adheres to standardized semantic heading hierarchies and linear text flows verified against major enterprise ATS parsers.
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 px-2.5 py-1 rounded-full text-[11px]">
                      <span className="font-mono">100%</span> parser safe
                    </span>
                    <span className="font-body text-[11px] font-medium text-slate-500 dark:text-slate-400">Custom Category Builder</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Part B: Live AI Bullet Point Enhancer Demo */}
            <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800">
              <Reveal variant="fade-up">
                <AiAssistantShowcase />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. ATS Analyzer Section — Analytical Dashboard View with Heuristics       */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-b from-blue-50/20 via-slate-50 to-emerald-50/20 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 text-slate-900 dark:text-slate-100 py-section-py-mob md:py-section-py-tab lg:py-section-py relative overflow-hidden">
          <GridPattern size={40} strokeOpacity={0.025} strokeColor="#0F172A" />

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10">
            <Reveal variant="fade-up">
              <AtsAnalyzerPreview />
            </Reveal>
          </div>
        </section>

        {/* Curved Section Wave Divider */}
        <ModernWaveDivider variant="curved" fillColor="fill-sky-50/40" className="dark:hidden" />

        {/* ========================================================================= */}
        {/* 8. Privacy Section — Light Canvas, Privacy-First Trust Pillars            */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-br from-sky-50/40 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 text-slate-900 dark:text-slate-100 py-section-py-mob md:py-section-py-tab lg:py-section-py relative overflow-hidden">
          <DotPattern size={28} dotOpacity={0.03} dotColor="#0F172A" />

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10 text-center space-y-12">
            <Reveal variant="fade-up">
              <div className="max-w-3xl mx-auto space-y-4">
                <span className="font-body text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-900/90 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Privacy by architecture · Zero servers, zero cookies</span>
                </span>
                <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900 dark:text-slate-100 font-bold">
                  Your career data belongs solely to you.
                </h2>
                <p className="font-body text-subtitle text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                  A resume contains your home address, personal phone number, employment
                  dates, and career history. We believe that data should never sit in an
                  unnecessary cloud database.
                </p>
              </div>
            </Reveal>

            {/* 3 Light Privacy Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
              <Reveal variant="fade-up" delay={100}>
                <div className="rounded-xl border border-slate-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-blue-200/60 dark:hover:border-blue-500/40 hover:shadow-md shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] transition-all space-y-3 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <h4 className="font-headings text-lg font-bold text-slate-900 dark:text-slate-100">
                    100% Local Storage
                  </h4>
                  <p className="font-body text-small text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your resume data is stored exclusively inside your own browser's
                    indexed storage. When you close the tab, your draft stays on your
                    computer.
                  </p>
                </div>
              </Reveal>

              <Reveal variant="fade-up" delay={200}>
                <div className="rounded-xl border border-slate-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-blue-200/60 dark:hover:border-blue-500/40 hover:shadow-md shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] transition-all space-y-3 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h4 className="font-headings text-lg font-bold text-slate-900 dark:text-slate-100">
                    Zero Account Registration
                  </h4>
                  <p className="font-body text-small text-slate-500 dark:text-slate-400 leading-relaxed">
                    No passwords to create or leak. No mandatory email submissions, and
                    no promotional newsletters flooding your personal inbox.
                  </p>
                </div>
              </Reveal>

              <Reveal variant="fade-up" delay={300}>
                <div className="rounded-xl border border-slate-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:border-blue-200/60 dark:hover:border-blue-500/40 hover:shadow-md shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] transition-all space-y-3 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h4 className="font-headings text-lg font-bold text-slate-900 dark:text-slate-100">
                    Zero Data Brokerage
                  </h4>
                  <p className="font-body text-small text-slate-500 dark:text-slate-400 leading-relaxed">
                    We never scrape, analyze, or sell your professional information to
                    recruiters, third-party advertisers, or external AI models.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. FAQ Section — SEO & Trust Optimized Editorial Layout                  */}
        {/* ========================================================================= */}
        <section
          id="faq"
          className="scroll-mt-20 sm:scroll-mt-24 py-section-py-mob md:py-section-py-tab lg:py-section-py bg-gradient-to-b from-slate-50/80 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 relative overflow-hidden"
        >
          <div className="max-w-container mx-auto px-4 sm:px-6 space-y-12">
            {/* Header */}
            <Reveal variant="fade-up">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800 px-3.5 py-1 font-body text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Common questions · Clear, straight answers</span>
                </span>
                <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900 dark:text-slate-100 [&>span]:text-blue-600 dark:[&>span]:text-blue-400">
                  Everything you need to know about <span>Cleartrix</span>
                </h2>
                <p className="font-body text-body text-slate-600 dark:text-slate-400 leading-relaxed">
                  Clear, transparent answers. No hidden terms, no bait-and-switch billing,
                  and zero marketing gimmicks.
                </p>
              </div>
            </Reveal>

            {/* Interactive Tabbed FAQ Component */}
            <LandingFaq />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. Bottom CTA Banner — Sleek High-Impact Canvas                          */}
        {/* ========================================================================= */}
        <section className="bg-[#0F172A] text-white py-16 sm:py-24 text-center relative overflow-hidden">
          {/* Subtle Ambient Mesh Glow */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-gradient-to-r from-blue-600/20 via-sky-500/15 to-teal-400/15 blur-3xl" />

          <div className="max-w-container mx-auto px-4 sm:px-6 space-y-6 relative z-10">
            <Reveal variant="fade-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-500/30 px-4 py-1.5 font-body text-xs font-semibold text-cyan-300 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Start in seconds · No account or payment needed</span>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100}>
              <h2 className="font-headings text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white [&>span]:text-wordmark-grad tracking-tight max-w-2xl mx-auto">
                Ready to create your <span>job-winning</span> resume?
              </h2>
            </Reveal>

            <Reveal variant="fade-up" delay={200}>
              <p className="font-body text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
                No credit card. No paywall. Jump straight into the editor and download
                your free vector PDF in minutes.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={300}>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Link href="/editor">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-8 py-3.5 rounded-xl min-h-[48px] text-base font-bold shadow-lg hover:shadow-blue-500/25 transition-all gap-2"
                  >
                    Build Your Resume Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-slate-800 hover:bg-slate-700 text-white hover:text-white border-slate-700 hover:border-slate-600 px-7 py-3.5 rounded-xl min-h-[48px] text-base font-semibold shadow-xs gap-2 transition-all"
                  >
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    <span>Explore {totalTools} Tools</span>
                  </Button>
                </Link>
                <a href="#templates">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-slate-300 hover:text-white hover:bg-slate-800/90 px-6 py-3.5 rounded-xl min-h-[48px] text-base font-medium transition-all"
                  >
                    <span>Browse 20+ Templates</span>
                  </Button>
                </a>
              </div>
            </Reveal>

            {/* Bottom Proof Tagline */}
            <Reveal variant="fade-up" delay={400}>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Free Forever
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> No Registration
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Instant Vector PDF
                </span>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Global Cleartrix Footer */}
      <Footer />

      {/* Google Structured Data / JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "name": "Cleartrix Resume Builder",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web browser",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                },
                "description":
                  "Free, privacy-first ATS resume and CV builder with zero paywalls, 20+ templates, and instant vector PDF export.",
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  ...RESUME_FAQS.map((faq) => ({
                    "@type": "Question",
                    "name": faq.q,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": faq.a,
                    },
                  })),
                  ...TOOLS_FAQS.map((faq) => ({
                    "@type": "Question",
                    "name": faq.q,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": faq.a,
                    },
                  })),
                ],
              },
            ],
          }),
        }}
      />
    </div>
  );
}
