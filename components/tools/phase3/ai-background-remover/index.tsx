"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Check,
  AlertCircle,
  ShieldCheck,
  Layers,
  Palette,
  Sliders,
  Trash2,
  Cpu,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  validateImageFile,
  downscaleImageForInference,
  createCanvasFromRgba,
  applyMaskToOriginalImage,
  renderCompositeImage,
  exportCanvasBlob,
  formatByteSize,
  ReplacementFill,
} from "./logic";

interface ModelProgress {
  file: string;
  loaded: number;
  total: number;
  progress: number;
}

export default function AiBackgroundRemoverTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("portrait");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState<ModelProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highQuality, setHighQuality] = useState<boolean>(true);

  // Background replacement
  const [fillMode, setFillMode] = useState<"transparent" | "solid" | "gradient">("transparent");
  const [solidColor, setSolidColor] = useState<string>("#ffffff");
  const [gradientStart, setGradientStart] = useState<string>("#3b82f6");
  const [gradientEnd, setGradientEnd] = useState<string>("#ec4899");

  // Output state
  const [hasResult, setHasResult] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<"cutout" | "original" | "comparison">("cutout");
  const [stats, setStats] = useState<{
    origWidth: number;
    origHeight: number;
    inferenceWidth: number;
    inferenceHeight: number;
    deviceType: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const rawCutoutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawInferenceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const comparisonCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  const getOrCreateWorker = useCallback((): Worker => {
    if (!workerRef.current) {
      const worker = new Worker(new URL("./worker.ts", import.meta.url), {
        type: "module",
      });

      worker.onmessage = (e: MessageEvent) => {
        const { type, status, file, loaded, total, progress, data, width, height, error } = e.data;

        if (type === "status") {
          if (status === "loading-model") {
            setStatusMessage("Loading AI segmentation model into browser memory...");
          } else if (status === "processing") {
            setStatusMessage("AI model removing background...");
            setModelProgress(null);
          } else if (status === "ready") {
            setStatusMessage(null);
          }
        } else if (type === "download-progress") {
          setModelProgress({
            file: file || "model",
            loaded: loaded || 0,
            total: total || 45 * 1024 * 1024,
            progress: typeof progress === "number" ? Math.round(progress) : 0,
          });
          setStatusMessage(`Downloading AI model: ${Math.round(progress || 0)}%`);
        } else if (type === "done") {
          setIsProcessing(false);
          setStatusMessage(null);
          setModelProgress(null);

          try {
            if (!originalImgRef.current) return;
            const inferenceCanvas = createCanvasFromRgba(
              new Uint8ClampedArray(data),
              width,
              height
            );

            rawInferenceCanvasRef.current = inferenceCanvas;

            // Apply mask to original full-resolution image if High Quality is enabled
            const finalCutout = applyMaskToOriginalImage(
              originalImgRef.current,
              inferenceCanvas,
              highQuality
            );

            rawCutoutCanvasRef.current = finalCutout;
            setHasResult(true);
            setPreviewTab("cutout");
          } catch (err: any) {
            setErrorMessage(err?.message || "Failed to composite final image.");
          }
        } else if (type === "error") {
          setIsProcessing(false);
          setStatusMessage(null);
          setModelProgress(null);
          setErrorMessage(
            error ||
              "AI inference failed. The image might be too large for device memory. Try a smaller image or our Simple Background Remover."
          );
        }
      };

      worker.onerror = (err) => {
        setIsProcessing(false);
        setStatusMessage(null);
        setErrorMessage(
          "Worker error during AI processing. Please check browser WebWorker / WebAssembly support."
        );
      };

      workerRef.current = worker;
    }
    return workerRef.current;
  }, [highQuality]);

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Draw composited cutout to specified canvas
  const drawCompositeToCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement | null) => {
      if (!targetCanvas || !rawCutoutCanvasRef.current) return;
      const fill: ReplacementFill = {
        type: fillMode,
        solidColor,
        gradientStart,
        gradientEnd,
      };

      const composited = renderCompositeImage(rawCutoutCanvasRef.current, fill);
      targetCanvas.width = composited.width;
      targetCanvas.height = composited.height;

      const ctx = targetCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        ctx.drawImage(composited, 0, 0);
      }
    },
    [fillMode, solidColor, gradientStart, gradientEnd]
  );

  // Update preview canvas whenever rawCutout, fillMode, colors, or previewTab change
  useEffect(() => {
    if (!hasResult || !rawCutoutCanvasRef.current) return;

    if (previewTab === "cutout") {
      drawCompositeToCanvas(previewCanvasRef.current);
    } else if (previewTab === "comparison") {
      drawCompositeToCanvas(comparisonCanvasRef.current);
    }
  }, [hasResult, previewTab, drawCompositeToCanvas]);

  // Re-composite if user toggles High Quality without re-running inference
  useEffect(() => {
    if (!originalImgRef.current || !rawInferenceCanvasRef.current) return;
    const finalCutout = applyMaskToOriginalImage(
      originalImgRef.current,
      rawInferenceCanvasRef.current,
      highQuality
    );
    rawCutoutCanvasRef.current = finalCutout;
    if (previewTab === "cutout") {
      drawCompositeToCanvas(previewCanvasRef.current);
    } else if (previewTab === "comparison") {
      drawCompositeToCanvas(comparisonCanvasRef.current);
    }
  }, [highQuality, previewTab, drawCompositeToCanvas]);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Unsupported image format.");
      return;
    }

    setErrorMessage(null);
    setHasResult(false);
    rawCutoutCanvasRef.current = null;
    rawInferenceCanvasRef.current = null;

    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "portrait";
    setFileName(baseName);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (src) {
        setImageSrc(src);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger background removal inference
  const runBackgroundRemoval = () => {
    if (!originalImgRef.current) return;
    setErrorMessage(null);
    setIsProcessing(true);
    setHasResult(false);

    try {
      const img = originalImgRef.current;
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      // Downscale to max 1600px for safe, fast in-browser AI inference
      const { canvas, width, height } = downscaleImageForInference(img, 1600);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not access canvas context.");

      const imageData = ctx.getImageData(0, 0, width, height);

      setStats({
        origWidth: origW,
        origHeight: origH,
        inferenceWidth: width,
        inferenceHeight: height,
        deviceType:
          typeof navigator !== "undefined" && (navigator as any).gpu ? "WebGPU" : "WASM (CPU)",
      });

      const worker = getOrCreateWorker();

      // Transfer ImageData buffer to worker
      const buffer = imageData.data.buffer;
      worker.postMessage(
        {
          type: "process",
          id: Date.now(),
          data: buffer,
          width,
          height,
        },
        [buffer]
      );
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(
        err?.message || "Failed to prepare image for AI inference. Image may be too large."
      );
    }
  };

  // Reset tool
  const resetTool = () => {
    setImageSrc(null);
    setHasResult(false);
    setIsProcessing(false);
    setStatusMessage(null);
    setErrorMessage(null);
    setModelProgress(null);
    setStats(null);
    rawCutoutCanvasRef.current = null;
    rawInferenceCanvasRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Download cutouts
  const handleDownload = async (format: "png" | "jpeg") => {
    if (!rawCutoutCanvasRef.current) return;

    try {
      const fill: ReplacementFill = {
        type: fillMode,
        solidColor,
        gradientStart,
        gradientEnd,
      };

      // Always composite from the full-resolution pristine rawCutoutCanvas
      const composited = renderCompositeImage(rawCutoutCanvasRef.current, fill);
      const blob = await exportCanvasBlob(composited, format, 0.95);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}-nobg.${format === "png" ? "png" : "jpg"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err: any) {
      setErrorMessage("Download failed: " + err?.message);
    }
  };

  // Sample portrait for quick demo
  const loadSamplePortrait = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Busy patterned background
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(0, 0, 800, 1000);
    ctx.fillStyle = "#94a3b8";
    for (let i = 0; i < 800; i += 40) {
      ctx.fillRect(i, 0, 20, 1000);
    }

    // Person silhouette / portrait
    // Head
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(400, 350, 160, 0, Math.PI * 2);
    ctx.fill();

    // Shoulders
    ctx.beginPath();
    ctx.ellipse(400, 750, 280, 240, 0, 0, Math.PI * 2);
    ctx.fill();

    setFileName("sample_portrait");
    setErrorMessage(null);
    setHasResult(false);
    setImageSrc(canvas.toDataURL("image/png"));
  };

  return (
    <div className="space-y-6">
      {/* Honesty Guidance Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-bold">
            Best for photos of people:{" "}
          </strong>
          This AI model (MODNet) excels at human portraits, hair strands, and real-world scenes.
          For logos, graphics, or solid studio backdrops, try our{" "}
          <Link
            href="/tools/image/image-background-remover"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
          >
            <span>Simple Background Remover</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          .
        </div>
      </div>

      {/* Control Panel Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-headings font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>Client-Side AI Background Remover</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                100% In-Browser
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Powered by MODNet neural matting via WebAssembly / WebGPU. Zero server uploads.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {imageSrc && (
              <>
                <button
                  type="button"
                  onClick={resetTool}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                {!hasResult && (
                  <button
                    type="button"
                    onClick={runBackgroundRemoval}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                    <span>{isProcessing ? "Processing..." : "Remove Background with AI"}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Options Row (when image is loaded) */}
        {imageSrc && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 text-xs">
            {/* High Quality Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Original Resolution Matte
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Applies AI mask onto full image
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={highQuality}
                  onChange={(e) => setHighQuality(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Replacement Background Selection */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white block">
                Background Type
              </span>
              <div className="flex items-center gap-1.5">
                {(["transparent", "solid", "gradient"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFillMode(mode)}
                    className={`flex-1 py-1.5 rounded-lg text-xs capitalize font-semibold transition-all ${
                      fillMode === mode
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Choosers */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Fill Colors
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {fillMode === "transparent"
                    ? "Checkerboard transparency"
                    : fillMode === "solid"
                    ? "Custom backdrop color"
                    : "Linear gradient blend"}
                </span>
              </div>

              {fillMode === "solid" && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5"
                  />
                </div>
              )}

              {fillMode === "gradient" && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradientStart}
                    onChange={(e) => setGradientStart(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5"
                    title="Gradient Start"
                  />
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={(e) => setGradientEnd(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5"
                    title="Gradient End"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Model Download Progress Bar (First Time Only) */}
        {modelProgress && (
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Cpu className="w-4 h-4 animate-pulse" />
                <span>Downloading AI Model (~45 MB)</span>
              </span>
              <span>{modelProgress.progress}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-blue-100 dark:bg-blue-900 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(0, modelProgress.progress))}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
              <strong>First time only:</strong> downloading AI model (~45 MB) to your browser cache. Subsequent uses will be instant and work offline.
            </p>
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && !modelProgress && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-xs">
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {statusMessage || "Running neural network segmentation..."}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Processing Notice:</span>
              <p>{errorMessage}</p>
              <div className="pt-1">
                <Link
                  href="/tools/image/image-background-remover"
                  className="font-bold text-blue-600 dark:text-blue-400 underline"
                >
                  Try the Simple Background Remover instead →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Preview & Workspace Canvas */}
      {!imageSrc ? (
        /* Empty Upload State */
        <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 sm:p-14 text-center bg-white dark:bg-slate-900/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center mx-auto shadow-2xs">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-headings font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
              Upload Photo for AI Background Removal
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Supports JPG, PNG, and WebP. Neural matting model isolates subjects without uploading data to any external server.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md transition-colors">
              Choose Photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={loadSamplePortrait}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Load Demo Photo
            </button>
          </div>
        </div>
      ) : (
        /* Active Preview & Compare Workspace */
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
          {/* Top Preview Controls & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewTab("cutout")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewTab === "cutout"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                AI Result
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("original")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewTab === "original"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Original Photo
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("comparison")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewTab === "comparison"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Side-by-Side
              </button>
            </div>

            {/* Download Buttons (when result ready) */}
            {hasResult && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("png")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {fillMode === "transparent" ? "Download Transparent PNG" : "Download PNG"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("jpeg")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JPG</span>
                </button>
              </div>
            )}
          </div>

          {/* Hidden Original Image for Canvas Access */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={originalImgRef}
            src={imageSrc}
            alt="Source for AI background removal"
            className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none"
            onLoad={() => {
              if (!hasResult && !isProcessing) {
                // Auto trigger background removal upon image load
                runBackgroundRemoval();
              }
            }}
          />

          {/* Canvas Preview Area with Checkerboard Background */}
          <div className="relative min-h-[360px] max-h-[640px] flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#ffffff_0%_50%)] dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] [background-size:20px_20px] p-4">
            {previewTab === "cutout" && (
              <canvas
                ref={previewCanvasRef}
                className="max-h-[580px] max-w-full object-contain rounded-lg shadow-sm"
              />
            )}

            {previewTab === "original" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="Original photo"
                className="max-h-[580px] max-w-full object-contain rounded-lg shadow-sm"
              />
            )}

            {previewTab === "comparison" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full items-center">
                <div className="space-y-1 text-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Original</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Original comparison"
                    className="max-h-[460px] mx-auto object-contain rounded-lg shadow-sm"
                  />
                </div>
                <div className="space-y-1 text-center">
                  <span className="text-[11px] font-bold text-blue-600 uppercase">AI Cutout</span>
                  <canvas
                    ref={comparisonCanvasRef}
                    className="max-h-[460px] mx-auto object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Resolution Stats & Privacy Verification */}
          {stats && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  Original: <strong>{stats.origWidth} × {stats.origHeight}px</strong>
                </span>
                <span>•</span>
                <span>
                  AI Inference: <strong>{stats.inferenceWidth} × {stats.inferenceHeight}px</strong>
                </span>
                <span>•</span>
                <span>
                  Engine: <strong>{stats.deviceType}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% In-Browser Memory</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
