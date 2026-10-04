"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  calculateRotatedDimensions,
  normalizeAngle,
  combineTransforms,
  TransformState,
} from "./logic";
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Upload,
  Download,
  Rotate3D,
  RotateCcw as ResetIcon,
  ShieldCheck,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

export default function ImageRotatorFlipperTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("image");
  const [origSize, setOrigSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [transform, setTransform] = useState<TransformState>({
    rotation: 0,
    flipH: false,
    flipV: false,
  });
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [quality, setQuality] = useState<number>(0.92);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultDimensions, setResultDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Load original sample lighthouse image
  const loadSampleImage = useCallback(() => {
    setImageSrc("/images/samples/lighthouse-sample.jpg");
    setImageName("coastal-lighthouse.jpg");
    setTransform({ rotation: 0, flipH: false, flipV: false });
  }, []);

  useEffect(() => {
    loadSampleImage();
  }, [loadSampleImage]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    setImageName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        setImageSrc(src);
        setTransform({ rotation: 0, flipH: false, flipV: false });
      }
    };
    reader.readAsDataURL(file);
  };

  // Re-render canvas transformation
  const renderTransformedImage = useCallback(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageElementRef.current = img;
      setOrigSize({ width: img.naturalWidth, height: img.naturalHeight });

      const rad = (transform.rotation * Math.PI) / 180;
      const dims = calculateRotatedDimensions(img.naturalWidth, img.naturalHeight, transform.rotation);
      setResultDimensions(dims);

      const canvas = document.createElement("canvas");
      canvas.width = dims.width;
      canvas.height = dims.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Move coordinate origin to canvas center
      ctx.translate(dims.width / 2, dims.height / 2);

      // Apply rotation
      ctx.rotate(rad);

      // Apply flips
      ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

      // Draw original image centered
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const dataUrl = canvas.toDataURL(outputFormat, quality);
      setPreviewUrl(dataUrl);
    };
    img.src = imageSrc;
  }, [imageSrc, transform, outputFormat, quality]);

  useEffect(() => {
    renderTransformedImage();
  }, [renderTransformedImage]);

  const handleRotate = (degreesDelta: number) => {
    setTransform((prev) => combineTransforms(prev, { rotation: degreesDelta }));
  };

  const handleFlipH = () => {
    setTransform((prev) => ({ ...prev, flipH: !prev.flipH }));
  };

  const handleFlipV = () => {
    setTransform((prev) => ({ ...prev, flipV: !prev.flipV }));
  };

  const handleReset = () => {
    setTransform({ rotation: 0, flipH: false, flipV: false });
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const ext = outputFormat === "image/png" ? "png" : outputFormat === "image/jpeg" ? "jpg" : "webp";
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${imageName}-transformed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Transformation — Image rotation and canvas processing execute strictly in local memory.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Transformation Controls
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSampleImage}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sample
              </Button>
            </div>

            {/* Quick Rotate Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Rotate
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate(-90)}
                  className="h-8 text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  -90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate(90)}
                  className="h-8 text-xs gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  +90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate(180)}
                  className="h-8 text-xs gap-1.5"
                >
                  <Rotate3D className="w-3.5 h-3.5" />
                  180°
                </Button>
              </div>
            </div>

            {/* Flip Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Mirror & Flip
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={transform.flipH ? "default" : "outline"}
                  size="sm"
                  onClick={handleFlipH}
                  className="h-8 text-xs gap-1.5"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  Flip Horizontal
                </Button>
                <Button
                  variant={transform.flipV ? "default" : "outline"}
                  size="sm"
                  onClick={handleFlipV}
                  className="h-8 text-xs gap-1.5"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  Flip Vertical
                </Button>
              </div>
            </div>

            {/* Fine Rotation Slider */}
            <div className="space-y-2 pt-1 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                  Custom Angle
                </span>
                <span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                  {transform.rotation}°
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="359"
                value={transform.rotation}
                onChange={(e) =>
                  setTransform((prev) => ({
                    ...prev,
                    rotation: normalizeAngle(parseInt(e.target.value, 10)),
                  }))
                }
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Format & Export Settings */}
            <div className="space-y-2 pt-2 border-t border-border text-xs">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
                Export Format
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["image/png", "image/jpeg", "image/webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={`py-1.5 px-2 rounded-lg border font-medium uppercase tracking-wider text-[11px] transition-colors ${
                      outputFormat === fmt
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {fmt.split("/")[1]}
                  </button>
                ))}
              </div>

              {outputFormat !== "image/png" && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Quality</span>
                    <span className="font-mono text-foreground">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Reset & Upload Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
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
                className="w-full text-xs gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Image
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs text-muted-foreground hover:text-foreground shrink-0"
                title="Reset Transformations"
              >
                <ResetIcon className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Metadata Banner */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-xl border border-border text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Original</p>
              <p className="text-xs font-semibold font-mono text-foreground">
                {origSize.width} × {origSize.height}
              </p>
            </div>
            <div className="border-x border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Output</p>
              <p className="text-xs font-semibold font-mono text-primary">
                {resultDimensions.width} × {resultDimensions.height}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Transform</p>
              <p className="text-xs font-semibold font-mono text-foreground">
                {transform.rotation}° {transform.flipH ? "• H" : ""} {transform.flipV ? "• V" : ""}
              </p>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="p-4 bg-card border border-border rounded-xl min-h-[380px] flex flex-col justify-between items-center space-y-4">
            <div className="w-full flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                Live Preview
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                disabled={!previewUrl}
                className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-3.5 h-3.5" />
                Download Transformed
              </Button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 max-h-[350px] w-full overflow-hidden">
              {previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Transformed preview"
                  className="max-h-[320px] max-w-full object-contain rounded-lg shadow-sm border border-border bg-muted/20"
                />
              ) : (
                <p className="text-xs text-muted-foreground">Rendering preview...</p>
              )}
            </div>

            <div className="w-full pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Lossless canvas matrix interpolation</span>
              <span>100% Client-Side RAM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
