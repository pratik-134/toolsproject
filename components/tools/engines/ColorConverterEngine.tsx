"use client";

import React, { useState } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";
import { Copy, Check } from "lucide-react";

export interface ColorConverterEngineProps {
  preset: ConverterPreset;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

export { hexToRgb, rgbToHex, rgbToHsl, rgbToCmyk };

export function ColorConverterEngine({ preset }: ColorConverterEngineProps) {
  const [colorInput, setColorInput] = useState<string>("#3B82F6");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rgb = hexToRgb(colorInput) || { r: 59, g: 130, b: 246 };
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  const formats = [
    { label: "HEX", value: hex, key: "hex" },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, key: "rgb" },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, key: "hsl" },
    { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, key: "cmyk" },
    { label: "CSS Variable", value: `--color: ${hex};`, key: "css" },
  ];

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div
          className="w-32 h-32 rounded-2xl shadow-inner border-2 border-white dark:border-slate-800 transition-colors duration-200"
          style={{ backgroundColor: hex }}
        />
        <div className="flex-1 space-y-4 w-full text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select or Type Color (HEX / RGB):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hex}
                onChange={(e) => setColorInput(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent p-1"
              />
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="#3B82F6"
                className="flex-1 p-3 font-mono text-base border rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3 text-left">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Converted Formats:
        </label>
        <div className="grid grid-cols-1 gap-3">
          {formats.map((fmt) => (
            <div
              key={fmt.key}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mr-3">{fmt.label}:</span>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{fmt.value}</span>
              </div>
              <button
                onClick={() => handleCopy(fmt.value, fmt.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                {copiedKey === fmt.key ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Copy
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
