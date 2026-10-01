"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { Button } from "@/components/ui/button";
import {
  Grid,
  Columns,
  Split,
  Eye,
  CheckCircle2,
  FileCheck,
  Maximize2,
  Minimize2,
  HelpCircle,
  X,
} from "lucide-react";

interface PdfDebugBarProps {
  showMargins: boolean;
  setShowMargins: (v: boolean) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  showPageBreaks: boolean;
  setShowPageBreaks: (v: boolean) => void;
}

export const PdfDebugBar: React.FC<PdfDebugBarProps> = ({
  showMargins,
  setShowMargins,
  showGrid,
  setShowGrid,
  showPageBreaks,
  setShowPageBreaks,
}) => {
  const {
    isDebugMode,
    toggleDebugMode,
    isPdfSplitView,
    togglePdfSplitView,
    isInlineEditMode,
    toggleInlineEditMode,
    resumeData,
  } = useResumeStore();

  const [showHelpModal, setShowHelpModal] = useState(false);

  if (!isDebugMode) return null;

  return (
    <div className="w-full max-w-[794px] mb-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-md flex flex-wrap items-center justify-between gap-2 text-xs no-print select-none">
      {/* Left: Indicator & Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>PDF Parity Debug Mode</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
        <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden md:inline font-mono">
          A4: 595.28pt = 794px @ 96DPI (Ratio: 1.333x)
        </span>
      </div>

      {/* Middle: Overlay Toggles */}
      <div className="flex items-center gap-1.5">
        {/* Margin Guide Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMargins(!showMargins)}
          className={`h-7 px-2 text-[11px] gap-1 rounded-md transition-colors ${
            showMargins
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="Highlight 36pt / 48px printable margin boundaries"
        >
          <Columns className="h-3 w-3" />
          <span>Margins</span>
        </Button>

        {/* Grid Overlay Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className={`h-7 px-2 text-[11px] gap-1 rounded-md transition-colors ${
            showGrid
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="Display baseline alignment grid"
        >
          <Grid className="h-3 w-3" />
          <span>Grid</span>
        </Button>

        {/* Page Break Boundaries Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPageBreaks(!showPageBreaks)}
          className={`h-7 px-2 text-[11px] gap-1 rounded-md transition-colors ${
            showPageBreaks
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="Highlight exact physical page thresholds (1122.5px)"
        >
          <Split className="h-3 w-3" />
          <span>Page Cuts</span>
        </Button>

        {/* Side-by-Side PDF Split View */}
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePdfSplitView}
          className={`h-7 px-2 text-[11px] gap-1 rounded-md transition-colors ${
            isPdfSplitView
              ? "bg-blue-600 text-white font-bold shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          }`}
          title="View Live DOM Preview side-by-side with actual React-PDF output stream"
        >
          <Eye className="h-3 w-3" />
          <span>{isPdfSplitView ? "Hide PDF Split" : "PDF Split View"}</span>
        </Button>

        {/* Close Debug Bar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDebugMode}
          className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md ml-1"
          title="Exit Debug Mode"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
