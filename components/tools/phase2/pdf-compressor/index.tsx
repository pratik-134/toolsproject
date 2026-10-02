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
  Minimize2,
  Percent,
  ArrowRight,
} from "lucide-react";
import {
  createSampleCompressPdf,
  compressPdf,
  CompressResult,
} from "./logic";
import { PDFDocument } from "pdf-lib";
import { getHandoff, clearHandoff, HandoffFile } from "@/lib/tool-chains";
import { ToolHandoffBanner } from "@/components/tools/chaining/tool-chain-banner";
import { ToolChainActions } from "@/components/tools/chaining/tool-chain-actions";

export default function PdfCompressorTool() {
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [incomingHandoff, setIncomingHandoff] = useState<HandoffFile | null>(null);

  const [stripMetadata, setStripMetadata] = useState(true);
  const [useObjectStreams, setUseObjectStreams] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect and pre-load chained file handoff
  React.useEffect(() => {
    let isMounted = true;
    getHandoff("pdf-compressor").then(async (handoff) => {
      if (!isMounted || !handoff) return;
      try {
        const doc = await PDFDocument.load(handoff.buffer, { ignoreEncryption: true });
        setFileBuffer(handoff.buffer);
        setFileName(handoff.name);
        setFileSize(handoff.size);
        setPageCount(doc.getPageCount());
        setResult(null);
        setDownloadUrl(null);
        setIncomingHandoff(handoff);
      } catch (err: any) {
        console.warn("[PdfCompressor] Failed to pre-load chained PDF", err);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleClearHandoff = async () => {
    await clearHandoff("pdf-compressor");
    setIncomingHandoff(null);
    resetAll();
  };

  const handleDismissHandoff = () => {
    setIncomingHandoff(null);
  };

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
      setResult(null);
      setDownloadUrl(null);
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
      const sample = await createSampleCompressPdf();
      const doc = await PDFDocument.load(sample);

      setFileBuffer(sample);
      setFileName("Sample_Uncompressed_Report.pdf");
      setFileSize(sample.length);
      setPageCount(doc.getPageCount());
      setResult(null);
      setDownloadUrl(null);
    } catch (err: any) {
      setError(`Failed to load sample: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompress = async () => {
    if (!fileBuffer) return;
    setError(null);
    setIsProcessing(true);

    try {
      const res = await compressPdf(fileBuffer, {
        stripMetadata,
        useObjectStreams,
      });
      const blob = new Blob([res.data as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setResult(res);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(`Compression failed: ${err?.message || "Unknown error"}`);
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
    setResult(null);
    setDownloadUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> PDF compression runs completely in browser memory. Documents are never transmitted over the internet.
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

      {/* Chained File Handoff Banner */}
      {incomingHandoff && (
        <ToolHandoffBanner
          handoff={incomingHandoff}
          onClear={handleClearHandoff}
          onDismiss={handleDismissHandoff}
          formatSize={formatFileSize}
        />
      )}

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
              <Minimize2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop a PDF
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Shrink PDF file size through stream compression and metadata optimization.
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

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Compression Options */}
      {fileBuffer && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Optimization Settings
          </h4>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={useObjectStreams}
                onChange={(e) => setUseObjectStreams(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Pack Object Streams (Cross-Reference Optimization)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Compresses internal PDF dictionary objects and stream references into compact cross-reference tables.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={stripMetadata}
                onChange={(e) => setStripMetadata(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Strip Metadata & Hidden Author Info
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Removes unneeded document metadata (Title, Author, Producer, Keywords, Revision History) to save bytes.
                </p>
              </div>
            </label>
          </div>

          <button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compressing PDF in Memory...
              </>
            ) : (
              <>
                <Minimize2 className="w-4 h-4" />
                Optimize & Compress PDF
              </>
            )}
          </button>
        </div>
      )}

      {/* Compression Result Panel */}
      {result && downloadUrl && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  PDF Compressed!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center flex-wrap gap-1">
                  <span>{formatFileSize(result.originalSize)}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span>{formatFileSize(result.compressedSize)}</span>
                  <span>
                    {result.savingsBytes > 0
                      ? ` (Saved ${result.savingsPercent}% / -${formatFileSize(result.savingsBytes)})`
                      : " (Already maximally compact)"}
                  </span>
                </p>
              </div>
            </div>

            <a
              href={downloadUrl}
              download={`compressed-${fileName || "document.pdf"}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Download Compressed PDF
            </a>
          </div>

          {result && result.data && (
            <ToolChainActions
              sourceToolSlug="pdf-compressor"
              fileName={`compressed-${fileName || "document.pdf"}`}
              mimeType="application/pdf"
              fileData={result.data}
            />
          )}
        </div>
      )}
    </div>
  );
}
