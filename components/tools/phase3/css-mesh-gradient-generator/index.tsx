"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Sliders,
  Maximize2,
  Code2,
  FileCode,
  Layers,
  Palette,
} from "lucide-react";
import {
  MeshPoint,
  DEFAULT_MESH_PRESETS,
  generateMeshCss,
  generateTailwindClass,
  generateMeshSvg,
  randomizeMeshPoints,
} from "./logic";

const INITIAL_POINTS: MeshPoint[] = [
  { id: "p1", x: 20, y: 30, color: "#10b981", radius: 70 },
  { id: "p2", x: 80, y: 25, color: "#06b6d4", radius: 65 },
  { id: "p3", x: 45, y: 75, color: "#8b5cf6", radius: 80 },
  { id: "p4", x: 85, y: 80, color: "#3b82f6", radius: 60 },
];

export default function CssMeshGradientStudioTool() {
  const [backgroundColor, setBackgroundColor] = useState<string>("#030712");
  const [points, setPoints] = useState<MeshPoint[]>(INITIAL_POINTS);
  const [blurAmount, setBlurAmount] = useState<number>(40);
  const [activePointId, setActivePointId] = useState<string>("p1");
  const [copiedCss, setCopiedCss] = useState<boolean>(false);
  const [copiedTailwind, setCopiedTailwind] = useState<boolean>(false);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [exportCodeTab, setExportCodeTab] = useState<"css" | "tailwind" | "svg">("css");

  const canvasRef = useRef<HTMLDivElement>(null);

  const activePoint: MeshPoint = points.find((p) => p.id === activePointId) || points[0] || {
    id: "p1",
    x: 20,
    y: 30,
    color: "#10b981",
    radius: 70,
  };

  // Randomize points
  const handleRandomize = useCallback(() => {
    setPoints((prev) => randomizeMeshPoints(prev));
  }, []);

  // Select Preset
  const handleSelectPreset = (presetId: string) => {
    const preset = DEFAULT_MESH_PRESETS.find((p) => p.id === presetId);
    if (!preset || preset.points.length === 0) return;
    const firstPoint = preset.points[0];
    if (!firstPoint) return;
    setBackgroundColor(preset.backgroundColor);
    setPoints(preset.points);
    setActivePointId(firstPoint.id);
  };

  // Add Point
  const handleAddPoint = () => {
    if (points.length >= 8) return;
    const newPoint: MeshPoint = {
      id: `p_${Date.now()}`,
      x: 30 + Math.floor(Math.random() * 40),
      y: 30 + Math.floor(Math.random() * 40),
      color: "#ec4899",
      radius: 65,
    };
    setPoints((prev) => [...prev, newPoint]);
    setActivePointId(newPoint.id);
  };

  // Remove Point
  const handleRemovePoint = (id: string) => {
    if (points.length <= 2) return;
    setPoints((prev) => prev.filter((p) => p.id !== id));
    if (activePointId === id) {
      const remaining = points.filter((p) => p.id !== id);
      const nextActive = remaining[0];
      if (nextActive) {
        setActivePointId(nextActive.id);
      }
    }
  };

  // Dragging pin coordinates
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (activePoint) {
      setPoints((prev) =>
        prev.map((p) => (p.id === activePoint.id ? { ...p, x: Math.round(x), y: Math.round(y) } : p))
      );
    }
  };

  // Computed Outputs
  const generatedCss = useMemo(() => {
    return generateMeshCss(backgroundColor, points, blurAmount);
  }, [backgroundColor, points, blurAmount]);

  const generatedTailwind = useMemo(() => {
    return generateTailwindClass(backgroundColor, points);
  }, [backgroundColor, points]);

  const generatedSvg = useMemo(() => {
    return generateMeshSvg(backgroundColor, points, 1920, 1080, blurAmount);
  }, [backgroundColor, points, blurAmount]);

  // Copy Helpers
  const copyToClipboard = (text: string, type: "css" | "tailwind" | "svg") => {
    navigator.clipboard.writeText(text);
    if (type === "css") {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    } else if (type === "tailwind") {
      setCopiedTailwind(true);
      setTimeout(() => setCopiedTailwind(false), 2000);
    } else {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  // Download SVG
  const handleDownloadSvg = () => {
    const blob = new Blob([generatedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "qwertygen-mesh-gradient.svg");
    link.click();
    URL.revokeObjectURL(url);
  };

  // Inline radial gradient background for the preview canvas
  const canvasBackgroundStyle = useMemo(() => {
    const radials = points.map(
      (p) => `radial-gradient(at ${p.x}% ${p.y}%, ${p.color} 0px, transparent ${p.radius}%)`
    );
    return {
      backgroundColor,
      backgroundImage: radials.join(", "),
    };
  }, [backgroundColor, points]);

  return (
    <div className="space-y-6">
      {/* Top Header & Presets Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              CSS Mesh Gradient Studio
            </span>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Retina Vector & CSS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomize}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Randomize Mesh
            </button>
          </div>
        </div>

        {/* Curated Aesthetic Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground font-medium">Presets:</span>
            {DEFAULT_MESH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-medium transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-foreground font-medium cursor-pointer">
              <span>Canvas Base:</span>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-6 h-6 rounded border border-border cursor-pointer bg-transparent"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport: Interactive Canvas + Live Point Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Canvas */}
        <div className="lg:col-span-2 space-y-3">
          <div
            ref={canvasRef}
            onClick={handleCanvasMouseDown}
            style={canvasBackgroundStyle}
            className="relative w-full h-80 md:h-[450px] rounded-3xl border border-border/70 overflow-hidden shadow-xl cursor-crosshair select-none transition-all"
          >
            {/* Draggable Interactive Coordinate Pins */}
            {points.map((p, idx) => {
              const isSelected = p.id === activePoint.id;
              return (
                <div
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePointId(p.id);
                  }}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shadow-2xl transition-transform cursor-pointer border-2 ${
                    isSelected
                      ? "scale-125 border-white ring-4 ring-primary ring-offset-2 z-20"
                      : "scale-100 border-black/40 hover:scale-110 z-10"
                  }`}
                >
                  <span
                    className="w-full h-full rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    {idx + 1}
                  </span>
                </div>
              );
            })}

            {/* Click to re-position hint badge */}
            <div className="absolute bottom-4 left-4 pointer-events-none px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md text-[11px] text-white/90 font-medium">
              Click anywhere on canvas to reposition selected color pin #{points.findIndex((p) => p.id === activePoint.id) + 1}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Points: {points.length} / 8</span>
            <span>Click any numbered badge to inspect and adjust radius</span>
          </div>
        </div>

        {/* Right 1 Col: Active Point Controls & Global Adjustments */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Point Inspector
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddPoint}
              disabled={points.length >= 8}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-medium disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Pin
            </button>
          </div>

          {/* Active Point Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Selected: Pin #{points.findIndex((p) => p.id === activePoint.id) + 1}
              </span>
              {points.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemovePoint(activePoint.id)}
                  className="text-rose-500 hover:text-rose-600 text-xs inline-flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            {/* Color Swatch Picker */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Pin Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={activePoint.color}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPoints((prev) =>
                      prev.map((p) => (p.id === activePoint.id ? { ...p, color: val } : p))
                    );
                  }}
                  className="w-10 h-10 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={activePoint.color}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPoints((prev) =>
                      prev.map((p) => (p.id === activePoint.id ? { ...p, color: val } : p))
                    );
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background font-mono text-xs uppercase"
                />
              </div>
            </div>

            {/* Radius / Spread Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Spread Radius</span>
                <span className="font-mono text-foreground font-semibold">{activePoint.radius}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={activePoint.radius}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPoints((prev) =>
                    prev.map((p) => (p.id === activePoint.id ? { ...p, radius: val } : p))
                  );
                }}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Global Mesh Blur Slider */}
            <div className="space-y-1.5 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Filter Blur (Softness)</span>
                <span className="font-mono text-foreground font-semibold">{blurAmount}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={blurAmount}
                onChange={(e) => setBlurAmount(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
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
              Production Export Studio
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setExportCodeTab("css")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                exportCodeTab === "css"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Pure CSS
            </button>
            <button
              type="button"
              onClick={() => setExportCodeTab("tailwind")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                exportCodeTab === "tailwind"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Tailwind CSS
            </button>
            <button
              type="button"
              onClick={() => setExportCodeTab("svg")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                exportCodeTab === "svg"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Vector SVG
            </button>

            <button
              type="button"
              onClick={() => {
                if (exportCodeTab === "css") copyToClipboard(generatedCss, "css");
                else if (exportCodeTab === "tailwind") copyToClipboard(generatedTailwind, "tailwind");
                else copyToClipboard(generatedSvg, "svg");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              {(exportCodeTab === "css" && copiedCss) ||
              (exportCodeTab === "tailwind" && copiedTailwind) ||
              (exportCodeTab === "svg" && copiedSvg) ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download SVG
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-muted/50 border border-border font-mono text-xs text-foreground overflow-x-auto max-h-48 selection:bg-primary/20">
            {exportCodeTab === "css" && generatedCss}
            {exportCodeTab === "tailwind" && generatedTailwind}
            {exportCodeTab === "svg" && generatedSvg}
          </pre>
        </div>
      </div>
    </div>
  );
}
