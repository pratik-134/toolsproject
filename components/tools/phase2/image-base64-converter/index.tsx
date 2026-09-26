"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  convertImageBytesToBase64,
  parseBase64DataUri,
  formatBase64Snippet,
  computeBase64Metrics,
} from "./logic";
import {
  FileCode,
  Upload,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
  FileImage,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Eye,
  Code2,
} from "lucide-react";

export default function ImageBase64ConverterTool() {
  const [activeTab, setActiveTab] = useState<"image-to-b64" | "b64-to-image">("image-to-b64");

  // Mode 1: Image to Base64
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState<string>("");
  const [snippetFormat, setSnippetFormat] = useState<"data-uri" | "css" | "html" | "markdown">("data-uri");
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  // Mode 2: Base64 to Image
  const [inputBase64, setInputBase64] = useState<string>("");
  const [decodedDataUri, setDecodedDataUri] = useState<string | null>(null);
  const [decodedMime, setDecodedMime] = useState<string>("image/png");
  const [decodedBytes, setDecodedBytes] = useState<Uint8Array | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Format code snippet
  const formattedSnippet = useMemo(() => {
    if (!dataUri) return "";
    return formatBase64Snippet(dataUri, snippetFormat, imageFile?.name || "image");
  }, [dataUri, snippetFormat, imageFile]);

  // Compute metrics
  const metrics = useMemo(() => {
    if (!imageFile || !dataUri) return null;
    return computeBase64Metrics(imageFile.size, dataUri.length);
  }, [imageFile, dataUri]);

  // Handle image upload
  const handleImageSelect = (file: File) => {
    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        const bytes = new Uint8Array(buffer);
        const uri = convertImageBytesToBase64(bytes, file.type || "image/png");
        setDataUri(uri);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      handleImageSelect(dropped);
    }
  };

  // Handle Base64 paste decoding
  const handleDecodeInput = (text: string) => {
    setInputBase64(text);
    setError(null);

    if (!text.trim()) {
      setDecodedDataUri(null);
      setDecodedBytes(null);
      return;
    }

    const res = parseBase64DataUri(text);
    if (res.valid && res.bytes) {
      setDecodedBytes(res.bytes);
      setDecodedMime(res.mimeType || "image/png");
      setDecodedDataUri(`data:${res.mimeType || "image/png"};base64,${res.base64Data}`);
    } else {
      setError(res.error || "Invalid Base64 string.");
      setDecodedDataUri(null);
      setDecodedBytes(null);
    }
  };

  const handleCopySnippet = async () => {
    if (!formattedSnippet) return;
    try {
      await navigator.clipboard.writeText(formattedSnippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadDecoded = () => {
    if (!decodedBytes) return;
    const blob = new Blob([decodedBytes.buffer as ArrayBuffer], { type: decodedMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    let ext = "png";
    if (decodedMime.includes("jpeg") || decodedMime.includes("jpg")) ext = "jpg";
    else if (decodedMime.includes("webp")) ext = "webp";
    else if (decodedMime.includes("svg")) ext = "svg";
    else if (decodedMime.includes("gif")) ext = "gif";
    a.download = `decoded_image.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetMode1 = () => {
    setImageFile(null);
    setDataUri("");
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">
            100% In-Browser Base64 Data URI Conversion • Zero Server Uploads
          </div>
        </div>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
          Client Sandboxed
        </span>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center justify-center">
        <div className="flex bg-muted/60 p-1 rounded-xl border">
          <button
            type="button"
            onClick={() => {
              setActiveTab("image-to-b64");
              setError(null);
            }}
            className={`flex items-center gap-2 px-6 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "image-to-b64"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileImage className="w-3.5 h-3.5" /> Image → Base64 Data URI
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("b64-to-image");
              setError(null);
            }}
            className={`flex items-center gap-2 px-6 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "b64-to-image"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Base64 → Image File
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode 1: Image to Base64 */}
      {activeTab === "image-to-b64" && (
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          {!imageFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 transition bg-muted/20 hover:bg-muted/40"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageSelect(f);
                }}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm text-foreground">Select or Drop an Image</p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPEG, WebP, SVG, GIF, ICO, or BMP
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header metrics */}
              <div className="p-4 bg-muted/30 border rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-lg bg-black/5 border overflow-hidden flex items-center justify-center shrink-0">
                    <img src={dataUri} alt="Thumbnail" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{imageFile.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Binary: {(imageFile.size / 1024).toFixed(1)} KB • Base64:{" "}
                      {(dataUri.length / 1024).toFixed(1)} KB
                      {metrics && <span> (+{metrics.overheadPercent}% overhead)</span>}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetMode1}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Choose Different Image
                </Button>
              </div>

              {/* Format selection ribbon */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border text-xs">
                    {(
                      [
                        { id: "data-uri", label: "Data URI" },
                        { id: "css", label: "CSS Background" },
                        { id: "html", label: "HTML <img>" },
                        { id: "markdown", label: "Markdown" },
                      ] as const
                    ).map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSnippetFormat(fmt.id)}
                        className={`px-3 py-1.5 rounded font-medium transition ${
                          snippetFormat === fmt.id
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handleCopySnippet}
                    size="sm"
                    className="gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
                  >
                    {copiedSnippet ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </Button>
                </div>

                {/* Snippet text */}
                <div className="relative">
                  <textarea
                    readOnly
                    value={formattedSnippet}
                    className="w-full h-44 p-3 font-mono text-xs bg-muted/10 border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 leading-relaxed break-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Base64 to Image */}
      {activeTab === "b64-to-image" && (
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Paste Base64 or Data URI String</span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {inputBase64.length.toLocaleString()} characters
              </span>
            </label>
            <textarea
              value={inputBase64}
              onChange={(e) => handleDecodeInput(e.target.value)}
              placeholder="Paste data:image/png;base64,... or raw Base64 string here..."
              className="w-full h-36 p-3 text-xs font-mono bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 break-all"
            />
          </div>

          {decodedDataUri && decodedBytes && (
            <div className="p-4 bg-muted/20 border rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg bg-black/5 border overflow-hidden flex items-center justify-center shrink-0">
                  <img src={decodedDataUri} alt="Decoded Preview" className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Decoded Image</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {(decodedBytes.length / 1024).toFixed(1)} KB • {decodedMime}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleDownloadDecoded}
                className="gap-2 bg-primary text-primary-foreground font-semibold"
              >
                <Download className="w-4 h-4" /> Download Image File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
