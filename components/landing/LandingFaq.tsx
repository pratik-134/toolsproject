"use client";

import React, { useState } from "react";
import { HelpCircle, FileText, Wrench } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export interface FaqItem {
  num: string;
  q: string;
  a: string;
}

export const RESUME_FAQS: FaqItem[] = [
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
];

export const TOOLS_FAQS: FaqItem[] = [
  {
    num: "01",
    q: "How can Mindkit tools run with zero server uploads?",
    a: "All tools execute directly within your browser sandbox using modern web standards—including WebAssembly, Web Workers, Canvas, and client-side JavaScript. When you merge a PDF, convert an image, or run a calculation, your files are processed entirely in your device's memory without transferring even a single byte to an external server.",
  },
  {
    num: "02",
    q: "Are the 111+ tools really free forever?",
    a: "Yes. There are no trial periods, monthly subscriptions, credit card prompts, or daily usage caps. Every tool across all 5 categories is permanently accessible and 100% free to use without restrictions.",
  },
  {
    num: "03",
    q: "Is there a file size limit for PDF or image processing?",
    a: "Because processing happens directly on your device rather than our servers, file size limits are governed by your device's available memory (RAM). Most modern laptops and phones easily process PDFs and images up to 50MB–100MB+ without any lag.",
  },
  {
    num: "04",
    q: "Do I need to create an account or provide an email?",
    a: "Never. None of our tools require registration, login, or personal information. You can use any tool instantly without giving up your email address or creating yet another password.",
  },
  {
    num: "05",
    q: "Can I use these tools offline?",
    a: "Once the tool page is loaded in your browser cache, the client-side processing logic runs entirely on your local machine. You can disconnect from the internet or work in airplane mode, and your tools will continue functioning seamlessly.",
  },
  {
    num: "06",
    q: "How do you make money if everything is free?",
    a: "Mindkit is built with an ultra-lean architecture: because all computation happens on the client side, our server hosting costs are negligible compared to traditional cloud platforms. We sustain operations through non-intrusive affiliate partnerships, developer sponsorships, and future optional enterprise team features—never by gating basic consumer tools or selling user data.",
  },
  {
    num: "07",
    q: "Are these tools safe for confidential work documents and sensitive data?",
    a: "Yes, they are far safer than traditional cloud converters. Because files are never sent over the internet to remote servers, there is zero risk of data intercepts, server breaches, or cloud logging. Your private financial reports, legal contracts, and confidential images remain strictly on your machine.",
  },
];

export const LandingFaq: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"resume" | "tools">("resume");

  const currentFaqs = activeTab === "resume" ? RESUME_FAQS : TOOLS_FAQS;

  return (
    <div className="space-y-10">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs font-body">
          <button
            type="button"
            onClick={() => setActiveTab("resume")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "resume"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className={`h-4 w-4 ${activeTab === "resume" ? "text-blue-600" : "text-slate-400"}`} />
            <span>Resume Builder ({RESUME_FAQS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tools")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "tools"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Wrench className={`h-4 w-4 ${activeTab === "tools" ? "text-emerald-600" : "text-slate-400"}`} />
            <span>In-Browser Tools ({TOOLS_FAQS.length})</span>
          </button>
        </div>
      </div>

      {/* FAQ Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {currentFaqs.map((faq, idx) => (
          <Reveal key={`${activeTab}-${faq.num}`} variant="fade-up" delay={idx * 40}>
            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 h-full">
              <h3 className="font-headings text-base sm:text-lg font-bold text-slate-900 flex items-start gap-2.5">
                <span
                  className={`font-headings text-sm shrink-0 mt-0.5 font-bold ${
                    activeTab === "resume" ? "text-blue-600" : "text-emerald-600"
                  }`}
                >
                  {faq.num}
                </span>
                <span>{faq.q}</span>
              </h3>
              <p className="font-body text-small text-slate-600 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};
