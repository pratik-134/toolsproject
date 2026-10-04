"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import {
  PassportPreset,
  PASSPORT_PRESETS,
  PrintPaperFormat,
  PRINT_PAPERS,
  PhotoTransform,
  DEFAULT_TRANSFORM,
  NameOverlayConfig,
  DEFAULT_NAME_OVERLAY,
  computePrintSheetLayout,
  drawBiometricGuide,
  drawCropMarks,
  drawNameOverlay,
} from "./logic";
import {
  Camera,
  Upload,
  Download,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  User,
  Layers,
  Sparkles,
} from "lucide-react";

export default function PassportPhotoGeneratorTool() {
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]!);
  const [selectedPaper, setSelectedPaper] = useState<PrintPaperFormat>(PRINT_PAPERS[1]!); // Default 4x6"
  const [requestedPhotoCount, setRequestedPhotoCount] = useState<number>(0); // 0 = Fill Sheet
  const [nameOverlay, setNameOverlay] = useState<NameOverlayConfig>(DEFAULT_NAME_OVERLAY);
  const [transform, setTransform] = useState<PhotoTransform>({
    ...DEFAULT_TRANSFORM,
    bgColor: PASSPORT_PRESETS[0]!.bgColor,
  });

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize with demo portrait
  useEffect(() => {
    const demoCanvas = document.createElement("canvas");
    demoCanvas.width = 600;
    demoCanvas.height = 750;
    const ctx = demoCanvas.getContext("2d");
    if (ctx) {
      // Soft portrait background
      ctx.fillStyle = "#E2E8F0";
      ctx.fillRect(0, 0, 600, 750);

      // Stylized silhouette portrait
      ctx.fillStyle = "#1E293B"; // Shoulders / dark suit
      ctx.beginPath();
      ctx.ellipse(300, 680, 240, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck
      ctx.fillStyle = "#FDBA74"; // Skin tone
      ctx.fillRect(260, 420, 80, 100);

      // Head oval
      ctx.beginPath();
      ctx.ellipse(300, 320, 120, 150, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.arc(300, 260, 130, Math.PI, 0);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.arc(260, 310, 8, 0, Math.PI * 2);
      ctx.arc(340, 310, 8, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.beginPath();
      ctx.strokeStyle = "#9A3412";
      ctx.lineWidth = 3;
      ctx.arc(300, 370, 30, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      const img = new Image();
      img.onload = () => setImageElement(img);
      img.src = demoCanvas.toDataURL();
    }
  }, []);

  // Update preset
  const handleSelectPreset = (preset: PassportPreset) => {
    setSelectedPreset(preset);
    setTransform((prev) => ({
      ...prev,
      bgColor: preset.bgColor,
    }));
  };

  // Render photo onto canvas
  const renderSinglePhotoToCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement, withGuide: boolean = false) => {
      const ctx = targetCanvas.getContext("2d");
      if (!ctx || !imageElement) return;

      const targetW = selectedPreset.targetWidthPx;
      const targetH = selectedPreset.targetHeightPx;

      targetCanvas.width = targetW;
      targetCanvas.height = targetH;

      // 1. Fill Background
      ctx.fillStyle = transform.bgColor;
      ctx.fillRect(0, 0, targetW, targetH);

      // 2. Setup Filters (brightness, contrast, saturation)
      const bVal = 100 + transform.brightness;
      const cVal = 100 + transform.contrast;
      const sVal = 100 + transform.saturation;
      ctx.filter = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%)`;

      // 3. Coordinate Transformation
      ctx.save();
      ctx.translate(targetW / 2 + transform.panX, targetH / 2 + transform.panY);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      if (transform.flipH) {
        ctx.scale(-1, 1);
      }
      ctx.scale(transform.zoom, transform.zoom);

      // Fitted aspect ratio so image covers canvas gracefully
      const imgAspect = imageElement.width / imageElement.height;
      const targetAspect = targetW / targetH;
      let drawW: number;
      let drawH: number;

      if (imgAspect > targetAspect) {
        drawH = targetH;
        drawW = targetH * imgAspect;
      } else {
        drawW = targetW;
        drawH = targetW / imgAspect;
      }

      ctx.drawImage(imageElement, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Reset filter
      ctx.filter = "none";

      // 4. Draw Name & Date Overlay (Government Exam / Visa Requirement)
      if (nameOverlay.enabled) {
        drawNameOverlay(ctx, targetW, targetH, nameOverlay);
      }

      // 5. Draw Biometric Alignment Guide (if requested for UI preview)
      if (withGuide) {
        drawBiometricGuide(ctx, targetW, targetH, selectedPreset);
      }
    },
    [selectedPreset, transform, imageElement, nameOverlay]
  );

  // Render Interactive Canvas for the UI
  useEffect(() => {
    if (!canvasRef.current || !imageElement) return;
    renderSinglePhotoToCanvas(canvasRef.current, showBiometricGuide);
  }, [renderSinglePhotoToCanvas, showBiometricGuide, imageElement]);

  // Handle Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        setTransform({
          ...DEFAULT_TRANSFORM,
          bgColor: selectedPreset.bgColor,
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Start Live Webcam
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access your webcam. Please ensure camera permissions are allowed.");
      setIsCameraActive(false);
    }
  };

  // Stop Webcam
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraCountdown(null);
  };

  // Capture Photo with countdown
  const triggerCapture = () => {
    setCameraCountdown(3);
    const interval = setInterval(() => {
      setCameraCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const snapCanvas = document.createElement("canvas");
    snapCanvas.width = video.videoWidth || 1280;
    snapCanvas.height = video.videoHeight || 720;
    const ctx = snapCanvas.getContext("2d");
    if (ctx) {
      ctx.translate(snapCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);

      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        setTransform({
          ...DEFAULT_TRANSFORM,
          bgColor: selectedPreset.bgColor,
        });
        stopCamera();
      };
      img.src = snapCanvas.toDataURL("image/jpeg", 0.95);
    }
  };

  // Canvas Mouse / Touch Dragging for Panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.panX, y: e.clientY - transform.panY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      panX: Math.round(e.clientX - dragStart.x),
      panY: Math.round(e.clientY - dragStart.y),
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Compute Layout for the Sheet
  const sheetLayout = computePrintSheetLayout(
    selectedPaper,
    selectedPreset,
    requestedPhotoCount > 0 ? requestedPhotoCount : undefined
  );

  // Generate Print Sheet Canvas
  const generatePrintSheetCanvas = (): HTMLCanvasElement | null => {
    if (!imageElement) return null;

    // 1. Render single photo to an offscreen clean canvas
    const singleCanvas = document.createElement("canvas");
    renderSinglePhotoToCanvas(singleCanvas, false);

    // 2. Compute Sheet Layout
    const layout = computePrintSheetLayout(
      selectedPaper,
      selectedPreset,
      requestedPhotoCount > 0 ? requestedPhotoCount : undefined
    );

    // 3. Create High-Resolution Print Canvas
    const printCanvas = document.createElement("canvas");
    printCanvas.width = selectedPaper.targetWidthPx || selectedPreset.targetWidthPx;
    printCanvas.height = selectedPaper.targetHeightPx || selectedPreset.targetHeightPx;

    const ctx = printCanvas.getContext("2d");
    if (!ctx) return null;

    // Fill Paper White
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, printCanvas.width, printCanvas.height);

    if (selectedPaper.id === "single") {
      ctx.drawImage(singleCanvas, 0, 0, printCanvas.width, printCanvas.height);
      return printCanvas;
    }

    // 4. Render Grid of Photos with Precision Crop Marks
    let drawn = 0;
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        if (drawn >= layout.photosToRender) break;
        const x = layout.offsetX + c * (layout.cellWidthPx + layout.gapPx);
        const y = layout.offsetY + r * (layout.cellHeightPx + layout.gapPx);

        // Draw individual photo
        ctx.drawImage(singleCanvas, x, y, layout.cellWidthPx, layout.cellHeightPx);

        // Draw subtle border around photo
        ctx.strokeStyle = "rgba(203, 213, 225, 0.9)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, layout.cellWidthPx, layout.cellHeightPx);

        // Draw corner crop marks for scissors / cutter
        drawCropMarks(ctx, x, y, layout.cellWidthPx, layout.cellHeightPx, 18);
        drawn++;
      }
      if (drawn >= layout.photosToRender) break;
    }

    // Header stamp in margin
    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(
      `ClearTrix Passport Studio · ${selectedPreset.country} (${selectedPreset.widthMm}x${selectedPreset.heightMm}mm) · ${layout.photosToRender} Photo(s) · 300 DPI`,
      layout.offsetX,
      Math.max(22, layout.offsetY - 14)
    );

    return printCanvas;
  };

  // Download Single Photo (Exact 300 DPI specification)
  const downloadSinglePhoto = () => {
    const exportCanvas = document.createElement("canvas");
    renderSinglePhotoToCanvas(exportCanvas, false);

    const link = document.createElement("a");
    link.download = `${selectedPreset.id}-${selectedPreset.widthMm}x${selectedPreset.heightMm}mm-300dpi.jpg`;
    link.href = exportCanvas.toDataURL("image/jpeg", 0.96);
    link.click();
  };

  // Download Multi-up Print Sheet JPG
  const downloadPrintSheetJpg = () => {
    const printCanvas = generatePrintSheetCanvas();
    if (!printCanvas) return;

    const link = document.createElement("a");
    link.download = `passport-sheet-${selectedPaper.id}-${selectedPreset.id}-${sheetLayout.photosToRender}photos.jpg`;
    link.href = printCanvas.toDataURL("image/jpeg", 0.96);
    link.click();
  };

  // Download Multi-up Print Sheet PDF (Accurate Physical Scale)
  const downloadPrintSheetPdf = async () => {
    setIsExportingPdf(true);
    try {
      const printCanvas = generatePrintSheetCanvas();
      if (!printCanvas) return;

      const dataUrl = printCanvas.toDataURL("image/jpeg", 0.98);
      const res = await fetch(dataUrl);
      const imageBytes = await res.arrayBuffer();

      const pdfDoc = await PDFDocument.create();

      let pageWidthPt = selectedPaper.pdfWidthPt;
      let pageHeightPt = selectedPaper.pdfHeightPt;

      if (selectedPaper.id === "single") {
        pageWidthPt = (selectedPreset.widthMm / 25.4) * 72;
        pageHeightPt = (selectedPreset.heightMm / 25.4) * 72;
      }

      const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
      const embeddedJpg = await pdfDoc.embedJpg(imageBytes);

      // Full bleed mapping gives exact millimeter print when printed at 100% scale
      page.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: pageWidthPt,
        height: pageHeightPt,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `passport-sheet-${selectedPaper.id}-${selectedPreset.id}-${sheetLayout.photosToRender}photos.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to export PDF. Please try again or download as JPG.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Quick helper to fill today's date
  const handleSetTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    setNameOverlay((prev) => ({
      ...prev,
      enabled: true,
      date: `DOP: ${dd}/${mm}/${yyyy}`,
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16">
      {/* Consistent Privacy Ribbon & Actions Bar (Matches ClearTrix Tool Suite) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
            <Camera className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Biometric Studio & Print Sheet Engine
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3 w-3" /> ICAO 9303 Compliant
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              300 DPI high-resolution output · Processed 100% in browser RAM · Zero server uploads
            </p>
          </div>
        </div>

        {/* Quick export actions in header */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTransform({ ...DEFAULT_TRANSFORM, bgColor: selectedPreset.bgColor });
              setNameOverlay(DEFAULT_NAME_OVERLAY);
              setRequestedPhotoCount(0);
            }}
            className="h-8 text-xs gap-1.5 rounded-xl border-slate-200 dark:border-slate-700"
            title="Reset All Adjustments"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={downloadSinglePhoto}
            className="h-8 text-xs gap-1.5 rounded-xl border-slate-200 dark:border-slate-700 font-semibold"
          >
            <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Single (JPG)</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={downloadPrintSheetJpg}
            className="h-8 text-xs gap-1.5 rounded-xl border-slate-200 dark:border-slate-700 font-semibold"
          >
            <Printer className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Sheet ({sheetLayout.photosToRender} JPG)</span>
          </Button>

          <Button
            size="sm"
            onClick={downloadPrintSheetPdf}
            disabled={isExportingPdf}
            className="h-8 text-xs gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{isExportingPdf ? "Generating..." : `Print Sheet (${sheetLayout.photosToRender} PDF)`}</span>
          </Button>
        </div>
      </div>

      {/* Main Studio Grid: Left Canvas, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Framing Canvas & Direct Tools */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          {/* Top Bar above Canvas */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedPreset.flag}</span>
              <div>
                <span className="font-headings text-sm font-bold text-slate-900 dark:text-white block">
                  {selectedPreset.country} ({selectedPreset.widthMm} x {selectedPreset.heightMm} mm)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {selectedPreset.targetWidthPx} x {selectedPreset.targetHeightPx} px @ 300 DPI
                </span>
              </div>
            </div>

            {/* Toggle Biometric Overlay */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBiometricGuide(!showBiometricGuide)}
              className={`gap-1.5 text-xs h-8 rounded-lg ${
                showBiometricGuide
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {showBiometricGuide ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>Biometric Guide</span>
            </Button>
          </div>

          {/* Interactive Canvas Viewport */}
          <div className="relative flex flex-col items-center justify-center p-4 bg-slate-100/70 dark:bg-slate-950/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 min-h-[400px] overflow-hidden select-none">
            {isCameraActive ? (
              /* Live Camera View */
              <div className="relative w-full max-w-md aspect-3/4 rounded-xl overflow-hidden bg-black shadow-xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Camera Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/60 m-8 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-mono font-bold bg-black/60 px-2 py-0.5 rounded">
                    Position Face Inside Oval
                  </span>
                </div>

                {/* Countdown display */}
                {cameraCountdown !== null && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-7xl font-bold text-white animate-ping">
                      {cameraCountdown}
                    </span>
                  </div>
                )}

                {/* Camera Actions Bar */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stopCamera}
                    className="bg-black/60 text-white border-white/40 hover:bg-black/80 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={triggerCapture}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl gap-2 shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Take Photo</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Canvas with Drag Handlers */
              <div className="relative flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`rounded-lg shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-slate-200 dark:border-slate-700 bg-white max-w-full max-h-[360px] object-contain transition-all ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  style={{
                    aspectRatio: `${selectedPreset.widthMm} / ${selectedPreset.heightMm}`,
                  }}
                />

                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 font-medium">
                  💡 Drag on the photo to center face inside the biometric guide.
                </span>
              </div>
            )}
          </div>

          {/* Quick Photo Source Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 h-10 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
            >
              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Upload Photo</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={startCamera}
              className="gap-2 h-10 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
            >
              <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Live Camera</span>
            </Button>
          </div>

          {/* Canvas Direct Adjustment Sliders */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3.5">
            {/* Zoom Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Zoom Scale</span>
                </span>
                <span className="font-mono text-slate-500">{Math.round(transform.zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTransform((p) => ({ ...p, zoom: Math.max(0.5, p.zoom - 0.1) }))}
                  className="h-7 w-7 rounded-lg"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={transform.zoom}
                  onChange={(e) => setTransform({ ...transform, zoom: parseFloat(e.target.value) })}
                  className="flex-1 accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTransform((p) => ({ ...p, zoom: Math.min(3.0, p.zoom + 0.1) }))}
                  className="h-7 w-7 rounded-lg"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Rotation & Flip Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Rotation (Straighten)</span>
                  <span className="font-mono text-slate-500">{transform.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="0.5"
                  value={transform.rotation}
                  onChange={(e) => setTransform({ ...transform, rotation: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransform((p) => ({ ...p, rotation: (p.rotation - 90) % 360 }))}
                  className="text-xs h-8 rounded-lg gap-1 border-slate-200 dark:border-slate-800"
                  title="Rotate 90 degrees Left"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>-90°</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransform((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))}
                  className="text-xs h-8 rounded-lg gap-1 border-slate-200 dark:border-slate-800"
                  title="Rotate 90 degrees Right"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>+90°</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransform((p) => ({ ...p, flipH: !p.flipH }))}
                  className={`text-xs h-8 rounded-lg gap-1 border-slate-200 dark:border-slate-800 ${
                    transform.flipH ? "bg-blue-50 text-blue-600 font-bold" : ""
                  }`}
                  title="Mirror Photo Horizontally"
                >
                  <FlipHorizontal className="h-3 w-3" />
                  <span>Mirror</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Presets, Name on Photo, Print & PDF Options, Retouch */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Preset Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <h2 className="font-headings text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Country & Document Requirements</span>
              <span className="text-[11px] font-normal text-slate-500">
                {PASSPORT_PRESETS.length} Standards
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {PASSPORT_PRESETS.map((preset) => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 shadow-xs ring-1 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{preset.flag}</span>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                        {preset.country}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                        {preset.document}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block">
                        {preset.widthMm} x {preset.heightMm} mm
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <span className="font-bold text-blue-700 dark:text-blue-400 block">
                Official Guideline:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {selectedPreset.notes}
              </p>
            </div>
          </div>

          {/* Card 2: Photo Name & Date Overlay (Government Exam & Admit Card Standard) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-headings text-sm font-bold text-slate-900 dark:text-white">
                  Name & Date on Photo
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={nameOverlay.enabled}
                  onChange={(e) =>
                    setNameOverlay((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Required for government exams (SSC CGL/CHSL, NEET, UPSC, Railway, Police) and official application admit cards.
            </p>

            {nameOverlay.enabled && (
              <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Applicant Full Name</span>
                    <span className="text-[10px] text-slate-400 font-normal">UPPERCASE</span>
                  </label>
                  <input
                    type="text"
                    value={nameOverlay.name}
                    onChange={(e) =>
                      setNameOverlay((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g. ANIL SHARMA"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>Photo Date (DOP)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSetTodayDate}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Set Today
                    </button>
                  </div>
                  <input
                    type="text"
                    value={nameOverlay.date}
                    onChange={(e) =>
                      setNameOverlay((prev) => ({ ...prev, date: e.target.value }))
                    }
                    placeholder="e.g. DOP: 15/10/2026"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Print Sheet & PDF Configuration */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headings text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Print & PDF Sheet Layout</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {sheetLayout.photosToRender} Photo(s) Active
              </span>
            </div>

            {/* Paper Size Selector */}
            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
                Paper Size (Exact Physical Dimensions)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRINT_PAPERS.map((paper) => {
                  const isSelected = selectedPaper.id === paper.id;
                  return (
                    <button
                      key={paper.id}
                      type="button"
                      onClick={() => {
                        setSelectedPaper(paper);
                        setRequestedPhotoCount(0); // reset to fill
                      }}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 shadow-xs ring-1 ring-blue-500/20"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                        {paper.id === "single" ? "Single 1-Up" : paper.id === "letter" ? "US Letter" : paper.name.split(" ")[0] + " " + paper.name.split(" ")[1]}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate">
                        {paper.id === "single" ? "Cut Size" : `${paper.widthInches}x${paper.heightInches}"`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Number of Photos to Print */}
            {selectedPaper.id !== "single" && (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                  <span>Number of Photos to Print</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Max capacity: {sheetLayout.totalCapacity}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[2, 4, 6, 8, 12]
                    .filter((cnt) => cnt <= sheetLayout.totalCapacity)
                    .map((count) => {
                      const isActive = requestedPhotoCount === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setRequestedPhotoCount(count)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isActive
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {count} Photos
                        </button>
                      );
                    })}
                  <button
                    type="button"
                    onClick={() => setRequestedPhotoCount(0)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      requestedPhotoCount === 0 || requestedPhotoCount >= sheetLayout.totalCapacity
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Fill Sheet ({sheetLayout.totalCapacity})
                  </button>
                </div>
              </div>
            )}

            {/* Direct Export Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={downloadPrintSheetPdf}
                disabled={isExportingPdf}
                className="w-full gap-2 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 text-xs"
              >
                <FileText className="h-4 w-4" />
                <span>
                  {isExportingPdf
                    ? "Generating Printable PDF..."
                    : `Download Print-Ready PDF (${sheetLayout.photosToRender} Photos)`}
                </span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPrintSheetJpg}
                  className="gap-1.5 h-9 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                  <span>Download JPG Sheet</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSinglePhoto}
                  className="gap-1.5 h-9 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Single Photo (300 DPI)</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Card 4: Background Color & Image Tuning */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5">
            <h2 className="font-headings text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Background Tint & Retouch</span>
              <span className="text-[11px] font-normal text-slate-400">Client-Side Canvas</span>
            </h2>

            {/* Background Color Swatches */}
            <div>
              <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
                Background Tint / Fill
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: "White", hex: "#FFFFFF" },
                  { label: "Off-White", hex: "#F8FAFC" },
                  { label: "Light Grey", hex: "#E2E8F0" },
                  { label: "Light Blue", hex: "#DBEAFE" },
                  { label: "Cream", hex: "#FEF3C7" },
                ].map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => setTransform({ ...transform, bgColor: swatch.hex })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                      transform.bgColor === swatch.hex
                        ? "border-blue-500 ring-2 ring-blue-500/20 font-bold"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-600"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span>{swatch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Brightness & Contrast */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono">{transform.brightness > 0 ? `+${transform.brightness}` : transform.brightness}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={transform.brightness}
                  onChange={(e) => setTransform({ ...transform, brightness: parseInt(e.target.value, 10) })}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono">{transform.contrast > 0 ? `+${transform.contrast}` : transform.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={transform.contrast}
                  onChange={(e) => setTransform({ ...transform, contrast: parseInt(e.target.value, 10) })}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Privacy & Quality Guarantee */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% In-Browser Privacy Protection</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Biometric photos and PDFs are generated directly in your browser using HTML5 Canvas & pdf-lib. Facial images are never transmitted or stored on external servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
