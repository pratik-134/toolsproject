"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ResizeMode,
  RESIZE_PRESETS,
  calculateProportionalDimension,
  calculatePercentageDimensions,
  calculateCanvasPlacement,
} from "./logic";
import {
  Upload,
  Download,
  Scaling,
  Lock,
  Unlock,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  Palette,
  X,
} from "lucide-react";

export default function CanvasResizerTool() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);

  // Dimension controls
  const [targetWidth, setTargetWidth] = useState<number>(1920);
  const [targetHeight, setTargetHeight] = useState<number>(1080);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [resizeMode, setResizeMode] = useState<ResizeMode>("fit");
  const [padColor, setPadColor] = useState<string>("#ffffff");
  const [resampleMode, setResampleMode] = useState<"high" | "pixelated">("high");

  // Output format controls
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("webp");
  const [quality, setQuality] = useState<number>(90);

  // Execution state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    };
  }, [previewUrl, resizedUrl]);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WebP, BMP, etc.)");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    setResizedBlob(null);
    setResizedUrl(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSourceFile(file);

    const img = new Image();
    img.onload = () => {
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && naturalDimensions && val > 0) {
      const prop = calculateProportionalDimension(
        naturalDimensions.width,
        naturalDimensions.height,
        { width: val }
      );
      setTargetHeight(prop.height);
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && naturalDimensions && val > 0) {
      const prop = calculateProportionalDimension(
        naturalDimensions.width,
        naturalDimensions.height,
        { height: val }
      );
      setTargetWidth(prop.width);
    }
  };

  const handlePercentageClick = (pct: number) => {
    if (!naturalDimensions) return;
    const res = calculatePercentageDimensions(
      naturalDimensions.width,
      naturalDimensions.height,
      pct
    );
    setTargetWidth(res.width);
    setTargetHeight(res.height);
  };

  const handlePresetSelect = (w: number, h: number) => {
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const executeResize = async () => {
    if (!sourceFile || !previewUrl || !naturalDimensions || targetWidth <= 0 || targetHeight <= 0) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load source image into canvas"));
        img.src = previewUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context");

      // Fill background if padding or JPEG format
      if (resizeMode === "pad" || outputFormat === "jpeg") {
        ctx.fillStyle = padColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.imageSmoothingEnabled = resampleMode === "high";
      if (resampleMode === "high") {
        ctx.imageSmoothingQuality = "high";
      }

      const placement = calculateCanvasPlacement(
        naturalDimensions.width,
        naturalDimensions.height,
        targetWidth,
        targetHeight,
        resizeMode
      );

      ctx.drawImage(
        img,
        placement.destX,
        placement.destY,
        placement.destWidth,
        placement.destHeight
      );

      const mime =
        outputFormat === "png"
          ? "image/png"
          : outputFormat === "webp"
          ? "image/webp"
          : "image/jpeg";

      const q = quality / 100;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to export resized canvas"))),
          mime,
          q
        );
      });

      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
      const url = URL.createObjectURL(blob);
      setResizedUrl(url);
      setResizedBlob(blob);
    } catch (err: any) {
      setError(err?.message || "Resize execution failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resizedBlob || !resizedUrl || !sourceFile) return;
    const baseName = sourceFile.name.substring(0, sourceFile.name.lastIndexOf(".")) || sourceFile.name;
    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
    const filename = `${baseName}_resized_${targetWidth}x${targetHeight}.${ext}`;

    const a = document.createElement("a");
    a.href = resizedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-body">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Scaling className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-headings text-sm sm:text-base font-bold text-slate-900">
              Canvas Resizer & Resolution Scaler
            </h2>
            <p className="text-xs text-slate-600">
              Resize pixel dimensions with aspect ratio lock, percentage scaling, and canvas padding.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-semibold shrink-0 shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>100% Client-Side Privacy</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Resizing Error:</strong> {error}
          </div>
        </div>
      )}

      {!sourceFile ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 bg-white hover:bg-slate-50/80 shadow-xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />
          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="font-headings text-lg font-bold text-slate-900 mb-1">
            Choose an image to resize
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
            Scale pixel dimensions for banners, social media, thumbnails, or web optimization.
          </p>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-xs font-bold"
          >
            Select Image
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Header */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Thumb"
                  className="h-12 w-12 rounded-lg object-contain border border-slate-200 bg-slate-50"
                />
              )}
              <div>
                <h4 className="font-headings text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {sourceFile.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Original: {naturalDimensions?.width} × {naturalDimensions?.height} px •{" "}
                  {((sourceFile.size) / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Change Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSourceFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  if (resizedUrl) URL.revokeObjectURL(resizedUrl);
                  setPreviewUrl(null);
                  setResizedUrl(null);
                  setResizedBlob(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            </div>
          </div>

          {/* Dimension Controls Card */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="h-4 w-4 text-blue-600" />
              <h3 className="font-headings text-sm font-bold text-slate-900">
                Target Dimensions
              </h3>
            </div>

            {/* Quick Percentage Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Quick Scale Presets
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageClick(pct)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:border-blue-500 hover:bg-blue-50/50 transition-all"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Width, Height, and Aspect Lock */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold text-slate-700">Width (pixels)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">px</span>
                </div>
              </div>

              {/* Lock Aspect Ratio Toggle Button */}
              <div className="sm:col-span-2 flex justify-center pt-4 sm:pt-0">
                <button
                  type="button"
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`p-2 rounded-xl border transition-all ${
                    lockAspect
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-600"
                  }`}
                  title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                >
                  {lockAspect ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                </button>
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold text-slate-700">Height (pixels)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">px</span>
                </div>
              </div>
            </div>

            {/* Popular Dimension Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Standard Resolution Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RESIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.width, preset.height)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all bg-slate-50/50 hover:bg-white"
                  >
                    <span className="font-headings text-xs font-bold text-slate-800 block truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {preset.width} × {preset.height} px
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resize Mode Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Resize Fit Behavior
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[
                  { id: "fit", name: "Fit Inside", desc: "Maintains aspect ratio, no cropping" },
                  { id: "fill", name: "Fill & Crop", desc: "Covers entire canvas, crops edges" },
                  { id: "stretch", name: "Stretch", desc: "Stretches to exact width & height" },
                  { id: "pad", name: "Pad Canvas", desc: "Adds colored margins around image" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setResizeMode(m.id as ResizeMode)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      resizeMode === m.id
                        ? "border-blue-600 bg-blue-50/80 ring-1 ring-blue-500 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="font-headings text-xs font-bold text-slate-900 block">
                      {m.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Padding Color when 'pad' mode selected */}
            {resizeMode === "pad" && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Palette className="h-4 w-4 text-blue-600" />
                <label className="text-xs font-bold text-slate-700">Margin Padding Color:</label>
                <input
                  type="color"
                  value={padColor}
                  onChange={(e) => setPadColor(e.target.value)}
                  className="h-8 w-12 rounded cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <span className="text-xs text-slate-500 font-mono">{padColor}</span>
              </div>
            )}

            {/* Output Format and Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Export Format</label>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {(["webp", "png", "jpeg"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setOutputFormat(fmt)}
                      className={`flex-1 py-1 rounded-md text-xs font-bold uppercase transition-all ${
                        outputFormat === fmt
                          ? "bg-white text-blue-700 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {outputFormat !== "png" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Quality</span>
                    <span className="text-blue-700">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                  />
                </div>
              )}
            </div>

            {/* Execute Button */}
            <div className="pt-2">
              <Button
                onClick={executeResize}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Rescaling Image...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Resize Canvas to {targetWidth} × {targetHeight} px
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Resized Result Card */}
          {resizedBlob && resizedUrl && (
            <div className="p-6 rounded-2xl border-2 border-emerald-500/40 bg-white shadow-md space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-headings text-sm sm:text-base font-bold text-slate-900">
                    Resized Successfully!
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {targetWidth} × {targetHeight} px • {((resizedBlob.size) / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-center max-h-80 overflow-hidden">
                <img
                  src={resizedUrl}
                  alt="Resized Preview"
                  className="max-h-72 max-w-full object-contain rounded-lg shadow-2xs"
                />
              </div>

              <Button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                Download Resized Image ({outputFormat.toUpperCase()})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
