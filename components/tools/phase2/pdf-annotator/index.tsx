"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  PdfAnnotation,
  ANNOTATION_PRESETS,
  applyPdfAnnotations,
  createDemoPdf,
} from "./logic";
import {
  Highlighter,
  Upload,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Stamp,
  FileText,
  StickyNote,
  Square,
  Plus,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function PdfAnnotatorTool() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("agreement.pdf");
  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Custom tool creator form state
  const [toolType, setToolType] = useState<"highlight" | "stamp" | "note" | "rect">("stamp");
  const [customText, setCustomText] = useState<string>("APPROVED");
  const [customColor, setCustomColor] = useState<string>("#16a34a");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load demo PDF
  const loadDemoDocument = useCallback(async () => {
    try {
      const bytes = await createDemoPdf();
      setPdfBytes(bytes);
      setFileName("service-level-agreement.pdf");
      setAnnotations([
        {
          id: "1",
          type: "stamp",
          pageIndex: 0,
          x: 390,
          y: 700,
          width: 140,
          height: 38,
          color: "#16a34a",
          text: "APPROVED",
        },
        {
          id: "2",
          type: "highlight",
          pageIndex: 0,
          x: 50,
          y: 650,
          width: 380,
          height: 18,
          color: "#fde047",
        },
      ]);
    } catch (e) {
      console.error("Failed to load demo PDF:", e);
    }
  }, []);

  useEffect(() => {
    loadDemoDocument();
  }, [loadDemoDocument]);

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      alert("Please upload a valid PDF document.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        setPdfBytes(new Uint8Array(buffer));
        setAnnotations([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addPreset = (presetKey: string) => {
    const p = ANNOTATION_PRESETS[presetKey];
    if (!p) return;

    const newAnn: PdfAnnotation = {
      ...p,
      id: Math.random().toString(36).substring(2, 9),
      pageIndex: 0,
    };
    setAnnotations([...annotations, newAnn]);
  };

  const addCustomAnnotation = () => {
    const newAnn: PdfAnnotation = {
      id: Math.random().toString(36).substring(2, 9),
      type: toolType,
      pageIndex: 0,
      x: 60,
      y: 500,
      width: toolType === "highlight" ? 300 : toolType === "stamp" ? 140 : 180,
      height: toolType === "highlight" ? 18 : toolType === "stamp" ? 36 : 50,
      color: customColor,
      text: toolType === "stamp" || toolType === "note" ? customText : undefined,
    };
    setAnnotations([...annotations, newAnn]);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id));
  };

  const handleDownload = async () => {
    if (!pdfBytes) return;
    setIsProcessing(true);
    try {
      const resultBytes = await applyPdfAnnotations(pdfBytes, annotations);
      const blob = new Blob([resultBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `annotated-${fileName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to annotate PDF:", err);
      alert("Error applying PDF annotations.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser PDF Vector Annotator — Vector highlights and stamps are baked directly into document streams in device memory.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tools & Presets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Stamp className="w-4 h-4 text-primary" />
                Annotation Presets
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDemoDocument}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Demo Doc
              </Button>
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => addPreset("approved_stamp")}
                className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-700 dark:text-emerald-300 font-semibold text-left hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Approved Stamp</span>
              </button>
              <button
                onClick={() => addPreset("confidential_stamp")}
                className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-700 dark:text-rose-300 font-semibold text-left hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Confidential Stamp</span>
              </button>
              <button
                onClick={() => addPreset("yellow_highlight")}
                className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-300 font-semibold text-left hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
              >
                <Highlighter className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Yellow Highlight</span>
              </button>
              <button
                onClick={() => addPreset("review_note")}
                className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-700 dark:text-blue-300 font-semibold text-left hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
              >
                <StickyNote className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Review Sticky Note</span>
              </button>
            </div>

            {/* Custom Annotation Creator */}
            <div className="space-y-3 pt-2 border-t border-border text-xs">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
                Add Custom Annotation
              </span>

              {/* Type selector */}
              <div className="grid grid-cols-4 gap-1">
                {(["stamp", "highlight", "note", "rect"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setToolType(t);
                      if (t === "highlight") setCustomColor("#fde047");
                      if (t === "stamp") setCustomColor("#16a34a");
                      if (t === "note") setCustomColor("#3b82f6");
                    }}
                    className={`py-1.5 px-1 rounded border text-[11px] font-medium capitalize transition-colors ${
                      toolType === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Text input if stamp or note */}
              {(toolType === "stamp" || toolType === "note") && (
                <div>
                  <label className="text-muted-foreground block mb-1">Annotation Text</label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg text-foreground font-semibold text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. APPROVED"
                  />
                </div>
              )}

              {/* Color picker */}
              <div>
                <label className="text-muted-foreground block mb-1">Color Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-7 h-7 p-0 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-full px-2 py-1 bg-muted/40 border border-border rounded text-xs font-mono text-foreground"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={addCustomAnnotation}
                className="w-full text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Document
              </Button>
            </div>

            {/* Upload File */}
            <div className="pt-2 border-t border-border">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload PDF File
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Layout & Applied Annotations List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl min-h-[440px] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Document Annotations ({annotations.length})
                </span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isProcessing || !pdfBytes}
                  className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isProcessing ? "Baking PDF..." : "Export Annotated PDF"}
                </Button>
              </div>

              {/* List of active annotations */}
              <div className="space-y-2 mt-3 max-h-[340px] overflow-y-auto pr-1">
                {annotations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    No annotations added yet. Click a preset or add a custom stamp.
                  </div>
                ) : (
                  annotations.map((ann, idx) => (
                    <div
                      key={ann.id}
                      className="p-2.5 bg-muted/20 border border-border rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: ann.color || "#fde047" }}
                        />
                        <div className="truncate">
                          <p className="font-semibold text-foreground truncate">
                            {idx + 1}. {ann.type.toUpperCase()}{" "}
                            {ann.text ? `— "${ann.text}"` : ""}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            Coords: ({ann.x}, {ann.y}) | Size: {ann.width}×{ann.height}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAnnotation(ann.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        title="Delete annotation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Vector PDF Stream Compilation (`pdf-lib`)</span>
              <span>100% In-Browser RAM Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
