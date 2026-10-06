"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  CropRect,
  ASPECT_PRESETS,
  calculateInitialCrop,
  clampCropRect,
  calculateRotatedDimensions,
} from "./logic";
import {
  Upload,
  Download,
  Crop as CropIcon,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";

export default function AspectRatioCropperTool() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>("1:1");
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });

  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg">("png");
  const [jpegQuality, setJpegQuality] = useState<number>(92);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [cropStart, setCropStart] = useState<CropRect | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    };
  }, [previewUrl, croppedUrl]);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setCroppedUrl(null);
    setCroppedBlob(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSourceFile(file);

    const img = new Image();
    img.onload = () => {
      imageElementRef.current = img;
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      setNaturalDimensions(dims);
      const preset = ASPECT_PRESETS.find((p) => p.id === selectedPresetId);
      const initial = calculateInitialCrop(dims.width, dims.height, preset ? preset.ratio : 1.0);
      setCrop(initial);
    };
    img.src = url;
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!naturalDimensions) return;
    const currentDims = calculateRotatedDimensions(
      naturalDimensions.width,
      naturalDimensions.height,
      rotation
    );
    const preset = ASPECT_PRESETS.find((p) => p.id === presetId);
    const ratio = preset ? preset.ratio : null;
    const initial = calculateInitialCrop(currentDims.width, currentDims.height, ratio);
    setCrop(initial);
  };

  const handleRotate = (delta: number) => {
    const nextRot = ((rotation + delta) % 360 + 360) % 360;
    setRotation(nextRot);
    if (!naturalDimensions) return;
    const newDims = calculateRotatedDimensions(
      naturalDimensions.width,
      naturalDimensions.height,
      nextRot
    );
    const preset = ASPECT_PRESETS.find((p) => p.id === selectedPresetId);
    const nextCrop = calculateInitialCrop(newDims.width, newDims.height, preset?.ratio ?? null);
    setCrop(nextCrop);
  };

  // Perform client-side canvas crop & export
  const executeCrop = useCallback(async () => {
    if (!sourceFile || !previewUrl || !naturalDimensions || crop.width <= 0 || crop.height <= 0) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image for cropping"));
        img.src = previewUrl;
      });

      // 1. Create transformed canvas for rotation and flipping
      const rotDims = calculateRotatedDimensions(
        naturalDimensions.width,
        naturalDimensions.height,
        rotation
      );

      const intermediateCanvas = document.createElement("canvas");
      intermediateCanvas.width = rotDims.width;
      intermediateCanvas.height = rotDims.height;
      const iCtx = intermediateCanvas.getContext("2d");
      if (!iCtx) throw new Error("Could not initialize 2D canvas context");

      iCtx.save();
      // Translate to center for rotation & scale
      iCtx.translate(rotDims.width / 2, rotDims.height / 2);
      iCtx.rotate((rotation * Math.PI) / 180);
      iCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      iCtx.drawImage(
        img,
        -naturalDimensions.width / 2,
        -naturalDimensions.height / 2,
        naturalDimensions.width,
        naturalDimensions.height
      );
      iCtx.restore();

      // 2. Crop target region onto destination canvas
      const destCanvas = document.createElement("canvas");
      destCanvas.width = Math.round(crop.width);
      destCanvas.height = Math.round(crop.height);
      const dCtx = destCanvas.getContext("2d");
      if (!dCtx) throw new Error("Could not initialize destination canvas context");

      if (outputFormat === "jpeg") {
        dCtx.fillStyle = "#ffffff";
        dCtx.fillRect(0, 0, destCanvas.width, destCanvas.height);
      }

      dCtx.imageSmoothingEnabled = true;
      dCtx.imageSmoothingQuality = "high";

      dCtx.drawImage(
        intermediateCanvas,
        Math.round(crop.x),
        Math.round(crop.y),
        Math.round(crop.width),
        Math.round(crop.height),
        0,
        0,
        Math.round(crop.width),
        Math.round(crop.height)
      );

      const mime = outputFormat === "png" ? "image/png" : "image/jpeg";
      const q = jpegQuality / 100;

      const blob = await new Promise<Blob>((resolve, reject) => {
        destCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas blob conversion failed"))),
          mime,
          q
        );
      });

      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
      const url = URL.createObjectURL(blob);
      setCroppedUrl(url);
      setCroppedBlob(blob);
    } catch (err: any) {
      setError(err?.message || "Failed to crop image.");
    } finally {
      setIsProcessing(false);
    }
  }, [sourceFile, previewUrl, naturalDimensions, crop, rotation, flipH, flipV, outputFormat, jpegQuality, croppedUrl]);

  // Trigger download
  const handleDownload = () => {
    if (!croppedBlob || !croppedUrl || !sourceFile) return;
    const baseName = sourceFile.name.substring(0, sourceFile.name.lastIndexOf(".")) || sourceFile.name;
    const ext = outputFormat === "png" ? "png" : "jpg";
    const filename = `${baseName}_cropped_${Math.round(crop.width)}x${Math.round(crop.height)}.${ext}`;

    const a = document.createElement("a");
    a.href = croppedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Dimensions of the rotated source image
  const currentRotatedDims = naturalDimensions
    ? calculateRotatedDimensions(naturalDimensions.width, naturalDimensions.height, rotation)
    : { width: 1, height: 1 };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-body">
      {/* Header Eyebrow & Privacy Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CropIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-headings text-sm sm:text-base font-bold text-slate-900">
              Aspect Ratio Cropper & Photo Resizer
            </h2>
            <p className="text-xs text-slate-600">
              Crop images to 1:1, 16:9, 9:16, 4:5, and custom ratios with full rotation & flip controls.
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
            <strong className="font-semibold">Cropping Error:</strong> {error}
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
            Choose an image to crop
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
            Upload any photo to crop for Instagram, YouTube, TikTok, or custom dimensions.
          </p>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-xs font-bold"
          >
            Select Photo
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preset Buttons */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Aspect Ratio Preset
                </span>
                <span className="text-[11px] text-slate-500">
                  Pre-configured for popular social media dimensions & print layouts
                </span>
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
                    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
                    setPreviewUrl(null);
                    setCroppedUrl(null);
                    setCroppedBlob(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {ASPECT_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="font-headings text-xs font-bold text-slate-900 block truncate">
                      {p.id === "free" ? "Freeform" : p.id}
                    </span>
                    <span className="text-[9.5px] text-slate-500 block truncate mt-0.5">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Transform Controls: Rotate & Flip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate(-90)}
                  className="text-xs text-slate-700 h-8 px-2.5"
                  title="Rotate Counter-Clockwise"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1 text-slate-600" />
                  90° CCW
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate(90)}
                  className="text-xs text-slate-700 h-8 px-2.5"
                  title="Rotate Clockwise"
                >
                  <RotateCw className="h-3.5 w-3.5 mr-1 text-slate-600" />
                  90° CW
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipH(!flipH)}
                  className={`text-xs h-8 px-2.5 ${flipH ? "bg-blue-50 text-blue-700 border-blue-300" : "text-slate-700"}`}
                  title="Flip Horizontally"
                >
                  <FlipHorizontal className="h-3.5 w-3.5 mr-1" />
                  Flip H
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipV(!flipV)}
                  className={`text-xs h-8 px-2.5 ${flipV ? "bg-blue-50 text-blue-700 border-blue-300" : "text-slate-700"}`}
                  title="Flip Vertically"
                >
                  <FlipVertical className="h-3.5 w-3.5 mr-1" />
                  Flip V
                </Button>
              </div>

              {/* Crop Stats Badge */}
              <div className="text-xs text-slate-600 font-medium">
                Crop Area:{" "}
                <strong className="text-slate-900 font-bold">
                  {Math.round(crop.width)} × {Math.round(crop.height)} px
                </strong>{" "}
                <span className="text-slate-400">
                  (Source: {currentRotatedDims.width} × {currentRotatedDims.height})
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Crop Viewport Card */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-headings text-sm font-bold text-slate-900 flex items-center gap-2">
                <CropIcon className="h-4 w-4 text-blue-600" />
                Adjust Crop Position
              </h3>
              <span className="text-xs text-slate-500">
                Use position sliders below or click Preview & Crop
              </span>
            </div>

            {/* Position & Size Adjusters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Offset X:</span>
                  <span className="font-bold text-blue-700">{Math.round(crop.x)} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, currentRotatedDims.width - crop.width)}
                  value={crop.x}
                  onChange={(e) => setCrop({ ...crop, x: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Offset Y:</span>
                  <span className="font-bold text-blue-700">{Math.round(crop.y)} px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, currentRotatedDims.height - crop.height)}
                  value={crop.y}
                  onChange={(e) => setCrop({ ...crop, y: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Crop Width:</span>
                  <span className="font-bold text-blue-700">{Math.round(crop.width)} px</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max={currentRotatedDims.width}
                  value={crop.width}
                  onChange={(e) => {
                    const newW = Number(e.target.value);
                    const preset = ASPECT_PRESETS.find((p) => p.id === selectedPresetId);
                    const newH = preset?.ratio ? Math.round(newW / preset.ratio) : crop.height;
                    const clamped = clampCropRect(
                      { ...crop, width: newW, height: Math.min(newH, currentRotatedDims.height) },
                      currentRotatedDims
                    );
                    setCrop(clamped);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Crop Height:</span>
                  <span className="font-bold text-blue-700">{Math.round(crop.height)} px</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max={currentRotatedDims.height}
                  value={crop.height}
                  onChange={(e) => {
                    const newH = Number(e.target.value);
                    const preset = ASPECT_PRESETS.find((p) => p.id === selectedPresetId);
                    const newW = preset?.ratio ? Math.round(newH * preset.ratio) : crop.width;
                    const clamped = clampCropRect(
                      { ...crop, height: newH, width: Math.min(newW, currentRotatedDims.width) },
                      currentRotatedDims
                    );
                    setCrop(clamped);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Visual Viewport with Mask Overlay */}
            <div className="relative rounded-xl border border-slate-200 bg-slate-900/90 overflow-hidden flex items-center justify-center p-4 min-h-[300px] max-h-[460px]">
              {previewUrl && (
                <div className="relative max-h-full max-w-full flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                      maxHeight: "380px",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                    className="rounded shadow-sm transition-transform duration-200 pointer-events-none"
                  />
                  {/* Visual Crop Box Overlay indicator */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-cyan-400 bg-cyan-400/10 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-slate-900/80 px-2.5 py-1 rounded-full shadow-sm">
                      {Math.round(crop.width)} × {Math.round(crop.height)} px
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Export Settings & Crop Trigger */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-700">Format:</span>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOutputFormat("png")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      outputFormat === "png"
                        ? "bg-white text-blue-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputFormat("jpeg")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      outputFormat === "jpeg"
                        ? "bg-white text-blue-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    JPEG (Photo)
                  </button>
                </div>
              </div>

              <Button
                onClick={executeCrop}
                disabled={isProcessing}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Cropping...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Cropped Image
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Cropped Result Card */}
          {croppedBlob && croppedUrl && (
            <div className="p-6 rounded-2xl border-2 border-emerald-500/40 bg-white shadow-md space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-headings text-sm sm:text-base font-bold text-slate-900">
                    Cropped Successfully!
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {Math.round(crop.width)} × {Math.round(crop.height)} px • {outputFormat.toUpperCase()}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-center max-h-72 overflow-hidden">
                <img
                  src={croppedUrl}
                  alt="Cropped Preview"
                  className="max-h-64 max-w-full object-contain rounded-lg shadow-2xs"
                />
              </div>

              <Button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                Download Cropped Image ({outputFormat.toUpperCase()})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
