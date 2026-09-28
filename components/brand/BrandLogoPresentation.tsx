"use client";

import React, { useState } from "react";
import { Check, Copy, Sparkles, Layers, ShieldCheck, Box } from "lucide-react";
import {
  CleartrixIcon,
  CleartrixLogo,
} from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";

/**
 * Official ClearTrix Brand Guidelines & Logo Asset Presentation Page
 * Aligned 100% with the official ClearTrix Brand Asset specifications.
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
      name: "Primary Blue",
      hex: "#3B82F6",
      desc: "Core brand accent, 'Tr' wordmark, key buttons & active states",
      textColor: "text-white",
    },
    {
      name: "Accent Teal",
      hex: "#06D6A0",
      desc: "Monogram stem, 'ix' wordmark, positive highlight indicators",
      textColor: "text-slate-900",
    },
    {
      name: "Dark Navy",
      hex: "#0F172A",
      desc: "'Clear' wordmark text, dark mode canvas, high contrast headers",
      textColor: "text-white",
    },
    {
      name: "Gray",
      hex: "#94A3B8",
      desc: "Tagline subtitle ('Tools for a Smarter You'), muted text & icons",
      textColor: "text-white",
    },
    {
      name: "Light / Canvas",
      hex: "#F8FAFC",
      desc: "Primary workspace background, card surfaces, subtle borders",
      textColor: "text-slate-900",
      border: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-container mx-auto space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5 text-[#3B82F6]" /> Official ClearTrix Brand Guidelines
          </div>
          <h1 className="font-headings text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight">
            Clear<span className="text-[#3B82F6]">Tr</span><span className="text-[#06D6A0]">ix</span> Assets & Tokens
          </h1>
          <p className="font-body text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto font-medium">
            {BRAND.tagline}
          </p>
        </div>

        {/* 1. Official Core Logo Symbol Anatomy */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-headings font-bold text-[#3B82F6] tracking-wider uppercase">
              Brand Monogram Geometry
            </span>
            <h2 className="font-headings text-2xl font-bold text-[#0F172A] mt-1">
              ClearTrix Interlocking C+T Mark
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-[#F8FAFC] rounded-xl p-8 flex items-center justify-center border border-slate-200">
              <CleartrixIcon size={120} />
            </div>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                The <strong>ClearTrix Monogram</strong> combines the curved Primary Blue (<strong>#3B82F6</strong>) outer 'C' arc with the inner Accent Teal (<strong>#06D6A0</strong>) 'T' stem.
              </p>
              <p>
                The interlocked structure represents privacy-first client-side web tools executing seamlessly on local user devices with zero cloud uploads.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-[#06D6A0]" /> 100% Client-Side Privacy
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <Layers className="w-4 h-4 text-[#3B82F6]" /> 111+ In-Browser Tools
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Official Logo Variants */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-headings text-xl font-bold text-[#0F172A]">
              Official Logo Variations
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5 font-medium">
              Horizontal, stacked, dark mode, monochrome, and app icon / favicon formats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Horizontal */}
            <div className="p-6 bg-[#F8FAFC] rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-4 min-h-[160px]">
              <CleartrixLogo size={36} variant="horizontal" />
              <span className="text-xs text-slate-500 font-mono">Horizontal Logo</span>
            </div>

            {/* Stacked */}
            <div className="p-6 bg-[#F8FAFC] rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-4 min-h-[160px]">
              <CleartrixLogo size={36} variant="stacked" />
              <span className="text-xs text-slate-500 font-mono">Stacked Logo</span>
            </div>

            {/* Dark Version */}
            <div className="p-6 bg-[#0F172A] rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-4 min-h-[160px]">
              <CleartrixLogo size={36} variant="horizontal" isLight />
              <span className="text-xs text-slate-400 font-mono">Dark Version</span>
            </div>

            {/* App Icon / Favicon */}
            <div className="p-6 bg-[#F8FAFC] rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-4 min-h-[160px]">
              <CleartrixIcon size={56} hasContainer />
              <span className="text-xs text-slate-500 font-mono">App Icon / Favicon</span>
            </div>
          </div>
        </div>

        {/* 3. Color Swatches */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-headings text-xl font-bold text-[#0F172A]">
              Brand Color Tokens
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5 font-medium">
              Click any color swatch to copy the hex code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {colors.map((c) => (
              <div
                key={c.hex}
                onClick={() => copyColor(c.hex)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  c.border ? "border-slate-200" : "border-transparent"
                } hover:shadow-md hover:scale-[1.02]`}
                style={{ backgroundColor: c.hex }}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${c.textColor}`}>
                    {c.hex}
                  </span>
                  {copiedHex === c.hex ? (
                    <Check className={`h-4 w-4 ${c.textColor}`} />
                  ) : (
                    <Copy className={`h-3.5 w-3.5 opacity-70 ${c.textColor}`} />
                  )}
                </div>
                <div className={`mt-3 text-xs font-bold font-headings ${c.textColor}`}>
                  {c.name}
                </div>
                <p className={`text-[11px] mt-1 opacity-80 leading-snug ${c.textColor}`}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Typography */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-headings text-xl font-bold text-[#0F172A]">
              Typography Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-mono font-bold text-[#3B82F6]">Headings / Logo Font</span>
              <div className="font-headings text-2xl font-bold text-[#0F172A]">
                Poppins (SemiBold / Bold)
              </div>
              <p className="text-xs text-slate-500">
                Used for primary section headlines, brand wordmarks, and feature titles.
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-mono font-bold text-[#06D6A0]">Body Text Font</span>
              <div className="font-body text-2xl font-medium text-[#0F172A]">
                Inter (Regular / Medium)
              </div>
              <p className="text-xs text-slate-500">
                Used for paragraph copy, UI controls, tool descriptions, and inputs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLogoPresentation;
