import React from "react";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
  FileText,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { usePdfEditorStore } from "../store";

interface HeaderBarProps {
  onExport: () => void;
  onLoadDemo: () => void;
  onOpenNewFile: () => void;
  isExporting: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onExport,
  onLoadDemo,
  onOpenNewFile,
  isExporting,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const {
    fileName,
    fileSize,
    pages,
    activePageIndex,
    zoom,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    resetDocument,
  } = usePdfEditorStore();

  const formattedSize =
    fileSize > 1024 * 1024
      ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(fileSize / 1024)} KB`;

  const zoomPercent = Math.round(zoom * 100);

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between gap-3 select-none z-30">
      {/* Left: Document Info & Privacy Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-sm">
            PDF
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate text-foreground flex items-center gap-1.5" title={fileName}>
              {fileName || "Untitled Document.pdf"}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{pages.length} {pages.length === 1 ? "page" : "pages"}</span>
              {fileSize > 0 && (
                <>
                  <span>•</span>
                  <span>{formattedSize}</span>
                </>
              )}
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                100% Client-Side
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: History & Zoom Controls */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50">
          <button
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-md text-foreground hover:bg-background/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-md text-foreground hover:bg-background/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-border/80 mx-1 hidden sm:block" />

        {/* Zoom */}
        <div className="hidden sm:flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50">
          <button
            onClick={() => setZoom(Math.max(0.4, zoom - 0.15))}
            title="Zoom Out"
            className="p-1.5 rounded-md text-foreground hover:bg-background/80 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium px-2 min-w-[3.5rem] text-center text-foreground">
            {zoomPercent}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2.5, zoom + 0.15))}
            title="Zoom In"
            className="p-1.5 rounded-md text-foreground hover:bg-background/80 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            title="Reset Zoom to 100%"
            className="text-[11px] font-medium px-1.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
          >
            100%
          </button>
        </div>
      </div>

      {/* Right: Actions (Open New, Load Demo, Save/Export) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNewFile}
          title="Open another PDF document"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Open
        </button>

        <button
          onClick={onLoadDemo}
          title="Load Sample Contract"
          className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border/80 bg-background/50 hover:bg-muted text-foreground transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Sample PDF
        </button>

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Studio"}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Fullscreen</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onExport}
          disabled={isExporting || pages.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
