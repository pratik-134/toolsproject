"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  FilterAdjustments,
  DEFAULT_FILTER_ADJUSTMENTS,
  FILTER_PRESETS,
  buildCssFilterString,
  applyPreset,
} from "./logic";
import {
  Sliders,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Palette,
} from "lucide-react";

export default function PhotoFilterStudioTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("photo");
  const [adjustments, setAdjustments] = useState<FilterAdjustments>({ ...DEFAULT_FILTER_ADJUSTMENTS });
  const [activePreset, setActivePreset] = useState<string>("original");
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [quality, setQuality] = useState<number>(0.92);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate scenic canvas sample image
  const loadSamplePhoto = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 300);
    sky.addColorStop(0, "#0284c7");
    sky.addColorStop(0.6, "#f59e0b");
    sky.addColorStop(1, "#ef4444");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 700, 450);

    // Glowing sun
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(350, 220, 60, 0, Math.PI * 2);
    ctx.fill();

    // Mountain silhouettes
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(0, 450);
    ctx.lineTo(150, 260);
    ctx.lineTo(280, 360);
    ctx.lineTo(440, 240);
    ctx.lineTo(580, 340);
    ctx.lineTo(700, 280);
    ctx.lineTo(700, 450);
    ctx.closePath();
    ctx.fill();

    // Foreground lake
    const lake = ctx.createLinearGradient(0, 350, 0, 450);
    lake.addColorStop(0, "#0f172a");
    lake.addColorStop(1, "#020617");
    ctx.fillStyle = lake;
    ctx.fillRect(0, 350, 700, 100);

    setImageSrc(canvas.toDataURL("image/png"));
    setImageName("sunset-mountains");
    setAdjustments({ ...DEFAULT_FILTER_ADJUSTMENTS });
    setActivePreset("original");
  }, []);

  useEffect(() => {
    loadSamplePhoto();
  }, [loadSamplePhoto]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    setImageName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        setImageSrc(src);
        setAdjustments({ ...DEFAULT_FILTER_ADJUSTMENTS });
        setActivePreset("original");
      }
    };
    reader.readAsDataURL(file);
  };

  // Re-render preview canvas with applied filters (optimized to max 1280px for instant 60fps sliders)
  useEffect(() => {
    if (!imageSrc) return;

    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (isCancelled) return;
      const MAX_PREVIEW = 1280;
      let w = img.naturalWidth || 800;
      let h = img.naturalHeight || 600;
      if (w > MAX_PREVIEW || h > MAX_PREVIEW) {
        if (w > h) {
          h = Math.round((h * MAX_PREVIEW) / w);
          w = MAX_PREVIEW;
        } else {
          w = Math.round((w * MAX_PREVIEW) / h);
          h = MAX_PREVIEW;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const filterStr = isComparing ? "none" : buildCssFilterString(adjustments);
      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL(outputFormat, quality);
      if (!isCancelled) {
        setPreviewUrl(dataUrl);
      }
    };
    img.src = imageSrc;

    return () => {
      isCancelled = true;
    };
  }, [imageSrc, adjustments, isComparing, outputFormat, quality]);

  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    setAdjustments(applyPreset(presetId));
  };

  const updateAdjustment = (key: keyof FilterAdjustments, value: number) => {
    setActivePreset("custom");
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setActivePreset("original");
    setAdjustments({ ...DEFAULT_FILTER_ADJUSTMENTS });
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const filterStr = isComparing ? "none" : buildCssFilterString(adjustments);
      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0);

      const fullDataUrl = canvas.toDataURL(outputFormat, quality);
      const ext = outputFormat === "image/png" ? "png" : outputFormat === "image/jpeg" ? "jpg" : "webp";
      const a = document.createElement("a");
      a.href = fullDataUrl;
      a.download = `${imageName}-${activePreset}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = imageSrc;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Photo Processing — Filters render directly in your browser canvas. No image data is uploaded.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Color & Filter Presets
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSamplePhoto}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sample
              </Button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FILTER_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                    activePreset === p.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Fine Sliders */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                  Manual Adjustments
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Slider list */}
              <div className="space-y-2.5 text-xs">
                {/* Brightness */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Brightness</span>
                    <span className="font-mono text-foreground">{adjustments.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={adjustments.brightness}
                    onChange={(e) => updateAdjustment("brightness", parseInt(e.target.value, 10))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Contrast</span>
                    <span className="font-mono text-foreground">{adjustments.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={adjustments.contrast}
                    onChange={(e) => updateAdjustment("contrast", parseInt(e.target.value, 10))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Saturation</span>
                    <span className="font-mono text-foreground">{adjustments.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={adjustments.saturation}
                    onChange={(e) => updateAdjustment("saturation", parseInt(e.target.value, 10))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Hue Rotate */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Hue Rotation</span>
                    <span className="font-mono text-foreground">{adjustments.hueRotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={adjustments.hueRotate}
                    onChange={(e) => updateAdjustment("hueRotate", parseInt(e.target.value, 10))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Sepia & Grayscale */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Sepia</span>
                      <span className="font-mono text-foreground">{adjustments.sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adjustments.sepia}
                      onChange={(e) => updateAdjustment("sepia", parseInt(e.target.value, 10))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Grayscale</span>
                      <span className="font-mono text-foreground">{adjustments.grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adjustments.grayscale}
                      onChange={(e) => updateAdjustment("grayscale", parseInt(e.target.value, 10))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                {/* Blur */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Soft Blur</span>
                    <span className="font-mono text-foreground">{adjustments.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={adjustments.blur}
                    onChange={(e) => updateAdjustment("blur", parseInt(e.target.value, 10))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Export Settings & Upload */}
            <div className="space-y-2 pt-3 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Export Format
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["image/png", "image/jpeg", "image/webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={`py-1.5 px-2 rounded-lg border font-medium uppercase tracking-wider text-[11px] transition-colors ${
                      outputFormat === fmt
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {fmt.split("/")[1]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-xs gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl min-h-[420px] flex flex-col justify-between items-center space-y-4">
            <div className="w-full flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant={isComparing ? "default" : "outline"}
                  size="sm"
                  onMouseDown={() => setIsComparing(true)}
                  onMouseUp={() => setIsComparing(false)}
                  onMouseLeave={() => setIsComparing(false)}
                  onTouchStart={() => setIsComparing(true)}
                  onTouchEnd={() => setIsComparing(false)}
                  className="h-7 text-xs gap-1.5 select-none"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Hold to Compare
                </Button>
                {isComparing && (
                  <span className="text-[11px] text-amber-500 font-medium">Viewing Original</span>
                )}
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                disabled={!previewUrl}
                className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-3.5 h-3.5" />
                Download Filtered Image
              </Button>
            </div>

            <div className="flex-1 flex items-center justify-center p-3 max-h-[380px] w-full overflow-hidden">
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Filtered Preview"
                  className="max-h-[350px] max-w-full object-contain rounded-lg shadow-sm border border-border bg-muted/20"
                />
              ) : (
                <p className="text-xs text-muted-foreground">Rendering filter preview...</p>
              )}
            </div>

            <div className="w-full pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Filter: {activePreset.toUpperCase()}</span>
              <span>100% In-Memory Canvas Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
