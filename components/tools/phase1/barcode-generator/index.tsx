"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, Copy, Check, Barcode as BarcodeIcon, AlertCircle } from "lucide-react";
import {
  BarcodeFormat,
  BarcodeValidationResult,
  encodeCode128B,
  encodeEan13,
  encodeUpcA,
  renderBarcodeToCanvas,
  generateBarcodeSvg,
} from "./logic";

export default function BarcodeGeneratorTool() {
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [inputText, setInputText] = useState<string>("MINDKIT-2026");
  const [barWidth, setBarWidth] = useState<number>(2);
  const [barHeight, setBarHeight] = useState<number>(90);
  const [showText, setShowText] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Validate and encode based on selected format
  let encodeResult: BarcodeValidationResult;
  if (format === "EAN13") {
    encodeResult = encodeEan13(inputText);
  } else if (format === "UPCA") {
    encodeResult = encodeUpcA(inputText);
  } else {
    encodeResult = encodeCode128B(inputText);
  }

  // Draw to canvas whenever settings change
  useEffect(() => {
    if (!canvasRef.current || !encodeResult.valid) return;
    renderBarcodeToCanvas(canvasRef.current, encodeResult.pattern, encodeResult.displayText, {
      barWidth,
      height: barHeight,
      showText,
      color: "#000000",
      bgColor: "#ffffff",
    });
  }, [encodeResult, barWidth, barHeight, showText]);

  const handleDownloadPng = () => {
    if (!canvasRef.current || !encodeResult.valid) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `barcode-${format.toLowerCase()}-${encodeResult.normalized}.png`;
    link.href = url;
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!encodeResult.valid) return;
    const svg = generateBarcodeSvg(encodeResult.pattern, encodeResult.displayText, {
      barWidth,
      height: barHeight,
      showText,
    });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `barcode-${format.toLowerCase()}-${encodeResult.normalized}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySvg = async () => {
    if (!encodeResult.valid) return;
    const svg = generateBarcodeSvg(encodeResult.pattern, encodeResult.displayText, {
      barWidth,
      height: barHeight,
      showText,
    });
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const setFormatWithDefault = (fmt: BarcodeFormat) => {
    setFormat(fmt);
    if (fmt === "EAN13") {
      setInputText("4006381333931");
    } else if (fmt === "UPCA") {
      setInputText("012345678905");
    } else {
      setInputText("MINDKIT-2026");
    }
  };

  return (
    <div className="space-y-6">
      {/* Format Selection Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <BarcodeIcon className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Barcode Standard:
          </span>
        </div>
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
          <button
            type="button"
            onClick={() => setFormatWithDefault("CODE128")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              format === "CODE128"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Code 128 (Alphanumeric)
          </button>
          <button
            type="button"
            onClick={() => setFormatWithDefault("EAN13")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              format === "EAN13"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            EAN-13 (Retail / Global)
          </button>
          <button
            type="button"
            onClick={() => setFormatWithDefault("UPCA")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              format === "UPCA"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            UPC-A (Retail / US)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Input & Customization */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-headings font-bold text-sm text-foreground">
            Barcode Content &amp; Dimensions
          </h2>

          <div>
            <label htmlFor="barcode-content" className="block text-xs font-medium text-muted-foreground mb-1">
              {format === "CODE128"
                ? "Alphanumeric Text / SKU / Tracking ID"
                : format === "EAN13"
                ? "12 or 13 Digits (13th check digit auto-calculated)"
                : "11 or 12 Digits (12th check digit auto-calculated)"}
            </label>
            <input
              id="barcode-content"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                format === "CODE128"
                  ? "Enter any text or SKU..."
                  : format === "EAN13"
                  ? "e.g. 4006381333931"
                  : "e.g. 012345678905"
              }
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {!encodeResult.valid && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {encodeResult.error}
              </p>
            )}
          </div>

          {/* Bar Height Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <label htmlFor="bar-height" className="text-muted-foreground">Bar Height</label>
              <span className="font-mono text-foreground font-bold">{barHeight}px</span>
            </div>
            <input
              id="bar-height"
              type="range"
              min={40}
              max={160}
              step={10}
              value={barHeight}
              onChange={(e) => setBarHeight(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Bar Width (Module Density) */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <label htmlFor="bar-width" className="text-muted-foreground">Bar Thickness (Module Width)</label>
              <span className="font-mono text-foreground font-bold">{barWidth}px</span>
            </div>
            <input
              id="bar-width"
              type="range"
              min={1}
              max={4}
              step={1}
              value={barWidth}
              onChange={(e) => setBarWidth(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Show text below toggle */}
          <div className="pt-2 border-t border-border/60">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-foreground">
              <input
                type="checkbox"
                checked={showText}
                onChange={(e) => setShowText(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>Render human-readable text below barcode</span>
            </label>
          </div>
        </div>

        {/* Right: Barcode Preview & Export */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headings font-bold text-sm text-foreground">
                High-Contrast Preview
              </h2>
              {encodeResult.valid && (
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {format}: Valid Checksum
                </span>
              )}
            </div>

            {/* Canvas Container */}
            <div className="p-4 bg-white rounded-xl border border-border/80 flex items-center justify-center min-h-[160px] overflow-x-auto shadow-inner">
              {encodeResult.valid ? (
                <canvas ref={canvasRef} className="max-w-full h-auto" />
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-6">
                  {encodeResult.error || "Enter a valid code to preview barcode"}
                </p>
              )}
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!encodeResult.valid}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              PNG
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              disabled={!encodeResult.valid}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Vector SVG
            </button>
            <button
              type="button"
              onClick={handleCopySvg}
              disabled={!encodeResult.valid}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground disabled:opacity-40 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy SVG
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
