"use client";

import React, { useState, useRef, useEffect } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { PdfDebugBar } from "./PdfDebugBar";
import { RealPdfPreview } from "./RealPdfPreview";
import {
  A4_WIDTH_PX,
  A4_HEIGHT_PX,
  getComputedResumeLayout,
} from "@/lib/resume-layout";
import {
  FileText,
  Sparkles,
  Bug,
  Split,
  Eye,
  Edit3,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LivePreviewProps {
  mobileTab?: "edit" | "preview";
}

export const LivePreview: React.FC<LivePreviewProps> = ({ mobileTab }) => {
  const {
    resumeData,
    zoomLevel,
    setZoomLevel,
    isDebugMode,
    toggleDebugMode,
    isPdfSplitView,
    togglePdfSplitView,
    isInlineEditMode,
    toggleInlineEditMode,
    setActiveSectionId,
    setSelectedPreviewField,
  } = useResumeStore();

  const [showMargins, setShowMargins] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showPageBreaks, setShowPageBreaks] = useState<boolean>(true);
  const [pageCount, setPageCount] = useState<number>(1);
  const [canvasHeight, setCanvasHeight] = useState<number>(A4_HEIGHT_PX);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scale = zoomLevel / 100;

  const layout = getComputedResumeLayout(resumeData.theme);

  // Auto-fit scale to available container/viewport width on small/tablet screens
  useEffect(() => {
    const handleAutoFit = () => {
      if (typeof window === "undefined") return;
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      if (containerWidth < 1024) {
        // Safe horizontal padding so the A4 preview has breathing room and never gets cut off
        const padding = containerWidth < 480 ? 16 : containerWidth < 640 ? 24 : 48;
        const availableWidth = Math.max(200, containerWidth - padding);
        const targetZoom = Math.max(20, Math.min(100, Math.round((availableWidth / A4_WIDTH_PX) * 100)));
        setZoomLevel(targetZoom);
      }
    };

    handleAutoFit();
    // Re-check after tab animation frame settles
    const raf = requestAnimationFrame(handleAutoFit);
    window.addEventListener("resize", handleAutoFit);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleAutoFit);
    };
  }, [setZoomLevel, mobileTab]);

  const handleFitToScreen = () => {
    if (typeof window === "undefined") return;
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const padding = containerWidth < 480 ? 16 : containerWidth < 640 ? 24 : 48;
    const availableWidth = Math.max(200, containerWidth - padding);
    const targetZoom = Math.max(20, Math.min(120, Math.round((availableWidth / A4_WIDTH_PX) * 100)));
    setZoomLevel(targetZoom);
  };

  // Dynamic calculation of page height and page count
  useEffect(() => {
    const measure = () => {
      if (canvasRef.current) {
        const actualHeight = Math.max(canvasRef.current.offsetHeight, canvasRef.current.scrollHeight);
        setCanvasHeight(actualHeight);
        const computedPages = Math.max(1, Math.ceil(actualHeight / A4_HEIGHT_PX));
        setPageCount(computedPages);
      }
    };
    measure();
    if (typeof ResizeObserver !== "undefined" && canvasRef.current) {
      const ro = new ResizeObserver(measure);
      ro.observe(canvasRef.current);
      return () => ro.disconnect();
    }
  }, [resumeData, scale]);

  // Click handler for in-preview quick navigation to corresponding editor section
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const sectionElement = target.closest("[data-section-id]") as HTMLElement;
    if (sectionElement) {
      const sectionId = sectionElement.getAttribute("data-section-id");
      if (sectionId) {
        setActiveSectionId(sectionId);
        // Dispatch custom scroll event to focus form
        const editorField = document.getElementById(`editor-section-${sectionId}`);
        if (editorField) {
          editorField.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-start h-full py-4 sm:py-8 px-2 sm:px-6 overflow-y-auto overflow-x-hidden w-full bg-slate-100/70 dark:bg-slate-900/70 pb-24"
    >
      {/* Floating Canvas Dock */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl no-print select-none transition-all max-w-[calc(100vw-24px)] overflow-x-auto no-scrollbar">
        {/* Zoom Out */}
        <button
          onClick={() => setZoomLevel(Math.max(30, zoomLevel - 10))}
          disabled={zoomLevel <= 30}
          className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors shrink-0"
          title="Zoom Out (-10%)"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        {/* Fit to Screen */}
        <button
          onClick={handleFitToScreen}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-1.5 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 shrink-0"
          title="Fit to Screen Width"
        >
          <Maximize2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-[11px]">Fit</span>
        </button>

        {/* Zoom In */}
        <button
          onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
          disabled={zoomLevel >= 150}
          className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors shrink-0"
          title="Zoom In (+10%)"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 px-0.5 shrink-0">{zoomLevel}%</span>

        <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        {/* Page indicator */}
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1 whitespace-nowrap shrink-0">
          {pageCount} {pageCount === 1 ? "Page" : "Pages"}
        </span>

        {/* PDF Stream Split View Toggle (hidden on small mobile screens to keep dock compact) */}
        <div className="hidden sm:block h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />
        <button
          onClick={togglePdfSplitView}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
            isPdfSplitView
              ? "bg-blue-600 text-white font-semibold shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
          title="Toggle Exported PDF Stream View"
        >
          <Split className="h-3 w-3" />
          <span>{isPdfSplitView ? "Hide PDF" : "PDF Stream"}</span>
        </button>

        {/* Debug Toggle Button */}
        <button
          onClick={toggleDebugMode}
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
            isDebugMode
              ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
          title="Toggle PDF Parity Debug Tools"
        >
          <Bug className="h-3 w-3" />
          {isDebugMode && <span className="hidden sm:inline">Debug</span>}
        </button>
      </div>

      {/* PDF Debug Bar Overlay (when Debug Mode is on) */}
      <PdfDebugBar
        showMargins={showMargins}
        setShowMargins={setShowMargins}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showPageBreaks={showPageBreaks}
        setShowPageBreaks={setShowPageBreaks}
      />

      {/* Main Split Area (Side-by-Side if isPdfSplitView is active) */}
      <div
        className={`w-full flex ${
          isPdfSplitView ? "flex-col xl:flex-row items-stretch gap-6" : "flex-col items-center"
        } justify-center`}
      >
        {/* DOM Live Preview Column */}
        <div
          className="flex flex-col items-center shrink-0 transition-all duration-200 shadow-[0_12px_40px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 rounded-xs overflow-hidden"
          style={{
            width: `${Math.round(A4_WIDTH_PX * scale)}px`,
            height: `${Math.round(canvasHeight * scale)}px`,
          }}
        >
          {/* Scaled A4 Container */}
          <div
            className="transition-transform duration-200 ease-out origin-top-left relative"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: `${A4_WIDTH_PX}px`,
            }}
          >
            {/* Multi-Page Canvas with Paper Shadow */}
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="relative bg-white text-slate-900 select-text print:shadow-none print:m-0"
              style={{
                width: `${A4_WIDTH_PX}px`,
                minHeight: `${A4_HEIGHT_PX}px`,
              }}
            >
              {/* Printable Margin Overlay Guide (Debug Mode) */}
              {isDebugMode && showMargins && (
                <div
                  className="absolute inset-0 pointer-events-none z-20 border-2 border-dashed border-blue-400/60"
                  style={{
                    top: `${layout.margins.topPx}px`,
                    bottom: `${layout.margins.bottomPx}px`,
                    left: `${layout.margins.horizontalPx}px`,
                    right: `${layout.margins.horizontalPx}px`,
                  }}
                >
                  <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-blue-600 bg-white/90 px-1 rounded shadow-2xs">
                    Printable Margin: {layout.margins.horizontalPt}pt ({Math.round(layout.margins.horizontalPx)}px)
                  </span>
                </div>
              )}

              {/* Baseline Grid Overlay (Debug Mode) */}
              {isDebugMode && showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none z-20 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #2563EB 1px, transparent 1px), linear-gradient(to bottom, #2563EB 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />
              )}

              {/* Physical Page Break Dotted Lines (Debug Mode or multi-page) */}
              {Array.from({ length: Math.max(1, pageCount) }).map((_, index) => {
                if (index === 0) return null;
                const topPx = index * A4_HEIGHT_PX;
                return (
                  <div
                    key={`page-break-${index}`}
                    className="absolute left-0 right-0 z-30 pointer-events-none flex items-center justify-between no-print"
                    style={{ top: `${topPx}px` }}
                  >
                    <div className="w-full border-b-2 border-dashed border-slate-300" />
                    <span className="shrink-0 bg-slate-800 text-white font-mono text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs ml-2">
                      Page {index + 1} Break
                    </span>
                  </div>
                );
              })}

              {/* Actual Rendered Template Component */}
              <TemplateRenderer data={resumeData} />
            </div>
          </div>
        </div>

        {/* Real PDF Stream Column (Side-by-Side Mode) */}
        {isPdfSplitView && (
          <div className="w-full xl:w-[48%] min-h-[600px] flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3 no-print select-none">
              <span className="text-xs font-medium text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Exported PDF Stream</span>
              </span>
            </div>
            <RealPdfPreview data={resumeData} scale={scale} />
          </div>
        )}
      </div>
    </div>
  );
};
