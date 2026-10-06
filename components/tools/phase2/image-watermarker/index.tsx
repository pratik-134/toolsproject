"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  WatermarkOptions,
  WatermarkPosition,
  DEFAULT_WATERMARK_OPTIONS,
  WATERMARK_PRESETS,
  calculateSinglePosition,
  calculateTiledGrid,
} from "./logic";
import {
  Stamp,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Grid,
  Type,
  Layers,
  Image as ImageIcon,
  X,
} from "lucide-react";

const POSITION_LABELS: { id: WatermarkPosition; label: string }[] = [
  { id: "top-left", label: "TL" },
  { id: "top-center", label: "TC" },
  { id: "top-right", label: "TR" },
  { id: "center", label: "CTR" },
  { id: "bottom-left", label: "BL" },
  { id: "bottom-center", label: "BC" },
  { id: "bottom-right", label: "BR" },
];

export default function ImageWatermarkerTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("document");
  const [options, setOptions] = useState<WatermarkOptions>({ ...DEFAULT_WATERMARK_OPTIONS });
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [quality, setQuality] = useState<number>(0.92);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load original sample architecture photograph
  const loadSampleDocument = useCallback(() => {
    setImageSrc("/images/samples/architecture-sample.jpg");
    setImageName("modern-architecture-commercial");
    setOptions({ ...DEFAULT_WATERMARK_OPTIONS });
  }, []);

  useEffect(() => {
    loadSampleDocument();
  }, [loadSampleDocument]);

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
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageSrc(null);
    setImageName("");
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Render watermarked image onto offscreen canvas
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Setup watermark font & styling
      ctx.save();
      ctx.font = `bold ${options.fontSize}px sans-serif`;
      ctx.fillStyle = options.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, options.opacity));
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const rad = (options.rotation * Math.PI) / 180;
      const metrics = ctx.measureText(options.text);
      const textWidth = metrics.width;
      const textHeight = options.fontSize;

      if (options.mode === "single") {
        const pos = calculateSinglePosition(
          img.naturalWidth,
          img.naturalHeight,
          textWidth,
          textHeight,
          options.position,
          options.margin
        );

        ctx.translate(pos.x, pos.y);
        ctx.rotate(rad);
        ctx.fillText(options.text, 0, 0);
      } else {
        // Tiled repeating watermark
        const points = calculateTiledGrid(
          img.naturalWidth,
          img.naturalHeight,
          options.tileSpacingX,
          options.tileSpacingY
        );

        for (const pt of points) {
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(rad);
          ctx.fillText(options.text, 0, 0);
          ctx.restore();
        }
      }

      ctx.restore();

      const dataUrl = canvas.toDataURL(outputFormat, quality);
      setPreviewUrl(dataUrl);
    };
    img.src = imageSrc;
  }, [imageSrc, options, outputFormat, quality]);

  const applyPresetConfig = (presetOpts: Partial<WatermarkOptions>) => {
    setOptions((prev) => ({ ...prev, ...presetOpts }));
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const ext = outputFormat === "image/png" ? "png" : outputFormat === "image/jpeg" ? "jpg" : "webp";
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${imageName}-watermarked.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Watermarking — Watermark rendering occurs in local canvas memory with zero server uploads.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Stamp className="w-4 h-4 text-primary" />
                Watermark Presets
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSampleDocument}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sample Doc
              </Button>
            </div>

            {/* Presets buttons */}
            <div className="grid grid-cols-2 gap-2">
              {WATERMARK_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPresetConfig(p.options)}
                  className="p-2 rounded-lg bg-muted/40 hover:bg-muted border border-border text-xs font-medium text-foreground text-left transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Mode & Text Config */}
            <div className="space-y-3 pt-2 border-t border-border text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                  Layout Mode
                </span>
                <div className="flex gap-1">
                  <Button
                    variant={options.mode === "single" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOptions({ ...options, mode: "single" })}
                    className="h-6 text-[11px] px-2.5 gap-1"
                  >
                    <Type className="w-3 h-3" />
                    Single Stamp
                  </Button>
                  <Button
                    variant={options.mode === "tiled" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOptions({ ...options, mode: "tiled" })}
                    className="h-6 text-[11px] px-2.5 gap-1"
                  >
                    <Grid className="w-3 h-3" />
                    Diagonal Tiled
                  </Button>
                </div>
              </div>

              {/* Watermark Text */}
              <div>
                <label className="text-muted-foreground block mb-1">Watermark Text</label>
                <input
                  type="text"
                  value={options.text}
                  onChange={(e) => setOptions({ ...options, text: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg text-foreground font-semibold text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. CONFIDENTIAL"
                />
              </div>

              {/* Color & Opacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1">Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={options.color}
                      onChange={(e) => setOptions({ ...options, color: e.target.value })}
                      className="w-7 h-7 p-0 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={options.color}
                      onChange={(e) => setOptions({ ...options, color: e.target.value })}
                      className="w-full px-2 py-1 bg-muted/40 border border-border rounded text-xs font-mono text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Opacity</span>
                    <span className="font-mono text-foreground">{Math.round(options.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={options.opacity}
                    onChange={(e) => setOptions({ ...options, opacity: parseFloat(e.target.value) })}
                    className="w-full accent-primary cursor-pointer mt-1"
                  />
                </div>
              </div>

              {/* Size & Rotation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Font Size</span>
                    <span className="font-mono text-foreground">{options.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="100"
                    value={options.fontSize}
                    onChange={(e) => setOptions({ ...options, fontSize: parseInt(e.target.value, 10) })}
                    className="w-full accent-primary cursor-pointer mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Rotation</span>
                    <span className="font-mono text-foreground">{options.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={options.rotation}
                    onChange={(e) => setOptions({ ...options, rotation: parseInt(e.target.value, 10) })}
                    className="w-full accent-primary cursor-pointer mt-1"
                  />
                </div>
              </div>

              {/* Anchor Position (Single mode only) */}
              {options.mode === "single" && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block mb-1.5 font-medium">
                    Anchor Position
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {POSITION_LABELS.map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => setOptions({ ...options, position: pos.id })}
                        className={`py-1 px-1 rounded border text-[10px] font-mono font-medium transition-colors ${
                          options.position === pos.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/30 border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload & Format */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center gap-2">
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
                  Upload Image
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOptions({ ...DEFAULT_WATERMARK_OPTIONS })}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground shrink-0"
                  title="Reset watermark settings"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl min-h-[420px] flex flex-col justify-between items-center space-y-4">
            <div className="w-full flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{imageName ? `${imageName}` : "Watermarked Preview"}</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {imageSrc && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearImage}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear Image
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!previewUrl}
                  className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-3 max-h-[380px] w-full overflow-hidden">
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Watermarked Preview"
                  className="max-h-[350px] max-w-full object-contain rounded-lg shadow-sm border border-border bg-muted/20"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-xl w-full">
                  <ImageIcon className="w-10 h-10 text-muted-foreground/40 mb-2" />
                  <p className="text-xs font-semibold text-foreground mb-1">No image loaded</p>
                  <p className="text-[11px] text-muted-foreground mb-3">Upload your own photo or load the demo image</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs">
                      <Upload className="w-3.5 h-3.5 mr-1" /> Upload
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadSampleDocument} className="text-xs">
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> Demo Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Mode: {options.mode.toUpperCase()}</span>
              <span>100% Client-Side Alpha Composite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
