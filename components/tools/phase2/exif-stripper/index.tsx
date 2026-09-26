"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ExtractedMetadata,
  parseJpegExif,
  stripImageMetadata,
} from "./logic";
import {
  Upload,
  Download,
  ShieldCheck,
  ShieldAlert,
  Camera,
  MapPin,
  Calendar,
  Layers,
  RefreshCw,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

export default function ExifStripperTool() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rawBytes, setRawBytes] = useState<Uint8Array | null>(null);
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null);

  const [isStripping, setIsStripping] = useState<boolean>(false);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [savedBytes, setSavedBytes] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (cleanedUrl) URL.revokeObjectURL(cleanedUrl);
    };
  }, [previewUrl, cleanedUrl]);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (cleanedUrl) URL.revokeObjectURL(cleanedUrl);
    setCleanedBlob(null);
    setCleanedUrl(null);
    setSavedBytes(0);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSourceFile(file);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setRawBytes(bytes);

      const parsed = parseJpegExif(bytes);
      setMetadata(parsed);
    } catch (err: any) {
      setError(err?.message || "Failed to inspect image metadata.");
    }
  };

  const handleStrip = () => {
    if (!rawBytes || !sourceFile) return;
    setIsStripping(true);
    setError(null);

    try {
      const result = stripImageMetadata(rawBytes, sourceFile.type);
      const mime = sourceFile.type || "image/jpeg";
      const blob = new Blob([result.data.buffer as ArrayBuffer], { type: mime });

      if (cleanedUrl) URL.revokeObjectURL(cleanedUrl);
      const url = URL.createObjectURL(blob);
      setCleanedBlob(blob);
      setCleanedUrl(url);
      setSavedBytes(result.savedBytes);
    } catch (err: any) {
      setError(err?.message || "Failed to strip metadata.");
    } finally {
      setIsStripping(false);
    }
  };

  const handleDownload = () => {
    if (!cleanedBlob || !cleanedUrl || !sourceFile) return;
    const lastDot = sourceFile.name.lastIndexOf(".");
    const base = lastDot !== -1 ? sourceFile.name.substring(0, lastDot) : sourceFile.name;
    const ext = lastDot !== -1 ? sourceFile.name.substring(lastDot) : ".jpg";
    const filename = `${base}_clean_noexif${ext}`;

    const a = document.createElement("a");
    a.href = cleanedUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyMetadataJson = () => {
    if (!metadata) return;
    navigator.clipboard.writeText(JSON.stringify(metadata.allRawTags, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasTrackingData =
    Boolean(metadata?.cameraMake) ||
    Boolean(metadata?.cameraModel) ||
    Boolean(metadata?.dateTime) ||
    Boolean(metadata?.gpsLatitude) ||
    (metadata?.totalTagCount ?? 0) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-body">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-headings text-sm sm:text-base font-bold text-slate-900">
              EXIF Metadata Viewer & Privacy Stripper
            </h2>
            <p className="text-xs text-slate-600">
              Inspect hidden camera, location, and date metadata. Remove all tracking tags losslessly.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-semibold shrink-0 shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>100% In-Browser Privacy</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Stripper Error:</strong> {error}
          </div>
        </div>
      )}

      {!sourceFile ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 bg-white hover:bg-slate-50/80 shadow-xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />
          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="font-headings text-lg font-bold text-slate-900 mb-1">
            Choose a photo to inspect and sanitize
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
            Inspect GPS location, camera serials, timestamps, and delete them before sharing online.
          </p>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-xs font-bold"
          >
            Select Photo
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Header */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Thumb"
                  className="h-12 w-12 rounded-lg object-contain border border-slate-200 bg-slate-50"
                />
              )}
              <div>
                <h4 className="font-headings text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {sourceFile.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {((sourceFile.size) / (1024 * 1024)).toFixed(2)} MB • {sourceFile.type}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSourceFile(null);
                setPreviewUrl(null);
                setCleanedUrl(null);
                setMetadata(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs text-slate-600"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Change Photo
            </Button>
          </div>

          {/* Privacy Assessment Card */}
          <div
            className={`p-5 rounded-2xl border ${
              hasTrackingData
                ? "bg-amber-50/70 border-amber-200"
                : "bg-emerald-50/70 border-emerald-200"
            } flex items-start gap-3.5`}
          >
            {hasTrackingData ? (
              <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3
                className={`font-headings text-sm font-bold ${
                  hasTrackingData ? "text-amber-900" : "text-emerald-900"
                }`}
              >
                {hasTrackingData
                  ? `Privacy Risk Detected (${metadata?.totalTagCount ?? 0} Metadata Tags Found)`
                  : "Clean Photo: No Sensitive EXIF Tags Found"}
              </h3>
              <p
                className={`text-xs mt-0.5 leading-relaxed ${
                  hasTrackingData ? "text-amber-800" : "text-emerald-800"
                }`}
              >
                {hasTrackingData
                  ? "This image contains embedded device or camera metadata that could reveal your identity, equipment, and shooting date. Strip before uploading publicly."
                  : "No standard EXIF identifiers were found in this file header. You can still run a binary sanitization pass to be certain."}
              </p>
            </div>
          </div>

          {/* Extracted Metadata Overview */}
          {metadata && (
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <h3 className="font-headings text-sm font-bold text-slate-900">
                    Inspected Metadata Tags
                  </h3>
                </div>
                {Object.keys(metadata.allRawTags).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyMetadataJson}
                    className="text-xs h-7 px-2.5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" /> Copy JSON
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* High-level tags grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Camera className="h-3 w-3 text-slate-400" /> Camera Model
                  </span>
                  <strong className="text-slate-900 block truncate">
                    {metadata.cameraModel || metadata.cameraMake || "Not specified"}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" /> Date Taken
                  </span>
                  <strong className="text-slate-900 block truncate">
                    {metadata.dateTime || "Not recorded"}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Layers className="h-3 w-3 text-slate-400" /> Exposure & ISO
                  </span>
                  <strong className="text-slate-900 block truncate">
                    {metadata.iso ? `ISO ${metadata.iso}` : "N/A"}
                    {metadata.fNumber ? ` • f/${metadata.fNumber}` : ""}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" /> Location / GPS
                  </span>
                  <strong className="text-slate-900 block truncate">
                    {metadata.gpsLatitude ? `${metadata.gpsLatitude}, ${metadata.gpsLongitude}` : "None found"}
                  </strong>
                </div>
              </div>

              {/* Raw Tag Table */}
              {Object.keys(metadata.allRawTags).length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    All Discovered Metadata Properties
                  </span>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                    {Object.entries(metadata.allRawTags).map(([tag, val]) => (
                      <div key={tag} className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                        <span className="font-semibold text-slate-700">{tag}</span>
                        <span className="text-slate-500 font-mono text-[11px] truncate max-w-xs">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strip Action Trigger */}
              <div className="pt-2">
                <Button
                  onClick={handleStrip}
                  disabled={isStripping}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {isStripping ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Stripping Metadata Binary...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Strip All Metadata (Lossless Binary Sanitization)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Sanitized Result Card */}
          {cleanedBlob && cleanedUrl && (
            <div className="p-6 rounded-2xl border-2 border-emerald-500/40 bg-white shadow-md space-y-4 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-headings text-sm sm:text-base font-bold text-slate-900">
                    Metadata Successfully Stripped!
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Private • Lossless
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Original Size</span>
                  <strong className="text-slate-900 text-sm">
                    {((sourceFile.size) / 1024).toFixed(1)} KB
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-blue-700 block">Sanitized Size</span>
                  <strong className="text-blue-900 text-sm">
                    {((cleanedBlob.size) / 1024).toFixed(1)} KB
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-emerald-700 block">Metadata Removed</span>
                  <strong className="text-emerald-900 text-sm">
                    {savedBytes > 0 ? `${savedBytes} bytes stripped` : "All headers sanitized"}
                  </strong>
                </div>
              </div>

              <Button
                onClick={handleDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                Download Clean Image
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
