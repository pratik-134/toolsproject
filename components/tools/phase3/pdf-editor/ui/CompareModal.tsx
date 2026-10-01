import React, { useState, useRef, useEffect } from "react";
import {
  X,
  GitCompare,
  Upload,
  Split,
  Layers,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileCheck,
} from "lucide-react";
import { computeCanvasDiff, PageDiffResult } from "../comparison";
import { loadPdfDocument } from "../logic";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawPdfDocA: any;
  fileNameA: string;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  rawPdfDocA,
  fileNameA,
}) => {
  const [fileB, setFileB] = useState<File | null>(null);
  const [rawPdfDocB, setRawPdfDocB] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"side-by-side" | "diff-heatmap">("side-by-side");
  const [diffResult, setDiffResult] = useState<PageDiffResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const canvasRefA = useRef<HTMLCanvasElement | null>(null);
  const canvasRefB = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUploadB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileB(file);
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const { rawPdf } = await loadPdfDocument(buffer);
      setRawPdfDocB(rawPdf);
      setPageIndex(0);
    } catch (err) {
      console.error("Failed to load PDF B:", err);
      alert("Failed to load comparison PDF.");
    }
  };

  // Render both pages and compute diff
  useEffect(() => {
    if (!rawPdfDocA || !rawPdfDocB) return;

    let isMounted = true;
    setIsComparing(true);

    const renderAndDiff = async () => {
      try {
        const pageA = await rawPdfDocA.getPage(pageIndex + 1);
        const pageB = await rawPdfDocB.getPage(
          Math.min(pageIndex + 1, rawPdfDocB.numPages)
        );

        const viewportA = pageA.getViewport({ scale: 1.2 });
        const viewportB = pageB.getViewport({ scale: 1.2 });

        const cA = canvasRefA.current || document.createElement("canvas");
        cA.width = viewportA.width;
        cA.height = viewportA.height;
        const ctxA = cA.getContext("2d");
        if (ctxA) await pageA.render({ canvasContext: ctxA, viewport: viewportA }).promise;

        const cB = canvasRefB.current || document.createElement("canvas");
        cB.width = viewportB.width;
        cB.height = viewportB.height;
        const ctxB = cB.getContext("2d");
        if (ctxB) await pageB.render({ canvasContext: ctxB, viewport: viewportB }).promise;

        const diff = computeCanvasDiff(cA, cB);
        if (isMounted) {
          setDiffResult(diff);
        }
      } catch (err) {
        console.error("Comparison render error:", err);
      } finally {
        if (isMounted) setIsComparing(false);
      }
    };

    renderAndDiff();

    return () => {
      isMounted = false;
    };
  }, [rawPdfDocA, rawPdfDocB, pageIndex]);

  const maxPages = Math.max(
    rawPdfDocA?.numPages || 1,
    rawPdfDocB?.numPages || 1
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card text-foreground border border-border w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">Visual PDF Document Comparison</h2>
              <p className="text-xs text-muted-foreground">Compare two versions page-by-page entirely in browser memory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* File status */}
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-foreground truncate max-w-[200px]">Doc A: {fileNameA}</span>
            <span className="text-muted-foreground">vs</span>
            {fileB ? (
              <span className="font-semibold text-primary truncate max-w-[200px]">Doc B: {fileB.name}</span>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Version B to Compare</span>
              </button>
            )}
          </div>

          {/* View Mode & Page Navigation */}
          {rawPdfDocB && (
            <div className="flex items-center gap-3">
              {/* Diff metric */}
              {diffResult && (
                <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted border border-border">
                  {diffResult.diffScore === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">100% Identical</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">{diffResult.diffScore}% Visual Differences</span>
                  )}
                </div>
              )}

              {/* View Switch */}
              <div className="flex rounded-lg border border-border p-0.5 bg-card">
                <button
                  onClick={() => setViewMode("side-by-side")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === "side-by-side" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Side by Side
                </button>
                <button
                  onClick={() => setViewMode("diff-heatmap")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === "diff-heatmap" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Diff Heatmap
                </button>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-1">
                <button
                  disabled={pageIndex <= 0}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  className="p-1 rounded-md border border-border disabled:opacity-40 hover:bg-muted"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-muted-foreground px-1">
                  Page {pageIndex + 1} of {maxPages}
                </span>
                <button
                  disabled={pageIndex >= maxPages - 1}
                  onClick={() => setPageIndex((p) => Math.min(maxPages - 1, p + 1))}
                  className="p-1 rounded-md border border-border disabled:opacity-40 hover:bg-muted"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Body */}
        <div className="flex-1 overflow-auto p-6 bg-muted/40 flex justify-center items-center">
          {!rawPdfDocB ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/80 bg-card rounded-2xl p-12 text-center cursor-pointer transition-all max-w-md space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">Select Version B PDF</h3>
                <p className="text-xs text-muted-foreground">
                  Upload a revised contract, draft, or document to visually inspect differences against current file.
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
              >
                Choose Second PDF
              </button>
            </div>
          ) : isComparing ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-semibold text-foreground">Comparing rasterized page pixels...</span>
            </div>
          ) : viewMode === "side-by-side" ? (
            <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-start">
              {/* Document A Canvas */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-foreground bg-card px-2.5 py-1 rounded-md border border-border shadow-2xs">
                  Version A ({fileNameA})
                </span>
                <div className="shadow-lg border border-border bg-white rounded-sm overflow-hidden">
                  <canvas ref={canvasRefA} className="max-h-[60vh] object-contain" />
                </div>
              </div>

              {/* Document B Canvas */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-primary bg-card px-2.5 py-1 rounded-md border border-border shadow-2xs">
                  Version B ({fileB?.name})
                </span>
                <div className="shadow-lg border border-border bg-white rounded-sm overflow-hidden">
                  <canvas ref={canvasRefB} className="max-h-[60vh] object-contain" />
                </div>
              </div>
            </div>
          ) : (
            /* Diff Heatmap View */
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 text-xs bg-card px-3 py-1.5 rounded-lg border border-border shadow-xs">
                <span className="font-semibold text-foreground">Diff Legend:</span>
                <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  Deleted / Changed in Doc A
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Added in Doc B
                </span>
              </div>
              {diffResult?.diffDataUrl && (
                <div className="shadow-xl border border-border bg-white rounded-sm overflow-hidden max-h-[62vh]">
                  <img
                    src={diffResult.diffDataUrl}
                    alt="Document Visual Diff"
                    className="max-h-[60vh] object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileUploadB}
          className="hidden"
        />
      </div>
    </div>
  );
};
