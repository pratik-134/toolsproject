"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  FAVICON_SPECS,
  FaviconSizeSpec,
  generateWebManifest,
  generateFaviconHtmlTags,
  buildIcoFile,
} from "./logic";
import {
  Upload,
  Download,
  Copy,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Globe,
  Smartphone,
  Layers,
  FileCode,
  FileArchive,
} from "lucide-react";

export default function FaviconGeneratorTool() {
  const [appName, setAppName] = useState<string>("My Awesome App");
  const [shortName, setShortName] = useState<string>("App");
  const [themeColor, setThemeColor] = useState<string>("#6366f1");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [renderedIcons, setRenderedIcons] = useState<Record<string, { dataUrl: string; bytes: Uint8Array }>>({});
  const [icoBlobUrl, setIcoBlobUrl] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [copiedManifest, setCopiedManifest] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load sample geometric icon
  const loadSampleIcon = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw modern gradient icon
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, "#4f46e5");
    grad.addColorStop(1, "#06b6d4");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(32, 32, 448, 448, 96);
    ctx.fill();

    // Draw emblem
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(256, 256, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4f46e5";
    ctx.beginPath();
    ctx.arc(256, 256, 70, 0, Math.PI * 2);
    ctx.fill();

    setImageSrc(canvas.toDataURL("image/png"));
  }, []);

  // Initialize with sample icon on first mount
  useEffect(() => {
    loadSampleIcon();
  }, [loadSampleIcon]);

  // Handle image file upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageSrc(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Render all standard favicon sizes to Canvas and generate binary buffers
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const newIcons: Record<string, { dataUrl: string; bytes: Uint8Array }> = {};

      for (const spec of FAVICON_SPECS) {
        const canvas = document.createElement("canvas");
        canvas.width = spec.width;
        canvas.height = spec.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // Smooth high quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.clearRect(0, 0, spec.width, spec.height);

        // Aspect ratio cover/fit
        const scale = Math.min(spec.width / img.width, spec.height / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = (spec.width - nw) / 2;
        const ny = (spec.height - nh) / 2;

        ctx.drawImage(img, nx, ny, nw, nh);

        const dataUrl = canvas.toDataURL("image/png");

        // Convert dataUrl to bytes
        const base64Data = dataUrl.split(",")[1] ?? "";
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        newIcons[spec.filename] = { dataUrl, bytes };
      }

      setRenderedIcons(newIcons);

      // Generate multi-resolution ICO file (16, 32, 48)
      try {
        const ico16 = newIcons["favicon-16x16.png"];
        const ico32 = newIcons["favicon-32x32.png"];
        const ico48 = newIcons["favicon-48x48.png"];

        if (ico16 && ico32 && ico48) {
          const icoBuffer = buildIcoFile([
            { width: 16, height: 16, data: ico16.bytes },
            { width: 32, height: 32, data: ico32.bytes },
            { width: 48, height: 48, data: ico48.bytes },
          ]);
          const blob = new Blob([icoBuffer as unknown as BlobPart], { type: "image/x-icon" });
          setIcoBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
        }
      } catch (e) {
        console.error("Failed to build ICO buffer:", e);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Clean up ICO blob URL
  useEffect(() => {
    return () => {
      if (icoBlobUrl) URL.revokeObjectURL(icoBlobUrl);
    };
  }, [icoBlobUrl]);

  // Generate snippets
  const htmlSnippet = useMemo(() => generateFaviconHtmlTags(themeColor), [themeColor]);
  const webManifestSnippet = useMemo(
    () => generateWebManifest({ name: appName, shortName, themeColor, backgroundColor }),
    [appName, shortName, themeColor, backgroundColor]
  );

  const downloadFile = (filename: string, content: string | Blob, mime: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlSnippet);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyManifest = async () => {
    try {
      await navigator.clipboard.writeText(webManifestSnippet);
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Favicon Generation — Images and ICO binaries are generated in memory and never sent to a server.
        </span>
      </div>

      {/* Main Grid: Settings & Source Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Image & Config */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Icon Source
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSampleIcon}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Sample Icon
              </Button>
            </div>

            {/* Image Preview & Upload button */}
            <div className="flex flex-col items-center justify-center p-4 bg-muted/20 border border-dashed border-border rounded-xl space-y-3">
              {imageSrc ? (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Favicon master source"
                    className="w-28 h-28 object-contain rounded-2xl shadow-sm border border-border bg-card p-1"
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No image loaded</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Logo or Image
              </Button>
            </div>

            {/* PWA & Manifest Configuration */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                App & Web Manifest
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1">Application Name</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg text-foreground font-medium text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Cleartrix Platform"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1">Short Name</label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg text-foreground font-medium text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Cleartrix"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-muted-foreground block mb-1">Theme Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="w-7 h-7 p-0 rounded border border-border cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="w-full px-2 py-1 bg-muted/40 border border-border rounded text-xs font-mono text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-muted-foreground block mb-1">Background</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-7 h-7 p-0 rounded border border-border cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full px-2 py-1 bg-muted/40 border border-border rounded text-xs font-mono text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Previews & Code Snippets */}
        <div className="lg:col-span-7 space-y-4">
          {/* Visual Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Desktop Browser Tab Mockup */}
            <div className="p-3 bg-card border border-border rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-primary" />
                Browser Tab Preview
              </span>
              <div className="bg-muted/70 p-2 rounded-lg border border-border flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <div className="ml-2 flex items-center gap-1.5 bg-card px-2.5 py-1 rounded shadow-xs max-w-[170px] truncate border border-border">
                  {renderedIcons["favicon-16x16.png"] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={renderedIcons["favicon-16x16.png"].dataUrl}
                      alt="tab favicon"
                      className="w-4 h-4 shrink-0"
                    />
                  )}
                  <span className="text-[11px] font-medium text-foreground truncate">
                    {appName}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Home Screen Mockup */}
            <div className="p-3 bg-card border border-border rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-primary" />
                Mobile Home Screen
              </span>
              <div className="bg-slate-900 dark:bg-slate-950 p-2.5 rounded-lg flex items-center justify-center gap-4 text-white">
                <div className="flex flex-col items-center gap-1">
                  {renderedIcons["apple-touch-icon.png"] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={renderedIcons["apple-touch-icon.png"].dataUrl}
                      alt="home icon"
                      className="w-10 h-10 rounded-xl shadow-md border border-white/20"
                    />
                  )}
                  <span className="text-[10px] text-slate-300 font-medium truncate max-w-[70px]">
                    {shortName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Favicon Sizes List */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Generated Favicons & Package
              </h3>
              {icoBlobUrl && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = icoBlobUrl;
                    a.download = "favicon.ico";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download favicon.ico
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FAVICON_SPECS.map((spec) => {
                const icon = renderedIcons[spec.filename];
                return (
                  <div
                    key={spec.filename}
                    className="p-2.5 bg-muted/30 border border-border rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {icon && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={icon.dataUrl}
                          alt={spec.name}
                          className="w-6 h-6 object-contain shrink-0 rounded bg-white p-0.5 border border-border"
                        />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-medium text-foreground truncate">{spec.name}</p>
                        <p className="text-[10px] text-muted-foreground">{spec.width}x{spec.height}</p>
                      </div>
                    </div>
                    {icon && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadFile(spec.filename, icon.dataUrl, "image/png")}
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                        title={`Download ${spec.filename}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* HTML & Web Manifest Snippets */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-primary" />
                HTML &lt;head&gt; Code
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyHtml}
                className="h-7 text-xs gap-1"
              >
                {copiedHtml ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedHtml ? "Copied" : "Copy HTML"}
              </Button>
            </div>
            <pre className="p-2.5 bg-muted/40 rounded-lg text-[11px] font-mono text-foreground overflow-x-auto border border-border">
              {htmlSnippet}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileArchive className="w-3.5 h-3.5 text-primary" />
                site.webmanifest
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyManifest}
                  className="h-7 text-xs gap-1"
                >
                  {copiedManifest ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedManifest ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadFile("site.webmanifest", webManifestSnippet, "application/manifest+json")}
                  className="h-7 text-xs gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
