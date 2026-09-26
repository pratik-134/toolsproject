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
  Lock,
  Layers,
} from "lucide-react";
import {
  createSampleFillablePdf,
  countFormFields,
  flattenPdf,
  FlattenResult,
} from "./logic";
import { PDFDocument } from "pdf-lib";

export default function PdfFlattenerTool() {
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [detectedFields, setDetectedFields] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flattenResult, setFlattenResult] = useState<FlattenResult | null>(null);
  const [flattenedUrl, setFlattenedUrl] = useState<string | null>(null);

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
      const fields = await countFormFields(buffer);

      setFileBuffer(buffer);
      setFileName(file.name);
      setFileSize(file.size);
      setPageCount(pages);
      setDetectedFields(fields);
      setFlattenResult(null);
      setFlattenedUrl(null);
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
      const sample = await createSampleFillablePdf();
      const doc = await PDFDocument.load(sample);
      const fields = await countFormFields(sample);

      setFileBuffer(sample);
      setFileName("Fillable_NDA_Agreement.pdf");
      setFileSize(sample.length);
      setPageCount(doc.getPageCount());
      setDetectedFields(fields);
      setFlattenResult(null);
      setFlattenedUrl(null);
    } catch (err: any) {
      setError(`Failed to create sample: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlatten = async () => {
    if (!fileBuffer) return;
    setError(null);
    setIsProcessing(true);

    try {
      const res = await flattenPdf(fileBuffer);
      const blob = new Blob([res.data as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setFlattenResult(res);
      setFlattenedUrl(url);
    } catch (err: any) {
      setError(`Flattening failed: ${err?.message || "Unknown error"}`);
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
    setDetectedFields(0);
    setFlattenResult(null);
    setFlattenedUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> PDF form flattening runs locally inside your browser memory. Data is never sent to any server.
          </span>
        </div>
        <button
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Demo Fillable PDF
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
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop a PDF
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Flatten fillable form fields and annotations into permanent, read-only vector content.
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
                {formatFileSize(fileSize)} • {pageCount} {pageCount === 1 ? "Page" : "Pages"} • {detectedFields} interactive {detectedFields === 1 ? "field" : "fields"} detected
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

      {/* Controls */}
      {fileBuffer && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Flattening Guarantees
            </h4>
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                • <strong>Permanent Read-Only Lock:</strong> Converts interactive form widgets (text boxes, checkboxes, radio buttons) into fixed vector drawings on the page.
              </p>
              <p>
                • <strong>Prevents Alterations:</strong> Ensures downstream signers, recipients, or court filers cannot tamper with or modify filled form values.
              </p>
              <p>
                • <strong>Print Driver Compatibility:</strong> Resolves rendering glitches in older printers that fail to print dynamic AcroForm fields.
              </p>
            </div>
          </div>

          <button
            onClick={handleFlatten}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Flattening Form Layers in Memory...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Flatten & Lock Document ({detectedFields} Form Fields)
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Panel */}
      {flattenedUrl && flattenResult && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                PDF Flattened Successfully!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {flattenResult.fieldCount} interactive {flattenResult.fieldCount === 1 ? "field" : "fields"} permanently baked into static page content.
              </p>
            </div>
          </div>
          <a
            href={flattenedUrl}
            download={`flattened-${fileName || "document.pdf"}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Download Flattened PDF
          </a>
        </div>
      )}
    </div>
  );
}
