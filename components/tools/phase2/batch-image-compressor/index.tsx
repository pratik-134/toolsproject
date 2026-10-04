"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  calculateSavings,
  calculateDownscale,
  aggregateBatchStats,
  createZipArchive,
} from "./logic";
import {
  Upload,
  Download,
  Archive,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Sparkles,
  Sliders,
  FileCheck,
} from "lucide-react";

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "queued" | "processing" | "done" | "error";
  originalSize: number;
  compressedSize: number;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  savedPercentage: number;
  error?: string;
}

export default function BatchImageCompressorTool() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [quality, setQuality] = useState<number>(80); // 10 to 100
  const [targetFormat, setTargetFormat] = useState<"webp" | "jpeg" | "original">("webp");
  const [maxDimension, setMaxDimension] = useState<number>(1920); // 0 = no limit

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [overallProgress, setOverallProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      });
    };
  }, [items]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const newItems: BatchItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file || !file.type.startsWith("image/")) continue;

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
        status: "queued",
        originalSize: file.size,
        compressedSize: 0,
        compressedBlob: null,
        compressedUrl: null,
        savedPercentage: 0,
      });
    }

    if (newItems.length === 0) {
      setError("No valid image files found in upload.");
      return;
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
    setOverallProgress(null);
    setError(null);
  };

  // Compress a single image
  const compressSingleFile = async (item: BatchItem): Promise<{ blob: Blob; url: string; size: number }> => {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load ${item.file.name}`));
      img.src = item.previewUrl;
    });

    const scaled = calculateDownscale(img.naturalWidth, img.naturalHeight, maxDimension);

    const canvas = document.createElement("canvas");
    canvas.width = scaled.width;
    canvas.height = scaled.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not initialize 2D canvas context");

    // Resolve format
    let mime = "image/webp";
    if (targetFormat === "jpeg") {
      mime = "image/jpeg";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (targetFormat === "original") {
      mime = item.file.type === "image/png" ? "image/png" : "image/jpeg";
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, scaled.width, scaled.height);

    const q = quality / 100;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Image compression failed"))),
        mime,
        q
      );
    });

    const url = URL.createObjectURL(blob);
    return { blob, url, size: blob.size };
  };

  // Start batch compression queue
  const processBatch = async () => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    const updated = [...items];
    const total = updated.length;

    for (let i = 0; i < total; i++) {
      setOverallProgress({ current: i + 1, total });
      const currentItem = updated[i];
      if (!currentItem) continue;
      currentItem.status = "processing";
      setItems([...updated]);

      try {
        const res = await compressSingleFile(currentItem);
        currentItem.status = "done";
        currentItem.compressedBlob = res.blob;
        currentItem.compressedUrl = res.url;
        currentItem.compressedSize = res.size;
        const savings = calculateSavings(currentItem.originalSize, res.size);
        currentItem.savedPercentage = savings.percentage;
      } catch (err: any) {
        currentItem.status = "error";
        currentItem.error = err?.message || "Compression error";
      }

      setItems([...updated]);
    }

    setIsProcessing(false);
  };

  const downloadSingle = (item: BatchItem) => {
    if (!item.compressedUrl) return;
    const lastDot = item.file.name.lastIndexOf(".");
    const base = lastDot !== -1 ? item.file.name.substring(0, lastDot) : item.file.name;
    const ext = targetFormat === "jpeg" ? "jpg" : targetFormat === "webp" ? "webp" : "jpg";
    const filename = `${base}_optimized.${ext}`;

    const a = document.createElement("a");
    a.href = item.compressedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download all as ZIP
  const downloadAllZip = async () => {
    const doneItems = items.filter((item) => item.status === "done" && item.compressedBlob);
    if (doneItems.length === 0) return;

    try {
      const zipFiles: Array<{ name: string; data: Uint8Array }> = [];
      const ext = targetFormat === "jpeg" ? "jpg" : targetFormat === "webp" ? "webp" : "jpg";

      for (const item of doneItems) {
        if (!item.compressedBlob) continue;
        const buffer = await item.compressedBlob.arrayBuffer();
        const lastDot = item.file.name.lastIndexOf(".");
        const base = lastDot !== -1 ? item.file.name.substring(0, lastDot) : item.file.name;
        const name = `${base}_compressed.${ext}`;
        zipFiles.push({ name, data: new Uint8Array(buffer) });
      }

      const zipBytes = createZipArchive(zipFiles);
      const zipBlob = new Blob([zipBytes.buffer as ArrayBuffer], { type: "application/zip" });
      const zipUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `optimized_images_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
    } catch (err: any) {
      setError(err?.message || "Failed to generate ZIP archive.");
    }
  };

  // Aggregated metrics
  const doneItems = items.filter((item) => item.status === "done");
  const summary = aggregateBatchStats(
    doneItems.map((i) => ({ originalSize: i.originalSize, compressedSize: i.compressedSize }))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-body">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Archive className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-headings text-sm sm:text-base font-bold text-slate-900">
              Batch Image Compressor & Optimizer
            </h2>
            <p className="text-xs text-slate-600">
              Compress multiple photos simultaneously in your browser. Download individually or as a single ZIP.
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
            <strong className="font-semibold">Batch Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Multi-File Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 bg-white hover:bg-slate-50/80 shadow-xs"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
        <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
          <Upload className="h-7 w-7" />
        </div>
        <h3 className="font-headings text-base sm:text-lg font-bold text-slate-900 mb-1">
          Drop multiple images here or click to browse
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Select up to 20 images at once. Supports JPEG, PNG, WebP, and BMP.
        </p>
        <Button
          type="button"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-bold"
        >
          Select Images
        </Button>
      </div>

      {items.length > 0 && (
        <div className="space-y-6">
          {/* Settings Panel */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" />
                <h3 className="font-headings text-sm font-bold text-slate-900">
                  Batch Compression Settings
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Compression Quality:</span>
                  <span className="text-blue-700">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Small File (20%)</span>
                  <span>Balanced (80%)</span>
                  <span>Max (100%)</span>
                </div>
              </div>

              {/* Target Format */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Output Format</label>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {(["webp", "jpeg", "original"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`flex-1 py-1 rounded-md text-xs font-bold uppercase transition-all ${
                        targetFormat === fmt
                          ? "bg-white text-blue-700 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Resolution Constraint */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Max Resolution Limit</label>
                <select
                  value={maxDimension}
                  onChange={(e) => setMaxDimension(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Original Resolution (No Limit)</option>
                  <option value={1920}>Full HD (Max 1920px)</option>
                  <option value={1280}>HD 720p (Max 1280px)</option>
                  <option value={2560}>2K QHD (Max 2560px)</option>
                  <option value={1080}>Square (Max 1080px)</option>
                </select>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-2">
              <Button
                onClick={processBatch}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Compressing {overallProgress?.current} of {overallProgress?.total}...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Compress All {items.length} Images
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Overall Summary Bar (if any done) */}
          {doneItems.length > 0 && (
            <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-white shadow-md space-y-4 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-headings text-sm sm:text-base font-bold text-slate-900">
                    Batch Optimization Complete
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Saved {(summary.totalSavedBytes / (1024 * 1024)).toFixed(2)} MB (-{summary.overallPercentage}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Total Files</span>
                  <strong className="text-slate-900 text-sm">{doneItems.length}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Original Size</span>
                  <strong className="text-slate-900 text-sm">
                    {(summary.totalOriginalSize / (1024 * 1024)).toFixed(2)} MB
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-blue-700 block">Compressed Size</span>
                  <strong className="text-blue-900 text-sm">
                    {(summary.totalCompressedSize / (1024 * 1024)).toFixed(2)} MB
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-emerald-700 block">Net Savings</span>
                  <strong className="text-emerald-900 text-sm">
                    ▼ {summary.overallPercentage}%
                  </strong>
                </div>
              </div>

              <Button
                onClick={downloadAllZip}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                Download All ({doneItems.length}) as ZIP Archive
              </Button>
            </div>
          )}

          {/* Items Queue List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Image Queue ({items.length})
            </span>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="h-10 w-10 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {item.file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {((item.originalSize) / (1024 * 1024)).toFixed(2)} MB
                        {item.status === "done" && (
                          <span className="text-emerald-600 font-bold ml-2">
                            → {((item.compressedSize) / (1024 * 1024)).toFixed(2)} MB (-{item.savedPercentage}%)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === "queued" && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        Queued
                      </span>
                    )}
                    {item.status === "processing" && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Compressing
                      </span>
                    )}
                    {item.status === "done" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadSingle(item)}
                        className="text-xs h-7 px-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                      >
                        <Download className="h-3 w-3 mr-1" /> Save
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                      title="Remove from batch"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
