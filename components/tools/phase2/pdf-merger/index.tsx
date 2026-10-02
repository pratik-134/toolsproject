"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import {
  createSamplePdf,
  getPdfPageCount,
  mergePdfs,
  PdfFileInfo,
} from "./logic";
import { getHandoff, clearHandoff, HandoffFile } from "@/lib/tool-chains";
import { ToolHandoffBanner } from "@/components/tools/chaining/tool-chain-banner";
import { ToolChainActions } from "@/components/tools/chaining/tool-chain-actions";
import { parsePdfMergerHash, serializePdfMergerHash } from "@/lib/preset-urls";
import { PresetShareButton } from "@/components/tools/presets/preset-share-button";

export default function PdfMergerTool() {
  const [files, setFiles] = useState<PdfFileInfo[]>([]);
  const [outputFileName, setOutputFileName] = useState("merged-document.pdf");
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedBuffer, setMergedBuffer] = useState<Uint8Array | null>(null);
  const [mergedSize, setMergedSize] = useState<number | null>(null);
  const [mergedPageCount, setMergedPageCount] = useState<number | null>(null);
  const [incomingHandoff, setIncomingHandoff] = useState<HandoffFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect URL preset & pre-load chained file handoff
  React.useEffect(() => {
    let isMounted = true;

    // 1. Sanitize & apply preset settings from URL hash (#)
    if (typeof window !== "undefined" && window.location.hash) {
      const preset = parsePdfMergerHash(window.location.hash);
      if (preset.outputFileName) {
        setOutputFileName(preset.outputFileName);
      }
    }

    // 2. Chained file handoff
    getHandoff("pdf-merger").then(async (handoff) => {
      if (!isMounted || !handoff) return;
      try {
        const pageCount = await getPdfPageCount(handoff.buffer);
        const newEntry: PdfFileInfo = {
          id: handoff.id,
          name: handoff.name,
          size: handoff.size,
          pageCount,
          buffer: handoff.buffer,
        };
        setFiles((prev) => {
          if (prev.some((f) => f.id === handoff.id || (f.name === handoff.name && f.size === handoff.size))) {
            return prev;
          }
          return [...prev, newEntry];
        });
        setIncomingHandoff(handoff);
      } catch (err: any) {
        console.warn("[PdfMerger] Failed to pre-load chained PDF", err);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleClearHandoff = async () => {
    await clearHandoff("pdf-merger");
    if (incomingHandoff) {
      setFiles((prev) => prev.filter((f) => f.id !== incomingHandoff.id));
    }
    setIncomingHandoff(null);
  };

  const handleDismissHandoff = () => {
    setIncomingHandoff(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    setError(null);

    const newEntries: PdfFileInfo[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (!file) continue;
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        continue;
      }
      try {
        const arrayBuf = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuf);
        const pageCount = await getPdfPageCount(buffer);
        newEntries.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          pageCount,
          buffer,
        });
      } catch (err: any) {
        setError(`Failed to read "${file.name}": ${err?.message || "Invalid PDF"}`);
      }
    }

    if (newEntries.length > 0) {
      setFiles((prev) => [...prev, ...newEntries]);
      setMergedPdfUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLoadSample = async () => {
    setError(null);
    setIsMerging(true);
    try {
      const sample1 = await createSamplePdf("Project Brief & Overview", 2);
      const sample2 = await createSamplePdf("Technical Specifications", 3);
      const sample3 = await createSamplePdf("Appendix & Sign-off", 1);

      setFiles([
        {
          id: "sample-1",
          name: "Project_Brief.pdf",
          size: sample1.length,
          pageCount: 2,
          buffer: sample1,
        },
        {
          id: "sample-2",
          name: "Technical_Specifications.pdf",
          size: sample2.length,
          pageCount: 3,
          buffer: sample2,
        },
        {
          id: "sample-3",
          name: "Appendix_Signoff.pdf",
          size: sample3.length,
          pageCount: 1,
          buffer: sample3,
        },
      ]);
      setMergedPdfUrl(null);
    } catch (err: any) {
      setError(`Failed to load samples: ${err?.message}`);
    } finally {
      setIsMerging(false);
    }
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === files.length - 1)
    ) {
      return;
    }
    const newFiles = [...files];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const [moved] = newFiles.splice(index, 1);
    if (moved) {
      newFiles.splice(targetIdx, 0, moved);
      setFiles(newFiles);
      setMergedPdfUrl(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedPdfUrl(null);
  };

  const handleMerge = async () => {
    if (files.length === 0) {
      setError("Please add at least one PDF file to merge.");
      return;
    }
    setError(null);
    setIsMerging(true);

    try {
      const buffers = files.map((f) => f.buffer);
      const mergedBytes = await mergePdfs(buffers);
      const totalPages = await getPdfPageCount(mergedBytes);

      const blob = new Blob([mergedBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setMergedPdfUrl(url);
      setMergedBuffer(mergedBytes);
      setMergedSize(mergedBytes.length);
      setMergedPageCount(totalPages);
    } catch (err: any) {
      setError(`Merge failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfUrl) return;
    const a = document.createElement("a");
    a.href = mergedPdfUrl;
    a.download = outputFileName.endsWith(".pdf") ? outputFileName : `${outputFileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0);

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> Your PDF documents are merged directly in your browser RAM. Files never leave your computer.
          </span>
        </div>
        <button
          onClick={handleLoadSample}
          disabled={isMerging}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Demo Sample
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
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Click to upload or drag & drop PDF files
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select multiple files to combine in sequence. No file size upload limits.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Queue List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Files to Merge ({files.length} documents • {totalPages} total pages)
            </h3>
            <button
              onClick={() => {
                setFiles([]);
                setMergedPdfUrl(null);
              }}
              className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file, idx) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)} • {file.pageCount} {file.pageCount === 1 ? "page" : "pages"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                  <button
                    onClick={() => moveFile(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveFile(idx, "down")}
                    disabled={idx === files.length - 1}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Options & Action */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Merged PDF Filename
                  </label>
                  <PresetShareButton hashString={serializePdfMergerHash({ outputFileName })} />
                </div>
                <input
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="merged-document.pdf"
                />
              </div>

              <div className="w-full sm:w-auto pt-5">
                <button
                  onClick={handleMerge}
                  disabled={isMerging || files.length === 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {isMerging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Merging PDFs in Memory...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Merge {files.length} PDFs
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merged Success Panel */}
      {mergedPdfUrl && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  PDFs Merged Successfully!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {mergedPageCount} pages combined • {mergedSize ? formatFileSize(mergedSize) : ""}
                </p>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Download {outputFileName.endsWith(".pdf") ? outputFileName : `${outputFileName}.pdf`}
            </button>
          </div>

          {mergedBuffer && (
            <ToolChainActions
              sourceToolSlug="pdf-merger"
              fileName={outputFileName.endsWith(".pdf") ? outputFileName : `${outputFileName}.pdf`}
              mimeType="application/pdf"
              fileData={mergedBuffer}
            />
          )}
        </div>
      )}
    </div>
  );
}
