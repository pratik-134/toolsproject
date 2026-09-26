"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { Button } from "@/components/ui/button";
import {
  Sliders,
  X,
  Check,
  Palette,
  Type,
  Maximize,
  Minimize,
  Columns,
  Sparkles,
} from "lucide-react";

const ACCENT_COLORS = [
  { name: "Brand Blue", hex: "#2563EB" },
  { name: "Navy Dark", hex: "#1E3A8A" },
  { name: "Ocean Cyan", hex: "#0891B2" },
  { name: "Charcoal Black", hex: "#0F172A" },
  { name: "Slate Navy", hex: "#334155" },
  { name: "Crimson Red", hex: "#DC2626" },
  { name: "Dark Red", hex: "#991B1B" },
  { name: "Amber Gold", hex: "#D97706" },
  { name: "Sky Blue", hex: "#0284C7" },
  { name: "Muted Gray", hex: "#64748B" },
];

const FONT_OPTIONS = [
  { id: "inter-roboto", name: "Inter", desc: "Modern Sans-Serif • ATS Recommended" },
  { id: "poppins-lato", name: "Poppins", desc: "Creative & Bold Display Typography" },
  { id: "lora-opensans", name: "Lora", desc: "Classic Editorial Serif • Formal & Academic" },
  { id: "playfair-source", name: "Playfair Display", desc: "Executive Luxury Serif • Leadership" },
  { id: "fira-jetbrains", name: "JetBrains Mono", desc: "Developer Monospace • Technical Precision" },
];

export const PageSettingsModal: React.FC = () => {
  const { resumeData, updateTheme, isPageSettingsOpen, setPageSettingsOpen } = useResumeStore();

  if (!isPageSettingsOpen) return null;

  const theme = resumeData.theme;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 no-print">
      <div className="w-full max-w-lg bg-white text-slate-900 border border-slate-200 rounded-lg p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 select-none max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Sliders className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900">
                Page Setup & Formatting
              </h3>
              <p className="text-xs text-slate-500">
                Synchronized live between browser preview and exported PDF
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPageSettingsOpen(false)}
            className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
          {/* 1. Spacing & Density */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Layout Density</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Section & item spacing)
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "compact", name: "Compact", desc: "Fits more on 1 page" },
                { id: "comfortable", name: "Balanced", desc: "Recommended standard" },
                { id: "spacious", name: "Spacious", desc: "Airy executive style" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => updateTheme({ density: d.id as any })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    theme.density === d.id
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold text-xs">{d.name}</div>
                  <div className={`text-[10px] mt-0.5 ${theme.density === d.id ? "text-blue-600" : "text-slate-400"}`}>
                    {d.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Margin Profile */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Printable Margins</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (A4 sheet border padding)
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "narrow", name: "Narrow", desc: "28pt (37px)" },
                { id: "normal", name: "Normal", desc: "36pt (48px)" },
                { id: "wide", name: "Wide", desc: "48pt (64px)" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateTheme({ marginSize: m.id as any })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    theme.marginSize === m.id
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold text-xs">{m.name}</div>
                  <div className={`text-[10px] mt-0.5 ${theme.marginSize === m.id ? "text-blue-600" : "text-slate-400"}`}>
                    {m.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Typography Pairing */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-slate-500" />
              <span>Typography Pairing</span>
            </label>
            <div className="space-y-1.5">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateTheme({ fontPair: f.id as any })}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                    theme.fontPair === f.id
                      ? "border-blue-600 bg-blue-50 font-medium text-slate-900 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{f.name}</div>
                    <div className="text-[10px] text-slate-500">{f.desc}</div>
                  </div>
                  {theme.fontPair === f.id && <Check className="h-4 w-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Accent Color Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-slate-500" />
              <span>Accent Color</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => updateTheme({ accentColor: c.hex })}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    theme.accentColor === c.hex
                      ? "scale-110 ring-2 ring-blue-600 ring-offset-2 ring-offset-white"
                      : "hover:scale-110 opacity-80"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}

              {/* Custom Hex Input */}
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Hex:</span>
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => updateTheme({ accentColor: e.target.value })}
                  maxLength={7}
                  className="w-20 bg-white text-slate-900 text-xs font-mono border border-slate-200 rounded-md px-2 py-0.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 5. Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="font-medium text-slate-800">Display Contact & Header Icons</span>
              <input
                type="checkbox"
                checked={theme.showIcons ?? true}
                onChange={(e) => updateTheme({ showIcons: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400">Changes are saved automatically</span>
          <Button
            onClick={() => setPageSettingsOpen(false)}
            className="h-8 text-xs bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 font-bold rounded-lg px-4 transition-colors shadow-xs"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
