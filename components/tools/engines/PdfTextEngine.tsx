"use client";

import React, { useState } from "react";
import { ToolWorkbenchShell } from "@/components/tools/ToolWorkbenchShell";
import { ConverterPreset } from "@/lib/registry/converter-presets";
import { FileText, AlertTriangle, Copy, Check } from "lucide-react";

export interface PdfTextEngineProps {
  preset: ConverterPreset;
}

export function PdfTextEngine({ preset }: PdfTextEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isScannedPdf, setIsScannedPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles.slice(0, 1));
    setDownloadUrl(null);
    setExtractedText("");
    setIsScannedPdf(false);
    setErrorMessage(null);
  };

  const extractPdfText = async () => {
    if (files.length === 0 || !files[0]) return;
    setIsProcessing(true);
    setProgressPercent(10);
    setErrorMessage(null);
    setIsScannedPdf(false);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // Dynamic import of pdfjs-dist
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items.map((item: any) => item.str);
        const pageText = pageStrings.join(" ");

        fullText += `--- Page ${i} ---\n${pageText.trim()}\n\n`;
        setProgressPercent(10 + Math.round((i / numPages) * 85));
      }

      const cleanText = fullText.trim();
      const hasTextContent = cleanText.replace(/--- Page \d+ ---/g, "").trim().length > 0;

      if (!hasTextContent) {
        setIsScannedPdf(true);
      }

      setExtractedText(cleanText);

      const blob = new Blob([cleanText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "extracted-text";

      setDownloadUrl(url);
      setDownloadFilename(`${baseName}.txt`);
    } catch (err: any) {
      console.error("[PdfTextEngine Error]:", err);
      setErrorMessage(err.message || "Failed to extract text from PDF document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setDownloadUrl(null);
    setDownloadFilename(null);
    setExtractedText("");
    setIsScannedPdf(false);
    setProgressPercent(null);
    setErrorMessage(null);
  };

  return (
    <ToolWorkbenchShell
      acceptTypes={preset.inputFormats}
      maxFileSizeMB={preset.maxFileSizeMB}
      multipleFiles={false}
      files={files}
      onFilesSelected={handleFilesSelected}
      actionLabel={preset.actionLabel}
      onAction={extractPdfText}
      isProcessing={isProcessing}
      progressPercent={progressPercent}
      downloadUrl={downloadUrl}
      downloadFilename={downloadFilename}
      onReset={handleReset}
      errorMessage={errorMessage}
      isActionDisabled={files.length === 0}
      dropzoneText="Drag & drop a PDF document to extract plain text"
      resultPreview={
        downloadUrl ? (
          <div className="space-y-3 font-body">
            {isScannedPdf && (
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Scanned PDF Detected</p>
                  <p className="mt-0.5 text-amber-800">
                    This PDF appears to be a scanned image containing zero embedded text characters. Use our upcoming Optical Character Recognition (OCR) tool for scanned documents.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Extracted Text Preview ({extractedText.length} characters)
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={extractedText}
              rows={8}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:outline-none resize-y"
            />
          </div>
        ) : null
      }
    />
  );
}
