"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  StoryConfig,
  STORY_DIMENSIONS,
  STORY_STICKERS,
  DEFAULT_STORY_CONFIG,
  getStorySticker,
} from "./logic";
import { POST_GRADIENTS, wrapTextLines } from "../social-post-maker/logic";
import {
  Download,
  RotateCcw,
  ShieldCheck,
  Upload,
  Palette,
  Sparkles,
} from "lucide-react";

export default function StoryReelsMakerTool() {
  const [config, setConfig] = useState<StoryConfig>(DEFAULT_STORY_CONFIG);
  const [uploadedBgImg, setUploadedBgImg] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = STORY_DIMENSIONS;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    if (uploadedBgImg) {
      ctx.drawImage(uploadedBgImg, 0, 0, width, height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(0, 0, width, height);
    } else {
      const grad = POST_GRADIENTS[config.gradientIndex] ?? POST_GRADIENTS[0]!;
      const linear = ctx.createLinearGradient(0, 0, 0, height);
      linear.addColorStop(0, grad.colors[0]);
      linear.addColorStop(1, grad.colors[1]);
      ctx.fillStyle = linear;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Sticker Badge at top
    const sticker = getStorySticker(config.activeStickerId);
    if (sticker) {
      const stickerY = 240;
      ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const stickerText = sticker.label;
      const textWidth = ctx.measureText(stickerText).width;

      ctx.save();
      ctx.fillStyle = sticker.color;
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.roundRect(width / 2 - textWidth / 2 - 28, stickerY - 32, textWidth + 56, 56, 28);
      ctx.fill();
      ctx.restore();

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(stickerText, width / 2, stickerY + 6);
    }

    // 3. Tagline
    if (config.tagline) {
      const tagY = 560;
      ctx.textAlign = "center";
      ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.letterSpacing = "4px";
      ctx.fillText(config.tagline.toUpperCase(), width / 2, tagY);
    }

    // 4. Headline
    const headlineY = 720;
    ctx.textAlign = "center";
    ctx.font = "bold 68px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = "#ffffff";
    const headlineLines = wrapTextLines(ctx, config.headline, width - 220);
    let curY = headlineY;
    for (const line of headlineLines) {
      ctx.fillText(line, width / 2, curY);
      curY += 82;
    }

    // 5. Body Text
    if (config.body) {
      curY += 40;
      ctx.font = "normal 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      const bodyLines = wrapTextLines(ctx, config.body, width - 260);
      for (const bLine of bodyLines) {
        ctx.fillText(bLine, width / 2, curY);
        curY += 48;
      }
    }

    // 6. Call To Action Card at bottom
    if (config.ctaText) {
      const ctaY = height - 320;
      const ctaWidth = 480;
      const ctaHeight = 84;
      const ctaX = (width - ctaWidth) / 2;

      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      ctx.beginPath();
      ctx.roundRect(ctaX, ctaY, ctaWidth, ctaHeight, 42);
      ctx.fill();
      ctx.restore();

      ctx.textAlign = "center";
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(config.ctaText, width / 2, ctaY + 54);
    }
  }, [config, uploadedBgImg]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `story-reel-9-16-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png", 0.95);
    link.click();
  };

  const handleUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setUploadedBgImg(img);
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Privacy Notice */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Story & Reels Canvas Maker — 100% In-Browser 9:16 Canvas. Files never leave your device.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setConfig(DEFAULT_STORY_CONFIG);
              setUploadedBgImg(null);
            }}
            className="h-7 text-xs gap-1 border-emerald-300 dark:border-emerald-700"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-3 h-3" /> Export 9:16 Story (PNG)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 9:16 Phone Mockup View */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-[300px] h-[533px] relative shadow-2xl rounded-[36px] overflow-hidden border-4 border-slate-800 bg-black flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>
          <p className="text-xs text-slate-500 mt-4 font-mono">
            Native Canvas: 1080 x 1920 px (Instagram / TikTok standard)
          </p>
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-6 space-y-5">
          {/* Stickers */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Story Highlight Sticker
            </h4>
            <div className="flex flex-wrap gap-2">
              {STORY_STICKERS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, activeStickerId: st.id }))}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                    config.activeStickerId === st.id
                      ? "ring-2 ring-slate-900 dark:ring-white scale-105"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: st.color, color: "#ffffff" }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Copy Controls */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Story Text Content
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Top Tagline
              </label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => setConfig((prev) => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Main Story Headline
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
                Body Story Text
              </label>
              <textarea
                rows={3}
                value={config.body}
                onChange={(e) => setConfig((prev) => ({ ...prev, body: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Bottom Call-to-Action Button Label
              </label>
              <input
                type="text"
                value={config.ctaText}
                onChange={(e) => setConfig((prev) => ({ ...prev, ctaText: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs font-semibold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Gradients */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-600" /> Background Palette
            </h4>

            <div className="grid grid-cols-3 gap-2">
              {POST_GRADIENTS.map((grad, idx) => (
                <button
                  key={grad.name}
                  type="button"
                  onClick={() => {
                    setUploadedBgImg(null);
                    setConfig((prev) => ({ ...prev, gradientIndex: idx }));
                  }}
                  className={`h-12 rounded-lg relative overflow-hidden border-2 transition-all ${
                    config.gradientIndex === idx && !uploadedBgImg
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
                onChange={handleUploadBg}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Background Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
