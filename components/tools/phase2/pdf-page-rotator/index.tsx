"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileCheck,
  Trash2,
} from "lucide-react";
import {
  createSamplePdfForRotation,
  getPageRotations,
  rotatePdf,
  PageRotationInfo,
} from "./logic";

export default function PdfPageRotatorTool() {
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [pages, setPages] = useState<PageRotationInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const arrayBuf = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuf);
      const rotationList = await getPageRotations(buffer);

      setFileBuffer(buffer);
      setFileName(file.name);
      setFileSize(file.size);
      setPages(rotationList);
      setRotatedPdfUrl(null);
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
      const sample = await createSamplePdfForRotation(4);
      const rotationList = await getPageRotations(sample);

      setFileBuffer(sample);
      setFileName("Landscape_and_Portrait_Doc.pdf");
      setFileSize(sample.length);
      setPages(rotationList);
      setRotatedPdfUrl(null);
    } catch (err: any) {
      setError(`Failed to load sample: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const rotateSinglePage = (pageIndex: number, delta: number) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageIndex === pageIndex) {
          const newAngle = ((p.currentAngle + delta) % 360 + 360) % 360;
          return { ...p, currentAngle: newAngle };
        }
        return p;
      })
    );
    setRotatedPdfUrl(null);
  };

  const rotateAllPages = (delta: number) => {
    setPages((prev) =>
      prev.map((p) => {
        const newAngle = ((p.currentAngle + delta) % 360 + 360) % 360;
        return { ...p, currentAngle: newAngle };
      })
    );
    setRotatedPdfUrl(null);
  };

  const handleSaveAndDownload = async () => {
    if (!fileBuffer) return;
    setError(null);
    setIsProcessing(true);

    try {
      // In pdf-lib, we can apply the delta between current modified angles and initial angles
      const initialList = await getPageRotations(fileBuffer);
      let workingBuffer = fileBuffer;

      for (let i = 0; i < pages.length; i++) {
        const initial = initialList[i]?.currentAngle ?? 0;
        const target = pages[i]?.currentAngle ?? 0;
        const delta = ((target - initial) % 360 + 360) % 360;
        if (delta !== 0) {
          workingBuffer = await rotatePdf(workingBuffer, delta, [i]);
        }
      }

      const blob = new Blob([workingBuffer as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setRotatedPdfUrl(url);
    } catch (err: any) {
      setError(`Failed to rotate PDF: ${err?.message || "Unknown error"}`);
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
    setPages([]);
    setRotatedPdfUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> PDF page rotation is executed entirely in your browser. No files are uploaded to any server.
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
              <RotateCw className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop a PDF
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Rotate specific pages or all pages permanently by 90°, 180°, or 270°.
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
                {formatFileSize(fileSize)} • {pages.length} Pages
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

      {/* Global Rotation Actions */}
      {fileBuffer && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Rotate All Pages
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => rotateAllPages(-90)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                -90° (Counter-Clockwise)
              </button>
              <button
                onClick={() => rotateAllPages(90)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
                +90° (Clockwise)
              </button>
              <button
                onClick={() => rotateAllPages(180)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                180° (Flip)
              </button>
            </div>
          </div>

          {/* Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {pages.map((p) => (
              <div
                key={p.pageIndex}
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center gap-2.5 shadow-sm"
              >
                {/* Visual Page Representation with Rotation Transform */}
                <div className="relative w-20 h-28 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-inner">
                  <div
                    style={{ transform: `rotate(${p.currentAngle}deg)` }}
                    className="transition-transform duration-300 flex flex-col items-center gap-1"
                  >
                    <FileText className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      ▲ TOP
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full px-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Page {p.pageIndex + 1}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-indigo-600 dark:text-indigo-400">
                    {p.currentAngle}°
                  </span>
                </div>

                {/* Individual Rotate Controls */}
                <div className="flex items-center gap-1.5 w-full">
                  <button
                    onClick={() => rotateSinglePage(p.pageIndex, -90)}
                    className="flex-1 p-1 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                    title="Rotate -90°"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => rotateSinglePage(p.pageIndex, 90)}
                    className="flex-1 p-1 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                    title="Rotate +90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveAndDownload}
              disabled={isProcessing}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Rotated PDF...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply & Generate Rotated PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result Panel */}
      {rotatedPdfUrl && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                PDF Rotated Successfully!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All page orientations have been permanently updated.
              </p>
            </div>
          </div>
          <a
            href={rotatedPdfUrl}
            download={`rotated-${fileName || "document.pdf"}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Download Rotated PDF
          </a>
        </div>
      )}
    </div>
  );
}
