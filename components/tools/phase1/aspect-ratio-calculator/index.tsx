"use client";

import React, { useState, useMemo } from "react";
import { Maximize2, Monitor, ArrowRightLeft, Sparkles, Layers } from "lucide-react";
import { gcd, calculateRatioFromDimensions, calculateDimension, RatioResult } from "./logic";

const PRESETS = [
  { name: "16:9 (HD / 4K)", rx: 16, ry: 9 },
  { name: "4:3 (Standard TV / iPad)", rx: 4, ry: 3 },
  { name: "1:1 (Square / Feed)", rx: 1, ry: 1 },
  { name: "9:16 (Stories / Reels)", rx: 9, ry: 16 },
  { name: "21:9 (Ultrawide / Cinema)", rx: 21, ry: 9 },
  { name: "3:2 (Classic 35mm DSLR)", rx: 3, ry: 2 },
];

export default function AspectRatioCalculatorTool() {
  const [mode, setMode] = useState<"dimensions" | "find-ratio">("dimensions");
  const [ratioX, setRatioX] = useState<number>(16);
  const [ratioY, setRatioY] = useState<number>(9);
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);

  // When in "dimensions" mode, user alters either W or H
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (ratioX > 0 && ratioY > 0 && val > 0) {
      setHeight(calculateDimension(ratioX, ratioY, "width", val));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (ratioX > 0 && ratioY > 0 && val > 0) {
      setWidth(calculateDimension(ratioX, ratioY, "height", val));
    }
  };

  const handlePresetClick = (rx: number, ry: number) => {
    setRatioX(rx);
    setRatioY(ry);
    if (width > 0) {
      setHeight(calculateDimension(rx, ry, "width", width));
    }
  };

  const ratioInfo: RatioResult | null = useMemo(() => {
    try {
      if (width > 0 && height > 0) {
        return calculateRatioFromDimensions(width, height);
      }
      return null;
    } catch {
      return null;
    }
  }, [width, height]);

  return (
    <div className="space-y-6">
      {/* Ratio Presets Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Standard Aspect Ratios:
          </label>
          <div className="flex flex-wrap gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePresetClick(p.rx, p.ry)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  ratioX === p.rx && ratioY === p.ry
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Dimensions Form */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-teal-600" /> Aspect Ratio Settings
            </h3>
            <div className="flex rounded-md p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode("dimensions")}
                className={`px-3 py-1 rounded transition-colors ${
                  mode === "dimensions"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Calculate Dimension
              </button>
              <button
                type="button"
                onClick={() => setMode("find-ratio")}
                className={`px-3 py-1 rounded transition-colors ${
                  mode === "find-ratio"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Find Ratio from W/H
              </button>
            </div>
          </div>

          {/* Ratio Inputs (when in dimensions mode) */}
          {mode === "dimensions" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Aspect Ratio (Width : Height)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={ratioX || ""}
                  onChange={(e) => {
                    const rx = parseInt(e.target.value) || 1;
                    setRatioX(rx);
                    if (width > 0 && ratioY > 0) {
                      setHeight(calculateDimension(rx, ratioY, "width", width));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500 text-center"
                  placeholder="16"
                />
                <span className="font-bold text-slate-400 text-lg">:</span>
                <input
                  type="number"
                  min="1"
                  value={ratioY || ""}
                  onChange={(e) => {
                    const ry = parseInt(e.target.value) || 1;
                    setRatioY(ry);
                    if (width > 0 && ratioX > 0) {
                      setHeight(calculateDimension(ratioX, ry, "width", width));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500 text-center"
                  placeholder="9"
                />
              </div>
            </div>
          )}

          {/* Width and Height Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Width (pixels)
              </label>
              <input
                type="number"
                min="1"
                value={width || ""}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Height (pixels)
              </label>
              <input
                type="number"
                min="1"
                value={height || ""}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Quick Rescaling Table */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Proportional Scales (Same Aspect Ratio)
            </label>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              {[0.5, 0.75, 1.5, 2].map((scale) => {
                const sW = Math.round(width * scale);
                const sH = Math.round(height * scale);
                return (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => {
                      setWidth(sW);
                      setHeight(sH);
                    }}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors"
                  >
                    <div className="text-slate-400 text-[10px]">{scale}x Scale</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {sW} × {sH}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Visual Proportion Preview & Stats */}
        <div className="lg:col-span-5 space-y-4">
          {/* Ratio Summary Card */}
          <div className="p-6 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-200 dark:border-teal-900/60 rounded-2xl shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Computed Aspect Ratio
            </span>

            {ratioInfo ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {ratioInfo.ratioString}
                  </div>
                  <span className="text-sm font-medium text-slate-500 font-mono">
                    ({ratioInfo.decimalRatio}:1)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Total Megapixels
                    </div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {ratioInfo.megapixels} MP
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                      Total Pixels
                    </div>
                    <div className="text-base font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                      {ratioInfo.totalPixels.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Visual Preview Box */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-teal-600" /> Geometric Scale Preview
              </span>
              <span className="text-slate-400 font-mono">
                {width} × {height}
              </span>
            </div>

            <div className="h-44 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center p-3 overflow-hidden">
              <div
                style={{
                  aspectRatio: `${Math.max(1, width)} / ${Math.max(1, height)}`,
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
                className="bg-teal-600/20 border-2 border-teal-500 rounded-md flex items-center justify-center text-xs font-mono font-bold text-teal-700 dark:text-teal-300 transition-all duration-200"
              >
                {width} × {height}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
