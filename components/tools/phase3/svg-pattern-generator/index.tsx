"use client";

import React, { useState, useMemo } from "react";
import {
  PatternType,
  PatternOptions,
  PATTERN_PALETTES,
  generatePatternSvg,
  svgToCssDataUri,
} from "./logic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Copy,
  Check,
  Shuffle,
  Layers,
  Palette,
  Sliders,
  Code,
  Sparkles,
} from "lucide-react";

export default function SvgPatternGenerator() {
  const [patternType, setPatternType] = useState<PatternType>("layered-waves");
  const [paletteId, setPaletteId] = useState<string>("midnight-indigo");
  const [points, setPoints] = useState<number>(5);
  const [variance, setVariance] = useState<number>(55);
  const [layers, setLayers] = useState<number>(3);
  const [seed, setSeed] = useState<number>(1337);
  const [width, setWidth] = useState<number>(1440);
  const [height, setHeight] = useState<number>(450);
  const [invert, setInvert] = useState<boolean>(false);
  const [isTransparent, setIsTransparent] = useState<boolean>(true);

  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [copiedCss, setCopiedCss] = useState<boolean>(false);

  // Selected palette colors
  const activePalette = useMemo(() => {
    return PATTERN_PALETTES.find((p) => p.id === paletteId) ?? PATTERN_PALETTES[0]!;
  }, [paletteId]);

  // Generate SVG string
  const svgOutput = useMemo(() => {
    const options: PatternOptions = {
      type: patternType,
      width,
      height,
      points,
      variance,
      seed,
      colors: activePalette.colors,
      backgroundColor: isTransparent ? "transparent" : "#ffffff",
      invert,
      layers,
    };
    return generatePatternSvg(options);
  }, [
    patternType,
    width,
    height,
    points,
    variance,
    seed,
    activePalette,
    isTransparent,
    invert,
    layers,
  ]);

  // Actions
  const handleRandomize = () => {
    setSeed(Math.floor(Math.random() * 900000) + 1000);
  };

  const handleCopySvg = async () => {
    await navigator.clipboard.writeText(svgOutput);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const handleCopyCss = async () => {
    const css = svgToCssDataUri(svgOutput);
    await navigator.clipboard.writeText(css);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgOutput], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `vector-${patternType}-${seed}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Presets & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pattern Type Selector */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <Select value={patternType} onValueChange={(val) => setPatternType(val as PatternType)}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="Pattern Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="layered-waves">Layered Waves</SelectItem>
                <SelectItem value="waves">Single Wave</SelectItem>
                <SelectItem value="blobs">Organic Blob</SelectItem>
                <SelectItem value="grid-dots">Dot Grid Matrix</SelectItem>
                <SelectItem value="mesh-gradient">Mesh Gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Palette Selector */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-500" />
            <Select value={paletteId} onValueChange={setPaletteId}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="Color Theme" />
              </SelectTrigger>
              <SelectContent>
                {PATTERN_PALETTES.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Randomize Button */}
          <button
            type="button"
            onClick={handleRandomize}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-500" />
            <span>Generate New</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCss}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Code className="w-3.5 h-3.5" />}
            <span>{copiedCss ? "CSS Copied!" : "Copy CSS"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopySvg}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSvg ? "SVG Copied!" : "Copy SVG"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SVG</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parametric Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Vector Parameters</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">Seed: #{seed}</span>
            </div>

            {/* Curvature & Variance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Curve Variance</span>
                <span className="font-mono">{variance}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={95}
                value={variance}
                onChange={(e) => setVariance(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Complexity / Points Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Complexity Points</span>
                <span className="font-mono">{points}</span>
              </div>
              <input
                type="range"
                min={3}
                max={9}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Layer Count Slider (for layered waves) */}
            {patternType === "layered-waves" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Stacked Layers</span>
                  <span className="font-mono">{layers}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={4}
                  value={layers}
                  onChange={(e) => setLayers(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            )}

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Canvas Width
                </label>
                <input
                  type="number"
                  min={300}
                  max={2560}
                  step={20}
                  value={width}
                  onChange={(e) => setWidth(Math.max(200, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 rounded-md text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Canvas Height
                </label>
                <input
                  type="number"
                  min={200}
                  max={1600}
                  step={20}
                  value={height}
                  onChange={(e) => setHeight(Math.max(100, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 rounded-md text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <label className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <span>Invert / Flip Vertically</span>
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(e) => setInvert(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <span>Transparent Background</span>
                <input
                  type="checkbox"
                  checked={isTransparent}
                  onChange={(e) => setIsTransparent(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live SVG Preview Canvas */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Interactive Canvas Preview
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {width} × {height} px
              </span>
            </div>

            {/* SVG Viewport */}
            <div className="flex-1 overflow-auto rounded-lg bg-slate-100/80 dark:bg-slate-950 p-6 flex items-center justify-center min-h-[380px] border border-slate-200/60 dark:border-slate-800">
              <div
                className="w-full max-w-full overflow-hidden flex items-center justify-center transition-all duration-300 rounded-lg shadow-sm"
                dangerouslySetInnerHTML={{ __html: svgOutput }}
              />
            </div>

            {/* Quick Code Preview */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Zero server calls · 100% vector SVG curves</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {(svgOutput.length / 1024).toFixed(1)} KB SVG
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
