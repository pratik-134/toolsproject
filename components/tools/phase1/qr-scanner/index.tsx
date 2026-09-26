"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  scanQRCode,
  parseQRPayload,
  QRScanResult,
  ParsedQRPayload,
  ImageDataLike,
} from "./logic";
import {
  QrCode,
  Upload,
  Camera,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Wifi,
  User,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  CameraOff,
} from "lucide-react";

interface QRPreset {
  name: string;
  type: string;
  payload: string;
  description: string;
}

const PRESETS: QRPreset[] = [
  {
    name: "Mindkit Web Platform",
    type: "URL",
    payload: "https://mindkit.dev/tools",
    description: "Standard web URL link",
  },
  {
    name: "Home Wi-Fi Network",
    type: "Wi-Fi",
    payload: "WIFI:S:Mindkit_Office_5G;T:WPA;P:FastSecurePass2026;H:false;;",
    description: "Instant Wi-Fi login configuration",
  },
  {
    name: "Executive vCard",
    type: "Contact",
    payload:
      "BEGIN:VCARD\nVERSION:3.0\nFN:Alex Mercer\nTITLE:Chief Technology Officer\nORG:Mindkit Systems\nTEL:+1-555-839-2041\nEMAIL:alex@mindkit.dev\nURL:https://mindkit.dev\nEND:VCARD",
    description: "Digital business contact card",
  },
  {
    name: "Encrypted Token Note",
    type: "Text",
    payload: "MKT-AUTH-SECURE-TOKEN-99482-XYZ",
    description: "Alphanumeric plain text authentication string",
  },
];

export default function QRScannerTool() {
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload");
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const processImageData = (imgData: ImageDataLike, name?: string) => {
    setIsScanning(true);
    setFileName(name ?? null);

    try {
      const result = scanQRCode(imgData);
      setScanResult(result);
    } catch {
      setScanResult({
        found: false,
        error: "Failed to process image data.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageElement = (img: HTMLImageElement, name?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const rawData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    processImageData(
      {
        width: canvas.width,
        height: canvas.height,
        data: rawData.data,
      },
      name
    );
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setScanResult({
        found: false,
        error: "Please select an image file (PNG, JPG, WebP, SVG).",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => handleImageElement(img, file.name);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        scanIntervalRef.current = window.setInterval(() => {
          if (!videoRef.current || !canvasRef.current) return;
          const v = videoRef.current;
          const c = canvasRef.current;
          if (v.readyState !== v.HAVE_ENOUGH_DATA) return;

          c.width = v.videoWidth;
          c.height = v.videoHeight;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;

          ctx.drawImage(v, 0, 0, c.width, c.height);
          const raw = ctx.getImageData(0, 0, c.width, c.height);
          const res = scanQRCode({
            width: c.width,
            height: c.height,
            data: raw.data,
          });

          if (res.found && res.text) {
            setScanResult(res);
            stopCamera();
          }
        }, 300);
      }
    } catch {
      setCameraError(
        "Camera access denied or unavailable. Please grant permission or upload an image."
      );
      setCameraActive(false);
    }
  };

  const handleLoadPreset = (preset: QRPreset) => {
    stopCamera();
    setActiveTab("upload");

    const parsed = parseQRPayload(preset.payload);
    setScanResult({
      found: true,
      text: preset.payload,
      parsed,
      version: 3,
      ecLevel: "M",
      confidence: 0.99,
      details: `${preset.name} (${preset.description})`,
    });
    setFileName(`preset_${preset.type.toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`);
  };

  const copyText = (text: string, key: string = "main") => {
    navigator.clipboard.writeText(text);
    if (key === "main") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const renderParsedContent = (parsed?: ParsedQRPayload) => {
    if (!parsed) return null;

    switch (parsed.type) {
      case "wifi": {
        const w = parsed.wifi;
        if (!w) return null;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Wifi className="h-4 w-4" />
              <span>Wi-Fi Network Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 font-medium">Network SSID</span>
                <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>{w.ssid}</span>
                  <button
                    onClick={() => copyText(w.ssid, "ssid")}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {copiedKey === "ssid" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 font-medium">Security Type</span>
                <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                  {w.authType || "WPA/WPA2"}
                </div>
              </div>
            </div>

            {w.password && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 font-medium text-xs">Network Password</span>
                <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>{showPassword ? w.password : "•".repeat(w.password.length)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => copyText(w.password ?? "", "pwd")}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {copiedKey === "pwd" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case "vcard": {
        const v = parsed.vcard;
        if (!v) return null;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <User className="h-4 w-4" />
              <span>vCard Digital Contact</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {v.name && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium block mb-1">Full Name</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{v.name}</div>
                </div>
              )}
              {v.organization && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-medium block mb-1">Organization</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {v.organization}
                    {v.title ? ` — ${v.title}` : ""}
                  </div>
                </div>
              )}
              {v.phone && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-medium block mb-1">Phone</span>
                    <a
                      href={`tel:${v.phone}`}
                      className="font-mono font-bold text-primary hover:underline"
                    >
                      {v.phone}
                    </a>
                  </div>
                  <button
                    onClick={() => copyText(v.phone ?? "", "phone")}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {copiedKey === "phone" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
              {v.email && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-medium block mb-1">Email</span>
                    <a
                      href={`mailto:${v.email}`}
                      className="font-mono font-bold text-primary hover:underline truncate"
                    >
                      {v.email}
                    </a>
                  </div>
                  <button
                    onClick={() => copyText(v.email ?? "", "email")}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {copiedKey === "email" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }

      case "url": {
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ExternalLink className="h-4 w-4" />
              <span>Website URL Link</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-sm break-all font-bold text-primary">
              <a href={parsed.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {parsed.url}
              </a>
            </div>
          </div>
        );
      }

      default: {
        return (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Decoded Content
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-sm break-all select-all whitespace-pre-wrap text-slate-900 dark:text-slate-100">
              {parsed.raw}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <QrCode className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              QR Code Scanner & Reader
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            Scan and decode URLs, Wi-Fi keys, vCards, and plain text directly in your
            browser. 100% private, zero server uploads.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1.5 rounded-full w-fit">
          <ShieldCheck className="h-4 w-4" />
          <span>Local Device Processing</span>
        </div>
      </div>

      {/* Preset Quick-Test Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Try Sample QR Codes
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleLoadPreset(p)}
              className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 bg-white dark:bg-slate-900 transition-all text-xs group"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate">
                {p.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {p.type} • {p.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            stopCamera();
            setActiveTab("upload");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "upload"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload QR Image
        </button>
        <button
          onClick={() => {
            setActiveTab("camera");
            startCamera();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "camera"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Camera className="h-4 w-4" />
          Live Webcam Scanner
        </button>
      </div>

      {/* Upload View */}
      {activeTab === "upload" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {fileName ? fileName : "Click to upload or drag & drop QR code image"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PNG, JPG, WebP, SVG (All QR code versions)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Camera View */}
      {activeTab === "camera" && (
        <div className="relative overflow-hidden rounded-2xl bg-black border border-slate-800 aspect-video max-h-96 flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
          />

          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* QR Finder Target Box */}
              <div className="w-56 h-56 border-2 border-indigo-400 rounded-2xl relative shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />
                <div className="w-full h-0.5 bg-indigo-400/80 shadow-[0_0_8px_#818cf8] animate-pulse absolute top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {!cameraActive && !cameraError && (
            <div className="text-center p-6 space-y-3">
              <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-300">Starting camera sensor...</p>
            </div>
          )}

          {cameraError && (
            <div className="text-center p-6 space-y-3 text-rose-400">
              <CameraOff className="h-8 w-8 mx-auto" />
              <p className="text-sm">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg hover:bg-rose-500/30"
              >
                Retry Camera
              </button>
            </div>
          )}

          {cameraActive && (
            <button
              onClick={stopCamera}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 backdrop-blur-sm transition-all"
            >
              Stop Camera
            </button>
          )}
        </div>
      )}

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Results View */}
      {scanResult && (
        <div
          className={`p-6 rounded-2xl border transition-all ${
            scanResult.found
              ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800"
              : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
          }`}
        >
          {scanResult.found ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-200 dark:border-indigo-800/60">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="font-semibold text-indigo-950 dark:text-indigo-200 text-sm">
                    QR Code Decoded Successfully
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 uppercase">
                    {scanResult.parsed?.type || "Text"} Payload
                  </span>
                  {scanResult.version && (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                      Version {scanResult.version}
                    </span>
                  )}
                </div>
              </div>

              {/* Render Type-Specific Content */}
              {renderParsedContent(scanResult.parsed)}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => copyText(scanResult.text ?? "")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied Raw Text!" : "Copy Raw Content"}
                </button>

                {scanResult.parsed?.type === "url" && scanResult.parsed.url && (
                  <a
                    href={scanResult.parsed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Website
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-amber-950 dark:text-amber-200 text-sm">
                  No QR Code Detected
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  {scanResult.error ||
                    "Ensure the QR code is centered, well-focused, with all 3 finder corners visible."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          Smart Payload Recognition
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Mindkit automatically interprets QR code payload schemas on your device:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1 flex items-center gap-1">
              <Wifi className="h-3.5 w-3.5 text-primary" />
              Wi-Fi Direct Login
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Extracts SSID, WPA/WPA2/WEP security flags, and passwords for one-click connection.
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-primary" />
              vCard Contacts
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Extracts full names, phone numbers, email addresses, and company details.
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1 flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
              Direct URLs & Links
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Detects standard HTTP/HTTPS links without sending telemetry or clicks through third-party redirectors.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
