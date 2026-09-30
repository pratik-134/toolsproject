"use client";

import React, { useState } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";
import JSZip from "jszip";
import { Sliders, FileImage } from "lucide-react";

export interface PdfImageEngineProps {
  preset: ConverterPreset;
}

export function PdfImageEngine({ preset }: PdfImageEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Options
  const [scale, setScale] = useState<number>(preset.defaultOptions.scale || 2);
  const [quality, setQuality] = useState<number>(preset.defaultOptions.quality || 0.92);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles.slice(0, 1));
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const renderPdfToImages = async () => {
    if (files.length === 0 || !files[0]) return;
    setIsProcessing(true);
    setProgressPercent(10);
    setErrorMessage(null);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // Dynamic import of pdfjs-dist
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      if (numPages === 0) {
        throw new Error("PDF file contains 0 pages.");
      }

      const zip = new JSZip();
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "pdf-page";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize 2D canvas context.");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // White background for pages
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        const mimeType = preset.outputFormat === "jpeg" ? "image/jpeg" : "image/png";
        const ext = preset.outputFormat === "jpeg" ? "jpg" : "png";

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
            mimeType,
            quality
          );
        });

        const padIndex = String(i).padStart(String(numPages).length, "0");
        zip.file(`${baseName}-page-${padIndex}.${ext}`, blob);

        setProgressPercent(10 + Math.round((i / numPages) * 85));
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);

      setDownloadUrl(url);
      setDownloadFilename(`${baseName}-images.zip`);
    } catch (err: any) {
      console.error("[PdfImageEngine Error]:", err);
      setErrorMessage(err.message || "Failed to render PDF pages to images.");
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
      multipleFiles={false}
      files={files}
      onFilesSelected={handleFilesSelected}
      actionLabel={preset.actionLabel}
      onAction={renderPdfToImages}
      isProcessing={isProcessing}
      progressPercent={progressPercent}
      downloadUrl={downloadUrl}
      downloadFilename={downloadFilename}
      onReset={handleReset}
      errorMessage={errorMessage}
      isActionDisabled={files.length === 0}
      dropzoneText="Drag & drop a PDF document to render pages as images"
      customControls={
        files.length > 0 && !downloadUrl ? (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Sliders className="h-4 w-4 text-blue-600" />
              <span>Image Output Quality & Resolution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">DPI / Resolution</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => (
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
                      {s === 1 ? "150 DPI" : s === 2 ? "300 DPI (HQ)" : "450 DPI (Ultra)"}
                    </button>
                  ))}
                </div>
              </div>

              {preset.outputFormat === "jpeg" && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    JPEG Compression: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                  />
                </div>
              )}
            </div>
          </div>
        ) : null
      }
    />
  );
}
