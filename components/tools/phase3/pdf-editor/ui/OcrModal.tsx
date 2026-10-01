import React, { useState } from "react";
import {
  X,
  ScanText,
  Copy,
  Download,
  Check,
  Loader2,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { runOcrOnCanvas, createSearchablePdf } from "../ocr";
import { usePdfEditorStore } from "../store";

interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawPdfDoc: any;
}

export const OcrModal: React.FC<OcrModalProps> = ({ isOpen, onClose, rawPdfDoc }) => {
  const { pdfBytes, activePageIndex, fileName, setOcrResults, ocrResults } = usePdfEditorStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isCreatingSearchable, setIsCreatingSearchable] = useState(false);

  if (!isOpen) return null;

  const handleStartOcr = async () => {
    if (!rawPdfDoc) return;
    setIsProcessing(true);
    setProgress(15);
    try {
      const page = await rawPdfDoc.getPage(activePageIndex + 1);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      await page.render({ canvasContext: ctx, viewport }).promise;
      setProgress(40);

      const result = await runOcrOnCanvas(canvas, activePageIndex, (p) => {
        setProgress(40 + Math.round(p * 0.55));
      });

      setExtractedText(result.fullText);
      setOcrResults([result]);
      setProgress(100);
    } catch (err) {
      console.error("OCR error:", err);
      alert("Failed to run OCR on page. Ensure page contains clear text or scan.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}-ocr-page-${activePageIndex + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateSearchable = async () => {
    if (!pdfBytes || ocrResults.length === 0) {
      alert("Please run OCR on the page first before generating a Searchable PDF.");
      return;
    }

    setIsCreatingSearchable(true);
    try {
      const searchableBytes = await createSearchablePdf(pdfBytes, ocrResults);
      const blob = new Blob([searchableBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, "")}-searchable.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Searchable PDF creation error:", err);
      alert("Failed to create searchable PDF.");
    } finally {
      setIsCreatingSearchable(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-foreground border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanText className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">Optical Character Recognition (OCR)</h2>
              <p className="text-xs text-muted-foreground">Recognize text on Page {activePageIndex + 1} entirely in browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!extractedText && !isProcessing && (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ScanText className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-semibold text-foreground">Extract Text from Scanned Document</h3>
                <p className="text-xs text-muted-foreground">
                  Processes scanned contracts, receipts, and images using Tesseract.js client-side neural net. Zero data leaves your computer.
                </p>
              </div>
              <button
                onClick={handleStartOcr}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start OCR on Page {activePageIndex + 1}</span>
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="py-10 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="text-center space-y-1">
                <span className="text-xs font-semibold text-foreground">Extracting glyphs and layout...</span>
                <p className="text-[11px] text-muted-foreground">Running Tesseract.js neural net in WebAssembly</p>
              </div>
              <div className="w-48 bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {extractedText && !isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Extracted Text ({extractedText.length} characters)</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? "Copied!" : "Copy"}</span>
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save .txt</span>
                  </button>
                </div>
              </div>

              <textarea
                value={extractedText}
                readOnly
                rows={8}
                className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs font-mono text-foreground focus:outline-hidden resize-none"
              />

              {/* Action Banner for Searchable PDF */}
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Create Searchable PDF</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Bakes invisible selectable text layer over the scanned bitmap image.
                  </p>
                </div>
                <button
                  onClick={handleCreateSearchable}
                  disabled={isCreatingSearchable}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 disabled:opacity-50"
                >
                  {isCreatingSearchable ? "Baking..." : "Download Searchable PDF"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
