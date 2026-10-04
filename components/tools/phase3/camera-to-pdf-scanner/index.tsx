"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import {
  ScannedPage,
  ScanFilterType,
  applyDocumentFilter,
  calculateA4Fitting,
} from "./logic";
import {
  Camera,
  Download,
  RotateCcw,
  ShieldCheck,
  Plus,
  Trash2,
  RotateCw,
  Sliders,
  FileText,
  AlertCircle,
  Upload,
} from "lucide-react";

export default function CameraToPdfScannerTool() {
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Ensure video element receives stream when cameraActive becomes true
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch((err) => console.warn("Camera play error:", err));
      }
    }
  }, [cameraActive]);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setErrorMessage("Camera access is not supported in this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        setErrorMessage("Camera access permission was denied. Please allow camera permissions in browser settings.");
      } else {
        setErrorMessage(error?.message || "Failed to initialize camera device.");
      }
    }
  };

  const snapPage = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    const newPage: ScannedPage = {
      id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      dataUrl,
      filter: "normal",
      rotation: 0,
    };

    setPages((prev) => {
      const nextPages = [...prev, newPage];
      setSelectedPageIndex(nextPages.length - 1);
      return nextPages;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawSrc = event.target?.result as string;
        if (!rawSrc) return;

        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 2048;
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          let finalDataUrl = rawSrc;

          if (w > MAX_DIM || h > MAX_DIM) {
            if (w > h) {
              h = Math.round((h * MAX_DIM) / w);
              w = MAX_DIM;
            } else {
              w = Math.round((w * MAX_DIM) / h);
              h = MAX_DIM;
            }
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              finalDataUrl = canvas.toDataURL("image/jpeg", 0.92);
            }
          }

          const newPage: ScannedPage = {
            id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            dataUrl: finalDataUrl,
            filter: "normal",
            rotation: 0,
          };

          setPages((prev) => {
            const nextPages = [...prev, newPage];
            setSelectedPageIndex(nextPages.length - 1);
            return nextPages;
          });
        };
        img.src = rawSrc;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const setPageFilter = (index: number, filter: ScanFilterType) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, filter } : p))
    );
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const removePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
    if (selectedPageIndex >= index && selectedPageIndex > 0) {
      setSelectedPageIndex(selectedPageIndex - 1);
    }
  };

  // Compile multi-page PDF with pdf-lib
  const exportPdf = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const page of pages) {
        // Load image to apply filter and rotation on canvas first
        const img = new Image();
        img.src = page.dataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const isRotated = page.rotation === 90 || page.rotation === 270;
        const canvas = document.createElement("canvas");
        canvas.width = isRotated ? img.height : img.width;
        canvas.height = isRotated ? img.width : img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((page.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        // Apply filter if selected
        if (page.filter !== "normal") {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          applyDocumentFilter(imgData, page.filter);
          ctx.putImageData(imgData, 0, 0);
        }

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.9)
        );
        if (!blob) continue;
        const imgBytes = await blob.arrayBuffer();
        const embeddedImg = await pdfDoc.embedJpg(imgBytes);

        // Standard A4: 595.28 x 841.89
        const pdfPage = pdfDoc.addPage([595.28, 841.89]);
        const fit = calculateA4Fitting(canvas.width, canvas.height, 595.28, 841.89, 20);

        pdfPage.drawImage(embeddedImg, {
          x: fit.x,
          y: fit.y,
          width: fit.width,
          height: fit.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `scanned-document-${Date.now()}.pdf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to build PDF:", err);
      alert("Error compiling document PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const activePage = pages[selectedPageIndex];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="leading-relaxed">Camera-to-PDF Scanner — Document captures are processed in RAM. Zero uploads.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPages([])}
            disabled={pages.length === 0}
            className="h-7 text-xs gap-1 border-emerald-300 dark:border-emerald-700"
          >
            <RotateCcw className="w-3 h-3" /> Clear Pages
          </Button>
          <Button
            size="sm"
            onClick={exportPdf}
            disabled={pages.length === 0 || isExporting}
            className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-3 h-3" /> {isExporting ? "Compiling..." : `Export ${pages.length} Pages PDF`}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Camera Access Warning</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Camera Viewfinder or Page Preview */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] max-w-2xl mx-auto shadow-2xl flex items-center justify-center border border-slate-800">
            {cameraActive ? (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.play().catch(() => {});
                  }
                }}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            ) : activePage ? (
              <div
                className="w-full h-full flex items-center justify-center p-4"
                style={{
                  filter:
                    activePage.filter === "grayscale"
                      ? "grayscale(100%)"
                      : activePage.filter === "high-contrast"
                      ? "contrast(200%) grayscale(100%)"
                      : activePage.filter === "enhanced"
                      ? "contrast(130%) saturate(120%)"
                      : "none",
                  transform: `rotate(${activePage.rotation}deg)`,
                  transition: "all 0.2s ease",
                }}
              >
                <img
                  src={activePage.dataUrl}
                  alt="Scanned page"
                  className="max-h-full max-w-full object-contain shadow-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Camera Viewfinder Ready</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Start your device camera to snap physical paper documents into a multi-page PDF.
                  </p>
                </div>
              </div>
            )}

            {/* Document Guide Frame Overlay when camera is active */}
            {cameraActive && (
              <div className="absolute inset-8 border-2 border-emerald-400/70 border-dashed rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-[11px] text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                  Align paper document within frame
                </span>
              </div>
            )}
          </div>

          {/* Action buttons under viewfinder */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!cameraActive ? (
              <>
                <Button
                  size="lg"
                  onClick={startCamera}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium px-6"
                >
                  <Camera className="w-4 h-4" /> Start Camera Viewfinder
                </Button>

                <input
                  type="file"
                  ref={uploadInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => uploadInputRef.current?.click()}
                  className="gap-2 border-slate-300 dark:border-slate-700"
                >
                  <Upload className="w-4 h-4" /> Upload Document Photo
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={snapPage}
                  className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-bold px-8 shadow-lg ring-4 ring-rose-500/20"
                >
                  <Camera className="w-5 h-5 fill-white" /> Snap Page #{pages.length + 1}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={stopCamera}
                  className="border-slate-300 dark:border-slate-700"
                >
                  Close Camera
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right: Multi-Page Deck & Filter Controls */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Page Tools */}
          {activePage && (
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Page #{selectedPageIndex + 1} Enhancements
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => rotatePage(selectedPageIndex)}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    title="Rotate 90 deg"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePage(selectedPageIndex)}
                    className="p-1 text-slate-500 hover:text-rose-600"
                    title="Delete page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Document Clean-Up Filter:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "normal", label: "Color (Original)" },
                      { id: "grayscale", label: "Grayscale" },
                      { id: "high-contrast", label: "B&W Document" },
                      { id: "enhanced", label: "Enhanced Vivid" },
                    ] as { id: ScanFilterType; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPageFilter(selectedPageIndex, f.id)}
                      className={`px-2.5 py-1.5 text-xs rounded-md border text-center transition-colors ${
                        activePage.filter === f.id
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scanned Pages Deck */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" /> Scanned Document Pages ({pages.length})
              </h4>
            </div>

            {pages.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No pages captured yet. Click &quot;Start Camera Viewfinder&quot; to begin.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1">
                {pages.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPageIndex(idx);
                      stopCamera();
                    }}
                    className={`relative rounded-lg overflow-hidden border-2 aspect-[3/4] bg-slate-100 dark:bg-slate-800 transition-all ${
                      selectedPageIndex === idx && !cameraActive
                        ? "border-emerald-600 ring-2 ring-emerald-500 scale-105"
                        : "border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={p.dataUrl}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
