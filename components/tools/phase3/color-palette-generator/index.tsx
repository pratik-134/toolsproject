"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Palette,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Check,
  Download,
  Eye,
  Sliders,
  Sparkles,
  ShieldCheck,
  FileCode,
  Layers,
  Shuffle,
  ChevronDown,
} from "lucide-react";
import {
  HarmonyMode,
  ExportFormat,
  ColorItem,
  generateHarmonicPalette,
  getColorName,
  evaluateWCAG,
  getReadableTextColor,
  simulateColorBlindness,
  formatExport,
} from "./logic";

const INITIAL_COLORS: ColorItem[] = [
  { id: "c1", hex: "#3b82f6", locked: false, name: "Cobalt" },
  { id: "c2", hex: "#06b6d4", locked: false, name: "Cyan" },
  { id: "c3", hex: "#10b981", locked: false, name: "Emerald" },
  { id: "c4", hex: "#f59e0b", locked: false, name: "Amber" },
  { id: "c5", hex: "#ef4444", locked: false, name: "Crimson" },
];

export default function ColorPaletteGeneratorTool() {
  const [colors, setColors] = useState<ColorItem[]>(INITIAL_COLORS);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>("complementary");
  const [activeColorIndex, setActiveColorIndex] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("hex");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);
  const [visionMode, setVisionMode] = useState<"normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia">("normal");

  const activeColor: ColorItem = colors[activeColorIndex] || colors[0] || {
    id: "default",
    hex: "#3b82f6",
    locked: false,
    name: "Cobalt",
  };

  // Generate new harmonic palette keeping locked colors intact
  const handleGenerate = useCallback(() => {
    // Find unlocked indices or generate full
    const baseHex = activeColor.hex;
    const generatedHexes = generateHarmonicPalette(baseHex, harmonyMode, colors.length);

    setColors((prev) =>
      prev.map((c, i) => {
        if (c.locked) return c;
        const newHex = generatedHexes[i] ?? generatedHexes[0] ?? "#3b82f6";
        return {
          ...c,
          hex: newHex,
          name: getColorName(newHex),
        };
      })
    );
  }, [activeColor.hex, harmonyMode, colors.length]);

  // Spacebar to generate new palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGenerate]);

  // Toggle color lock
  const toggleLock = (index: number) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c))
    );
  };

  // Change individual color
  const handleColorChange = (index: number, newHex: string) => {
    setColors((prev) =>
      prev.map((c, i) =>
        i === index
          ? { ...c, hex: newHex, name: getColorName(newHex) }
          : c
      )
    );
  };

  // Add / remove palette slots
  const addColor = () => {
    if (colors.length >= 8) return;
    const lastColor: ColorItem = colors[colors.length - 1] || activeColor;
    const baseHex = lastColor.hex;
    const nextHex = generateHarmonicPalette(baseHex, "analogous", 3)[1] ?? "#10b981";
    setColors((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        hex: nextHex,
        locked: false,
        name: getColorName(nextHex),
      },
    ]);
  };

  const removeColor = (index: number) => {
    if (colors.length <= 3) return;
    setColors((prev) => prev.filter((_, i) => i !== index));
    if (activeColorIndex >= colors.length - 1) {
      setActiveColorIndex(Math.max(0, colors.length - 2));
    }
  };

  // 1-Click Copy Individual Hex
  const handleCopyHex = (hex: string, id: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export string
  const exportString = useMemo(() => {
    return formatExport(colors, exportFormat);
  }, [colors, exportFormat]);

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportString);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  // Download palette as JSON or ASE/PNG swatch
  const handleDownload = () => {
    const blob = new Blob([exportString], {
      type: exportFormat === "json" ? "application/json" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `qwertygen-palette-${harmonyMode}.${exportFormat === "json" ? "json" : "txt"}`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // Accessibility WCAG matrix against White and Obsidian
  const wcagWhite = useMemo(() => evaluateWCAG(activeColor.hex, "#ffffff"), [activeColor.hex]);
  const wcagBlack = useMemo(() => evaluateWCAG(activeColor.hex, "#0f172a"), [activeColor.hex]);

  // Color blindness simulation for the active color
  const simulatedVision = useMemo(() => simulateColorBlindness(activeColor.hex), [activeColor.hex]);

  return (
    <div className="space-y-6">
      {/* Top Studio Control Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              Harmonic Color Palette Studio
            </span>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              WCAG 2.1 Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
              Generate (or press Space)
            </button>
          </div>
        </div>

        {/* Harmony Mode Selector & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground font-medium">Harmonic Rule:</span>
            {(
              [
                "complementary",
                "analogous",
                "triadic",
                "monochromatic",
                "split-complementary",
                "tetradic",
                "random",
              ] as HarmonyMode[]
            ).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setHarmonyMode(mode);
                  const generated = generateHarmonicPalette(activeColor.hex, mode, colors.length);
                  setColors((prev) =>
                    prev.map((c, i) => (c.locked ? c : { ...c, hex: generated[i] || c.hex, name: getColorName(generated[i] || c.hex) }))
                  );
                }}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors font-medium ${
                  harmonyMode === mode
                    ? "bg-foreground text-background font-semibold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addColor}
              disabled={colors.length >= 8}
              className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium disabled:opacity-50"
            >
              + Add Color
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Palette Strip Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {colors.map((color, index) => {
          const textColor = getReadableTextColor(color.hex);
          const isSelected = activeColorIndex === index;

          return (
            <div
              key={color.id}
              onClick={() => setActiveColorIndex(index)}
              style={{ backgroundColor: color.hex }}
              className={`relative group rounded-2xl p-4 h-64 md:h-80 flex flex-col justify-between transition-all cursor-pointer shadow-md select-none ${
                isSelected ? "ring-4 ring-primary ring-offset-2 scale-[1.02]" : "hover:scale-[1.01]"
              }`}
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span
                  style={{ color: textColor }}
                  className="text-xs font-semibold uppercase tracking-wider opacity-90 backdrop-blur-md px-2 py-0.5 rounded-md bg-black/10"
                >
                  {color.name}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(index);
                  }}
                  style={{ color: textColor }}
                  className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 backdrop-blur-md transition-colors"
                  title={color.locked ? "Unlock Color" : "Lock Color (keep during generate)"}
                >
                  {color.locked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4 opacity-60 hover:opacity-100" />
                  )}
                </button>
              </div>

              {/* Center Quick Copy Action */}
              <div className="flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyHex(color.hex, color.id);
                  }}
                  style={{ color: textColor }}
                  className="px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {copiedId === color.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Hex</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Details & Native Color Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    style={{ color: textColor }}
                    className="font-mono text-sm font-bold tracking-tight uppercase"
                  >
                    {color.hex}
                  </span>

                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer relative inline-flex items-center justify-center p-1 rounded-md bg-black/10 hover:bg-black/20 backdrop-blur-md"
                  >
                    <Sliders style={{ color: textColor }} className="w-3.5 h-3.5" />
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>

                {colors.length > 3 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeColor(index);
                    }}
                    style={{ color: textColor }}
                    className="text-[10px] opacity-60 hover:opacity-100 underline decoration-dotted transition-opacity"
                  >
                    Remove slot
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Auditor: WCAG 2.1 Accessibility & Color Blindness Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: WCAG 2.1 Contrast Ratio Matrix */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-sm text-foreground">
                WCAG 2.1 Accessibility Audit
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeColor.hex }} />
              <span className="font-mono text-xs font-semibold text-foreground">
                {activeColor.hex}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Auditing active color against pure white and dark obsidian backgrounds per W3C WCAG 2.1 guidelines.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* White Background Test */}
            <div className="rounded-xl border border-border p-3.5 bg-white text-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>On Pure White</span>
                <span className="font-mono">{wcagWhite.ratio}:1</span>
              </div>
              <div
                style={{ color: activeColor.hex }}
                className="font-bold text-base border-b border-slate-200 pb-2"
              >
                Sample Headline Text
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-semibold">
                <span className={`px-2 py-0.5 rounded ${wcagWhite.aaNormal ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  AA Normal {wcagWhite.aaNormal ? "Pass" : "Fail"}
                </span>
                <span className={`px-2 py-0.5 rounded ${wcagWhite.aaaNormal ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  AAA Normal {wcagWhite.aaaNormal ? "Pass" : "Fail"}
                </span>
              </div>
            </div>

            {/* Dark Slate Background Test */}
            <div className="rounded-xl border border-border p-3.5 bg-[#0f172a] text-white space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>On Obsidian Dark</span>
                <span className="font-mono">{wcagBlack.ratio}:1</span>
              </div>
              <div
                style={{ color: activeColor.hex }}
                className="font-bold text-base border-b border-slate-800 pb-2"
              >
                Sample Headline Text
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-semibold">
                <span className={`px-2 py-0.5 rounded ${wcagBlack.aaNormal ? "bg-emerald-900/60 text-emerald-300" : "bg-rose-900/60 text-rose-300"}`}>
                  AA Normal {wcagBlack.aaNormal ? "Pass" : "Fail"}
                </span>
                <span className={`px-2 py-0.5 rounded ${wcagBlack.aaaNormal ? "bg-emerald-900/60 text-emerald-300" : "bg-rose-900/60 text-rose-300"}`}>
                  AAA Normal {wcagBlack.aaaNormal ? "Pass" : "Fail"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Color Blindness Vision Simulation */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Color Blindness Vision Simulation
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">Brettel-Viénot Matrices</span>
          </div>

          <p className="text-xs text-muted-foreground">
            Preview how users with different color vision deficiencies perceive your chosen palette colors.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Protanopia */}
            <div className="rounded-xl border border-border p-3 space-y-1.5 bg-muted/30">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Protanopia</span>
                <span className="text-[11px] text-muted-foreground">Red-blind (1%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: simulatedVision.protanopia }} />
                <span className="font-mono text-xs font-semibold text-foreground">{simulatedVision.protanopia}</span>
              </div>
            </div>

            {/* Deuteranopia */}
            <div className="rounded-xl border border-border p-3 space-y-1.5 bg-muted/30">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Deuteranopia</span>
                <span className="text-[11px] text-muted-foreground">Green-blind (5%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: simulatedVision.deuteranopia }} />
                <span className="font-mono text-xs font-semibold text-foreground">{simulatedVision.deuteranopia}</span>
              </div>
            </div>

            {/* Tritanopia */}
            <div className="rounded-xl border border-border p-3 space-y-1.5 bg-muted/30">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Tritanopia</span>
                <span className="text-[11px] text-muted-foreground">Blue-blind (0.1%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: simulatedVision.tritanopia }} />
                <span className="font-mono text-xs font-semibold text-foreground">{simulatedVision.tritanopia}</span>
              </div>
            </div>

            {/* Achromatopsia */}
            <div className="rounded-xl border border-border p-3 space-y-1.5 bg-muted/30">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Achromatopsia</span>
                <span className="text-[11px] text-muted-foreground">Monochromacy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg shadow-inner" style={{ backgroundColor: simulatedVision.achromatopsia }} />
                <span className="font-mono text-xs font-semibold text-foreground">{simulatedVision.achromatopsia}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Export Studio */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              Developer Export & Integration
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["hex", "rgb", "hsl", "css-variables", "tailwind", "json"] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setExportFormat(fmt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${
                  exportFormat === fmt
                    ? "bg-foreground text-background font-semibold"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {fmt}
              </button>
            ))}

            <button
              type="button"
              onClick={handleCopyExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              {copiedExport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedExport ? "Copied" : "Copy"}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-xs text-foreground overflow-x-auto max-h-48 selection:bg-primary/20">
            {exportString}
          </pre>
        </div>
      </div>
    </div>
  );
}
