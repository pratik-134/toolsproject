"use client";

import React, { useEffect, useState } from "react";
import { ResumeData } from "@/lib/schema";
import { PdfDocument } from "@/lib/pdf/PdfDocument";
import { Loader2, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RealPdfPreviewProps {
  data: ResumeData;
  scale?: number;
}

export const RealPdfPreview: React.FC<RealPdfPreviewProps> = ({ data, scale = 1 }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [renderCount, setRenderCount] = useState<number>(0);

  useEffect(() => {
    let isCancelled = false;
    let currentObjectUrl: string | null = null;

    const generatePdf = async () => {
      setLoading(true);
      setError(null);

      try {
        const { pdf } = await import("@react-pdf/renderer");
        const blob = await pdf(<PdfDocument data={data} />).toBlob();

        if (!isCancelled) {
          const url = URL.createObjectURL(blob);
          currentObjectUrl = url;
          setPdfUrl(url);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Failed to generate PDF stream for preview:", err);
        if (!isCancelled) {
          setError(err?.message || "Failed to render PDF preview stream.");
          setLoading(false);
        }
      }
    };

    // Debounce PDF compilation slightly to prevent stutter on fast keystrokes
    const timer = setTimeout(generatePdf, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [data, renderCount]);

  const handleRefresh = () => {
    setRenderCount((c) => c + 1);
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full bg-slate-900 text-white rounded-lg overflow-hidden border border-blue-500/30 shadow-xl">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-semibold text-white">Live Client-Side PDF Stream</span>
          <span className="text-white/40 hidden sm:inline">•</span>
          <span className="text-white/60 text-[11px] hidden sm:inline font-mono">
            @react-pdf/renderer v4
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Pop Out</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-6 px-2 text-[11px] text-white/80 hover:text-white hover:bg-white/10 rounded-md"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span className="ml-1">Refresh</span>
          </Button>
        </div>
      </div>

      {/* PDF Container Frame */}
      <div className="relative w-full flex-1 min-h-[500px] flex items-center justify-center bg-slate-800">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xs">
            <Loader2 className="h-7 w-7 text-blue-400 animate-spin mb-2" />
            <span className="text-xs text-white/80 font-medium">Compiling PDF Vector Stream...</span>
          </div>
        )}

        {error ? (
          <div className="p-6 text-center max-w-sm">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white mb-1">PDF Compilation Issue</p>
            <p className="text-[11px] text-white/60 mb-4">{error}</p>
            <Button size="sm" onClick={handleRefresh} className="h-7 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white">
              Retry Generation
            </Button>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full border-none rounded-b-card min-h-[600px] lg:min-h-[750px]"
            title="Real PDF Stream Preview"
          />
        ) : null}
      </div>
    </div>
  );
};
