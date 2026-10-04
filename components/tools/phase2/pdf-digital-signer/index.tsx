"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Download,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileCheck,
  Trash2,
  PenTool,
  Type,
  ImageIcon,
  Eraser,
} from "lucide-react";
import {
  createSampleSignablePdf,
  signPdf,
  MINIMAL_PNG_BYTES,
} from "./logic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDFDocument } from "pdf-lib";

export default function PdfDigitalSignerTool() {
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);

  // Signing mode: 'draw' | 'type' | 'upload'
  const [mode, setMode] = useState<"draw" | "type" | "upload">("draw");
  const [typedName, setTypedName] = useState("Alex Morgan");
  const [signerName, setSignerName] = useState("Alex Morgan");
  const [signerTitle, setSignerTitle] = useState("Authorized Signatory");
  const [dateString, setDateString] = useState(
    new Date().toISOString().split("T")[0] ?? ""
  );

  // Placement
  const [targetPage, setTargetPage] = useState<number>(0);
  const [placement, setPlacement] = useState<"bottom-left" | "bottom-right" | "bottom-center">("bottom-left");

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);

  // Drawing canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadedSigBytes, setUploadedSigBytes] = useState<Uint8Array | null>(null);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    const clientY = "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    const clientY = "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSignedPdfUrl(null);
  };

  const dataUriToUint8Array = (dataUri: string): Uint8Array => {
    const parts = dataUri.split(",");
    const base64 = parts[1] ?? "";
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  };

  // Convert drawn or typed signature into PNG bytes
  const getSignaturePngBytes = async (): Promise<Uint8Array> => {
    if (mode === "upload" && uploadedSigBytes) {
      return uploadedSigBytes;
    }

    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL("image/png");
      return dataUriToUint8Array(dataUrl);
    }

    // Type mode: render calligraphic text onto an offscreen canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = 400;
    offscreen.height = 120;
    const ctx = offscreen.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, offscreen.width, offscreen.height);
      ctx.font = "italic 44px 'Brush Script MT', 'Segoe Script', cursive, sans-serif";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(typedName || "Signature", 20, 75);
    }
    const dataUrl = offscreen.toDataURL("image/png");
    return dataUriToUint8Array(dataUrl);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const arrayBuf = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuf);
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      setFileBuffer(buffer);
      setFileName(file.name);
      setFileSize(file.size);
      setPageCount(doc.getPageCount());
      setTargetPage(0);
      setSignedPdfUrl(null);
    } catch (err: any) {
      setError(`Failed to read PDF: ${err?.message || "Invalid or encrypted file"}`);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSigImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ab = await file.arrayBuffer();
      setUploadedSigBytes(new Uint8Array(ab));
    } catch {
      setError("Failed to read signature image.");
    }
  };

  const handleLoadSample = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const sample = await createSampleSignablePdf();
      const doc = await PDFDocument.load(sample);

      setFileBuffer(sample);
      setFileName("Consulting_Agreement_Signable.pdf");
      setFileSize(sample.length);
      setPageCount(doc.getPageCount());
      setTargetPage(0);
      setSignedPdfUrl(null);
    } catch (err: any) {
      setError(`Failed to load sample: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSign = async () => {
    if (!fileBuffer) return;
    setError(null);
    setIsProcessing(true);

    try {
      const sigBytes = await getSignaturePngBytes();

      let x = 60;
      let y = 100;
      if (placement === "bottom-right") {
        x = 380;
        y = 100;
      } else if (placement === "bottom-center") {
        x = 220;
        y = 100;
      }

      const signed = await signPdf(fileBuffer, {
        signaturePngBytes: sigBytes,
        signerName,
        signerTitle,
        dateString,
        pageIndex: targetPage,
        x,
        y,
        width: 150,
        height: 50,
      });

      const blob = new Blob([signed as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setSignedPdfUrl(url);
    } catch (err: any) {
      setError(`Signing failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const resetAll = () => {
    setFileBuffer(null);
    setFileName("");
    setFileSize(0);
    setPageCount(0);
    setSignedPdfUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs md:text-sm text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Privacy:</strong> Signatures and contracts are stamped locally in your browser. Signature images and PDF files are never uploaded.
          </span>
        </div>
        <button
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Demo Contract
        </button>
      </div>

      {/* Upload Zone */}
      {!fileBuffer ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <PenTool className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Click to upload or drag & drop a PDF
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Draw, type, or upload your signature to place on any document page.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* File Card */
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {fileName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(fileSize)} • {pageCount} Pages
              </p>
            </div>
          </div>
          <button
            onClick={resetAll}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Remove document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Signing Workspace */}
      {fileBuffer && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMode("draw")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === "draw"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Draw Signature
            </button>
            <button
              onClick={() => setMode("type")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === "type"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Type Name
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === "upload"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Upload Image
            </button>
          </div>

          {/* Signature Creation Panel */}
          {mode === "draw" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Draw your signature below
                </label>
                <button
                  onClick={clearCanvas}
                  className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 flex items-center gap-1"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
              <div className="border border-slate-300 dark:border-slate-700 rounded-xl bg-white overflow-hidden shadow-inner flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair touch-none w-full max-w-[420px]"
                />
              </div>
            </div>
          )}

          {mode === "type" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Type your full signature name
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                <span
                  style={{
                    fontFamily: "'Brush Script MT', 'Segoe Script', cursive, sans-serif",
                  }}
                  className="text-3xl text-slate-800 dark:text-slate-100 italic"
                >
                  {typedName || "Signature Preview"}
                </span>
              </div>
            </div>
          )}

          {mode === "upload" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Upload signature image (PNG recommended)
              </label>
              <input
                ref={sigImageInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleSigImageUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          )}

          {/* Signer Metadata & Placement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Signer Printed Name
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Title / Capacity
              </label>
              <input
                type="text"
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Date
              </label>
              <input
                type="date"
                value={dateString}
                onChange={(e) => setDateString(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Placement
              </label>
              <Select
                value={placement}
                onValueChange={(v) => setPlacement(v as any)}
              >
                <SelectTrigger className="w-full h-8 text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <button
            onClick={handleSign}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Signing & Stamping Document in Memory...
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4" />
                Sign Document (Page {targetPage + 1})
              </>
            )}
          </button>
        </div>
      )}

      {/* Result Panel */}
      {signedPdfUrl && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                PDF Signed Successfully!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Signature and verification metadata embedded onto Page {targetPage + 1}.
              </p>
            </div>
          </div>
          <a
            href={signedPdfUrl}
            download={`signed-${fileName || "document.pdf"}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Download Signed PDF
          </a>
        </div>
      )}
    </div>
  );
}
