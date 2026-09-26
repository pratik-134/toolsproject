"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileCheck,
  Trash2,
  Stamp,
} from "lucide-react";
import {
  formatBatesNumber,
  createSampleStampPdf,
  stampPdf,
  StampPosition,
  StampColor,
} from "./logic";
import { PDFDocument } from "pdf-lib";

export default function PdfBatesStamperTool() {
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);

  // Stamping options
  const [prefix, setPrefix] = useState("CONFIDENTIAL-");
  const [startNumber, setStartNumber] = useState(1);
  const [digits, setDigits] = useState(6);
  const [suffix, setSuffix] = useState("");
  const [includeTotalPages, setIncludeTotalPages] = useState(false);
  const [position, setPosition] = useState<StampPosition>("bottom-right");
  const [color, setColor] = useState<StampColor>("red");
  const [fontSize, setFontSize] = useState(10);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stampedPdfUrl, setStampedPdfUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const arrayBuf = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuf);
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      setFileBuffer(buffer);
      setFileName(file.name);
      setFileSize(file.size);
      setPageCount(doc.getPageCount());
      setStampedPdfUrl(null);
    } catch (err: any) {
      setError(`Failed to read PDF: ${err?.message || "Invalid or encrypted file"}`);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLoadSample = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const sample = await createSampleStampPdf(4);
      const doc = await PDFDocument.load(sample);

      setFileBuffer(sample);
      setFileName("Litigation_Exhibit_Batch.pdf");
      setFileSize(sample.length);
      setPageCount(doc.getPageCount());
      setStampedPdfUrl(null);
    } catch (err: any) {
      setError(`Failed to create sample: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStamp = async () => {
    if (!fileBuffer) return;
    setError(null);
    setIsProcessing(true);

    try {
      const stamped = await stampPdf(fileBuffer, {
        prefix,
        startNumber,
        digits,
        suffix,
        includeTotalPages,
        position,
        color,
        fontSize,
      });

      const blob = new Blob([stamped as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setStampedPdfUrl(url);
    } catch (err: any) {
      setError(`Stamping failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const resetAll = () => {
    setFileBuffer(null);
    setFileName("");
    setFileSize(0);
    setPageCount(0);
    setStampedPdfUrl(null);
    setError(null);
  };

  const samplePreview1 = formatBatesNumber(0, Math.max(pageCount, 1), {
    prefix,
    startNumber,
    digits,
    suffix,
    includeTotalPages,
  });

  const samplePreview2 = formatBatesNumber(1, Math.max(pageCount, 2), {
    prefix,
    startNumber,
    digits,
    suffix,
    includeTotalPages,
  });

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> Bates stamping executes directly in your browser memory. Confidential documents never leave your computer.
          </span>
        </div>
        <button
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Demo Sample
        </button>
      </div>

      {/* Upload Zone */}
      {!fileBuffer ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <Stamp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop a PDF
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Add legal Bates numbers, running headers, or footers with custom numbering.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* File Card */
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {fileName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(fileSize)} • {pageCount} Pages
              </p>
            </div>
          </div>
          <button
            onClick={resetAll}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Remove document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stamping Configuration */}
      {fileBuffer && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Bates Stamping Configuration
          </h4>

          {/* Text Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Prefix
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="CASE-"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Number
              </label>
              <input
                type="number"
                min={1}
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Zero-Padded Digits
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={digits}
                onChange={(e) => setDigits(parseInt(e.target.value, 10) || 6)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Suffix
              </label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="-DOC"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Position, Color & Font Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as StampPosition)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="bottom-right">Bottom Right (Standard)</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right (Header)</option>
                <option value="top-center">Top Center</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Color
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value as StampColor)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="red">Red (Litigation Notice)</option>
                <option value="black">Black (Formal)</option>
                <option value="blue">Blue (Corporate)</option>
                <option value="gray">Gray (Subtle)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Font Size
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={8}>8 pt (Small)</option>
                <option value={10}>10 pt (Recommended)</option>
                <option value={12}>12 pt (Prominent)</option>
                <option value={14}>14 pt (Large)</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={includeTotalPages}
              onChange={(e) => setIncludeTotalPages(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Append page index &quot;(Page 1 of {pageCount})&quot; to each stamp
            </span>
          </label>

          {/* Live Preview Box */}
          <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Stamp Preview
            </span>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/60 rounded font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                Page 1: {samplePreview1}
              </span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/60 rounded font-mono text-xs text-slate-600 dark:text-slate-400">
                Page 2: {samplePreview2}
              </span>
            </div>
          </div>

          <button
            onClick={handleStamp}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Stamping PDF in Memory...
              </>
            ) : (
              <>
                <Stamp className="w-4 h-4" />
                Apply Bates Stamp ({pageCount} Pages)
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Panel */}
      {stampedPdfUrl && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                PDF Stamped Successfully!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Bates sequential numbers applied to all {pageCount} pages.
              </p>
            </div>
          </div>
          <a
            href={stampedPdfUrl}
            download={`bates-${fileName || "document.pdf"}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Download Stamped PDF
          </a>
        </div>
      )}
    </div>
  );
}
