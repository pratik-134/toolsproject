"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Stamp,
  Sliders,
  Check,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { applyWatermarkToPdf, WatermarkOptions } from "./logic";

export default function PdfWatermarkStamperTool() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState<number>(54);
  const [opacity, setOpacity] = useState<number>(0.25);
  const [rotationAngle, setRotationAngle] = useState<number>(45);
  const [pageRange, setPageRange] = useState<"all" | "first" | "odd" | "even">("all");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);

  // Generate demo dummy PDF
  const loadDemoPdf = async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    page.drawText("ClearTrix PDF Watermark Studio Demo Document", { x: 50, y: 750, size: 16 });
    page.drawText("This is a sample page to test watermark opacity and diagonal angles.", { x: 50, y: 700, size: 12 });
    const bytes = await doc.save();
    setPdfBytes(bytes);
    setPdfFile(new File([bytes.buffer as ArrayBuffer], "demo.pdf", { type: "application/pdf" }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    const buf = await file.arrayBuffer();
    setPdfBytes(new Uint8Array(buf));
  };

  const handleApply = async () => {
    if (!pdfBytes) return;
    setIsProcessing(true);
    try {
      const result = await applyWatermarkToPdf(pdfBytes, {
        text: watermarkText,
        fontSize,
        opacity,
        rotationAngle,
        color: [0.8, 0.2, 0.2],
        pageRange,
      });
      setProcessedBytes(result);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBytes) return;
    const blob = new Blob([processedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `watermarked-${pdfFile?.name || "document.pdf"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Stamp className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              PDF Watermark & Page Stamp Studio
            </span>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Smallpdf / iLovePDF Alternative
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!pdfBytes && (
              <button
                type="button"
                onClick={loadDemoPdf}
                className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors"
              >
                Load Demo PDF
              </button>
            )}
            {processedBytes && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:opacity-90 transition-opacity"
              >
                <Download className="w-3.5 h-3.5" />
                Download Watermarked PDF
              </button>
            )}
          </div>
        </div>

        {/* Watermark Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-border/50 text-xs">
          <div className="space-y-1.5">
            <span className="text-muted-foreground font-medium">Watermark Text</span>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-border bg-background font-medium text-xs outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Opacity</span>
              <span className="font-mono text-foreground font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.9"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Rotation Angle</span>
              <span className="font-mono text-foreground font-bold">{rotationAngle}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-muted-foreground font-medium">Page Target</span>
            <select
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-border bg-background font-medium text-xs outline-none cursor-pointer"
            >
              <option value="all">All Pages</option>
              <option value="first">First Page Only</option>
              <option value="odd">Odd Pages</option>
              <option value="even">Even Pages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      {!pdfBytes ? (
        <div className="rounded-3xl border-2 border-dashed border-border/80 p-12 text-center bg-card/50 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">Upload PDF Document</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add diagonal or horizontal text watermarks across pages with zero server upload.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shadow-sm transition-opacity">
              Select PDF
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={loadDemoPdf}
              className="px-4 py-2 rounded-xl border border-border text-foreground text-xs font-medium hover:bg-muted transition-colors"
            >
              Try Demo Document
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-5">
          <div className="p-4 rounded-xl bg-muted/40 border border-border inline-flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm text-foreground">{pdfFile?.name || "document.pdf"}</span>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Stamp className="w-4 h-4" />
              {isProcessing ? "Stamping PDF..." : "Apply Watermark & Stamp"}
            </button>
          </div>

          {processedBytes && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold inline-flex items-center gap-2">
              <Check className="w-4 h-4" />
              Watermark successfully applied! Click 'Download Watermarked PDF' above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
