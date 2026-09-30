"use client";

import React, { useState } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";
import { Settings, Image as ImageIcon, Sliders } from "lucide-react";

export interface CanvasImageEngineProps {
  preset: ConverterPreset;
}

export function CanvasImageEngine({ preset }: CanvasImageEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preset options state
  const [quality, setQuality] = useState<number>(preset.defaultOptions.quality || 0.92);
  const [bgColor, setBgColor] = useState<string>(preset.defaultOptions.backgroundColor || "transparent");
  const [scale, setScale] = useState<number>(preset.defaultOptions.scale || 2);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (files.length === 0 || !files[0]) return;
    setIsProcessing(true);
    setProgressPercent(0);
    setErrorMessage(null);

    try {
      if (files.length === 1) {
        const file = files[0];
        const blob = await convertSingleImage(file, preset.outputFormat, quality, bgColor, scale);
        const url = URL.createObjectURL(blob);
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setDownloadUrl(url);
        setDownloadFilename(`${baseName}${preset.downloadFilenameExtension}`);
      } else {
        // Multi-file batch processing using Canvas
        const convertedBlobs: { name: string; blob: Blob }[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;
          const blob = await convertSingleImage(file, preset.outputFormat, quality, bgColor, scale);
          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          convertedBlobs.push({
            name: `${baseName}${preset.downloadFilenameExtension}`,
            blob,
          });
          setProgressPercent(((i + 1) / files.length) * 100);
        }

        const firstItem = convertedBlobs[0];
        if (firstItem) {
          const url = URL.createObjectURL(firstItem.blob);
          setDownloadUrl(url);
          setDownloadFilename(firstItem.name);
        }
      }
    } catch (err: any) {
      console.error("[CanvasImageEngine Error]:", err);
      setErrorMessage(err.message || "Failed to process image file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setDownloadUrl(null);
    setDownloadFilename(null);
    setProgressPercent(null);
    setErrorMessage(null);
  };

  return (
    <ToolWorkbenchShell
      acceptTypes={preset.inputFormats}
      maxFileSizeMB={preset.maxFileSizeMB}
      multipleFiles={preset.multiFile}
      files={files}
      onFilesSelected={handleFilesSelected}
      onRemoveFile={handleRemoveFile}
      actionLabel={preset.actionLabel}
      onAction={processImages}
      isProcessing={isProcessing}
      progressPercent={progressPercent}
      downloadUrl={downloadUrl}
      downloadFilename={downloadFilename}
      onReset={handleReset}
      errorMessage={errorMessage}
      isActionDisabled={files.length === 0}
      customControls={
        files.length > 0 && !downloadUrl ? (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Sliders className="h-4 w-4 text-blue-600" />
              <span>Conversion Preset Settings</span>
            </div>

            {preset.outputFormat === "jpeg" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700">
                  <label className="font-semibold">JPEG Quality: {Math.round(quality * 100)}%</label>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}

            {preset.slug === "png-to-jpg" || preset.slug === "webp-to-jpg" ? (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Background Fill (For Transparent Pixels)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBgColor("#FFFFFF")}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                      bgColor === "#FFFFFF"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full bg-white border border-slate-300 shadow-2xs" />
                    White (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor("#000000")}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                      bgColor === "#000000"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full bg-black border border-slate-700" />
                    Black
                  </button>
                </div>
              </div>
            ) : null}

            {preset.slug === "svg-to-png" && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Resolution Multiplier</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScale(s)}
                      className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                        scale === s
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {s}x {s === 2 ? "(Standard)" : s === 4 ? "(Ultra 4K)" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null
      }
    />
  );
}

/**
 * Pure client-side Canvas Image conversion logic
 */
async function convertSingleImage(
  file: File,
  outputFormat: string,
  quality: number,
  bgColor: string,
  scale: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to initialize 2D canvas context."));
        return;
      }

      const targetWidth = img.width * scale;
      const targetHeight = img.height * scale;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Fill background if specified
      if (bgColor && bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType = outputFormat === "jpeg" ? "image/jpeg" : "image/png";

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas blob export returned null."));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image file into browser memory."));
    };

    img.src = url;
  });
}
