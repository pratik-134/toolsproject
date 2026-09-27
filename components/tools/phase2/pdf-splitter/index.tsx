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
  Scissors,
  Layers,
  Trash2,
} from "lucide-react";
import {
  parsePageRanges,
  createSampleSplitPdf,
  extractPdfPages,
  burstPdfPages,
} from "./logic";
import { PDFDocument } from "pdf-lib";

export default function PdfSplitterTool() {
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);

  const [splitMode, setSplitMode] = useState<"range" | "burst">("range");
  const [rangeInput, setRangeInput] = useState<string>("1-2");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [extractedPdfUrl, setExtractedPdfUrl] = useState<string | null>(null);
  const [extractedPageCount, setExtractedPageCount] = useState<number>(0);
  const [burstFiles, setBurstFiles] = useState<
    { pageNumber: number; url: string; size: number }[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const arrayBuf = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuf);
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = doc.getPageCount();

      setFileBuffer(buffer);
      setFileName(file.name);
      setFileSize(file.size);
      setPageCount(pages);
      setRangeInput(pages > 1 ? `1-${Math.min(pages, 3)}` : "1");
      setExtractedPdfUrl(null);
      setBurstFiles([]);
    } catch (err: any) {
      setError(`Failed to parse PDF: ${err?.message || "Invalid or encrypted file"}`);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLoadSample = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const sample = await createSampleSplitPdf(6);
      const doc = await PDFDocument.load(sample);
      setFileBuffer(sample);
      setFileName("Cleartrix_Product_Guide_6Pages.pdf");
      setFileSize(sample.length);
      setPageCount(doc.getPageCount());
      setRangeInput("1-3, 5");
      setExtractedPdfUrl(null);
      setBurstFiles([]);
    } catch (err: any) {
      setError(`Failed to create sample: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPageIndices = parsePageRanges(rangeInput, pageCount);

  const handleApplyPreset = (preset: string) => {
    if (pageCount === 0) return;
    if (preset === "first") {
      setRangeInput("1");
    } else if (preset === "last") {
      setRangeInput(`${pageCount}`);
    } else if (preset === "odd") {
      const odd = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
        (p) => p % 2 !== 0
      );
      setRangeInput(odd.join(", "));
    } else if (preset === "even") {
      const even = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
        (p) => p % 2 === 0
      );
      setRangeInput(even.join(", "));
    } else if (preset === "all") {
      setRangeInput(`1-${pageCount}`);
    }
  };

  const handleSplit = async () => {
    if (!fileBuffer) {
      setError("Please upload a PDF document first.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      if (splitMode === "range") {
        if (selectedPageIndices.length === 0) {
          throw new Error("Please specify at least one valid page to extract.");
        }
        const extractedBytes = await extractPdfPages(fileBuffer, selectedPageIndices);
        const blob = new Blob([extractedBytes as unknown as BlobPart], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        setExtractedPdfUrl(url);
        setExtractedPageCount(selectedPageIndices.length);
        setBurstFiles([]);
      } else {
        // Burst every page
        const results = await burstPdfPages(fileBuffer);
        const items = results.map((r) => {
          const blob = new Blob([r.buffer as unknown as BlobPart], {
            type: "application/pdf",
          });
          return {
            pageNumber: r.pageNumber,
            url: URL.createObjectURL(blob),
            size: r.buffer.length,
          };
        });
        setBurstFiles(items);
        setExtractedPdfUrl(null);
      }
    } catch (err: any) {
      setError(`Splitting failed: ${err?.message || "Unknown error"}`);
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
    setExtractedPdfUrl(null);
    setBurstFiles([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> PDF splitting occurs entirely in your browser memory. No pages are sent to any remote server.
          </span>
        </div>
        <button
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Demo PDF
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
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop a PDF
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Extract page ranges, remove pages, or burst into individual single-page documents.
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
                {formatFileSize(fileSize)} • {pageCount} {pageCount === 1 ? "Page" : "Pages"}
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

      {/* Controls */}
      {fileBuffer && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSplitMode("range")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                splitMode === "range"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Scissors className="w-4 h-4" />
              Extract Custom Range
            </button>
            <button
              onClick={() => setSplitMode("burst")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                splitMode === "burst"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              Burst Every Page ({pageCount} Files)
            </button>
          </div>

          {splitMode === "range" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Page Selection (e.g., &quot;1-3, 5, 8-10&quot;)
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="1-2, 4"
                />
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Quick Select:
                </span>
                <button
                  onClick={() => handleApplyPreset("first")}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 text-slate-700 dark:text-slate-300"
                >
                  Page 1
                </button>
                <button
                  onClick={() => handleApplyPreset("last")}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 text-slate-700 dark:text-slate-300"
                >
                  Last Page ({pageCount})
                </button>
                <button
                  onClick={() => handleApplyPreset("odd")}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 text-slate-700 dark:text-slate-300"
                >
                  Odd Pages
                </button>
                <button
                  onClick={() => handleApplyPreset("even")}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 text-slate-700 dark:text-slate-300"
                >
                  Even Pages
                </button>
                <button
                  onClick={() => handleApplyPreset("all")}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 text-slate-700 dark:text-slate-300"
                >
                  All ({pageCount})
                </button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>
                  <strong>Selected Pages:</strong>{" "}
                  {selectedPageIndices.length > 0
                    ? selectedPageIndices.map((i) => i + 1).join(", ")
                    : "None"}
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedPageIndices.length} of {pageCount} pages
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSplit}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Splitting Pages in Memory...
              </>
            ) : splitMode === "range" ? (
              <>
                <Scissors className="w-4 h-4" />
                Extract Selected ({selectedPageIndices.length}) Pages
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                Burst Into {pageCount} Files
              </>
            )}
          </button>
        </div>
      )}

      {/* Extracted Range Result */}
      {extractedPdfUrl && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Extraction Complete!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {extractedPageCount} pages extracted into a unified PDF
              </p>
            </div>
          </div>
          <a
            href={extractedPdfUrl}
            download={`extracted-${fileName || "document.pdf"}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Download Extracted PDF
          </a>
        </div>
      )}

      {/* Burst Files Result */}
      {burstFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Burst Single Pages ({burstFiles.length} files)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {burstFiles.map((item) => (
              <div
                key={item.pageNumber}
                className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Page {item.pageNumber}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(item.size)}
                  </p>
                </div>
                <a
                  href={item.url}
                  download={`page-${item.pageNumber}-${fileName || "doc.pdf"}`}
                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                  title={`Download Page ${item.pageNumber}`}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
