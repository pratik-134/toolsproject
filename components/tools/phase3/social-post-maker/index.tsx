"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  PostAspectRatio,
  PostConfig,
  POST_DIMENSIONS,
  POST_GRADIENTS,
  DEFAULT_POST_CONFIG,
  wrapTextLines,
} from "./logic";
import {
  Download,
  Image as ImageIcon,
  RotateCcw,
  ShieldCheck,
  AlignLeft,
  AlignCenter,
  Upload,
  Palette,
} from "lucide-react";

export default function SocialPostMakerTool() {
  const [config, setConfig] = useState<PostConfig>(DEFAULT_POST_CONFIG);
  const [uploadedBgImg, setUploadedBgImg] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dim = POST_DIMENSIONS[config.aspectRatio];
    canvas.width = dim.width;
    canvas.height = dim.height;

    // 1. Draw Background
    if (config.backgroundType === "image" && uploadedBgImg) {
      ctx.drawImage(uploadedBgImg, 0, 0, dim.width, dim.height);
      // Dark overlay for legibility
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(0, 0, dim.width, dim.height);
    } else if (config.backgroundType === "gradient") {
      const gradConfig = POST_GRADIENTS[config.gradientIndex] ?? POST_GRADIENTS[0]!;
      const grad = ctx.createLinearGradient(0, 0, dim.width, dim.height);
      grad.addColorStop(0, gradConfig.colors[0]);
      grad.addColorStop(1, gradConfig.colors[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, dim.width, dim.height);
    } else {
      ctx.fillStyle = config.solidColor;
      ctx.fillRect(0, 0, dim.width, dim.height);
    }

    // 2. Decorative subtle accents
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 48, dim.width - 96, dim.height - 96);
    ctx.restore();

    const isCenter = config.textAlign === "center";
    const contentX = isCenter ? dim.width / 2 : 100;
    const maxContentWidth = dim.width - 200;

    ctx.textAlign = config.textAlign;
    ctx.fillStyle = config.textColor;

    // 3. Category Badge
    if (config.categoryBadge) {
      const badgeY = 140;
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.letterSpacing = "2px";

      if (isCenter) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        const textW = ctx.measureText(config.categoryBadge.toUpperCase()).width;
        ctx.beginPath();
        ctx.roundRect(dim.width / 2 - textW / 2 - 20, badgeY - 26, textW + 40, 36, 18);
        ctx.fill();
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillText(config.categoryBadge.toUpperCase(), contentX, badgeY);
    }

    // 4. Headline
    const headlineY = dim.height * 0.42;
    ctx.font = `bold ${config.headlineFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = config.textColor;
    const headlineLines = wrapTextLines(ctx, config.headline, maxContentWidth);
    const lineHeight = config.headlineFontSize * 1.25;

    let currentY = headlineY - (headlineLines.length * lineHeight) / 2;
    for (const line of headlineLines) {
      ctx.fillText(line, contentX, currentY);
      currentY += lineHeight;
    }

    // 5. Subtitle
    if (config.subtitle) {
      currentY += 24;
      ctx.font = "normal 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      const subtitleLines = wrapTextLines(ctx, config.subtitle, maxContentWidth);
      for (const line of subtitleLines) {
        ctx.fillText(line, contentX, currentY);
        currentY += 38;
      }
    }

    // 6. Author Handle / Footer
    if (config.authorHandle) {
      const footerY = dim.height - 110;
      ctx.font = "600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(config.authorHandle, contentX, footerY);
    }
  }, [config, uploadedBgImg]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownload = (format: "image/png" | "image/jpeg") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ext = format === "image/png" ? "png" : "jpg";
    const link = document.createElement("a");
    link.download = `social-post-${config.aspectRatio.replace(":", "-")}-${Date.now()}.${ext}`;
    link.href = canvas.toDataURL(format, 0.95);
    link.click();
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setUploadedBgImg(img);
      setConfig((prev) => ({ ...prev, backgroundType: "image" }));
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="leading-relaxed">Social Media Post Maker — Pure Client Canvas. Images stay in your browser.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfig(DEFAULT_POST_CONFIG)}
            className="h-7 text-xs gap-1 border-emerald-300 dark:border-emerald-700"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={() => handleDownload("image/png")}
            className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-3 h-3" /> Export PNG (1080p)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Canvas Retina Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-full max-w-[460px] aspect-square relative shadow-2xl rounded-xl overflow-hidden flex items-center justify-center bg-black">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{
                aspectRatio: config.aspectRatio === "1:1" ? "1 / 1" : "4 / 5",
              }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 font-mono">
            Output: {POST_DIMENSIONS[config.aspectRatio].width} x{" "}
            {POST_DIMENSIONS[config.aspectRatio].height} px (Retina Master)
          </p>
        </div>

        {/* Right: Controls Sidebar */}
        <div className="lg:col-span-5 space-y-5">
          {/* Aspect Ratio */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Format & Aspect Ratio
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(["1:1", "4:5"] as PostAspectRatio[]).map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, aspectRatio: ar }))}
                  className={`p-2.5 text-xs rounded-lg border font-medium transition-all text-center ${
                    config.aspectRatio === ar
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {POST_DIMENSIONS[ar].label}
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Text & Content
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Category Pill
              </label>
              <input
                type="text"
                value={config.categoryBadge}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, categoryBadge: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Main Headline
              </label>
              <textarea
                rows={2}
                value={config.headline}
                onChange={(e) => setConfig((prev) => ({ ...prev, headline: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs font-bold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={config.subtitle}
                onChange={(e) => setConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Brand / Handle
                </label>
                <input
                  type="text"
                  value={config.authorHandle}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, authorHandle: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Text Alignment
                </label>
                <div className="flex border rounded-lg overflow-hidden border-slate-300 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, textAlign: "left" }))}
                    className={`flex-1 py-1.5 flex items-center justify-center text-xs ${
                      config.textAlign === "left"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600"
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, textAlign: "center" }))}
                    className={`flex-1 py-1.5 flex items-center justify-center text-xs ${
                      config.textAlign === "center"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600"
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Headline Font Size:</span>
                <span>{config.headlineFontSize}px</span>
              </div>
              <input
                type="range"
                min="36"
                max="80"
                value={config.headlineFontSize}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, headlineFontSize: Number(e.target.value) }))
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Background Styling */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-600" /> Background Theme
            </h4>

            <div className="grid grid-cols-3 gap-2">
              {POST_GRADIENTS.map((grad, idx) => (
                <button
                  key={grad.name}
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      backgroundType: "gradient",
                      gradientIndex: idx,
                    }))
                  }
                  className={`h-12 rounded-lg relative overflow-hidden border-2 transition-all ${
                    config.backgroundType === "gradient" && config.gradientIndex === idx
                      ? "border-emerald-600 ring-2 ring-emerald-500"
                      : "border-transparent opacity-85 hover:opacity-100"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${grad.colors[0]}, ${grad.colors[1]})`,
                  }}
                  title={grad.name}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleBgImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Background Photo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
