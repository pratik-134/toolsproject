"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDFDocument } from "pdf-lib";
import {
  applyPdfRedactions,
  RedactionBox,
  REDACTION_PRESETS,
} from "./logic";
import {
  ShieldAlert,
  Upload,
  Download,
  ShieldCheck,
  Plus,
  Trash2,
  FileCheck,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function PdfRedactionTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [redactions, setRedactions] = useState<RedactionBox[]>([]);

  // Current drafting box
  const [currentX, setCurrentX] = useState<number>(50);
  const [currentY, setCurrentY] = useState<number>(650);
  const [currentWidth, setCurrentWidth] = useState<number>(200);
  const [currentHeight, setCurrentHeight] = useState<number>(30);
  const [currentColor, setCurrentColor] = useState<"black" | "white" | "dark">("black");
  const [currentLabel, setCurrentLabel] = useState<string>("[REDACTED]");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setDownloadUrl(null);
    setRedactions([]);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        try {
          const bytes = new Uint8Array(buffer);
          setPdfBytes(bytes);
          const pdfDoc = await PDFDocument.load(bytes);
          const count = pdfDoc.getPageCount();
          setPageCount(count);
          setSelectedPage(1);
        } catch {
          setError("Failed to load PDF. The file may be password protected or corrupted.");
        }
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "application/pdf") {
      handleFileSelect(dropped);
    }
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = REDACTION_PRESETS[presetKey];
    if (preset) {
      setCurrentX(preset.box.x);
      setCurrentY(preset.box.y);
      setCurrentWidth(preset.box.width);
      setCurrentHeight(preset.box.height);
      setCurrentColor(preset.box.color || "black");
      setCurrentLabel(preset.box.label || "[REDACTED]");
    }
  };

  const handleAddRedaction = () => {
    const newBox: RedactionBox = {
      id: `box-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pageIndex: selectedPage - 1, // 0-indexed internally
      x: Number(currentX),
      y: Number(currentY),
      width: Number(currentWidth),
      height: Number(currentHeight),
      color: currentColor,
      label: currentLabel,
    };
    setRedactions((prev) => [...prev, newBox]);
    setDownloadUrl(null);
  };

  const handleRemoveRedaction = (id: string) => {
    setRedactions((prev) => prev.filter((b) => b.id !== id));
    setDownloadUrl(null);
  };

  const handleApplyRedactions = async () => {
    if (!pdfBytes || redactions.length === 0) {
      setError("Please add at least one redaction box to apply.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const redacted = await applyPdfRedactions(pdfBytes, redactions);
      const blob = new Blob([redacted.buffer as ArrayBuffer], { type: "application/pdf" });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err: any) {
      setError(err?.message || "Failed to redact PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPdfBytes(null);
    setPageCount(0);
    setRedactions([]);
    setDownloadUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">
            100% In-Browser Permanent Vector Redaction • Zero Server Uploads
          </div>
        </div>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
          Irreversible Vector Burn
        </span>
      </div>

      {/* Main Workspace */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        {/* Upload Drop Zone */}
        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 transition bg-muted/20 hover:bg-muted/40"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
              className="hidden"
            />
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-semibold text-sm text-foreground">Select PDF to Redact</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports any standard PDF document (contracts, tax forms, reports)
            </p>
          </div>
        ) : (
          <div className="p-4 bg-muted/30 border rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {pageCount} {pageCount === 1 ? "page" : "pages"} • {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Choose Different PDF
            </Button>
          </div>
        )}

        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 border-t">
            {/* Left 2 Cols: Redaction Box Builder */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Define Redaction Area
                </label>
                {/* Presets */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[11px] text-muted-foreground mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" /> Presets:
                  </span>
                  <Select
                    onValueChange={(val) => handleApplyPreset(val)}
                  >
                    <SelectTrigger className="h-7 w-[160px] text-xs bg-background">
                      <SelectValue placeholder="Preset Area..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REDACTION_PRESETS).map(([key, p]) => (
                        <SelectItem key={key} value={key}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Coordinates & Page Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-muted/20 border rounded-xl">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Target Page
                  </label>
                  <Select
                    value={String(selectedPage)}
                    onValueChange={(v) => setSelectedPage(Number(v))}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-background font-mono">
                      <SelectValue placeholder="Page" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: pageCount }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          Page {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    X Position (pt)
                  </label>
                  <input
                    type="number"
                    value={currentX}
                    onChange={(e) => setCurrentX(Number(e.target.value))}
                    className="w-full text-xs bg-background border rounded px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Y Position (pt)
                  </label>
                  <input
                    type="number"
                    value={currentY}
                    onChange={(e) => setCurrentY(Number(e.target.value))}
                    className="w-full text-xs bg-background border rounded px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Width (pt)
                  </label>
                  <input
                    type="number"
                    value={currentWidth}
                    onChange={(e) => setCurrentWidth(Number(e.target.value))}
                    className="w-full text-xs bg-background border rounded px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Height (pt)
                  </label>
                  <input
                    type="number"
                    value={currentHeight}
                    onChange={(e) => setCurrentHeight(Number(e.target.value))}
                    className="w-full text-xs bg-background border rounded px-2 py-1.5 font-mono"
                  />
                </div>
              </div>

              {/* Box Styling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Redaction Block Color
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-lg border">
                    {(["black", "white", "dark"] as const).map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setCurrentColor(col)}
                        className={`text-xs capitalize font-medium py-1.5 rounded transition ${
                          currentColor === col
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Replacement Overlay Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentLabel}
                    onChange={(e) => setCurrentLabel(e.target.value)}
                    placeholder="[REDACTED]"
                    className="w-full text-xs bg-background border rounded-lg px-3 py-1.5 text-foreground font-mono"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddRedaction}
                className="gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Redaction Box to Page {selectedPage}
              </Button>
            </div>

            {/* Right 1 Col: List of Active Redactions */}
            <div className="border rounded-xl p-4 bg-muted/10 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-2">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Active Redactions
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {redactions.length} {redactions.length === 1 ? "box" : "boxes"}
                  </span>
                </div>

                {redactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-6 text-center">
                    No redaction zones added yet. Configure coordinates and click &quot;Add Redaction Box&quot;.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {redactions.map((box, idx) => (
                      <div
                        key={box.id}
                        className="p-2.5 bg-background border rounded-lg flex items-center justify-between text-xs gap-2"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            Page {box.pageIndex + 1}: {box.label || "[Block]"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {box.x}, {box.y} • {box.width}x{box.height}pt • {box.color}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRedaction(box.id)}
                          className="text-muted-foreground hover:text-red-500 p-1"
                          title="Remove redaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-2 border-t">
                {!downloadUrl ? (
                  <Button
                    onClick={handleApplyRedactions}
                    disabled={isProcessing || redactions.length === 0}
                    className="w-full gap-2 bg-primary text-primary-foreground font-semibold text-xs py-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    {isProcessing ? "Baking Redactions..." : "Apply Redactions"}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <a
                      href={downloadUrl}
                      download={`redacted_${file.name}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 rounded-lg transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Redacted PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
