"use client";

import React, { useState, useMemo } from "react";
import { generateQrSvg } from "./logic";
import { Download, QrCode, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QrGeneratorTool() {
  const [text, setText] = useState<string>("https://cleartrix.com");
  const [fgColor, setFgColor] = useState<string>("#0B1229");
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");
  const [size, setSize] = useState<number>(256);
  const [copied, setCopied] = useState<boolean>(false);

  const qrResult = useMemo(() => {
    return generateQrSvg({
      text,
      size,
      foregroundColor: fgColor,
      backgroundColor: bgColor,
    });
  }, [text, size, fgColor, bgColor]);

  const handleDownloadSvg = () => {
    if (!qrResult.svgString) return;
    const blob = new Blob([qrResult.svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleartrix-qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySvg = async () => {
    if (!qrResult.svgString) return;
    await navigator.clipboard.writeText(qrResult.svgString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <QrCode className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              QR Code Content & Customization
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              URL or Text to Encode
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter website URL, Wi-Fi details, or text message..."
              rows={4}
              className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-body text-slate-800"
            />
          </div>

          {/* Color & Size Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                QR Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-12 rounded cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <span className="text-xs font-mono text-slate-600 uppercase">
                  {fgColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-12 rounded cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <span className="text-xs font-mono text-slate-600 uppercase">
                  {bgColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Export Size
              </label>
              <Select
                value={String(size)}
                onValueChange={(val) => setSize(Number(val))}
              >
                <SelectTrigger className="w-full h-8 text-xs font-semibold text-slate-800 bg-white border-slate-300">
                  <SelectValue placeholder="Export Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="192">192 x 192 px</SelectItem>
                  <SelectItem value="256">256 x 256 px</SelectItem>
                  <SelectItem value="512">512 x 512 px</SelectItem>
                  <SelectItem value="1024">1024 x 1024 px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Live Preview & Download */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center space-y-4 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Live Vector Preview
          </span>

          {qrResult.success && qrResult.svgString ? (
            <div
              className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/60 max-w-[280px]"
              dangerouslySetInnerHTML={{ __html: qrResult.svgString }}
            />
          ) : (
            <div className="h-64 w-64 rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-4 text-xs text-slate-400">
              {qrResult.error || "Type content above to generate QR code"}
            </div>
          )}

          <div className="flex items-center gap-2 w-full max-w-[280px]">
            <Button
              size="sm"
              onClick={handleDownloadSvg}
              disabled={!qrResult.success}
              className="flex-1 gap-1.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download SVG</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopySvg}
              disabled={!qrResult.success}
              className="gap-1 rounded-lg h-9 text-xs"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
