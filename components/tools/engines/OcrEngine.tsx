"use client";

import React, { useState } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";

export interface OcrEngineProps {
  preset: ConverterPreset;
}

export function OcrEngine({ preset }: OcrEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setDownloadUrl(null);
    setErrorMessage(null);
    setExtractedText(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOcr = async () => {
    if (files.length === 0 || !files[0]) return;
    const file = files[0];

    setIsProcessing(true);
    setProgressPercent(10);
    setErrorMessage(null);

    try {
      // Dynamic lazy import of tesseract.js
      const { createWorker } = await import("tesseract.js");
      setProgressPercent(30);

      const worker = await createWorker("eng");
      setProgressPercent(50);

      const imageUrl = URL.createObjectURL(file);
      const ret = await worker.recognize(imageUrl);
      URL.revokeObjectURL(imageUrl);

      await worker.terminate();

      const text = ret.data.text || "No text recognized in image.";
      setExtractedText(text);

      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

      setDownloadUrl(url);
      setDownloadFilename(`${baseName}_ocr.txt`);
      setProgressPercent(100);
    } catch (err: unknown) {
      console.error("[OcrEngine Error]:", err);
      const msg = err instanceof Error ? err.message : "Failed to run OCR on image.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setExtractedText(null);
    setDownloadUrl(null);
    setDownloadFilename(null);
    setProgressPercent(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      <ToolWorkbenchShell
        acceptTypes={preset.inputFormats}
        maxFileSizeMB={preset.maxFileSizeMB}
        multipleFiles={preset.multiFile}
        files={files}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={handleRemoveFile}
        actionLabel={preset.actionLabel}
        onAction={handleOcr}
        isProcessing={isProcessing}
        progressPercent={progressPercent}
        downloadUrl={downloadUrl}
        downloadFilename={downloadFilename}
        errorMessage={errorMessage}
        onReset={handleReset}
      >
        {extractedText && (
          <div className="mt-6 text-left space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Extracted OCR Text:
            </label>
            <pre className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg overflow-x-auto text-sm font-mono border border-slate-200 dark:border-slate-700 max-h-80 whitespace-pre-wrap">
              {extractedText}
            </pre>
          </div>
        )}
      </ToolWorkbenchShell>
    </div>
  );
}
