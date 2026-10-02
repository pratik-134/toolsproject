"use client";

import React, { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
  Sliders,
  Sparkles,
  FileCheck,
  RotateCcw,
} from "lucide-react";

type Position =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "top-right"
  | "top-left";

type NumberFormat = "Page {n} of {total}" | "{n} / {total}" | "{n}" | "- {n} -";

export default function PdfPageNumbererTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<NumberFormat>("Page {n} of {total}");
  const [skipCover, setSkipCover] = useState<boolean>(false);
  const [startNum, setStartNum] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(10);
  const [margin, setMargin] = useState<number>(24);
  const [colorHex, setColorHex] = useState<string>("#334155"); // Slate-700
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    try {
      setError(null);
      setIsSuccess(false);
      const buffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      setFile(selectedFile);
      setPageCount(count);
    } catch (err: any) {
      setError("Unable to read PDF file. It might be corrupted or password-protected.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleStampAndDownload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      const total = pages.length;
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Parse RGB
      let r = 0, g = 0, b = 0;
      if (colorHex.startsWith("#") && colorHex.length === 7) {
        r = parseInt(colorHex.slice(1, 3), 16) / 255;
        g = parseInt(colorHex.slice(3, 5), 16) / 255;
        b = parseInt(colorHex.slice(5, 7), 16) / 255;
      }

      pages.forEach((page, idx) => {
        // Check if cover page should be skipped
        if (skipCover && idx === 0) return;

        const pageNum = skipCover ? idx + startNum - 1 : idx + startNum;
        const totalPagesCount = skipCover ? total - 1 : total;

        const text = format
          .replace("{n}", pageNum.toString())
          .replace("{total}", totalPagesCount.toString());

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const { width, height } = page.getSize();

        let x = 0;
        let y = 0;

        switch (position) {
          case "bottom-center":
            x = (width - textWidth) / 2;
            y = margin;
            break;
          case "bottom-right":
            x = width - textWidth - margin;
            y = margin;
            break;
          case "bottom-left":
            x = margin;
            y = margin;
            break;
          case "top-center":
            x = (width - textWidth) / 2;
            y = height - margin - fontSize;
            break;
          case "top-right":
            x = width - textWidth - margin;
            y = height - margin - fontSize;
            break;
          case "top-left":
            x = margin;
            y = height - margin - fontSize;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.pdf$/i, "");
      a.download = `${baseName}_numbered.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      setIsSuccess(true);
    } catch (err: any) {
      setError(`Failed to stamp page numbers: ${err.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-body text-slate-900 dark:text-slate-100">
      {/* Privacy Guarantee Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-xs text-blue-900 dark:text-blue-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>100% In-Browser PDF Processing:</strong> Page numbers are stamped using vector coordinate insertion in client-side memory. Your PDF never leaves your device.
          </span>
        </div>
      </div>

      {!file ? (
        /* Upload Area */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 sm:p-12 text-center bg-white dark:bg-slate-900 cursor-pointer transition-all hover:bg-blue-50/20 dark:hover:bg-blue-950/20 shadow-xs"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-headings font-bold text-base text-slate-900 dark:text-white">
                Choose a PDF to Number
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Drag and drop your file here, or click to browse
              </p>
            </div>
            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              Standard PDF documents up to 50 MB
            </span>
          </div>
        </div>
      ) : (
        /* Stamping Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Configuration Controls */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-headings font-bold text-sm text-slate-900 dark:text-white">
                  Page Numbering Options
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPageCount(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Change PDF
              </button>
            </div>

            {/* Position Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Number Position
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "bottom-left", label: "Bottom Left" },
                  { id: "bottom-center", label: "Bottom Center" },
                  { id: "bottom-right", label: "Bottom Right" },
                  { id: "top-left", label: "Top Left" },
                  { id: "top-center", label: "Top Center" },
                  { id: "top-right", label: "Top Right" },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setPosition(pos.id as Position)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                      position === pos.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Numbering Format */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Format Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Page {n} of {total}",
                  "{n} / {total}",
                  "{n}",
                  "- {n} -",
                ].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt as NumberFormat)}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono font-medium transition-all text-left ${
                      format === fmt
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {fmt.replace("{n}", "1").replace("{total}", (pageCount || 10).toString())}
                  </button>
                ))}
              </div>
            </div>

            {/* Skip Cover & Start Page */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipCover}
                  onChange={(e) => setSkipCover(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Skip First Page (Cover)
                </span>
              </label>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Start Numbering At:
                </span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={startNum}
                  onChange={(e) => setStartNum(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 py-1 text-center font-mono"
                />
              </div>
            </div>

            {/* Sliders for Font Size and Margin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span>Font Size</span>
                  <span className="font-mono">{fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={16}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span>Edge Margin</span>
                  <span className="font-mono">{margin} pt</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={48}
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Right: File Preview & Action CTA */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
                <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {pageCount} {pageCount === 1 ? "page" : "pages"} • {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Sample Stamp Preview Box */}
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center bg-white dark:bg-slate-850 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Simulated Stamp Preview
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white block py-2">
                  {format.replace("{n}", startNum.toString()).replace("{total}", (pageCount || 1).toString())}
                </span>
                <span className="text-[11px] text-slate-500 capitalize">
                  Placed at: {position.replace("-", " ")}
                </span>
              </div>

              {isSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Numbered PDF generated and downloaded successfully!</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              size="lg"
              disabled={isProcessing}
              onClick={handleStampAndDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-md gap-2"
            >
              {isProcessing ? (
                <span>Numbering {pageCount} pages...</span>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Stamp Page Numbers & Download</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
