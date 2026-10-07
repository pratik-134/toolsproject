"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Pipette,
  Layers,
  ShieldCheck,
  X,
} from "lucide-react";
import { RangeInput } from "@/components/ui/RangeInput";
import {
  SegmentationOptions,
  ReplacementFill,
  removeBackgroundPixels,
  applyAlphaFeather,
  calculateSafeDimensions,
  MAX_SAFE_IMAGE_DIMENSION,
} from "./logic";

export default function ImageBackgroundRemoverTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("image");
  const [tolerance, setTolerance] = useState<number>(20);
  const [feather, setFeather] = useState<number>(2);
  const [mode, setMode] = useState<"contiguous" | "global">("contiguous");
  const [customSeeds, setCustomSeeds] = useState<Array<[number, number, number]>>([]);
  const [eyedropperActive, setEyedropperActive] = useState<boolean>(false);
  const [fillMode, setFillMode] = useState<"transparent" | "solid" | "gradient">("transparent");
  const [solidColor, setSolidColor] = useState<string>("#ffffff");
  const [gradientStart, setGradientStart] = useState<string>("#3b82f6");
  const [gradientEnd, setGradientEnd] = useState<string>("#ec4899");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stats, setStats] = useState<{
    removedPercent: number;
    width: number;
    height: number;
    origWidth: number;
    origHeight: number;
    scaled: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const jobIdRef = useRef<number>(0);

  // Clear / Remove image and reset states
  const clearImage = () => {
    setImageSrc(null);
    setStats(null);
    setIsProcessing(false);
    setCustomSeeds([]);
    setEyedropperActive(false);
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

    setFileName("sample_product");
    setCustomSeeds([]);
    setImageSrc(sampleCanvas.toDataURL("image/png"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lastDot = file.name.lastIndexOf(".");
    const base = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
    setFileName(base);
    setCustomSeeds([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Click on image to sample background color (Eyedropper)
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!eyedropperActive || !originalImgRef.current) return;

    const img = originalImgRef.current;
    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Map displayed coords to natural image coords
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const actualX = Math.floor(clickX * scaleX);
    const actualY = Math.floor(clickY * scaleY);

    // Read pixel color from sample canvas
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 1;
    sampleCanvas.height = 1;
    const ctx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, actualX, actualY, 1, 1, 0, 0, 1, 1);
    const p = ctx.getImageData(0, 0, 1, 1).data;
    const seedColor: [number, number, number] = [p[0] ?? 255, p[1] ?? 255, p[2] ?? 255];

    setCustomSeeds((prev) => [...prev, seedColor]);
  };

  // Run in-browser background segmentation safely with bounded memory
  const processImage = useCallback(() => {
    if (!imageSrc) return;

    const currentJobId = ++jobIdRef.current;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Yield to let UI show processing state cleanly
      setTimeout(() => {
        if (currentJobId !== jobIdRef.current) return;

        const origW = img.naturalWidth;
        const origH = img.naturalHeight;

        // Calculate safe dimensions (prevents browser tab crashes on 12MP-24MP images)
        const { width: targetW, height: targetH, scaled } = calculateSafeDimensions(
          origW,
          origH,
          MAX_SAFE_IMAGE_DIMENSION
        );

        const origCanvas = document.createElement("canvas");
        origCanvas.width = targetW;
        origCanvas.height = targetH;
        const origCtx = origCanvas.getContext("2d", { willReadFrequently: true });
        if (!origCtx) {
          setIsProcessing(false);
          return;
        }

        origCtx.imageSmoothingEnabled = true;
        origCtx.imageSmoothingQuality = "high";
        origCtx.drawImage(img, 0, 0, targetW, targetH);

        const imgData = origCtx.getImageData(0, 0, targetW, targetH);
        const pixels = imgData.data;

        // Run smart background segmentation
        const { removedPixelCount, totalPixels } = removeBackgroundPixels(
          pixels,
          targetW,
          targetH,
          {
            tolerance,
            featherRadius: feather,
            smoothRollOff: true,
            mode,
            customSeeds,
          }
        );

        if (feather > 0) {
          applyAlphaFeather(pixels, targetW, targetH, feather);
        }

        origCtx.putImageData(imgData, 0, 0);

        // Render to output canvas with background fill mode
        const outCanvas = outputCanvasRef.current;
        if (outCanvas) {
          outCanvas.width = targetW;
          outCanvas.height = targetH;
          const outCtx = outCanvas.getContext("2d");
          if (outCtx) {
            outCtx.clearRect(0, 0, targetW, targetH);

            if (fillMode === "solid") {
              outCtx.fillStyle = solidColor;
              outCtx.fillRect(0, 0, targetW, targetH);
            } else if (fillMode === "gradient") {
              const grad = outCtx.createLinearGradient(0, 0, targetW, targetH);
              grad.addColorStop(0, gradientStart);
              grad.addColorStop(1, gradientEnd);
              outCtx.fillStyle = grad;
              outCtx.fillRect(0, 0, targetW, targetH);
            }

            outCtx.drawImage(origCanvas, 0, 0);
          }
        }

        setStats({
          removedPercent: Math.round((removedPixelCount / totalPixels) * 100),
          width: targetW,
          height: targetH,
          origWidth: origW,
          origHeight: origH,
          scaled,
        });
        setIsProcessing(false);
      }, 10);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };

    img.src = imageSrc;
  }, [imageSrc, tolerance, feather, mode, customSeeds, fillMode, solidColor, gradientStart, gradientEnd]);

  // Debounce processing to prevent UI freezing on rapid slider adjustments
  useEffect(() => {
    if (!imageSrc) return;

    const timer = setTimeout(() => {
      processImage();
    }, 180);

    return () => clearTimeout(timer);
  }, [processImage, imageSrc]);

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
            <span className="text-[11px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>100% In-Browser Privacy</span>
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
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
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

        {/* Algorithm Mode & Precision Adjusters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Segmentation Mode */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Segmentation Mode
            </span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setMode("contiguous")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === "contiguous"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
                }`}
                title="Smart Subject Protection: Removes background from outside while preserving clothes and skin inside"
              >
                Smart Subject
              </button>
              <button
                type="button"
                onClick={() => setMode("global")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === "global"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
                }`}
                title="Global Color: Removes matching background colors anywhere in the image"
              >
                Global Color
              </button>
            </div>
          </div>

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
              label="Edge Feathering"
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
            <div className="flex items-center gap-1.5 pt-0.5">
              {(["transparent", "solid", "gradient"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFillMode(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs capitalize transition-colors font-semibold ${
                    fillMode === m
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Color Pickers & Eyedropper Control Strip */}
        {imageSrc && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEyedropperActive(!eyedropperActive)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  eyedropperActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-400/30"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Pipette className="w-3.5 h-3.5" />
                <span>{eyedropperActive ? "Click image to sample color" : "Sample Color (Eyedropper)"}</span>
              </button>

              {customSeeds.length > 0 && (
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[11px] text-slate-500 font-medium">Extra seeds:</span>
                  {customSeeds.map((seed, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs text-[11px]"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                        style={{ backgroundColor: `rgb(${seed[0]}, ${seed[1]}, ${seed[2]})` }}
                      />
                      <button
                        type="button"
                        onClick={() => setCustomSeeds((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 font-bold ml-0.5"
                        title="Remove seed"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomSeeds([])}
                    className="text-[11px] text-rose-500 hover:underline font-semibold ml-1"
                  >
                    Clear seeds
                  </button>
                </div>
              )}
            </div>

            {/* Solid or Gradient color pickers */}
            {fillMode === "solid" && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Color:</span>
                <input
                  type="color"
                  value={solidColor}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                />
              </div>
            )}
            {fillMode === "gradient" && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Start:</span>
                <input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                />
                <span className="text-slate-500">End:</span>
                <input
                  type="color"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
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
              Retains original resolution with anti-aliased edge feathering. Supports PNG, JPG, WebP. Safe for ultra-large camera files.
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
              <span>Segmenting background boundaries & smoothing alpha edges in-browser...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Original Preview */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Original Input</span>
                  {eyedropperActive && (
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded">
                      Click image to sample color
                    </span>
                  )}
                </span>
                {stats && (
                  <div className="flex items-center gap-1.5">
                    {stats.scaled && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                        2K Safe Memory
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400">
                      {stats.origWidth} × {stats.origHeight}px
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[320px] ${
                  eyedropperActive ? "cursor-crosshair ring-2 ring-blue-500/30" : ""
                }`}
              >
                <img
                  ref={originalImgRef}
                  src={imageSrc}
                  alt="Original"
                  onClick={handleImageClick}
                  className="max-h-[380px] object-contain select-none"
                />
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
