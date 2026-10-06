"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Scissors,
  Download,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  Check,
  Palette,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { RangeInput } from "@/components/ui/RangeInput";
import {
  SegmentationOptions,
  ReplacementFill,
  removeBackgroundPixels,
  applyAlphaFeather,
} from "./logic";

export default function ImageBackgroundRemoverTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("image");
  const [tolerance, setTolerance] = useState<number>(20);
  const [feather, setFeather] = useState<number>(2);
  const [fillMode, setFillMode] = useState<"transparent" | "solid" | "gradient">("transparent");
  const [solidColor, setSolidColor] = useState<string>("#ffffff");
  const [gradientStart, setGradientStart] = useState<string>("#3b82f6");
  const [gradientEnd, setGradientEnd] = useState<string>("#ec4899");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stats, setStats] = useState<{ removedPercent: number; width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clear / Remove image and reset states
  const clearImage = () => {
    setImageSrc(null);
    setStats(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Load sample image
  const loadSample = () => {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 600;
    sampleCanvas.height = 600;
    const ctx = sampleCanvas.getContext("2d");
    if (!ctx) return;

    // Solid studio background
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, 0, 600, 600);

    // Subject in center (camera/product icon)
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(150, 150, 300, 300, 40);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(300, 300, 90, 0, Math.PI * 2);
    ctx.fill();

    setFileName("sample_graphic");
    setImageSrc(sampleCanvas.toDataURL("image/png"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lastDot = file.name.lastIndexOf(".");
    const base = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
    setFileName(base);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Run in-browser background segmentation retaining 100% natural resolution
  const processImage = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const origCanvas = document.createElement("canvas");
      origCanvas.width = img.naturalWidth;
      origCanvas.height = img.naturalHeight;
      const origCtx = origCanvas.getContext("2d");
      if (!origCtx) {
        setIsProcessing(false);
        return;
      }

      origCtx.drawImage(img, 0, 0);
      const imgData = origCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      const pixels = imgData.data;

      const { removedPixelCount, totalPixels } = removeBackgroundPixels(
        pixels,
        img.naturalWidth,
        img.naturalHeight,
        {
          tolerance,
          featherRadius: feather,
          smoothRollOff: true,
        }
      );

      if (feather > 0) {
        applyAlphaFeather(pixels, img.naturalWidth, img.naturalHeight, feather);
      }

      origCtx.putImageData(imgData, 0, 0);

      // Render to output canvas with background fill mode at full resolution
      const outCanvas = outputCanvasRef.current;
      if (outCanvas) {
        outCanvas.width = img.naturalWidth;
        outCanvas.height = img.naturalHeight;
        const outCtx = outCanvas.getContext("2d");
        if (outCtx) {
          outCtx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);

          if (fillMode === "solid") {
            outCtx.fillStyle = solidColor;
            outCtx.fillRect(0, 0, img.naturalWidth, img.naturalHeight);
          } else if (fillMode === "gradient") {
            const grad = outCtx.createLinearGradient(0, 0, img.naturalWidth, img.naturalHeight);
            grad.addColorStop(0, gradientStart);
            grad.addColorStop(1, gradientEnd);
            outCtx.fillStyle = grad;
            outCtx.fillRect(0, 0, img.naturalWidth, img.naturalHeight);
          }

          outCtx.drawImage(origCanvas, 0, 0);
        }
      }

      setStats({
        removedPercent: Math.round((removedPixelCount / totalPixels) * 100),
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };

    img.src = imageSrc;
  };

  useEffect(() => {
    if (imageSrc) {
      processImage();
    }
  }, [imageSrc, tolerance, feather, fillMode, solidColor, gradientStart, gradientEnd]);

  const handleDownload = () => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}_no_bg.png`;
      a.style.display = "none";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
  };

  return (
    <div className="space-y-6 font-body">
      {/* Studio Control Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              High-Precision Background Remover
            </span>
            <span className="text-[11px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900 px-2.5 py-0.5 rounded-full">
              100% In-Browser Privacy
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!imageSrc ? (
              <button
                type="button"
                onClick={loadSample}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                Load Sample Graphic
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={clearImage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                  title="Remove current image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove / Clear</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Cutout PNG
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tolerance & Feather Adjusters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <RangeInput
              label="Color Tolerance"
              value={tolerance}
              min={5}
              max={60}
              unit="%"
              minLabel="Gentle (5%)"
              maxLabel="Aggressive (60%)"
              onChange={(val) => setTolerance(val)}
            />
          </div>

          <div>
            <RangeInput
              label="Edge Feather & Smoothing"
              value={feather}
              min={0}
              max={5}
              unit="px"
              minLabel="Crisp (0px)"
              maxLabel="Soft (5px)"
              onChange={(val) => setFeather(val)}
            />
          </div>

          {/* Fill Mode */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Replacement Background
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              {(["transparent", "solid", "gradient"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFillMode(mode)}
                  className={`flex-1 py-1.5 rounded-lg text-xs capitalize transition-colors font-semibold ${
                    fillMode === mode
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      {!imageSrc ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 sm:p-14 text-center bg-white dark:bg-slate-900/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center mx-auto shadow-2xs">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-headings font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              Upload Image to Remove Background
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Retains original resolution with anti-aliased edge feathering. Supports PNG, JPG, WebP. Processed 100% locally.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors">
              Choose Photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={loadSample}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Try Demo Product
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Indicator */}
          {isProcessing && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center gap-2.5 text-xs font-semibold text-blue-700 dark:text-blue-300 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Analyzing border color gradients & feathering alpha edges...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Original Preview */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Original Input
                </span>
                {stats && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {stats.width} × {stats.height}px
                  </span>
                )}
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[320px]">
                <img src={imageSrc} alt="Original" className="max-h-[380px] object-contain" />
              </div>
            </div>

            {/* Right: Transparent Cutout Output */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cutout Result
                </span>
                {stats && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                    {stats.removedPercent}% background removed
                  </span>
                )}
              </div>
              <div
                style={{
                  backgroundImage:
                    fillMode === "transparent"
                      ? "radial-gradient(#94a3b8 1px, transparent 0)"
                      : undefined,
                  backgroundSize: fillMode === "transparent" ? "12px 12px" : undefined,
                }}
                className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[320px]"
              >
                <canvas ref={outputCanvasRef} className="max-h-[380px] object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
