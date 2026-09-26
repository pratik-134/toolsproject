import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MindkitLogo } from "@/components/BrandLogo";
import { LandingHeroActions } from "@/components/landing/LandingHeroActions";
import { HeroToolSearch } from "@/components/landing/HeroToolSearch";
import { RotatingWord } from "@/components/landing/RotatingWord";
import { TemplateSliderSection } from "@/components/landing/TemplateSliderSection";
import { LandingTemplatesSection } from "@/components/landing/LandingTemplatesSection";
import { AiAssistantShowcase } from "@/components/landing/AiAssistantShowcase";
import { AtsAnalyzerPreview } from "@/components/landing/AtsAnalyzerPreview";
import { AnimatedBannerBackground } from "@/components/landing/AnimatedBannerBackground";
import { Reveal } from "@/components/ui/reveal";
import {
  GridPattern,
  DotPattern,
  Glow,
  FloatingBadge,
  DiagonalDivider,
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
  FileText,
  Image as ImageIcon,
  Calculator,
  KeyRound,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-text-primary selection:bg-blue-500/20 selection:text-slate-900 overflow-x-hidden">
      {/* 1. Navigation Header — Floating Rounded Sticky Menu */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* ========================================================================= */}
        {/* 2. Hero Section — Light Neutral Canvas + Technical Grid + Soft Glow      */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-section-py-mob md:pt-section-py-tab lg:pt-section-py pb-12 sm:pb-20 bg-[radial-gradient(130%_90%_at_50%_-5%,#EEF5FF_0%,#F8FAFC_50%,#FFFFFF_100%)]">
          {/* Luminous Top Accent Hairline */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/35 to-transparent pointer-events-none z-20" />

          {/* Animated Background: Bespoke Topographic Career Elevation Waves and Ambient Glow */}
          <AnimatedBannerBackground variant="hero" />

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Value Prop & CTAs with Staggered Entrance Animations */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Trust Eyebrow Badge */}
                <Reveal variant="fade-up" delay={50}>
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3 sm:px-3.5 py-1 sm:py-1.5 font-body text-[11px] sm:text-xs font-semibold text-blue-800 shadow-xs backdrop-blur-xs max-w-full">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="truncate sm:whitespace-normal">Zero Paywalls • 100% Free Vector PDF • No Account Required</span>
                  </div>
                </Reveal>

                {/* H1 Headline */}
                <Reveal variant="fade-up" delay={150}>
                  <h1 className="font-headings text-[28px] xs:text-[34px] sm:text-hero-mobile md:text-hero-tablet lg:text-hero text-slate-900 leading-[1.14] break-words">
                    The resume builder that{" "}
                    <span className="relative inline-block text-blue-600">
                      never
                      <svg
                        className="absolute -bottom-1.5 left-0 w-full text-blue-400/50"
                        height="6"
                        viewBox="0 0 100 6"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M0 5 Q 50 0 100 5"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                        />
                      </svg>
                    </span>{" "}
                    traps your download.
                  </h1>
                </Reveal>

                {/* Subtitle & Category Breadth Rotation */}
                <Reveal variant="fade-up" delay={250}>
                  <div className="space-y-3 max-w-xl">
                    <p className="font-body text-sm sm:text-subtitle text-slate-600 leading-relaxed">
                      Build an executive-grade, ATS-optimized resume in minutes. Every
                      template, every export, and every feature is completely free—no trial
                      billing, no fake countdowns, and no paywalls when you hit download.
                    </p>
                    <RotatingWord />
                  </div>
                </Reveal>

                {/* Main Action Buttons */}
                <Reveal variant="fade-up" delay={350}>
                  <LandingHeroActions />
                </Reveal>

                {/* Proof Pills */}
                <Reveal variant="fade-up" delay={450}>
                  <div className="pt-6 flex flex-wrap items-center gap-x-5 sm:gap-x-6 gap-y-2.5 sm:gap-y-3 font-body text-xs sm:text-small text-slate-600 border-t border-slate-200/80">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-800 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>Instant High-Res Vector PDF</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-800 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>100% ATS Parser Safe</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-800 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>Private Local Storage</span>
                    </div>
                  </div>

                  {/* Secondary Quick In-Browser Tool Search */}
                  <HeroToolSearch />
                </Reveal>
              </div>

              {/* Right Column: High-Fidelity Interactive Mockup with Floating Badges */}
              <div className="lg:col-span-6 relative">
                {/* Atmospheric Ambient Glow behind Mockup */}
                <div className="pointer-events-none absolute -inset-4 sm:-inset-8 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-sky-400/15 to-transparent blur-2xl -z-10" />

                <Reveal variant="zoom-in" delay={200}>
                  {/* Floating Badge Top-Right */}
                  <div className="absolute -top-4 sm:-top-5 -right-1 sm:-right-4 z-30 hidden xs:block">
                    <FloatingBadge
                      delay="slow"
                      icon={<ShieldCheck className="h-4 w-4 text-blue-600" />}
                      title="ATS Score: 98/100"
                      subtitle="Workday & Greenhouse verified"
                    />
                  </div>

                  {/* Floating Badge Bottom-Left */}
                  <div className="absolute -bottom-4 sm:-bottom-5 -left-1 sm:-left-4 z-30 hidden xs:block">
                    <FloatingBadge
                      delay="delayed"
                      icon={<Download className="h-4 w-4 text-blue-600" />}
                      title="Vector PDF Ready"
                      subtitle="100% Free • Zero Watermarks"
                    />
                  </div>

                  {/* Main Window Mockup */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-[0_25px_60px_-15px_rgba(37,99,235,0.15),0_0_0_1px_rgba(226,232,240,0.8)] hover:shadow-[0_30px_70px_-12px_rgba(37,99,235,0.22)] transition-all duration-500">
                    {/* Window Chrome */}
                    <div className="flex items-center justify-between border-b border-slate-200 px-3.5 py-2.5 bg-slate-100/90 rounded-t-lg">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md bg-white px-3 py-0.5 text-[11px] font-sans font-medium text-slate-700 border border-slate-200 shadow-2xs">
                        <span>mindkit.dev/editor</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span>Ready</span>
                      </div>
                    </div>

                    {/* Split Inside Mockup */}
                    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 bg-slate-50/70 rounded-b-lg">
                      {/* Mockup Form Inputs (Hidden on small mobile < 640px) */}
                      <div className="hidden sm:block sm:col-span-5 space-y-2.5 text-left text-xs">
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
                          <span className="font-body text-eyebrow uppercase tracking-[1px] text-slate-500 block mb-0.5">
                            Position
                          </span>
                          <p className="font-headings text-h5 text-slate-900 font-bold">
                            Staff Software Engineer
                          </p>
                          <p className="font-body text-small text-slate-500">
                            Acme Platforms • 2021–Present
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs space-y-1">
                          <span className="font-body text-eyebrow uppercase tracking-[1px] text-slate-500 block mb-0.5">
                            Key Highlights
                          </span>
                          <p className="font-body text-[11px] text-slate-800 leading-snug">
                            • Architected microservices handling 45k req/sec.
                          </p>
                          <p className="font-body text-[11px] text-slate-800 leading-snug">
                            • Mentored team of 12 engineers across 4 time zones.
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
                          <span className="font-body text-eyebrow uppercase tracking-[1px] text-slate-500 block mb-1">
                            Core Proficiencies
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-white text-slate-700 px-2 py-0.5 rounded-[4px] font-medium text-[10px] border border-slate-200">
                              TypeScript
                            </span>
                            <span className="bg-white text-slate-700 px-2 py-0.5 rounded-[4px] font-medium text-[10px] border border-slate-200">
                              Next.js
                            </span>
                            <span className="bg-white text-slate-700 px-2 py-0.5 rounded-[4px] font-medium text-[10px] border border-slate-200">
                              PostgreSQL
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mockup A4 Preview Sheet */}
                      <div className="col-span-1 sm:col-span-7 bg-white rounded-lg border border-slate-200 p-3.5 sm:p-4 a4-paper-shadow text-left space-y-2.5 text-[10px]">
                        <div className="border-b-2 border-blue-600 pb-2">
                          <h4 className="font-headings text-h4 font-bold text-slate-900 leading-none">
                            Alex Rivera
                          </h4>
                          <p className="font-body text-[11px] font-semibold text-slate-600 mt-1">
                            Staff Software Engineer
                          </p>
                          <p className="font-body text-[9.5px] text-slate-500 mt-0.5">
                            alex@rivera.dev • San Francisco, CA • linkedin.com/in/alex
                          </p>
                        </div>
                        <div>
                          <span className="font-body text-[9px] font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-0.5 mb-1">
                            Experience
                          </span>
                          <div className="flex justify-between font-bold text-slate-900 text-[10px]">
                            <span>Staff Software Engineer — Acme</span>
                            <span className="text-slate-500 font-normal">2021–Present</span>
                          </div>
                          <p className="font-body text-[9.5px] text-slate-600 leading-snug mt-0.5">
                            Led core platform infrastructure team. Reduced P99 response times
                            by 42% through distributed caching and query indexing.
                          </p>
                        </div>
                        <div>
                          <span className="font-body text-[9px] font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-0.5 mb-1">
                            Education
                          </span>
                          <div className="flex justify-between font-bold text-slate-900 text-[10px]">
                            <span>B.S. in Computer Science — Stanford</span>
                            <span className="text-slate-500 font-normal">GPA 3.9</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. Automatically Playing Template Slider Section                          */}
        {/* ========================================================================= */}
        <TemplateSliderSection />

        {/* Diagonal Geometric Transition: Template Slider -> Comparison */}
        <DiagonalDivider
          direction="left-to-right"
          fillColor="text-slate-50/80"
          accentTint="blue"
          heightClass="h-6 sm:h-10 lg:h-12"
        />

        {/* ========================================================================= */}
        {/* 3. Comparison Section — Slate Tinted Backdrop with Elevated Column        */}
        {/* ========================================================================= */}
        <section
          id="comparison"
          className="scroll-mt-20 sm:scroll-mt-24 bg-slate-50/80 text-slate-900 py-section-py-mob md:py-section-py-tab lg:py-section-py relative"
        >
          <DotPattern size={24} dotOpacity={0.035} dotColor="#64748B" />

          <div className="max-w-container mx-auto px-4 sm:px-6 text-center relative z-10">
            <Reveal variant="fade-up">
              <div className="mb-section-mb-mob md:mb-12 lg:mb-section-mb max-w-3xl mx-auto">
                <span className="font-body text-eyebrow uppercase tracking-[1.2px] text-blue-800 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full inline-block mb-3 font-semibold shadow-2xs">
                  Transparent By Design
                </span>
                <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900">
                  Why job seekers are ditching traditional resume builders.
                </h2>
                <p className="font-body text-subtitle text-slate-600 mt-3">
                  Most resume tools lure you with "free" templates, only to demand credit
                  cards, subscriptions, or slap huge watermarks when you try to download.
                  Mindkit Resume Builder is genuinely 100% free.
                </p>
              </div>
            </Reveal>

            {/* Comparison Table Card */}
            <Reveal variant="fade-up" delay={150}>
              <div className="max-w-4xl mx-auto overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-lg text-left">
                {/* Mobile Card-Based Comparison (< sm) */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {[
                    {
                      feature: "PDF Download",
                      mindkit: "Free & Unlimited Vector PDF",
                      others: "Paywalled or recurring subscription ($24/mo)",
                    },
                    {
                      feature: "Template Access",
                      mindkit: "All 20+ Templates Unlocked",
                      others: "Most designs locked behind pro paywall",
                    },
                    {
                      feature: "Watermarks",
                      mindkit: "Zero watermarks on any export",
                      others: "Branding watermarks on free tier",
                    },
                    {
                      feature: "Account Required",
                      mindkit: "None. Open & build immediately",
                      others: "Mandatory email registration & tracking",
                    },
                    {
                      feature: "Data Privacy",
                      mindkit: "Saved privately on your device",
                      others: "Resume data stored on external servers",
                    },
                    {
                      feature: "ATS Compliance",
                      mindkit: "100% Parser-Tested Single Column & Layouts",
                      others: "Complex multi-column layouts can fail ATS parsers",
                    },
                  ].map((row, idx) => (
                    <div key={idx} className="p-4 space-y-2.5 bg-white">
                      <div className="font-headings text-sm font-bold text-slate-900">
                        {row.feature}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2 bg-blue-50/70 border border-blue-200/60 rounded-lg p-2.5">
                          <Check className="h-4 w-4 text-blue-600 shrink-0 stroke-[3] mt-0.5" />
                          <div className="text-xs">
                            <span className="font-bold text-blue-900 block mb-0.5">Mindkit</span>
                            <span className="text-slate-800 font-medium">{row.mindkit}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200/60 rounded-lg p-2.5">
                          <X className="h-4 w-4 text-red-500 shrink-0 stroke-[2.5] mt-0.5" />
                          <div className="text-xs">
                            <span className="font-medium text-slate-500 block mb-0.5">Others</span>
                            <span className="text-slate-600">{row.others}</span>
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
                    <div className="grid grid-cols-12 bg-slate-100 text-slate-900 border-b border-slate-200 p-4 font-headings text-xs font-bold uppercase tracking-wider">
                      <div className="col-span-4">Feature</div>
                      <div className="col-span-4 text-blue-800 font-extrabold flex items-center gap-2 bg-blue-50/80 -my-4 py-4 px-3 border-x border-blue-200">
                        <span>Mindkit</span>
                        <span className="rounded-md bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold">
                          100% Free
                        </span>
                      </div>
                      <div className="col-span-4 text-slate-500 pl-3">
                        Subscription-Based Builders
                      </div>
                    </div>

                    {/* Table Rows */}
                    {[
                      {
                        feature: "PDF Download",
                        mindkit: "Free & Unlimited Vector PDF",
                        others: "Paywalled or recurring subscription ($24/mo)",
                      },
                      {
                        feature: "Template Access",
                        mindkit: "All 20+ Templates Unlocked",
                        others: "Most designs locked behind pro paywall",
                      },
                      {
                        feature: "Watermarks",
                        mindkit: "Zero watermarks on any export",
                        others: "Branding watermarks on free tier",
                      },
                      {
                        feature: "Account Required",
                        mindkit: "None. Open & build immediately",
                        others: "Mandatory email registration & tracking",
                      },
                      {
                        feature: "Data Privacy",
                        mindkit: "Saved privately on your device",
                        others: "Resume data stored on external servers",
                      },
                      {
                        feature: "ATS Compliance",
                        mindkit: "100% Parser-Tested Single Column & Layouts",
                        others: "Complex multi-column layouts can fail ATS parsers",
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 p-4 items-center text-sm border-b border-slate-100 last:border-0 ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <div className="col-span-4 font-headings text-sm font-semibold text-slate-900">
                          {row.feature}
                        </div>
                        <div className="col-span-4 font-body font-bold text-slate-900 flex items-center gap-2 bg-blue-50/30 -my-4 py-4 px-3 border-x border-blue-100">
                          <Check className="h-4 w-4 text-blue-600 shrink-0 stroke-[3]" />
                          <span>{row.mindkit}</span>
                        </div>
                        <div className="col-span-4 font-body text-xs text-slate-500 flex items-center gap-2 pl-3">
                          <X className="h-4 w-4 text-red-500 shrink-0 stroke-[2.5]" />
                          <span>{row.others}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Cost Contrast Callout */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-slate-600 font-medium text-center sm:text-left">
                    Average competitor subscription:{" "}
                    <strong className="text-slate-900">$24.95 / month</strong>
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                    Mindkit: $0.00 forever
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Diagonal Geometric Transition: Comparison -> Templates */}
        <DiagonalDivider
          direction="right-to-left"
          fillColor="text-white"
          accentTint="blue"
          heightClass="h-6 sm:h-10 lg:h-12"
        />

        {/* ========================================================================= */}
        {/* 4. Template Showcase Section — Crisp White Canvas with Category Filters   */}
        {/* ========================================================================= */}
        <section
          id="templates"
          className="scroll-mt-20 sm:scroll-mt-24 bg-white py-section-py-mob md:py-section-py-tab lg:py-section-py relative"
        >
          <GridPattern size={56} strokeOpacity={0.02} strokeColor="#0F172A" />

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10">
            <Reveal variant="fade-up">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-section-mb-mob md:mb-12 lg:mb-section-mb gap-6">
                <div>
                  <span className="font-body text-eyebrow uppercase tracking-[1.2px] text-blue-800 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full inline-block mb-2 font-semibold">
                    20 Free Production Templates
                  </span>
                  <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900">
                    Designed for recruiters, tested against ATS parsers.
                  </h2>
                  <p className="font-body text-subtitle text-slate-600 mt-2 max-w-2xl">
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

        {/* Diagonal Geometric Transition: Templates -> Features */}
        <DiagonalDivider
          direction="left-to-right"
          fillColor="text-slate-50/70"
          accentTint="slate"
          heightClass="h-6 sm:h-10 lg:h-12"
        />

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 5. Why Mindkit: Features Bento & AI Bullet Enhancer Live Demo            */}
        {/* ========================================================================= */}
        <section
          id="features"
          className="scroll-mt-20 sm:scroll-mt-24 bg-slate-50/70 text-slate-900 py-section-py-mob md:py-section-py-tab lg:py-section-py relative border-b border-slate-200/80"
        >
          <DotPattern size={28} dotOpacity={0.035} dotColor="#0F172A" />

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10 space-y-12">
            {/* Section Header */}
            <Reveal variant="fade-up">
              <div className="text-center max-w-3xl mx-auto">
                <span className="font-body text-eyebrow uppercase tracking-[1.2px] text-blue-800 bg-white border border-blue-200/80 px-3.5 py-1 rounded-full inline-block mb-3 font-semibold shadow-2xs">
                  Why Mindkit
                </span>
                <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900">
                  Engineered for real careers. Backed by client-side intelligence.
                </h2>
                <p className="font-body text-subtitle text-slate-600 mt-3">
                  Native vector PDF compilation, client-side data isolation, strict ATS compliance, and instant AI bullet point polishing—completely private on your device.
                </p>
              </div>
            </Reveal>

            {/* Part A: 4 Core Feature Bento Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Block 1: Vector PDF Engine */}
              <Reveal variant="fade-up" delay={100} className="h-full">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-headings font-bold text-blue-600 uppercase tracking-wider">
                        Core Architecture
                      </span>
                      <h3 className="font-headings text-xl font-bold text-slate-900 mt-0.5">
                        In-Browser Vector PDF Compilation Engine
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-600 leading-relaxed">
                      Compiles true vector PDF documents directly inside your browser memory. Text glyphs, rules, and margins stay pin-sharp at any zoom level on standard A4 paper.
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-semibold text-slate-700">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                      <span className="block text-blue-600 font-headings text-sm font-bold">0 ms</span>
                      Server Wait
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                      <span className="block text-blue-600 font-headings text-sm font-bold">300 DPI</span>
                      Resolution
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                      <span className="block text-blue-600 font-headings text-sm font-bold">A4</span>
                      Print Standard
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
                      <span className="block text-blue-600 font-headings text-sm font-bold">Embedded</span>
                      Web Fonts
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Block 2: 100% Privacy by Default */}
              <Reveal variant="fade-up" delay={150} className="h-full">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-headings font-bold text-blue-600 uppercase tracking-wider">
                        Client-Side Isolation
                      </span>
                      <h3 className="font-headings text-xl font-bold text-slate-900 mt-0.5">
                        100% Privacy by Default
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-600 leading-relaxed">
                      0 Bytes Uploaded. Your personal contact info, achievements, and drafts stay exclusively inside your browser memory and private local storage. No tracking, no marketing emails, and zero external databases.
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50/80 border border-blue-200/80 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      0 Bytes Uploaded
                    </span>
                    <span className="font-body text-[11px] font-medium text-slate-500">Local Sandbox Architecture</span>
                  </div>
                </div>
              </Reveal>

              {/* Block 3: PDF & DOCX Multi-Format */}
              <Reveal variant="fade-up" delay={200} className="h-full">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                      <FileUp className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-headings font-bold text-blue-600 uppercase tracking-wider">
                        Document Interoperability
                      </span>
                      <h3 className="font-headings text-xl font-bold text-slate-900 mt-0.5">
                        PDF & DOCX Export & Import
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-600 leading-relaxed">
                      Import existing resumes directly from PDF or Word (.docx). Export vector-clean PDFs or editable Word documents anytime with zero formatting distortion.
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50/80 border border-blue-200/80 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Bi-Directional DOCX & PDF
                    </span>
                    <span className="font-body text-[11px] font-medium text-slate-500">Lossless Formatting</span>
                  </div>
                </div>
              </Reveal>

              {/* Block 4: Custom Sections & ATS Verification */}
              <Reveal variant="fade-up" delay={250} className="h-full">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div className="space-y-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-headings font-bold text-blue-600 uppercase tracking-wider">
                        Applicant Tracking
                      </span>
                      <h3 className="font-headings text-xl font-bold text-slate-900 mt-0.5">
                        Custom Sections & ATS Verification
                      </h3>
                    </div>
                    <p className="font-body text-sm text-slate-600 leading-relaxed">
                      Every template uses standardized semantic heading tags and linear reading order tested against Workday, Greenhouse, and Taleo. Add certifications, publications, or custom sections freely.
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50/80 border border-blue-200/80 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      100% Parser Safe
                    </span>
                    <span className="font-body text-[11px] font-medium text-slate-500">Custom Category Builder</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Part B: Live AI Bullet Point Enhancer Demo */}
            <div className="pt-8 border-t border-slate-200/80">
              <Reveal variant="fade-up">
                <AiAssistantShowcase />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. ATS Analyzer Section — Analytical Dashboard View with Heuristics       */}
        {/* ========================================================================= */}
        <section className="bg-slate-50/80 text-slate-900 py-section-py-mob md:py-section-py-tab lg:py-section-py relative">
          <GridPattern size={40} strokeOpacity={0.025} strokeColor="#0F172A" />

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10">
            <Reveal variant="fade-up">
              <AtsAnalyzerPreview />
            </Reveal>
          </div>
        </section>

        {/* Diagonal Geometric Transition: ATS (Light) -> Privacy (Dark Slate #0F172A) */}
        <DiagonalDivider
          direction="right-to-left"
          fillColor="text-slate-900"
          accentTint="blue"
          heightClass="h-8 sm:h-12 lg:h-16"
        />

        {/* ========================================================================= */}
        {/* 8. Privacy Section — Deep Slate Canvas (#0F172A) & High-Contrast Security */}
        {/* ========================================================================= */}
        <section className="bg-slate-900 text-white py-section-py-mob md:py-section-py-tab lg:py-section-py relative overflow-hidden">
          <GridPattern size={36} strokeOpacity={0.04} strokeColor="#FFFFFF" />
          <Glow color="blue" size="md" className="-top-24 -left-24 opacity-20" />
          <Glow color="blue" size="md" className="bottom-0 right-0 opacity-20" />

          <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10 text-center space-y-12">
            <Reveal variant="fade-up">
              <div className="max-w-3xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-400">
                  <ShieldCheck className="h-4 w-4" />
                  Client-Side Sandbox Architecture
                </span>
                <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-white font-bold">
                  Your career data belongs solely to you.
                </h2>
                <p className="font-body text-subtitle text-slate-400 leading-relaxed max-w-2xl mx-auto">
                  A resume contains your home address, personal phone number, employment
                  dates, and career history. We believe that data should never sit in an
                  unnecessary cloud database.
                </p>
              </div>
            </Reveal>

            {/* 3 Dark Security Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
              <Reveal variant="fade-up" delay={100}>
                <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-6 hover:border-slate-700 transition-all space-y-3 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <h4 className="font-headings text-lg font-bold text-white">
                    100% Local Storage
                  </h4>
                  <p className="font-body text-small text-slate-400 leading-relaxed">
                    Your resume data is stored exclusively inside your own browser's
                    indexed storage. When you close the tab, your draft stays on your
                    computer.
                  </p>
                </div>
              </Reveal>

              <Reveal variant="fade-up" delay={200}>
                <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-6 hover:border-slate-700 transition-all space-y-3 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h4 className="font-headings text-lg font-bold text-white">
                    Zero Account Registration
                  </h4>
                  <p className="font-body text-small text-slate-400 leading-relaxed">
                    No passwords to create or leak. No mandatory email submissions, and
                    no promotional newsletters flooding your personal inbox.
                  </p>
                </div>
              </Reveal>

              <Reveal variant="fade-up" delay={300}>
                <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-6 hover:border-slate-700 transition-all space-y-3 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h4 className="font-headings text-lg font-bold text-white">
                    Zero Data Brokerage
                  </h4>
                  <p className="font-body text-small text-slate-400 leading-relaxed">
                    We never scrape, analyze, or sell your professional information to
                    recruiters, third-party advertisers, or external AI models.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Diagonal Geometric Transition: Privacy (Dark) -> FAQ (White) */}
        <DiagonalDivider
          direction="left-to-right"
          fillColor="text-white"
          accentTint="slate"
          heightClass="h-8 sm:h-12 lg:h-16"
        />

        {/* ========================================================================= */}
        {/* 9. FAQ Section — SEO & Trust Optimized Editorial Layout                  */}
        {/* ========================================================================= */}
        <section
          id="faq"
          className="scroll-mt-20 sm:scroll-mt-24 py-section-py-mob md:py-section-py-tab lg:py-section-py bg-white border-b border-slate-200/80"
        >
          <div className="max-w-container mx-auto px-4 sm:px-6 space-y-12">
            {/* Header */}
            <Reveal variant="fade-up">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 font-body text-xs uppercase tracking-[1.5px] text-blue-800 font-bold">
                  <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
                  Frequently Asked Questions
                </span>
                <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900 [&>span]:text-blue-600">
                  Everything you need to know about <span>Mindkit Resume Builder</span>
                </h2>
                <p className="font-body text-body text-slate-600 leading-relaxed">
                  Clear, transparent answers. No hidden terms, no bait-and-switch billing,
                  and zero marketing gimmicks.
                </p>
              </div>
            </Reveal>

            {/* FAQ Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[
                {
                  num: "01",
                  q: "Is Mindkit Resume Builder truly 100% free with no hidden paywalls or watermarks?",
                  a: "Yes, unconditionally. Unlike services that let you craft a resume only to demand a credit card on the final download step, Mindkit is free forever. All 20 templates, all styling tools, and every vector PDF download are 100% unrestricted.",
                },
                {
                  num: "02",
                  q: "Are these resume templates optimized and tested for Applicant Tracking Systems (ATS)?",
                  a: "Yes. Every template is strictly formatted with semantic heading tags, standard date formats, standard section keys, and linear text hierarchies tested against enterprise ATS parsers including Workday, Greenhouse, Taleo, iCIMS, and Lever.",
                },
                {
                  num: "03",
                  q: "Do I need to sign up, create an account, or enter a credit card?",
                  a: "No sign-up and no credit card required. You can start creating your resume right now without entering an email address or password. Jump directly into the builder and start editing immediately.",
                },
                {
                  num: "04",
                  q: "How does Mindkit protect my personal privacy and resume details?",
                  a: "Mindkit is built on a 100% client-side privacy architecture. Your resume data, contact info, and work history live exclusively in your browser's private local storage. We do not transmit or store your resume on external servers, and we never sell user data.",
                },
                {
                  num: "05",
                  q: "Can I download my resume as a high-resolution vector PDF?",
                  a: "Yes. Mindkit utilizes an in-browser vector PDF compilation engine that produces crystal-clear, print-ready documents with selectable text and embedded fonts on standard A4 dimensions. You can also print directly from your browser.",
                },
                {
                  num: "06",
                  q: "Will my resume data be preserved if I close my browser tab?",
                  a: "Yes. As you type, changes are automatically saved to your browser's local memory. When you return on the same computer and browser, your draft will be waiting for you.",
                },
                {
                  num: "07",
                  q: "How does Mindkit compare to other resume builders?",
                  a: "Design-first, drag-and-drop graphic builders often produce multi-layered layouts that ATS parsers struggle to read. Meanwhile, many subscription-based builders require paid upgrades or apply watermarks at download. Mindkit focuses on clean, parser-friendly code structure, high-resolution vector PDF export, and a commitment to keeping every feature and template 100% free with zero paywalls.",
                },
                {
                  num: "08",
                  q: "Can I customize colors, fonts, and add custom sections?",
                  a: "Yes! Choose from curated color accents, professional typography pairings (Inter, Poppins, Lora, Playfair, JetBrains Mono), and add custom sections such as Certifications, Languages, Awards, Projects, or Publications.",
                },
              ].map((faq, idx) => (
                <Reveal key={faq.num} variant="fade-up" delay={idx * 50}>
                  <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 h-full">
                    <h3 className="font-headings text-base sm:text-lg font-bold text-slate-900 flex items-start gap-2.5">
                      <span className="text-blue-600 font-headings text-sm shrink-0 mt-0.5 font-bold">
                        {faq.num}
                      </span>
                      {faq.q}
                    </h3>
                    <p className="font-body text-small text-slate-600 leading-relaxed pl-6">
                      {faq.a}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9.5 Tools Showcase Bento Grid — 111+ Live In-Browser Utilities          */}
        {/* ========================================================================= */}
        <section
          id="tools-showcase"
          className="py-section-py-mob md:py-section-py-tab lg:py-section-py bg-slate-50 border-b border-slate-200/80 relative overflow-hidden"
        >
          <div className="max-w-container mx-auto px-4 sm:px-6 space-y-12 relative z-10">
            {/* Header */}
            <Reveal variant="fade-up">
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 border border-blue-200 px-3.5 py-1 font-body text-xs uppercase tracking-[1.5px] text-blue-800 font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Phase 2 Live • 111 In-Browser Tools
                </span>
                <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900 [&>span]:text-blue-600">
                  Beyond Resumes: <span>111+ Free Privacy-First</span> Utilities
                </h2>
                <p className="font-body text-body text-slate-600 leading-relaxed">
                  Mindkit provides an entire ecosystem of PDF editors, media converters, cryptographic tools,
                  and technical calculators. All running 100% locally in your browser sandbox with zero network uploads.
                </p>
              </div>
            </Reveal>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: PDF & Documents */}
              <Reveal variant="fade-up" delay={50}>
                <Link
                  href="/tools/document-pdf"
                  className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all h-full"
                >
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                        20+ Live Utilities
                      </span>
                      <h3 className="font-headings font-bold text-slate-900 text-lg mt-2 group-hover:text-slate-700 transition-colors">
                        PDF & Documents
                      </h3>
                      <p className="font-body text-xs text-slate-600 mt-2 leading-relaxed">
                        Merge, split, compress, watermark, rotate, and reorder PDFs. Convert Word and Markdown, sign documents with zero server uploads.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-red-600">
                    <span>Explore PDF Suite</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Reveal>

              {/* Card 2: Image & Media */}
              <Reveal variant="fade-up" delay={100}>
                <Link
                  href="/tools/image"
                  className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all h-full"
                >
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                        25+ Live Utilities
                      </span>
                      <h3 className="font-headings font-bold text-slate-900 text-lg mt-2 group-hover:text-slate-700 transition-colors">
                        Image & Media
                      </h3>
                      <p className="font-body text-xs text-slate-600 mt-2 leading-relaxed">
                        Convert WebP, AVIF, PNG, JPG, and SVG. Remove EXIF metadata, extract color palettes, crop, resize, and compress images client-side.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-orange-600">
                    <span>Explore Image Tools</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Reveal>

              {/* Card 3: Security & Cryptography */}
              <Reveal variant="fade-up" delay={150}>
                <Link
                  href="/tools/security"
                  className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all h-full"
                >
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform">
                      <KeyRound className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        15+ Live Utilities
                      </span>
                      <h3 className="font-headings font-bold text-slate-900 text-lg mt-2 group-hover:text-slate-700 transition-colors">
                        Security & Privacy
                      </h3>
                      <p className="font-body text-xs text-slate-600 mt-2 leading-relaxed">
                        Generate SHA-256, SHA-512, MD5 hashes, HMAC signatures, test password entropy, inspect JWTs, and generate secure UUIDs offline.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                    <span>Explore Security Suite</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Reveal>

              {/* Card 4: Calculators & Developer */}
              <Reveal variant="fade-up" delay={200}>
                <Link
                  href="/tools/calculators"
                  className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all h-full"
                >
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-700 group-hover:scale-110 transition-transform">
                      <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md">
                        30+ Live Utilities
                      </span>
                      <h3 className="font-headings font-bold text-slate-900 text-lg mt-2 group-hover:text-slate-700 transition-colors">
                        Calculators & Dev
                      </h3>
                      <p className="font-body text-xs text-slate-600 mt-2 leading-relaxed">
                        JSON formatter, regex tester, CSS minifiers, mortgage, loan, BMI, and calorie calculators. Instant, responsive, and completely private.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-violet-700">
                    <span>Explore Calculators</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Reveal>
            </div>

            {/* Bottom Directory Banner */}
            <Reveal variant="fade-up" delay={250}>
              <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="space-y-1.5 text-center sm:text-left">
                  <h4 className="font-headings text-lg font-bold text-slate-900">
                    Need a specific tool? Browse our searchable directory.
                  </h4>
                  <p className="font-body text-xs sm:text-sm text-slate-600">
                    Filter across 111 utilities by category, search by keywords, and run everything instantly in your browser.
                  </p>
                </div>
                <Link href="/tools" className="shrink-0">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs gap-2"
                  >
                    <span>Browse All 111 Tools</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. Bottom CTA Banner — High-Impact Layered Finish                       */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-b from-blue-50/50 via-slate-50 to-white text-slate-900 py-section-py-mob md:py-section-py-tab lg:py-section-py border-b border-slate-200/80 text-center relative overflow-hidden">
          {/* Animated Background: Radiant Sunburst Glow, Grid Shimmer Beam, and Particles */}
          <AnimatedBannerBackground variant="cta" />

          <div className="max-w-container mx-auto px-4 sm:px-6 space-y-6 relative z-10">
            <Reveal variant="fade-up">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-blue-200/80 px-3.5 py-1 text-xs font-semibold text-blue-800 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Start In 30 Seconds • No Credit Card
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100}>
              <h2 className="font-headings text-section-mobile md:text-section-tablet lg:text-section text-slate-900 [&>span]:text-blue-600 font-bold max-w-2xl mx-auto">
                Ready to create your <span>job-winning</span> resume?
              </h2>
            </Reveal>

            <Reveal variant="fade-up" delay={200}>
              <p className="font-body text-subtitle text-slate-600 max-w-xl mx-auto">
                No credit card. No paywall. Jump straight into the editor and download
                your free vector PDF in minutes.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={300}>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Link href="/editor">
                  <Button
                    size="lg"
                    className="bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 px-8 py-3.5 rounded-lg min-h-[48px] text-base font-bold shadow-md hover:shadow-xl transition-all"
                  >
                    Launch Free Resume Builder <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white text-slate-800 border-slate-200 hover:bg-slate-50 px-7 py-3.5 rounded-lg min-h-[48px] text-base font-semibold shadow-2xs gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Browse 111+ Free Tools
                  </Button>
                </Link>
                <a href="#templates">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-6 py-3.5 rounded-lg min-h-[48px] text-base font-medium"
                  >
                    Browse 20+ Templates
                  </Button>
                </a>
              </div>
            </Reveal>

            {/* Bottom Proof Tagline */}
            <Reveal variant="fade-up" delay={400}>
              <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> 100% Free Forever
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> No Registration
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Instant Download
                </span>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Floating Bottom Dock (Sticky Bar) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/90 shadow-xl px-5 py-2 rounded-full hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-body text-small font-bold text-slate-900">
            Mindkit Resume Builder 100% Free
          </span>
        </div>
        <div className="h-4 w-[1px] bg-slate-200" />
        <div className="flex items-center gap-4 font-body text-small text-slate-600 font-medium">
          <Link href="/tools" className="hover:text-blue-600 font-semibold text-blue-600 transition-colors">
            All Tools
          </Link>
          <a href="#templates" className="hover:text-blue-600 transition-colors">
            Templates
          </a>
          <a href="#comparison" className="hover:text-blue-600 transition-colors">
            Why Us?
          </a>
          <a href="#faq" className="hover:text-blue-600 transition-colors">
            FAQ
          </a>
        </div>
        <Link href="/editor">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full px-4 py-1.5 text-xs font-bold shadow-xs transition-all"
          >
            Start Free
          </Button>
        </Link>
      </div>

      {/* Global Mindkit Footer */}
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
                "name": "Mindkit Resume Builder",
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
                  {
                    "@type": "Question",
                    "name": "Is Mindkit Resume Builder truly 100% free with no hidden paywalls or watermarks?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text":
                        "Yes, unconditionally. Unlike services that let you craft a resume only to demand a credit card on the final download step, Mindkit is free forever. All 20 templates, all styling tools, and every vector PDF download are 100% unrestricted.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Are these resume templates optimized and tested for Applicant Tracking Systems (ATS)?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text":
                        "Yes. Every template is strictly formatted with semantic heading tags, standard date formats, standard section keys, and linear text hierarchies tested against enterprise ATS parsers including Workday, Greenhouse, Taleo, iCIMS, and Lever.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Do I need to sign up, create an account, or enter a credit card?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text":
                        "No sign-up and no credit card required. You can start creating your resume right now without entering an email address or password. Jump directly into the builder and start editing immediately.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "How does Mindkit protect my personal privacy and resume details?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text":
                        "Mindkit is built on a 100% client-side privacy architecture. Your resume data, contact info, and work history live exclusively in your browser's private local storage. We do not transmit or store your resume on external servers, and we never sell user data.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Can I download my resume as a high-resolution vector PDF?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text":
                        "Yes. Mindkit utilizes an in-browser vector PDF compilation engine that produces crystal-clear, print-ready documents with selectable text and embedded fonts on standard A4 dimensions. You can also print directly from your browser.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Will my resume data be preserved if I close my browser tab?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text":
                        "Yes. As you type, changes are automatically saved to your browser's local memory. When you return on the same computer and browser, your draft will be waiting for you.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "How does Mindkit compare to other resume builders?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text":
                        "Design-first, drag-and-drop graphic builders often produce multi-layered layouts that ATS parsers struggle to read. Meanwhile, many subscription-based builders require paid upgrades or apply watermarks at download. Mindkit focuses on clean, parser-friendly code structure, high-resolution vector PDF export, and a commitment to keeping every feature and template 100% free with zero paywalls.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Can I customize colors, fonts, and add custom sections?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text":
                        "Yes! Choose from curated color accents, professional typography pairings (Inter, Poppins, Lora, Playfair, JetBrains Mono), and add custom sections such as Certifications, Languages, Awards, Projects, or Publications.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
    </div>
  );
}
