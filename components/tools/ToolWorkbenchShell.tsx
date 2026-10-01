"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Upload,
  FileCheck,
  AlertCircle,
  Download,
  RotateCcw,
  ShieldCheck,
  Loader2,
  FileText,
  X,
} from "lucide-react";

export interface ToolWorkbenchShellProps {
  title?: string;
  description?: string;
  acceptTypes?: string[]; // e.g. [".pdf"], ["image/*"], [".json", ".txt"]
  maxFileSizeMB?: number; // default 50
  multipleFiles?: boolean;
  files?: File[];
  onFilesSelected?: (files: File[]) => void;
  onRemoveFile?: (index: number) => void;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  isProcessing?: boolean;
  progressPercent?: number | null; // 0 to 100 or null for indeterminate
  downloadUrl?: string | null;
  downloadFilename?: string | null;
  onDownload?: () => void;
  onReset?: () => void;
  customControls?: React.ReactNode;
  children?: React.ReactNode;
  resultPreview?: React.ReactNode;
  errorMessage?: string | null;
  isActionDisabled?: boolean;
  dropzoneText?: string;
  dropzoneHint?: string;
}

export const ToolWorkbenchShell: React.FC<ToolWorkbenchShellProps> = ({
  title,
  description,
  acceptTypes = [],
  maxFileSizeMB = 50,
  multipleFiles = false,
  files = [],
  onFilesSelected,
  onRemoveFile,
  actionLabel = "Process File",
  onAction,
  isProcessing = false,
  progressPercent,
  downloadUrl,
  downloadFilename,
  onDownload,
  onReset,
  customControls,
  children,
  resultPreview,
  errorMessage: externalError,
  isActionDisabled = false,
  dropzoneText = "Drag & drop your files here, or click to browse",
  dropzoneHint,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeError = externalError || internalError;

  const validateAndAddFiles = (incomingFiles: FileList | File[]) => {
    setInternalError(null);
    const fileArray = Array.from(incomingFiles);
    if (fileArray.length === 0) return;

    // Size validation
    const maxBytes = maxFileSizeMB * 1024 * 1024;
    const oversizedFile = fileArray.find((f) => f.size > maxBytes);
    if (oversizedFile) {
      setInternalError(
        `File "${oversizedFile.name}" exceeds maximum allowed size of ${maxFileSizeMB}MB.`
      );
      return;
    }

    // Type validation
    if (acceptTypes.length > 0) {
      const invalidFile = fileArray.find((f) => {
        const ext = `.${f.name.split(".").pop()?.toLowerCase()}`;
        return !acceptTypes.some((type) => {
          if (type.startsWith(".")) return type.toLowerCase() === ext;
          if (type.endsWith("/*")) {
            const group = type.split("/")[0];
            return f.type.startsWith(`${group}/`);
          }
          return f.type === type;
        });
      });

      if (invalidFile) {
        setInternalError(
          `Invalid file format for "${invalidFile.name}". Accepted types: ${acceptTypes.join(", ")}`
        );
        return;
      }
    }

    if (onFilesSelected) {
      onFilesSelected(multipleFiles ? fileArray : fileArray.slice(0, 1));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-6 font-body">
      {/* Privacy Guarantee Pill */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 px-3.5 py-2 text-xs text-blue-900 dark:text-blue-200 shadow-2xs">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>Files never leave your browser • 100% Client-Side Privacy Guaranteed</span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-mono text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60">
          Zero Uploads
        </span>
      </div>

      {title && (
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
          {description && <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>}
        </div>
      )}

      {/* Main Workbench Body */}
      {downloadUrl ? (
        /* Completed State */
        <div className="p-8 border-2 border-dashed border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/40 dark:bg-emerald-950/30 rounded-2xl text-center space-y-6 animate-fade-in">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-xs">
            <FileCheck className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Processing Complete!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Your file is ready for download. No server was involved in processing this file.
            </p>
          </div>

          {resultPreview && (
            <div className="my-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
              {resultPreview}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={downloadUrl}
              download={downloadFilename || "cleartrix-processed"}
              onClick={onDownload}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download File</span>
            </a>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span>Process Another File</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* File Upload / Interactive Dropzone State */
        <div className="space-y-5">
          {/* Dropzone area if tool uses files */}
          {onFilesSelected && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerBrowse}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all cursor-pointer select-none ${
                isDragging
                  ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 scale-[0.99]"
                  : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-slate-400 dark:hover:border-slate-600"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={multipleFiles}
                accept={acceptTypes.join(",")}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{dropzoneText}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {dropzoneHint ||
                  `Supports ${acceptTypes.length > 0 ? acceptTypes.join(", ") : "all standard files"} up to ${maxFileSizeMB}MB.`}
              </p>
            </div>
          )}

          {/* Uploaded File List Chip View */}
          {files.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Selected Files ({files.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-semibold truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    {onRemoveFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFile(idx);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {activeError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          {/* Tool Custom Options & Controls Slot */}
          {(children || customControls) && <div className="space-y-4">{children || customControls}</div>}

          {/* Live Progress Bar */}
          {isProcessing && (
            <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>Processing file locally in browser...</span>
                </span>
                <span>
                  {typeof progressPercent === "number" ? `${Math.round(progressPercent)}%` : ""}
                </span>
              </div>
              <div className="w-full bg-blue-200/70 dark:bg-blue-900/50 rounded-full h-2 overflow-hidden">
                {typeof progressPercent === "number" ? (
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                ) : (
                  <div className="bg-blue-600 h-2 rounded-full w-1/3 animate-pulse" />
                )}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              disabled={isActionDisabled || isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{actionLabel}</span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
