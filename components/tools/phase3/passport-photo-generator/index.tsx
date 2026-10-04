"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Printer,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  User,
  Sliders,
  Info,
  ShieldCheck,
  Grid,
  Crop,
  Scissors,
  Square,
  Maximize2,
} from "lucide-react";

export default function PassportPhotoGeneratorTool() {
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]!);
  const [selectedPaper, setSelectedPaper] = useState<PrintPaperFormat>(PRINT_PAPERS[1]!); // Default 4x6"
  const [requestedPhotoCount, setRequestedPhotoCount] = useState<number>(0); // 0 = Fill Sheet
  const [viewMode, setViewMode] = useState<"single" | "sheet">("single");
  const [nameOverlay, setNameOverlay] = useState<NameOverlayConfig>(DEFAULT_NAME_OVERLAY);
  const [activeTab, setActiveTab] = useState<"print" | "name" | "retouch">("print");
  const [transform, setTransform] = useState<PhotoTransform>({
    ...DEFAULT_TRANSFORM,
    bgColor: PASSPORT_PRESETS[0]!.bgColor,
  });

  // Border & Spacing Customization Controls
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [borderWidth, setBorderWidth] = useState<number>(1);
  const [borderColor, setBorderColor] = useState<string>("rgba(203, 213, 225, 0.9)");
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [spacingMode, setSpacingMode] = useState<"auto" | "custom">("auto");
  const [customSpacingMm, setCustomSpacingMm] = useState<number>(2);

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

  // Initialize with original sample portrait
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImageElement(img);
    img.src = "/images/samples/passport-sample.jpg";
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

  // Active Spacing in mm
  const activeSpacingMm = spacingMode === "custom" ? customSpacingMm : undefined;

  // Compute Layout for the Sheet
  const sheetLayout = computePrintSheetLayout(
    selectedPaper,
    selectedPreset,
    requestedPhotoCount > 0 ? requestedPhotoCount : undefined,
    activeSpacingMm
  );

  // Generate Print Sheet Canvas
  const generatePrintSheetCanvas = useCallback((): HTMLCanvasElement | null => {
    if (!imageElement) return null;

    // 1. Render single photo to an offscreen clean canvas
    const singleCanvas = document.createElement("canvas");
    renderSinglePhotoToCanvas(singleCanvas, false);

    // 2. Compute Sheet Layout
    const activeSpacing = spacingMode === "custom" ? customSpacingMm : undefined;
    const layout = computePrintSheetLayout(
      selectedPaper,
      selectedPreset,
      requestedPhotoCount > 0 ? requestedPhotoCount : undefined,
      activeSpacing
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
      if (showBorder) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(0, 0, printCanvas.width, printCanvas.height);
      }
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

        // Draw border if enabled by user
        if (showBorder) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderWidth;
          ctx.strokeRect(x, y, layout.cellWidthPx, layout.cellHeightPx);
        }

        // Draw corner crop marks for scissors / cutter if enabled
        if (showCropMarks) {
          drawCropMarks(ctx, x, y, layout.cellWidthPx, layout.cellHeightPx, 18);
        }
        drawn++;
      }
      if (drawn >= layout.photosToRender) break;
    }

    return printCanvas;
  }, [
    imageElement,
    renderSinglePhotoToCanvas,
    selectedPaper,
    selectedPreset,
    requestedPhotoCount,
    spacingMode,
    customSpacingMm,
    showBorder,
    borderWidth,
    borderColor,
    showCropMarks,
  ]);

  // Print Sheet Directly via Native Browser Print Dialog
  const printSheetDirectly = () => {
    const printCanvas = generatePrintSheetCanvas();
    if (!printCanvas) return;

    const dataUrl = printCanvas.toDataURL("image/jpeg", 0.98);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Passport Photos - ${selectedPreset.country}</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #fff;
            }
            img {
              width: 100%;
              height: auto;
              max-height: 100vh;
              object-fit: contain;
              display: block;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              img {
                width: 100%;
                height: 100%;
                max-height: none;
                object-fit: contain;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Passport Photo Sheet" />
        </body>
      </html>
    `);
    iframeDoc.close();

    const img = iframeDoc.querySelector("img");
    const triggerPrint = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Print error:", e);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }
      }, 250);
    };

    if (img?.complete) {
      triggerPrint();
    } else if (img) {
      img.onload = triggerPrint;
    }
  };

  // Render Interactive Canvas for the UI (Single photo framing OR Full sheet preview)
  useEffect(() => {
    if (!canvasRef.current || !imageElement) return;

    if (viewMode === "single") {
      renderSinglePhotoToCanvas(canvasRef.current, showBiometricGuide);
    } else {
      const sheetCanvas = generatePrintSheetCanvas();
      if (!sheetCanvas) return;
      const targetCanvas = canvasRef.current;
      targetCanvas.width = sheetCanvas.width;
      targetCanvas.height = sheetCanvas.height;
      const ctx = targetCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        ctx.drawImage(sheetCanvas, 0, 0);
      }
    }
  }, [
    viewMode,
    renderSinglePhotoToCanvas,
    generatePrintSheetCanvas,
    showBiometricGuide,
    imageElement,
    selectedPaper,
    selectedPreset,
    requestedPhotoCount,
  ]);

  // Download Single Photo (Exact 300 DPI specification)
  const downloadSinglePhoto = () => {
    const exportCanvas = document.createElement("canvas");
    renderSinglePhotoToCanvas(exportCanvas, false);

    if (showBorder) {
      const ctx = exportCanvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(0, 0, exportCanvas.width, exportCanvas.height);
      }
    }

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
      const base64Data = dataUrl.split(",")[1] || "";
      const binaryString = atob(base64Data);
      const imageBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imageBytes[i] = binaryString.charCodeAt(i);
      }

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
    <div className="w-full space-y-6">
      {/* Top Bar: Country & Document Preset Dropdown + Quick Source Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="lg:col-span-7 space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Country & Document Specification
            </label>
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
              {selectedPreset.widthMm} x {selectedPreset.heightMm} mm ({selectedPreset.widthInches}x{selectedPreset.heightInches}") · 300 DPI
            </span>
          </div>

          <Select
            value={selectedPreset.id}
            onValueChange={(val) => {
              const found = PASSPORT_PRESETS.find((p) => p.id === val);
              if (found) handleSelectPreset(found);
            }}
          >
            <SelectTrigger className="w-full h-10 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs">
              <SelectValue placeholder="Select Country Document Specification..." />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {PASSPORT_PRESETS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  [{p.code}] {p.country} — {p.document} ({p.widthMm} x {p.heightMm} mm)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
            {selectedPreset.notes}
          </p>
        </div>

        {/* Photo Input Controls */}
        <div className="lg:col-span-5 flex items-center justify-start lg:justify-end gap-2 pt-2 lg:pt-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-4 rounded-xl text-xs font-semibold gap-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="whitespace-nowrap">Upload Photo</span>
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
            size="sm"
            onClick={startCamera}
            className="h-10 px-4 rounded-xl text-xs font-semibold gap-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Live Camera</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTransform({ ...DEFAULT_TRANSFORM, bgColor: selectedPreset.bgColor });
              setNameOverlay(DEFAULT_NAME_OVERLAY);
              setRequestedPhotoCount(0);
            }}
            className="h-10 px-3 rounded-xl text-xs gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 whitespace-nowrap shrink-0"
            title="Reset All Adjustments"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Studio Area: Left Visual Studio, Right Tabbed Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Framing Canvas & Fine Framing */}
        <div className="lg:col-span-7 space-y-4">
          {/* Canvas Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            {/* Top Bar above Canvas: Preset Info & View Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-6 px-2 items-center justify-center rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300 shrink-0 whitespace-nowrap">
                  {selectedPreset.code}
                </span>
                <span className="font-headings text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate whitespace-nowrap">
                  {viewMode === "single"
                    ? `${selectedPreset.country} (${selectedPreset.widthMm} x ${selectedPreset.heightMm} mm)`
                    : `Print Sheet · ${selectedPaper.name} (${sheetLayout.photosToRender} Photos)`}
                </span>
              </div>

              {/* View Mode Segmented Switcher & Quick Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("single")}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      viewMode === "single"
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <Crop className="h-3 w-3 shrink-0" />
                    <span className="whitespace-nowrap">Single Framing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("sheet")}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      viewMode === "sheet"
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <Grid className="h-3 w-3 shrink-0" />
                    <span className="whitespace-nowrap">Sheet Preview ({sheetLayout.photosToRender})</span>
                  </button>
                </div>

                {viewMode === "single" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBiometricGuide(!showBiometricGuide)}
                    className={`gap-1 text-xs h-7 px-2 rounded-lg whitespace-nowrap shrink-0 ${
                      showBiometricGuide
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title="Toggle Biometric Head & Eye Guides"
                  >
                    {showBiometricGuide ? <Eye className="h-3.5 w-3.5 shrink-0" /> : <EyeOff className="h-3.5 w-3.5 shrink-0" />}
                    <span className="hidden sm:inline whitespace-nowrap">Guide</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={printSheetDirectly}
                    className="gap-1.5 text-xs h-7 px-2.5 rounded-lg border-blue-300 dark:border-blue-700 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold whitespace-nowrap shrink-0"
                    title="Print this sheet now"
                  >
                    <Printer className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="whitespace-nowrap">Print Now</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Interactive Canvas Viewport */}
            <div className="relative flex flex-col items-center justify-center p-4 bg-slate-100/70 dark:bg-slate-950/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 min-h-[420px] overflow-hidden select-none">
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
                /* Canvas with Drag Handlers for Single Mode, or Crisp Sheet Preview */
                <div className="relative flex flex-col items-center">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={viewMode === "single" ? handleMouseDown : undefined}
                    onMouseMove={viewMode === "single" ? handleMouseMove : undefined}
                    onMouseUp={viewMode === "single" ? handleMouseUp : undefined}
                    onMouseLeave={viewMode === "single" ? handleMouseUp : undefined}
                    className={`rounded-lg shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-slate-200 dark:border-slate-700 bg-white max-w-full max-h-[380px] sm:max-h-[440px] object-contain transition-all ${
                      viewMode === "single"
                        ? isDragging
                          ? "cursor-grabbing"
                          : "cursor-grab"
                        : "cursor-default"
                    }`}
                    style={{
                      aspectRatio:
                        viewMode === "single"
                          ? `${selectedPreset.widthMm} / ${selectedPreset.heightMm}`
                          : `${selectedPaper.targetWidthPx || selectedPreset.targetWidthPx} / ${
                              selectedPaper.targetHeightPx || selectedPreset.targetHeightPx
                            }`,
                    }}
                  />

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-medium">
                    <Info className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span>
                      {viewMode === "single"
                        ? "Drag directly on photo to center face inside the biometric guide."
                        : `Live sheet preview (${selectedPaper.name}) with precision scissor cut marks and 300 DPI margins.`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-Canvas Controls: Single Mode Framing Adjustments OR Sheet Mode Action Bar */}
            {viewMode === "single" ? (
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
                      className="h-8 w-8 rounded-lg"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
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
                      className="h-8 w-8 rounded-lg"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Rotation & Flip Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                  <div className="sm:col-span-7">
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

                  <div className="sm:col-span-5 flex items-center justify-start sm:justify-end gap-1.5 pt-1 sm:pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTransform((p) => ({ ...p, rotation: (p.rotation - 90) % 360 }))}
                      className="text-xs h-8 px-2.5 rounded-lg gap-1 border-slate-200 dark:border-slate-800 whitespace-nowrap shrink-0"
                      title="Rotate 90 degrees Left"
                    >
                      <RotateCcw className="h-3 w-3 shrink-0" />
                      <span className="whitespace-nowrap">-90°</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTransform((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))}
                      className="text-xs h-8 px-2.5 rounded-lg gap-1 border-slate-200 dark:border-slate-800 whitespace-nowrap shrink-0"
                      title="Rotate 90 degrees Right"
                    >
                      <RotateCw className="h-3 w-3 shrink-0" />
                      <span className="whitespace-nowrap">+90°</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTransform((p) => ({ ...p, flipH: !p.flipH }))}
                      className={`text-xs h-8 px-2.5 rounded-lg gap-1 border-slate-200 dark:border-slate-800 whitespace-nowrap shrink-0 ${
                        transform.flipH ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border-blue-300" : ""
                      }`}
                      title="Mirror Photo Horizontally"
                    >
                      <FlipHorizontal className="h-3 w-3 shrink-0" />
                      <span className="whitespace-nowrap">Mirror</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block whitespace-nowrap">
                      Ready for Physical Print & Cut
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                      {sheetLayout.photosToRender} copies on {selectedPaper.name} ({selectedPaper.widthInches}x{selectedPaper.heightInches}") · Standard 300 DPI
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("single")}
                    className="text-xs h-8 gap-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-semibold whitespace-nowrap shrink-0"
                  >
                    <Crop className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Adjust Framing</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <Button
                    onClick={printSheetDirectly}
                    className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs shadow-xs whitespace-nowrap justify-center"
                  >
                    <Printer className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Print Directly</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={downloadPrintSheetPdf}
                    disabled={isExportingPdf}
                    className="h-10 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold gap-1.5 whitespace-nowrap justify-center"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="whitespace-nowrap">{isExportingPdf ? "Compiling..." : "Save PDF"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={downloadPrintSheetJpg}
                    className="h-10 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold gap-1.5 whitespace-nowrap justify-center"
                  >
                    <Download className="h-3.5 w-3.5 shrink-0 text-slate-600 dark:text-slate-300" />
                    <span className="whitespace-nowrap">Save JPG</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Clean Tabbed Configuration & Instant Exports */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tab Navigation Bar */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setActiveTab("print")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "print"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Print & PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("name")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "name"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Name on Photo</span>
              {nameOverlay.enabled && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ml-0.5 shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("retouch")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "retouch"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Sliders className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">Retouch</span>
            </button>
          </div>

          {/* Tab 1: Print & PDF Sheet Layout */}
          {activeTab === "print" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-headings text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    Print Sheet Configuration
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Multi-up photo sheet with individual crop cutting marks
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0">
                  {sheetLayout.photosToRender} Active Photos
                </span>
              </div>

              {/* Paper Format Selector */}
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2 whitespace-nowrap">
                  Paper Size (Exact Scale)
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
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/60 shadow-xs ring-1 ring-blue-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <span className="font-bold text-xs text-slate-900 dark:text-white block truncate whitespace-nowrap">
                          {paper.id === "single" ? "Single 1-Up" : paper.id === "letter" ? "US Letter" : paper.name.split(" ")[0] + " " + paper.name.split(" ")[1]}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block truncate whitespace-nowrap">
                          {paper.id === "single" ? "Cut Size" : `${paper.widthInches}x${paper.heightInches}"`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of Photos Selector */}
              {selectedPaper.id !== "single" && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 whitespace-nowrap">
                    <span>Number of Photos to Print</span>
                    <span className="font-mono text-[11px] text-slate-500 font-normal whitespace-nowrap">
                      Sheet holds up to {sheetLayout.totalCapacity}
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
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

              {/* Photo Spacing & Gap Configuration */}
              {selectedPaper.id !== "single" && (
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      Photo Spacing (Gap)
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-normal whitespace-nowrap">
                      {spacingMode === "auto" ? "Auto Fit" : `${customSpacingMm} mm (${sheetLayout.gapPx}px)`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSpacingMode("auto")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
                        spacingMode === "auto"
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      Auto (Fit Max)
                    </button>
                    {[0, 1, 2, 3, 5].map((mm) => {
                      const isActive = spacingMode === "custom" && customSpacingMm === mm;
                      return (
                        <button
                          key={mm}
                          type="button"
                          onClick={() => {
                            setSpacingMode("custom");
                            setCustomSpacingMm(mm);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
                            isActive
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {mm === 0 ? "0 mm (None)" : `${mm} mm`}
                        </button>
                      );
                    })}
                  </div>

                  {spacingMode === "custom" && (
                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={customSpacingMm}
                        onChange={(e) => setCustomSpacingMm(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0 w-12 text-right">
                        {customSpacingMm.toFixed(1)} mm
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Photo Border & Cut Guides Configuration */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <Scissors className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    Border & Cut Guides
                  </span>
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showBorder}
                      onChange={(e) => setShowBorder(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Include Photo Border Line</span>
                  </label>

                  {showBorder && (
                    <div className="pl-6 space-y-2 pt-0.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                        <span className="font-medium whitespace-nowrap">Width:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { label: "1px (Thin)", val: 1 },
                            { label: "2px (Medium)", val: 2 },
                            { label: "3px (Thick)", val: 3 },
                          ].map((b) => (
                            <button
                              key={b.val}
                              type="button"
                              onClick={() => setBorderWidth(b.val)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all whitespace-nowrap ${
                                borderWidth === b.val
                                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                        <span className="font-medium whitespace-nowrap">Color:</span>
                        <div className="flex items-center gap-1">
                          {[
                            { label: "Light Gray", val: "rgba(203, 213, 225, 0.9)" },
                            { label: "Slate", val: "#64748B" },
                            { label: "Dark", val: "#0F172A" },
                            { label: "White", val: "#FFFFFF" },
                          ].map((c) => (
                            <button
                              key={c.label}
                              type="button"
                              onClick={() => setBorderColor(c.val)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all whitespace-nowrap ${
                                borderColor === c.val
                                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaper.id !== "single" && (
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={showCropMarks}
                        onChange={(e) => setShowCropMarks(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span>Include Corner Crop Marks (Cutting Guides)</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Export & Print Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={downloadPrintSheetPdf}
                  disabled={isExportingPdf}
                  className="w-full gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 text-xs sm:text-sm whitespace-nowrap justify-center"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate whitespace-nowrap">
                    {isExportingPdf
                      ? "Compiling PDF..."
                      : `Download Print-Ready PDF (${sheetLayout.photosToRender} Photos)`}
                  </span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={printSheetDirectly}
                    className="gap-1.5 h-10 rounded-xl border-blue-400/80 dark:border-blue-700 bg-blue-50/70 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold shadow-xs text-xs whitespace-nowrap justify-center"
                  >
                    <Printer className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="truncate whitespace-nowrap">Print Sheet</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadPrintSheetJpg}
                    className="gap-1.5 h-10 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold whitespace-nowrap justify-center"
                  >
                    <Download className="h-3.5 w-3.5 shrink-0 text-slate-600 dark:text-slate-300" />
                    <span className="truncate whitespace-nowrap">Sheet JPG</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSinglePhoto}
                    className="gap-1.5 h-9 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold whitespace-nowrap justify-center"
                  >
                    <Download className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="truncate whitespace-nowrap">Single Photo</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "single" ? "sheet" : "single")}
                    className="gap-1.5 h-9 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap justify-center"
                  >
                    {viewMode === "single" ? (
                      <>
                        <Grid className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span className="truncate whitespace-nowrap">Sheet Preview</span>
                      </>
                    ) : (
                      <>
                        <Crop className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span className="truncate whitespace-nowrap">Photo Framing</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Name & Date on Photo (Exam / Visa Standard) */}
          {activeTab === "name" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-headings text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    Name & Date on Photo
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Official white bottom strip for exams and admit cards
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
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

              {nameOverlay.enabled ? (
                <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 whitespace-nowrap">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        Applicant Full Name
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">UPPERCASE</span>
                    </div>
                    <input
                      type="text"
                      value={nameOverlay.name}
                      onChange={(e) =>
                        setNameOverlay((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))
                      }
                      placeholder="e.g. ANIL SHARMA"
                      className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 whitespace-nowrap">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="whitespace-nowrap">Date of Photo (DOP)</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSetTodayDate}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold whitespace-nowrap"
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
                      className="w-full h-10 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                    Standard government admit cards (SSC CGL/CHSL, NEET, UPSC, Railway, Police Recruitment) require the candidate's name and photo date clearly visible on a white bottom strip.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    Toggle on to automatically render your Name and Photo Date on a standardized white strip at the bottom of the photo.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Retouch & Background Tuning */}
          {activeTab === "retouch" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-headings text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                  Color Retouch & Background Tint
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Adjust brightness, contrast, and backdrop fill
                </p>
              </div>

              {/* Background Color Swatches */}
              <div className="pt-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2 whitespace-nowrap">
                  Background Color
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                        transform.bgColor === swatch.hex
                          ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 ring-1 ring-blue-500/20 font-bold"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span className="whitespace-nowrap">{swatch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Brightness & Contrast */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                    <span className="whitespace-nowrap">Brightness</span>
                    <span className="font-mono whitespace-nowrap">{transform.brightness > 0 ? `+${transform.brightness}` : transform.brightness}</span>
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
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                    <span className="whitespace-nowrap">Contrast</span>
                    <span className="font-mono whitespace-nowrap">{transform.contrast > 0 ? `+${transform.contrast}` : transform.contrast}</span>
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
          )}

          {/* Privacy Trust Card */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Client-Side RAM Processing</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Biometric photos and PDFs are generated directly in your browser using HTML5 Canvas & pdf-lib. No images are sent to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
