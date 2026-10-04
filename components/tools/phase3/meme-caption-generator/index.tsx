"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  MemeOptions,
  DEFAULT_MEME_OPTIONS,
  wrapMemeText,
} from "./logic";
import {
  Smile,
  Download,
  RotateCcw,
  ShieldCheck,
  Upload,
  Type,
} from "lucide-react";

export default function MemeCaptionGeneratorTool() {
  const [options, setOptions] = useState<MemeOptions>(DEFAULT_MEME_OPTIONS);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize with scenic sample canvas
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Linear gradient landscape
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(0.5, "#4338ca");
      grad.addColorStop(1, "#312e81");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      // Decorative stars
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 40; i++) {
        const x = (i * 97) % 800;
        const y = (i * 73) % 400;
        ctx.fillRect(x, y, 3, 3);
      }

      const img = new Image();
      img.onload = () => setImageElement(img);
      img.src = canvas.toDataURL();
    }
  }, []);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageElement) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageElement.width || 800;
    canvas.height = imageElement.height || 600;

    // 1. Draw base photo
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    // 2. Configure font styles
    ctx.font = `bold ${options.fontSize}px ${options.fontFamily}`;
    ctx.textAlign = "center";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;

    const maxWidth = canvas.width - 60;
    const topCaption = options.uppercase ? options.topText.toUpperCase() : options.topText;
    const bottomCaption = options.uppercase ? options.bottomText.toUpperCase() : options.bottomText;

    // Top Text
    if (topCaption) {
      const lines = wrapMemeText(ctx, topCaption, maxWidth);
      let y = options.fontSize + 24;
      lines.forEach((line) => {
        // Stroke
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = options.strokeWidth;
        ctx.strokeText(line, canvas.width / 2, y);

        // Fill
        ctx.fillStyle = options.fillColor;
        ctx.fillText(line, canvas.width / 2, y);
        y += options.fontSize * 1.15;
      });
    }

    // Bottom Text
    if (bottomCaption) {
      const lines = wrapMemeText(ctx, bottomCaption, maxWidth);
      const totalH = lines.length * options.fontSize * 1.15;
      let y = canvas.height - totalH + options.fontSize - 12;

      lines.forEach((line) => {
        ctx.strokeStyle = options.strokeColor;
        ctx.lineWidth = options.strokeWidth;
        ctx.strokeText(line, canvas.width / 2, y);

        ctx.fillStyle = options.fillColor;
        ctx.fillText(line, canvas.width / 2, y);
        y += options.fontSize * 1.15;
      });
    }
  }, [options, imageElement]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => setImageElement(img);
    img.src = URL.createObjectURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `cleartrix-meme-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="leading-relaxed">Meme Caption Generator — 100% In-Browser Canvas. Zero server uploads.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOptions(DEFAULT_MEME_OPTIONS)}
            className="h-7 text-xs gap-1 border-emerald-300 dark:border-emerald-700"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="w-3 h-3" /> Export Meme PNG
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Live Canvas View */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-full max-w-2xl bg-black rounded-xl shadow-2xl overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>
          <p className="text-xs text-slate-500 mt-3 font-mono">
            Direct HTML5 Canvas Master Output
          </p>
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-4 space-y-5">
          {/* Upload */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-emerald-600" /> Meme Base Image
            </h4>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-xs gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Custom Photo
            </Button>
          </div>

          {/* Captions */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-600" /> Captions
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Top Text
              </label>
              <input
                type="text"
                value={options.topText}
                onChange={(e) => setOptions((prev) => ({ ...prev, topText: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs font-bold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Bottom Text
              </label>
              <input
                type="text"
                value={options.bottomText}
                onChange={(e) => setOptions((prev) => ({ ...prev, bottomText: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs font-bold border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={(e) => setOptions((prev) => ({ ...prev, uppercase: e.target.checked }))}
                  className="rounded"
                />
                <span>ALL CAPS (Classic)</span>
              </label>
            </div>
          </div>

          {/* Typography Controls */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Font & Stroke
            </h4>

            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Font Size:</span>
                <span>{options.fontSize}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="80"
                value={options.fontSize}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
                }
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Outline Stroke:</span>
                <span>{options.strokeWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={options.strokeWidth}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, strokeWidth: Number(e.target.value) }))
                }
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Text Fill
                </label>
                <input
                  type="color"
                  value={options.fillColor}
                  onChange={(e) => setOptions((prev) => ({ ...prev, fillColor: e.target.value }))}
                  className="w-full h-8 p-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Stroke Color
                </label>
                <input
                  type="color"
                  value={options.strokeColor}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, strokeColor: e.target.value }))
                  }
                  className="w-full h-8 p-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
