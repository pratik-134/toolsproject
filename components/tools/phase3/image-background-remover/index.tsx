"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Scissors,
  Download,
  RefreshCw,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Check,
  Palette,
} from "lucide-react";
import {
  SegmentationOptions,
  ReplacementFill,
  removeBackgroundPixels,
  applyAlphaFeather,
} from "./logic";

export default function ImageBackgroundRemoverTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState<number>(18);
  const [feather, setFeather] = useState<number>(1);
  const [fillMode, setFillMode] = useState<"transparent" | "solid" | "gradient">("transparent");
  const [solidColor, setSolidColor] = useState<string>("#ffffff");
  const [gradientStart, setGradientStart] = useState<string>("#3b82f6");
  const [gradientEnd, setGradientEnd] = useState<string>("#ec4899");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stats, setStats] = useState<{ removedPercent: number } | null>(null);

  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load sample image
  const loadSample = () => {
    // Generate high-contrast geometric sample on canvas
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 400;
    sampleCanvas.height = 400;
    const ctx = sampleCanvas.getContext("2d");
    if (!ctx) return;

    // Solid light background
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, 0, 400, 400);

    // Subject in center (camera/product icon)
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(100, 100, 200, 200, 30);
    ctx.fill();

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(200, 200, 60, 0, Math.PI * 2);
    ctx.fill();

    setImageSrc(sampleCanvas.toDataURL("image/png"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Run in-browser background segmentation
  const processImage = () => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const origCanvas = document.createElement("canvas");
      origCanvas.width = img.width;
      origCanvas.height = img.height;
      const origCtx = origCanvas.getContext("2d");
      if (!origCtx) return;

      origCtx.drawImage(img, 0, 0);
      const imgData = origCtx.getImageData(0, 0, img.width, img.height);
      const pixels = imgData.data;

      const { removedPixelCount, totalPixels } = removeBackgroundPixels(pixels, img.width, img.height, {
        tolerance,
        featherRadius: feather,
      });

      if (feather > 0) {
        applyAlphaFeather(pixels, img.width, img.height, feather);
      }

      origCtx.putImageData(imgData, 0, 0);

      // Render to output canvas with background fill mode
      const outCanvas = outputCanvasRef.current;
      if (outCanvas) {
        outCanvas.width = img.width;
        outCanvas.height = img.height;
        const outCtx = outCanvas.getContext("2d");
        if (outCtx) {
          outCtx.clearRect(0, 0, img.width, img.height);

          if (fillMode === "solid") {
            outCtx.fillStyle = solidColor;
            outCtx.fillRect(0, 0, img.width, img.height);
          } else if (fillMode === "gradient") {
            const grad = outCtx.createLinearGradient(0, 0, img.width, img.height);
            grad.addColorStop(0, gradientStart);
            grad.addColorStop(1, gradientEnd);
            outCtx.fillStyle = grad;
            outCtx.fillRect(0, 0, img.width, img.height);
          }

          outCtx.drawImage(origCanvas, 0, 0);
        }
      }

      setStats({
        removedPercent: Math.round((removedPixelCount / totalPixels) * 100),
      });
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
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "qwertygen-removed-background.png";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Studio Control Header */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              Client-Side Smart Background Remover
            </span>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Zero Server Upload
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!imageSrc && (
              <button
                type="button"
                onClick={loadSample}
                className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors"
              >
                Load Sample Graphic
              </button>
            )}
            {imageSrc && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:opacity-90 transition-opacity"
              >
                <Download className="w-3.5 h-3.5" />
                Download Cutout PNG
              </button>
            )}
          </div>
        </div>

        {/* Tolerance & Feather Adjusters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border/50 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Color Tolerance</span>
              <span className="font-mono text-foreground font-bold">{tolerance}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Edge Feather Radius</span>
              <span className="font-mono text-foreground font-bold">{feather}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={feather}
              onChange={(e) => setFeather(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Fill Mode */}
          <div className="space-y-1.5">
            <span className="text-muted-foreground font-medium">Replacement Background:</span>
            <div className="flex items-center gap-2 pt-1">
              {(["transparent", "solid", "gradient"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFillMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors font-medium ${
                    fillMode === mode
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
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
        <div className="rounded-3xl border-2 border-dashed border-border/80 p-12 text-center bg-card/50 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">Upload Image to Remove Background</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PNG, JPG, WebP. Processed 100% locally in your browser memory.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-sm transition-opacity">
              Choose Photo
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={loadSample}
              className="px-4 py-2 rounded-xl border border-border text-foreground text-xs font-medium hover:bg-muted transition-colors"
            >
              Try Demo Product
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Original Preview */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Original Input</span>
            <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/20 flex items-center justify-center min-h-[300px]">
              <img src={imageSrc} alt="Original" className="max-h-[380px] object-contain" />
            </div>
          </div>

          {/* Right: Transparent Cutout Output */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Transparent Result</span>
              {stats && (
                <span className="text-xs text-emerald-500 font-semibold">
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
              className="rounded-xl border border-border/50 overflow-hidden bg-slate-900/10 dark:bg-slate-950/40 flex items-center justify-center min-h-[300px]"
            >
              <canvas ref={outputCanvasRef} className="max-h-[380px] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
