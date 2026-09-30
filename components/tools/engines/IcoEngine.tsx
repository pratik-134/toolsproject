"use client";

import React, { useState } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";
import { Sliders, CheckSquare, Square } from "lucide-react";

export interface IcoEngineProps {
  preset: ConverterPreset;
}

const AVAILABLE_ICO_SIZES = [16, 32, 48, 64, 128, 256];

export function IcoEngine({ preset }: IcoEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48, 64, 128, 256]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles.slice(0, 1));
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  const toggleSize = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const generateIcoPackage = async () => {
    if (files.length === 0 || !files[0] || selectedSizes.length === 0) return;
    setIsProcessing(true);
    setProgressPercent(10);
    setErrorMessage(null);

    try {
      const file = files[0];
      const img = await loadImage(file);

      const pngBlobs: { size: number; blob: Blob; buffer: Uint8Array }[] = [];

      for (let i = 0; i < selectedSizes.length; i++) {
        const size = selectedSizes[i];
        if (!size) continue;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize canvas 2D context.");

        ctx.drawImage(img, 0, 0, size, size);

        const blob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("Canvas export failed"))), "image/png");
        });

        const arrayBuffer = await blob.arrayBuffer();
        pngBlobs.push({
          size,
          blob,
          buffer: new Uint8Array(arrayBuffer),
        });

        setProgressPercent(10 + Math.round(((i + 1) / selectedSizes.length) * 80));
      }

      // Build ICO binary structure
      const icoBlob = buildIcoBinary(pngBlobs);
      const url = URL.createObjectURL(icoBlob);
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "favicon";

      setDownloadUrl(url);
      setDownloadFilename(`${baseName}.ico`);
    } catch (err: any) {
      console.error("[IcoEngine Error]:", err);
      setErrorMessage(err.message || "Failed to generate Favicon ICO file.");
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
      onAction={generateIcoPackage}
      isProcessing={isProcessing}
      progressPercent={progressPercent}
      downloadUrl={downloadUrl}
      downloadFilename={downloadFilename}
      onReset={handleReset}
      errorMessage={errorMessage}
      isActionDisabled={files.length === 0 || selectedSizes.length === 0}
      dropzoneText="Drag & drop an image (PNG, JPG, SVG) to generate a multi-resolution Favicon .ICO"
      customControls={
        files.length > 0 && !downloadUrl ? (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs font-body">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Sliders className="h-4 w-4 text-blue-600" />
              <span>Select Favicon Resolutions to Pack into .ICO</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_ICO_SIZES.map((size) => {
                const isChecked = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-colors ${
                      isChecked
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span>
                      {size}x{size} px
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null
      }
    />
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image file."));
    };
    img.src = url;
  });
}

/**
 * Packs array of PNG binary buffers into a valid multi-icon Windows .ICO file structure
 */
function buildIcoBinary(pngs: { size: number; buffer: Uint8Array }[]): Blob {
  const count = pngs.length;
  const headerSize = 6;
  const directorySize = 16 * count;

  let totalImageDataSize = 0;
  pngs.forEach((item) => {
    totalImageDataSize += item.buffer.length;
  });

  const totalSize = headerSize + directorySize + totalImageDataSize;
  const icoBuffer = new Uint8Array(totalSize);
  const view = new DataView(icoBuffer.buffer);

  // 1. ICO Header
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type (1 = ICO)
  view.setUint16(4, count, true); // Number of images

  // 2. Directory Entries
  let dataOffset = headerSize + directorySize;

  for (let i = 0; i < count; i++) {
    const png = pngs[i];
    if (!png) continue;
    const dirOffset = headerSize + i * 16;

    view.setUint8(dirOffset + 0, png.size >= 256 ? 0 : png.size); // Width
    view.setUint8(dirOffset + 1, png.size >= 256 ? 0 : png.size); // Height
    view.setUint8(dirOffset + 2, 0); // Color palette
    view.setUint8(dirOffset + 3, 0); // Reserved
    view.setUint16(dirOffset + 4, 1, true); // Color planes
    view.setUint16(dirOffset + 6, 32, true); // Bits per pixel
    view.setUint32(dirOffset + 8, png.buffer.length, true); // Image data size
    view.setUint32(dirOffset + 12, dataOffset, true); // Image data offset

    // Copy PNG bytes
    icoBuffer.set(png.buffer, dataOffset);
    dataOffset += png.buffer.length;
  }

  return new Blob([icoBuffer.buffer as ArrayBuffer], { type: "image/x-icon" });
}
