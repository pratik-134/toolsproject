"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  stripMetadata,
  detectFileType,
  StripResult,
} from "./logic";
import {
  ShieldAlert,
  ShieldCheck,
  Upload,
  Download,
  FileCheck2,
  Trash2,
  Sparkles,
  Layers,
  FileImage,
  AlertCircle,
} from "lucide-react";

export default function MetadataStripperTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [detectedType, setDetectedType] = useState<string>("");
  const [stripResult, setStripResult] = useState<StripResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Generate sample JPEG file with embedded metadata
  const loadSampleFile = useCallback(() => {
    // Generate synthetic JPEG buffer with APP1 (EXIF) and COM markers
    const syntheticJpeg = new Uint8Array([
      0xff, 0xd8, // SOI
      0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, // APP0 JFIF
      0xff, 0xe1, 0x00, 0x1c, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, // APP1 EXIF (Orientation + Camera)
      0xff, 0xfe, 0x00, 0x15, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x64, 0x20, 0x77, 0x69, 0x74, 0x68, 0x20, 0x6d, 0x69, 0x6e, 0x64, 0x6b, 0x69, 0x74, // COM Comment
      0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, // SOS
      0xfc, 0xd7, 0x54, 0x89, // sample scan data
      0xff, 0xd9, // EOI
    ]);

    setFileBuffer(syntheticJpeg);
    setFileName("sample-photo-with-exif.jpg");
    setDetectedType("jpeg");
    setStripResult(null);
  }, []);

  const handleFileUpload = (uploadedFile: File) => {
    setFileName(uploadedFile.name);
    setFile(uploadedFile);
    setStripResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        const uint8 = new Uint8Array(arrayBuffer);
        setFileBuffer(uint8);
        setDetectedType(detectFileType(uint8));
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleSanitize = () => {
    if (!fileBuffer) return;
    setIsProcessing(true);

    setTimeout(() => {
      const result = stripMetadata(fileBuffer);
      setStripResult(result);
      setIsProcessing(false);
    }, 150);
  };

  const handleDownload = () => {
    if (!stripResult) return;
    const blob = new Blob([stripResult.sanitizedBuffer as unknown as BlobPart], {
      type: stripResult.fileType === "jpeg" ? "image/jpeg" : "image/png",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sanitized-${fileName || "clean-file"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy Guarantee Badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Privacy Sanitization — File bytes are processed directly in device RAM with zero network uploads.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Inspection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileImage className="w-4 h-4 text-primary" />
                Target File
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSampleFile}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sample File
              </Button>
            </div>

            {/* Drag & Drop or Upload area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) handleFileUpload(dropped);
              }}
              className="flex flex-col items-center justify-center p-6 bg-muted/20 border border-dashed border-border rounded-xl space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const uploaded = e.target.files?.[0];
                  if (uploaded) handleFileUpload(uploaded);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Select Photo or Image
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                Supports JPEG and PNG images with embedded GPS, EXIF, or IPTC metadata.
              </p>
            </div>

            {/* Loaded File Info Card */}
            {fileBuffer && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filename:</span>
                    <span className="font-medium text-foreground truncate max-w-[200px]">{fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-mono text-foreground uppercase">{detectedType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Size:</span>
                    <span className="font-mono text-foreground">
                      {(fileBuffer.length / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <Button
                  variant="default"
                  onClick={handleSanitize}
                  disabled={isProcessing}
                  className="w-full text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isProcessing ? "Scrubbing Metadata..." : "Scrub & Sanitize Metadata"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sanitization Audit Report */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-card border border-border rounded-xl min-h-[380px] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                  Privacy & Metadata Audit
                </span>
                {stripResult && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Sanitized
                  </span>
                )}
              </div>

              {/* Status Display */}
              {stripResult ? (
                <div className="space-y-4 pt-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Original</p>
                      <p className="text-xs font-mono font-semibold text-foreground">
                        {(stripResult.originalSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Cleaned</p>
                      <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {(stripResult.sanitizedSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="p-2.5 bg-muted/30 border border-border rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Overhead Removed</p>
                      <p className="text-xs font-mono font-semibold text-primary">
                        {Math.max(0, stripResult.originalSize - stripResult.sanitizedSize)} Bytes
                      </p>
                    </div>
                  </div>

                  {/* Removed Segments List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Stripped Metadata Segments:
                    </h4>
                    <div className="space-y-1.5">
                      {stripResult.removedTags.map((tag, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-300"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                  <ShieldCheck className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Upload an image or load the sample file, then click &ldquo;Scrub &amp; Sanitize Metadata&rdquo; to permanently remove GPS tracking coordinates, camera serial numbers, and EXIF headers.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Download Bar */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Zero network leakage guarantee
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                disabled={!stripResult}
                className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sanitized Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
