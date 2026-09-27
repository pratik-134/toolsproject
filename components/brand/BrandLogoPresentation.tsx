"use client";

import React, { useState } from "react";
import { Check, Copy, Sparkles, Layers, ShieldCheck, Box } from "lucide-react";
import {
  CleartrixIcon,
  CleartrixLogo,
  ResumeBuilderIcon,
  ResumeBuilderLogo,
} from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";

/**
 * Brand Logo Showcase & Guidelines Presentation Page
 */
export const BrandLogoPresentation: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyColor = (hex: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  const colors = [
    {
      name: "Primary Blue (BRAND.colors.primary)",
      hex: "#2563EB",
      desc: "Core brand accent, primary buttons, badges, key interactive states",
      textColor: "text-white",
    },
    {
      name: "Deep Navy (BRAND.colors.primaryDark)",
      hex: "#1E3A8A",
      desc: "Logo base gradient, dark mode depth, high-contrast borders",
      textColor: "text-white",
    },
    {
      name: "Electric Cyan (BRAND.colors.cyanAccent)",
      hex: "#00D2FF",
      desc: "Hex-M node accent, client-side precision indicator, energy highlights",
      textColor: "text-slate-900",
      border: true,
    },
    {
      name: "Canvas Surface (BRAND.colors.canvas)",
      hex: "#F8FAFC",
      desc: "Clean workspace surfaces, tool canvas, subtle card backgrounds",
      textColor: "text-slate-900",
      border: true,
    },
    {
      name: "Dark Slate",
      hex: "#0F172A",
      desc: "Wordmark typography, dark privacy background, high-contrast text",
      textColor: "text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-semibold text-blue-800">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Cleartrix Identity System
          </div>
          <h1 className="font-headings text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Clear<span className="text-blue-600">trix</span> Brand Guidelines
          </h1>
          <p className="font-body text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Official vector logo marks, color tokens, and visual standards for the Cleartrix privacy-first web platform.
          </p>
        </div>

        {/* 1. Core Symbol Concept Anatomy */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-headings font-bold text-blue-600 tracking-tight uppercase">
              Symbol Geometry & Architecture
            </span>
            <h2 className="font-headings text-2xl font-bold text-slate-900 mt-1">
              The Cleartrix Modular Prism
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-slate-50 rounded-xl p-8 flex items-center justify-center border border-slate-100">
              <CleartrixIcon size={120} />
            </div>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                The <strong>Cleartrix Prism</strong> is engineered around precision matrix geometry. Its foundational royal indigo and brand blue represent computing strength and reliability.
              </p>
              <p>
                The central facet culminates in an <strong>Electric Cyan Node (#00D2FF)</strong>, symbolizing 100% client-side execution, browser memory processing, and the seamless integration of 111+ productivity tools.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Zero Server Leaks
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <Layers className="w-4 h-4 text-blue-600" /> 111+ Tools Architecture
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Logo Variations (Cleartrix Umbrella) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-headings text-xl font-bold text-slate-900">
              Cleartrix Umbrella Logo Variations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Horizontal, stacked, and icon-only lockups for light and dark backgrounds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-4">
              <CleartrixLogo size={36} variant="horizontal" />
              <span className="text-xs text-slate-500 font-mono">Horizontal (Light Background)</span>
            </div>

            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-4">
              <CleartrixLogo size={36} variant="horizontal" isLight />
              <span className="text-xs text-slate-400 font-mono">Horizontal (Dark Background)</span>
            </div>
          </div>
        </div>

        {/* 3. Sub-Brand: Cleartrix Resume Builder */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-headings text-xl font-bold text-slate-900">
              Flagship Sub-Brand: Cleartrix Resume Builder
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated lockup and ATS document spine mark for the flagship resume editor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-4">
              <ResumeBuilderLogo size={36} variant="horizontal" />
              <span className="text-xs text-slate-500 font-mono">Resume Builder Lockup</span>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-4">
              <ResumeBuilderIcon size={48} />
              <span className="text-xs text-slate-500 font-mono">ATS Document Icon Mark</span>
            </div>
          </div>
        </div>

        {/* 4. Color Palette Tokens */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-headings text-xl font-bold text-slate-900">
              Color Tokens & Digital Palette
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any color swatch to copy the hexadecimal code to clipboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map((c) => (
              <div
                key={c.hex}
                onClick={() => copyColor(c.hex)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  c.border ? "border-slate-200" : "border-transparent"
                } hover:shadow-md hover:scale-[1.01]`}
                style={{ backgroundColor: c.hex }}
              >
                <div className={`flex justify-between items-start ${c.textColor}`}>
                  <div>
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="font-mono text-xs opacity-90">{c.hex}</p>
                  </div>
                  <div className="p-1 rounded bg-black/10">
                    {copiedHex === c.hex ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 opacity-75" />
                    )}
                  </div>
                </div>
                <p className={`mt-3 text-xs opacity-80 leading-relaxed ${c.textColor}`}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
