"use client";

import React, { useState } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";
import { Sliders } from "lucide-react";

export interface HeicEngineProps {
  preset: ConverterPreset;
}

export function HeicEngine({ preset }: HeicEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [quality, setQuality] = useState<number>(preset.defaultOptions.quality || 0.92);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const convertHeic = async () => {
    if (files.length === 0 || !files[0]) return;
    setIsProcessing(true);
    setProgressPercent(10);
    setErrorMessage(null);

    const isPng = preset.outputFormat === "png";
    const toType = isPng ? "image/png" : "image/jpeg";
    const ext = preset.downloadFilenameExtension || (isPng ? ".png" : ".jpg");

    try {
      // Dynamic import of heic2any
      const heic2any = (await import("heic2any")).default;

      if (files.length === 1) {
        const file = files[0];
        const conversionResult = await heic2any({
          blob: file,
          toType,
          quality: isPng ? undefined : quality,
        });

        const resultBlob = Array.isArray(conversionResult)
          ? conversionResult[0]
          : conversionResult;

        if (!resultBlob) throw new Error("HEIC decoding returned empty output.");

        const url = URL.createObjectURL(resultBlob);
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

        setDownloadUrl(url);
        setDownloadFilename(`${baseName}${ext}`);
      } else {
        // Multi-file HEIC batch
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;
          const conversionResult = await heic2any({
            blob: file,
            toType,
            quality: isPng ? undefined : quality,
          });

          const resultBlob = Array.isArray(conversionResult)
            ? conversionResult[0]
            : conversionResult;

          if (resultBlob) {
            const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            zip.file(`${baseName}${ext}`, resultBlob);
          }

          setProgressPercent(10 + Math.round(((i + 1) / files.length) * 85));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);

        setDownloadUrl(url);
        setDownloadFilename(`${preset.slug}-converted-photos.zip`);
      }
    } catch (err: any) {
      console.error("[HeicEngine Error]:", err);
      setErrorMessage(
        err.message || "Failed to decode HEIC photo. Make sure the file is a valid Apple HEIC/HEIF image."
      );
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
      multipleFiles={true}
      files={files}
      onFilesSelected={handleFilesSelected}
      onRemoveFile={handleRemoveFile}
      actionLabel={preset.actionLabel}
      onAction={convertHeic}
      isProcessing={isProcessing}
      progressPercent={progressPercent}
      downloadUrl={downloadUrl}
      downloadFilename={downloadFilename}
      onReset={handleReset}
      errorMessage={errorMessage}
      isActionDisabled={files.length === 0}
      dropzoneText={`Drag & drop Apple iPhone HEIC/HEIF photos to convert to ${preset.outputFormat.toUpperCase()}`}
      customControls={
        files.length > 0 && !downloadUrl && preset.outputFormat !== "png" ? (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs font-body">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Sliders className="h-4 w-4 text-blue-600" />
              <span>JPEG Quality Options</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Output JPEG Quality: {Math.round(quality * 100)}%
              </label>
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
          </div>
        ) : null
      }
    />
  );
}
