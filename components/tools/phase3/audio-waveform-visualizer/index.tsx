"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Music,
  Download,
  Play,
  Pause,
  Upload,
  Copy,
  Check,
  Radio,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  WaveformStyle,
  WaveformOptions,
  normalizeAudioPeaks,
  generateWaveformSvg,
} from "./logic";

const SAMPLE_PEAKS = [
  0.15, 0.35, 0.65, 0.85, 0.95, 0.75, 0.55, 0.45, 0.3, 0.6, 0.9, 0.7, 0.4, 0.25, 0.5,
  0.8, 1.0, 0.85, 0.6, 0.35, 0.2, 0.55, 0.75, 0.9, 0.8, 0.6, 0.4, 0.3, 0.5, 0.7, 0.4, 0.2,
];

export default function AudioWaveformVisualizerTool() {
  const [peaks, setPeaks] = useState<number[]>(SAMPLE_PEAKS);
  const [style, setStyle] = useState<WaveformStyle>("bars");
  const [barWidth, setBarWidth] = useState<number>(5);
  const [barGap, setBarGap] = useState<number>(3);
  const [primaryColor, setPrimaryColor] = useState<string>("#38bdf8");
  const [secondaryColor, setSecondaryColor] = useState<string>("#818cf8");
  const [audioName, setAudioName] = useState<string>("Sample Acoustic Beat");
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);

  const audioOptions: WaveformOptions = useMemo(
    () => ({
      style,
      barWidth,
      barGap,
      height: 280,
      width: 720,
      primaryColor,
      secondaryColor,
      glowEffect: true,
    }),
    [style, barWidth, barGap, primaryColor, secondaryColor]
  );

  const svgOutput = useMemo(() => {
    return generateWaveformSvg(peaks, audioOptions);
  }, [peaks, audioOptions]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const channelData = decodedBuffer.getChannelData(0);
      const extracted = normalizeAudioPeaks(channelData, 48);
      setPeaks(extracted);
    } catch {
      // Fallback
    }
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(svgOutput);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waveform-${audioName.replace(/\.[^/.]+$/, "")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Studio Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              Audio Waveform & Speech Visualizer
            </span>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Headliner / Audiogram Alternative
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Upload Audio File
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleCopySvg}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
            >
              {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSvg ? "Copied SVG" : "Copy SVG"}
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              Download Vector SVG
            </button>
          </div>
        </div>

        {/* Style & Color Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Style:</span>
            {(["bars", "wave", "circular"] as WaveformStyle[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  style === s
                    ? "bg-foreground text-background font-semibold"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer text-foreground font-medium">
              <span>Color:</span>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-6 h-6 rounded border border-border cursor-pointer bg-transparent"
              />
            </label>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Bar Width:</span>
              <input
                type="range"
                min="2"
                max="10"
                value={barWidth}
                onChange={(e) => setBarWidth(Number(e.target.value))}
                className="w-20 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Waveform Canvas Preview */}
      <div className="rounded-3xl border border-border bg-[#0b0f19] p-6 shadow-2xl flex flex-col items-center justify-center min-h-[340px] space-y-4">
        <div
          dangerouslySetInnerHTML={{ __html: svgOutput }}
          className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
        />

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Music className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium text-slate-300">{audioName}</span>
          <span>·</span>
          <span>{peaks.length} Normalized Audio Samples</span>
        </div>
      </div>
    </div>
  );
}
