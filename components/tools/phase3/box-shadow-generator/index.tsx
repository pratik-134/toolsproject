"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Copy,
  Check,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Code2,
} from "lucide-react";
import {
  ShadowLayer,
  buildBoxShadowCss,
  getElevationPreset,
} from "./logic";

export default function BoxShadowGeneratorTool() {
  const [layers, setLayers] = useState<ShadowLayer[]>(getElevationPreset(3));
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);
  const [borderRadius, setBorderRadius] = useState<number>(20);
  const [boxColor, setBoxColor] = useState<string>("#ffffff");
  const [isGlass, setIsGlass] = useState<boolean>(false);
  const [copiedCss, setCopiedCss] = useState<boolean>(false);

  const fallbackLayer: ShadowLayer = {
    id: "l_default",
    x: 0,
    y: 4,
    blur: 8,
    spread: 0,
    color: "rgba(0, 0, 0, 0.1)",
    inset: false,
  };
  const activeLayer: ShadowLayer = layers[activeLayerIndex] ?? layers[0] ?? fallbackLayer;

  const boxShadowCss = useMemo(() => {
    return buildBoxShadowCss(layers);
  }, [layers]);

  const cssDeclaration = useMemo(() => {
    let css = `box-shadow: ${boxShadowCss};\nborder-radius: ${borderRadius}px;`;
    if (isGlass) {
      css += `\nbackground: rgba(255, 255, 255, 0.25);\nbackdrop-filter: blur(12px);\nborder: 1px solid rgba(255, 255, 255, 0.3);`;
    }
    return css;
  }, [boxShadowCss, borderRadius, isGlass]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssDeclaration);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleAddLayer = () => {
    if (layers.length >= 6) return;
    const newL: ShadowLayer = {
      id: `l_${Date.now()}`,
      x: 0,
      y: 8,
      blur: 16,
      spread: 0,
      color: "rgba(0, 0, 0, 0.15)",
      inset: false,
    };
    setLayers((prev) => [...prev, newL]);
    setActiveLayerIndex(layers.length);
  };

  const handleRemoveLayer = (idx: number) => {
    if (layers.length <= 1) return;
    setLayers((prev) => prev.filter((_, i) => i !== idx));
    setActiveLayerIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              CSS Box-Shadow & Glassmorphism Studio
            </span>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Multi-Layer Stacking
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 shadow-sm transition-opacity"
            >
              {copiedCss ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCss ? "Copied CSS" : "Copy CSS"}
            </button>
          </div>
        </div>

        {/* Elevation Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Elevation:</span>
            {([1, 2, 3, 4, 5] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLayers(getElevationPreset(lvl))}
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-medium transition-colors"
              >
                Level {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer text-foreground font-medium select-none">
              <input
                type="checkbox"
                checked={isGlass}
                onChange={(e) => setIsGlass(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              Glassmorphism Backdrop
            </label>
          </div>
        </div>
      </div>

      {/* Main Split: Interactive Preview & Layer Adjuster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive Preview Box */}
        <div
          style={{
            backgroundImage: isGlass
              ? "radial-gradient(circle at 50% 50%, #38bdf8 0%, #818cf8 50%, #ec4899 100%)"
              : undefined,
          }}
          className="rounded-3xl border border-border bg-muted/40 p-12 flex items-center justify-center min-h-[360px] overflow-hidden"
        >
          <div
            style={{
              boxShadow: boxShadowCss,
              borderRadius: `${borderRadius}px`,
              backgroundColor: isGlass ? "rgba(255, 255, 255, 0.25)" : boxColor,
              backdropFilter: isGlass ? "blur(12px)" : undefined,
              border: isGlass ? "1px solid rgba(255, 255, 255, 0.35)" : undefined,
            }}
            className="w-56 h-56 flex flex-col items-center justify-center text-center p-4 transition-all select-none"
          >
            <span className="font-semibold text-sm text-foreground">Interactive Card</span>
            <span className="text-[11px] text-muted-foreground mt-1">Multi-layer shadow elevation</span>
          </div>
        </div>

        {/* Right: Controls & Layer List */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="font-semibold text-sm text-foreground">Layer Settings</h3>
            <button
              type="button"
              onClick={handleAddLayer}
              disabled={layers.length >= 6}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-medium disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Shadow Layer
            </button>
          </div>

          {/* Layer Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {layers.map((l, idx) => (
              <div
                key={l.id}
                onClick={() => setActiveLayerIndex(idx)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer flex items-center gap-2 transition-all ${
                  idx === activeLayerIndex
                    ? "bg-foreground text-background font-semibold border-foreground"
                    : "border-border hover:bg-muted text-foreground"
                }`}
              >
                <span>Layer {idx + 1}</span>
                {layers.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLayer(idx);
                    }}
                    className="opacity-60 hover:opacity-100"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Active Layer Sliders */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Offset X</span>
                <span className="font-mono text-foreground">{activeLayer.x}px</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={activeLayer.x}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLayers((prev) => prev.map((l, i) => (i === activeLayerIndex ? { ...l, x: val } : l)));
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Offset Y</span>
                <span className="font-mono text-foreground">{activeLayer.y}px</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={activeLayer.y}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLayers((prev) => prev.map((l, i) => (i === activeLayerIndex ? { ...l, y: val } : l)));
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Blur Radius</span>
                <span className="font-mono text-foreground">{activeLayer.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={activeLayer.blur}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLayers((prev) => prev.map((l, i) => (i === activeLayerIndex ? { ...l, blur: val } : l)));
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Spread Radius</span>
                <span className="font-mono text-foreground">{activeLayer.spread}px</span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                value={activeLayer.spread}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLayers((prev) => prev.map((l, i) => (i === activeLayerIndex ? { ...l, spread: val } : l)));
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* CSS Output snippet */}
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground font-medium">CSS Code:</span>
            <pre className="p-3 rounded-xl bg-muted/50 border border-border font-mono text-xs text-foreground overflow-x-auto">
              {cssDeclaration}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
