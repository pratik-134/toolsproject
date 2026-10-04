"use client";

import React, { useState } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";
import { PDFDocument, PageSizes } from "pdf-lib";
import { Sliders, ArrowUp, ArrowDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ImagesToPdfEngineProps {
  preset: ConverterPreset;
}

export function ImagesToPdfEngine({ preset }: ImagesToPdfEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Options
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [margin, setMargin] = useState<number>(10);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    setFiles((prev) => {
      const copy = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const temp = copy[index];
      const target = copy[targetIndex];
      if (temp !== undefined && target !== undefined) {
        copy[index] = target;
        copy[targetIndex] = temp;
      }
      return copy;
    });
  };

  const convertImagesToPdf = async () => {
    const firstFile = files[0];
    if (files.length === 0 || !firstFile) return;
    setIsProcessing(true);
    setProgressPercent(10);
    setErrorMessage(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        const arrayBuffer = await file.arrayBuffer();

        let image;
        if (file.type === "image/png") {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          image = await pdfDoc.embedJpg(arrayBuffer);
        }

        // Determine dimensions
        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === "a4") {
          pageWidth = PageSizes.A4[0];
          pageHeight = PageSizes.A4[1];
        } else if (pageSize === "letter") {
          pageWidth = PageSizes.Letter[0];
          pageHeight = PageSizes.Letter[1];
        } else {
          // Fit to image dimensions
          pageWidth = image.width + margin * 2;
          pageHeight = image.height + margin * 2;
        }

        if (orientation === "landscape" && pageSize !== "fit") {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Draw image centered inside margins
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const imgAspectRatio = image.width / image.height;
        const boxAspectRatio = availableWidth / availableHeight;

        let drawWidth: number;
        let drawHeight: number;

        if (imgAspectRatio > boxAspectRatio) {
          drawWidth = availableWidth;
          drawHeight = availableWidth / imgAspectRatio;
        } else {
          drawHeight = availableHeight;
          drawWidth = availableHeight * imgAspectRatio;
        }

        const x = margin + (availableWidth - drawWidth) / 2;
        const y = margin + (availableHeight - drawHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        setProgressPercent(10 + Math.round(((i + 1) / files.length) * 80));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const firstFile = files[0];
      const firstBase = firstFile ? firstFile.name.substring(0, firstFile.name.lastIndexOf(".")) : "converted";
      setDownloadUrl(url);
      setDownloadFilename(`${firstBase}-cleartrix.pdf`);
    } catch (err: any) {
      console.error("[ImagesToPdfEngine Error]:", err);
      setErrorMessage(err.message || "Failed to generate PDF from images.");
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
      onAction={convertImagesToPdf}
      isProcessing={isProcessing}
      progressPercent={progressPercent}
      downloadUrl={downloadUrl}
      downloadFilename={downloadFilename}
      onReset={handleReset}
      errorMessage={errorMessage}
      isActionDisabled={files.length === 0}
      dropzoneText="Drag & drop images to convert to PDF (JPEG, PNG, WebP)"
      customControls={
        files.length > 0 && !downloadUrl ? (
          <div className="space-y-4">
            {/* Reorder File Controls */}
            {files.length > 1 && (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                <span className="font-bold text-slate-800">Reorder Pages / Images:</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {files.map((file, idx) => (
                    <div
                      key={`reorder-${idx}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-slate-700"
                    >
                      <span className="truncate font-medium">
                        {idx + 1}. {file.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveFile(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                          title="Move page up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFile(idx, "down")}
                          disabled={idx === files.length - 1}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                          title="Move page down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document PDF Options */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>PDF Document Options</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Page Size</label>
                  <Select value={pageSize} onValueChange={(val) => setPageSize(val as any)}>
                    <SelectTrigger className="w-full h-9 rounded-lg border border-slate-300 bg-white font-medium text-xs">
                      <SelectValue placeholder="Page Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4 Standard</SelectItem>
                      <SelectItem value="letter">US Letter</SelectItem>
                      <SelectItem value="fit">Fit to Image Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Orientation</label>
                  <Select
                    value={orientation}
                    onValueChange={(val) => setOrientation(val as any)}
                    disabled={pageSize === "fit"}
                  >
                    <SelectTrigger className="w-full h-9 rounded-lg border border-slate-300 bg-white font-medium text-xs disabled:opacity-50">
                      <SelectValue placeholder="Orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait (Vertical)</SelectItem>
                      <SelectItem value="landscape">Landscape (Horizontal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Page Margin</label>
                  <Select value={String(margin)} onValueChange={(val) => setMargin(parseInt(val, 10))}>
                    <SelectTrigger className="w-full h-9 rounded-lg border border-slate-300 bg-white font-medium text-xs">
                      <SelectValue placeholder="Page Margin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Margin (Full Bleed)</SelectItem>
                      <SelectItem value="10">Small Margin (10pt)</SelectItem>
                      <SelectItem value="25">Medium Margin (25pt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );
}
