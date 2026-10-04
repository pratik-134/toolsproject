"use client";

import React, { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import {
  formatBytes,
  getFilenameWithExtension,
  validateImageFile,
  calculateScaledDimensions,
  createBmpBinary,
  createIcoBinary,
  createSvgWrapper,
  FORMAT_DETAILS,
  SupportedImageFormat,
} from "./logic";
import {
  Upload,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  FileCheck,
  Sparkles,
  X,
  Plus,
  Archive,
} from "lucide-react";

async function convertFileToBlob(
  file: File,
  targetFormat: SupportedImageFormat,
  quality: number,
  scale: number,
  bgColor: string
): Promise<{ blob: Blob; dimensions: { width: number; height: number }; filename: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load "${file.name}" into canvas`));
      img.src = url;
    });

    const scaled = calculateScaledDimensions(
      img.naturalWidth || 800,
      img.naturalHeight || 600,
      scale / 100
    );

    const canvas = document.createElement("canvas");
    canvas.width = scaled.width;
    canvas.height = scaled.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not initialize 2D canvas context");

    const targetDetail = FORMAT_DETAILS[targetFormat];
    if (!targetDetail.hasAlpha || targetFormat === "jpeg" || targetFormat === "bmp") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, scaled.width, scaled.height);

    let resultBlob: Blob;
    if (targetFormat === "bmp") {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const bmpBytes = createBmpBinary(canvas.width, canvas.height, imgData.data);
      resultBlob = new Blob([bmpBytes.buffer as ArrayBuffer], { type: "image/bmp" });
    } else if (targetFormat === "ico") {
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encoding failed"))), "image/png");
      });
      const pngArrayBuffer = await pngBlob.arrayBuffer();
      const icoBytes = createIcoBinary(new Uint8Array(pngArrayBuffer), canvas.width, canvas.height);
      resultBlob = new Blob([icoBytes.buffer as ArrayBuffer], { type: "image/x-icon" });
    } else if (targetFormat === "svg") {
      const pngDataUri = canvas.toDataURL("image/png");
      const svgString = createSvgWrapper(pngDataUri, canvas.width, canvas.height);
      resultBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    } else {
      const mime = targetDetail.mime;
      const q = quality / 100;
      resultBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error(`Failed to convert to ${targetFormat}`))),
          mime,
          q
        );
      });
    }

    const filename = getFilenameWithExtension(file.name, targetDetail.ext);
    return { blob: resultBlob, dimensions: scaled, filename };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ImageConverterTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceDimensions, setSourceDimensions] = useState<{ width: number; height: number } | null>(null);

  const [targetFormat, setTargetFormat] = useState<SupportedImageFormat>("webp");
  const [quality, setQuality] = useState<number>(90); // 10 to 100
  const [scale, setScale] = useState<number>(100); // 25 to 200 percent
  const [bgColor, setBgColor] = useState<string>("#ffffff");

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedDimensions, setConvertedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sourceFile = files[0] || null;
  const isBatch = files.length > 1;

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [previewUrl, convertedUrl]);

  const loadFiles = (incoming: File[]) => {
    setError(null);
    const validFiles: File[] = [];

    for (const f of incoming) {
      const validation = validateImageFile(f);
      if (validation.valid) {
        validFiles.push(f);
      } else {
        setError(`"${f.name}": ${validation.error || "Invalid file"}`);
      }
    }

    if (validFiles.length === 0) return;

    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setConvertedBlob(null);
    setConvertedUrl(null);
    setConvertedDimensions(null);

    setFiles((prev) => {
      const next = [...prev, ...validFiles];
      if (next[0] && (!previewUrl || prev.length === 0)) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(next[0]);
        setPreviewUrl(url);
        const img = new Image();
        img.onload = () => {
          setSourceDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = url;
      }
      return next;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadFiles(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      loadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (index === 0 && next[0]) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(next[0]);
        setPreviewUrl(url);
        const img = new Image();
        img.onload = () => {
          setSourceDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = url;
      } else if (next.length === 0) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setSourceDimensions(null);
      }
      return next;
    });
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setConvertedBlob(null);
    setConvertedUrl(null);
    setConvertedDimensions(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setProgressPercent(0);
    setError(null);

    try {
      if (files.length === 1 && files[0]) {
        const result = await convertFileToBlob(files[0], targetFormat, quality, scale, bgColor);
        if (convertedUrl) URL.revokeObjectURL(convertedUrl);
        const outputUrl = URL.createObjectURL(result.blob);
        setConvertedBlob(result.blob);
        setConvertedUrl(outputUrl);
        setConvertedDimensions(result.dimensions);
      } else {
        // Multi-file batch
        const zip = new JSZip();
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;
          const result = await convertFileToBlob(file, targetFormat, quality, scale, bgColor);
          zip.file(result.filename, result.blob);
          setProgressPercent(Math.round(((i + 1) / files.length) * 85));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        setProgressPercent(100);
        if (convertedUrl) URL.revokeObjectURL(convertedUrl);
        const outputUrl = URL.createObjectURL(zipBlob);
        setConvertedBlob(zipBlob);
        setConvertedUrl(outputUrl);
        setConvertedDimensions({ width: 0, height: 0 });
      }
    } catch (err: any) {
      console.error("[ImageConverter Error]:", err);
      setError(err?.message || "An unexpected error occurred during image conversion.");
    } finally {
      setIsConverting(false);
      setProgressPercent(null);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !convertedUrl) return;
    let filename: string;
    if (files.length === 1 && files[0]) {
      filename = getFilenameWithExtension(
        files[0].name,
        FORMAT_DETAILS[targetFormat].ext
      );
    } else {
      filename = `converted-images-${targetFormat}.zip`;
    }
    const a = document.createElement("a");
    a.href = convertedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setFiles([]);
    setPreviewUrl(null);
    setSourceDimensions(null);
    setConvertedBlob(null);
    setConvertedUrl(null);
    setConvertedDimensions(null);
    setProgressPercent(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-body">
      {/* Header Eyebrow & Privacy Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-headings text-sm sm:text-base font-bold text-slate-900">
              In-Browser Image Format Converter
            </h2>
            <p className="text-xs text-slate-600">
              Convert between PNG, WebP, JPEG, BMP, ICO, and SVG without any cloud uploads.
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
            <strong className="font-semibold">Conversion Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Upload Box */}
      {files.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 bg-white hover:bg-slate-50/80 shadow-xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.avif,.bmp,.svg,.ico"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="font-headings text-lg font-bold text-slate-900 mb-1">
            Choose images or drag & drop here
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
            Supports multiple PNG, JPEG, WebP, SVG, BMP, ICO, AVIF, and GIF up to 50MB each.
          </p>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-xs font-bold"
          >
            Select Images
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active File / Batch Details */}
          {!isBatch && sourceFile ? (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {previewUrl && (
                  <div className="relative h-16 w-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-headings text-sm sm:text-base font-bold text-slate-900 truncate">
                      {sourceFile.name}
                    </h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {sourceFile.name.split(".").pop()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatBytes(sourceFile.size)}
                    {sourceDimensions && (
                      <> • {sourceDimensions.width} × {sourceDimensions.height} px</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.heic,.avif,.bmp,.svg,.ico"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add More
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-blue-600" />
                  <h4 className="font-headings text-sm sm:text-base font-bold text-slate-900">
                    Batch Queue: {files.length} Images ({formatBytes(files.reduce((acc, f) => acc + f.size, 0))})
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.avif,.bmp,.svg,.ico"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs gap-1.5 text-blue-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add More Images
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              {/* List of files in queue */}
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <ImageIcon className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="font-semibold truncate">{file.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({formatBytes(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
                      title="Remove file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversion Settings Panel */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="h-4 w-4 text-blue-600" />
              <h3 className="font-headings text-sm font-bold text-slate-900">
                Conversion Parameters
              </h3>
            </div>

            {/* Target Format Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Target Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {(Object.keys(FORMAT_DETAILS) as SupportedImageFormat[]).map((fmt) => {
                  const details = FORMAT_DETAILS[fmt];
                  const isSelected = targetFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headings text-xs font-bold text-slate-900 uppercase">
                          {fmt}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                        {details.lossy ? "Lossy / Compact" : "Lossless"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders Grid: Quality & Scale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Quality Slider (Visible for lossy formats JPEG and WebP) */}
              {FORMAT_DETAILS[targetFormat].lossy && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Encoding Quality
                    </label>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Smaller Size (10%)</span>
                    <span>Standard (85%)</span>
                    <span>Max Quality (100%)</span>
                  </div>
                </div>
              )}

              {/* Scaling Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Output Scale & Resolution
                  </label>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {scale}% {sourceDimensions && (
                      <span className="text-slate-500 font-normal">
                        ({Math.round((sourceDimensions.width * scale) / 100)} ×{" "}
                        {Math.round((sourceDimensions.height * scale) / 100)} px)
                      </span>
                    )}
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>Quarter (25%)</span>
                  <span>Original (100%)</span>
                  <span>Double (200%)</span>
                </div>
              </div>
            </div>

            {/* Background Color Picker for Opaque Formats */}
            {(!FORMAT_DETAILS[targetFormat].hasAlpha || targetFormat === "jpeg" || targetFormat === "bmp") && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">
                  Background Color (Replaces Transparency)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <div className="flex items-center gap-2">
                    {["#ffffff", "#000000", "#f8fafc"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBgColor(c)}
                        className={`text-xs px-2.5 py-1 rounded-md border ${
                          bgColor.toLowerCase() === c
                            ? "border-blue-600 bg-blue-50 font-bold text-blue-700"
                            : "border-slate-200 text-slate-600 bg-white"
                        }`}
                      >
                        {c === "#ffffff" ? "White" : c === "#000000" ? "Black" : "Light Gray"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Convert Trigger Button */}
            <div className="pt-2">
              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {isBatch
                      ? `Converting Batch (${progressPercent || 0}%)...`
                      : "Converting Image In Memory..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {isBatch
                      ? `Convert All ${files.length} Images to ${targetFormat.toUpperCase()}`
                      : `Convert to ${targetFormat.toUpperCase()}`}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Converted Result Card */}
          {convertedBlob && convertedUrl && (
            <div className="p-6 rounded-2xl border-2 border-blue-500/40 bg-white shadow-md space-y-6 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-headings text-sm sm:text-base font-bold text-slate-900">
                    {isBatch ? `Batch Conversion Complete (${files.length} Images)!` : "Conversion Complete!"}
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready to Download
                </span>
              </div>

              {!isBatch && sourceFile && convertedDimensions && (
                <>
                  {/* Single Image Comparison Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-medium text-slate-500 block">Original Size</span>
                      <strong className="text-xs sm:text-sm font-bold text-slate-800">
                        {formatBytes(sourceFile.size)}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                      <span className="text-[11px] font-medium text-blue-700 block">Converted Size</span>
                      <strong className="text-xs sm:text-sm font-bold text-blue-900">
                        {formatBytes(convertedBlob.size)}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-medium text-slate-500 block">Dimensions</span>
                      <strong className="text-xs sm:text-sm font-bold text-slate-800">
                        {convertedDimensions.width} × {convertedDimensions.height}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-medium text-slate-500 block">Size Diff</span>
                      <strong
                        className={`text-xs sm:text-sm font-bold ${
                          convertedBlob.size <= sourceFile.size ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {convertedBlob.size <= sourceFile.size ? "▼ " : "▲ "}
                        {Math.abs(Math.round(((convertedBlob.size - sourceFile.size) / sourceFile.size) * 100))}%
                      </strong>
                    </div>
                  </div>

                  {/* Preview Box */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-center max-h-72 overflow-hidden">
                    <img
                      src={convertedUrl}
                      alt="Converted"
                      className="max-h-64 max-w-full object-contain rounded-lg shadow-2xs"
                    />
                  </div>
                </>
              )}

              {isBatch && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Archive className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        All {files.length} images converted to {targetFormat.toUpperCase()}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Total Package Archive Size: {formatBytes(convertedBlob.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={handleDownload}
                  className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="h-4 w-4" />
                  {isBatch
                    ? `Download All (${files.length} Images) as ZIP`
                    : `Download Converted Image (${FORMAT_DETAILS[targetFormat].ext.toUpperCase()})`}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full sm:w-auto text-xs text-slate-600 hover:text-slate-900 py-2.5"
                >
                  Convert More Images
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
