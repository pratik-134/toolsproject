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
  ArrowLeft,
  ArrowRight,
  Copy,
  RotateCcw,
  Layers,
} from "lucide-react";
import {
  createSampleOrganizerPdf,
  organizePdfPages,
} from "./logic";
import { PDFDocument } from "pdf-lib";

interface PageItem {
  id: string;
  originalIndex: number; // 0-indexed
}

export default function PdfPageOrganizerTool() {
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [pageItems, setPageItems] = useState<PageItem[]>([]);
  const [originalCount, setOriginalCount] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizedPdfUrl, setOrganizedPdfUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const arrayBuf = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuf);
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();

      setFileBuffer(buffer);
      setFileName(file.name);
      setFileSize(file.size);
      setOriginalCount(count);
      setPageItems(
        Array.from({ length: count }, (_, i) => ({
          id: Math.random().toString(36).substring(2, 9),
          originalIndex: i,
        }))
      );
      setOrganizedPdfUrl(null);
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
      const sample = await createSampleOrganizerPdf(5);
      const doc = await PDFDocument.load(sample);
      const count = doc.getPageCount();

      setFileBuffer(sample);
      setFileName("Organizer_Demo_Document.pdf");
      setFileSize(sample.length);
      setOriginalCount(count);
      setPageItems(
        Array.from({ length: count }, (_, i) => ({
          id: Math.random().toString(36).substring(2, 9),
          originalIndex: i,
        }))
      );
      setOrganizedPdfUrl(null);
    } catch (err: any) {
      setError(`Failed to load sample: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const movePage = (index: number, direction: "left" | "right") => {
    if (
      (direction === "left" && index === 0) ||
      (direction === "right" && index === pageItems.length - 1)
    ) {
      return;
    }
    const newItems = [...pageItems];
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    const [moved] = newItems.splice(index, 1);
    if (moved) {
      newItems.splice(targetIdx, 0, moved);
      setPageItems(newItems);
      setOrganizedPdfUrl(null);
    }
  };

  const duplicatePage = (index: number) => {
    const item = pageItems[index];
    if (!item) return;
    const newItems = [...pageItems];
    newItems.splice(index + 1, 0, {
      id: Math.random().toString(36).substring(2, 9),
      originalIndex: item.originalIndex,
    });
    setPageItems(newItems);
    setOrganizedPdfUrl(null);
  };

  const deletePage = (index: number) => {
    setPageItems((prev) => prev.filter((_, i) => i !== index));
    setOrganizedPdfUrl(null);
  };

  const reversePages = () => {
    setPageItems((prev) => [...prev].reverse());
    setOrganizedPdfUrl(null);
  };

  const resetToOriginal = () => {
    setPageItems(
      Array.from({ length: originalCount }, (_, i) => ({
        id: Math.random().toString(36).substring(2, 9),
        originalIndex: i,
      }))
    );
    setOrganizedPdfUrl(null);
  };

  const handleExport = async () => {
    if (!fileBuffer) return;
    if (pageItems.length === 0) {
      setError("Document must contain at least one page.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const order = pageItems.map((p) => p.originalIndex);
      const organizedBytes = await organizePdfPages(fileBuffer, order);
      const blob = new Blob([organizedBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setOrganizedPdfUrl(url);
    } catch (err: any) {
      setError(`Failed to organize PDF: ${err?.message || "Unknown error"}`);
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
    setPageItems([]);
    setOriginalCount(0);
    setOrganizedPdfUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> Reordering, deleting, and duplicating pages occurs strictly in your browser memory.
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
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop a PDF
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visually reorder pages, delete unwanted sheets, or duplicate pages in seconds.
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
                {formatFileSize(fileSize)} • Current: {pageItems.length} pages (Original: {originalCount})
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

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Organizer Workspace */}
      {fileBuffer && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Page Sequence ({pageItems.length} pages)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={reversePages}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reverse Order
              </button>
              <button
                onClick={resetToOriginal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Order
              </button>
            </div>
          </div>

          {/* Page Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            {pageItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center gap-2 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                <div className="flex items-center justify-between w-full px-1">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Orig #{item.originalIndex + 1}
                  </span>
                </div>

                {/* Page Mock Preview */}
                <div className="w-full h-24 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-1 p-2">
                  <FileText className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate max-w-full">
                    Page {item.originalIndex + 1}
                  </span>
                </div>

                {/* Reorder and Delete Controls */}
                <div className="flex items-center justify-between w-full gap-1 pt-1">
                  <button
                    onClick={() => movePage(idx, "left")}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-20 transition-colors"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => duplicatePage(idx)}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded transition-colors"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deletePage(idx)}
                    disabled={pageItems.length <= 1}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded disabled:opacity-20 transition-colors"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => movePage(idx, "right")}
                    disabled={idx === pageItems.length - 1}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-20 transition-colors"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleExport}
              disabled={isProcessing || pageItems.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Organized PDF...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Export Organized PDF ({pageItems.length} Pages)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result Panel */}
      {organizedPdfUrl && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                PDF Organized Successfully!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your new PDF contains {pageItems.length} pages arranged in your customized sequence.
              </p>
            </div>
          </div>
          <a
            href={organizedPdfUrl}
            download={`organized-${fileName || "document.pdf"}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Download Organized PDF
          </a>
        </div>
      )}
    </div>
  );
}
