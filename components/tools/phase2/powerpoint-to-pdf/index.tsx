"use client";

import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  extractSlidesFromPptx,
  parseMarkdownSlides,
  convertSlidesToPdf,
  SAMPLE_PRESENTATION_MARKDOWN,
  SlideTheme,
  PresentationSlide,
} from "./logic";
import {
  Presentation,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Palette,
  FileCheck,
  Layers,
} from "lucide-react";

const THEMES: { id: SlideTheme; label: string; bgClass: string; textClass: string }[] = [
  { id: "modern-dark", label: "Modern Dark Pitch", bgClass: "bg-slate-900 border-slate-700", textClass: "text-white" },
  { id: "executive-light", label: "Executive Light", bgClass: "bg-white border-slate-200", textClass: "text-slate-900" },
  { id: "emerald-growth", label: "Emerald Growth", bgClass: "bg-emerald-950 border-emerald-800", textClass: "text-emerald-100" },
  { id: "indigo-pitch", label: "Indigo Studio", bgClass: "bg-indigo-950 border-indigo-800", textClass: "text-indigo-100" },
];

export default function PowerPointToPdfTool() {
  const [deckTitle, setDeckTitle] = useState<string>("Qwertygen Strategic Deck");
  const [markdownInput, setMarkdownInput] = useState<string>(SAMPLE_PRESENTATION_MARKDOWN);
  const [theme, setTheme] = useState<SlideTheme>("modern-dark");
  const [includeSlideNumbers, setIncludeSlideNumbers] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse slides
  const slides: PresentationSlide[] = useMemo(() => {
    return parseMarkdownSlides(markdownInput);
  }, [markdownInput]);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage("Extracting PPTX XML archive in browser memory...");
    try {
      const buffer = await file.arrayBuffer();
      const extracted = extractSlidesFromPptx(new Uint8Array(buffer));
      if (extracted.length > 0) {
        // Rebuild markdown for the editor
        const md = extracted
          .map((s) => {
            const lines = [`# ${s.title}`];
            if (s.subtitle) lines.push(`## ${s.subtitle}`);
            for (const b of s.bullets) lines.push(`• ${b}`);
            return lines.join("\n");
          })
          .join("\n---\n");
        setMarkdownInput(md);
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setDeckTitle(cleanName);
        setStatusMessage(`Extracted ${extracted.length} slides from PPTX!`);
      }
    } catch {
      setStatusMessage("Failed to parse PPTX file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (slides.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await convertSlidesToPdf(slides, {
        theme,
        deckTitle,
        includeSlideNumbers,
      });

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deckTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "presentation"}-slides.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "PDF creation failed";
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>100% Client-Side Privacy:</strong> PowerPoint PPTX decompression and vector 16:9 presentation slide rendering execute entirely in browser RAM. Zero external cloud servers.
          </span>
        </div>
        <span className="font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded text-[10px]">
          16:9 VECTOR SLIDES
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Outline Editor & Input Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Presentation className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Presentation Deck Outline & Content</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pptx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload PPTX
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 text-muted-foreground"
                  onClick={() => {
                    setMarkdownInput(SAMPLE_PRESENTATION_MARKDOWN);
                    setDeckTitle("Qwertygen Strategic Deck");
                    setStatusMessage("");
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                  Sample Deck
                </Button>
              </div>
            </div>

            {/* Deck Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Deck Title / Running Footer</label>
              <input
                type="text"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="Presentation Deck Title"
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Outline Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Slide Content (Separate slides with &apos;---&apos;)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {slides.length} slides ready
                </span>
              </div>
              <textarea
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
                rows={12}
                className="w-full p-3 font-mono text-xs leading-relaxed bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                placeholder="# Slide Title&#10;## Subtitle&#10;• Bullet 1&#10;• Bullet 2&#10;---&#10;# Next Slide"
              />
            </div>

            {statusMessage && (
              <p className="text-xs text-muted-foreground font-medium">{statusMessage}</p>
            )}
          </div>
        </div>

        {/* Right Column: Theme & Slide Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Palette className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Theme & Slide Layout</h2>
            </div>

            {/* Theme Picker */}
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    theme === t.id
                      ? "ring-2 ring-primary border-primary shadow-sm"
                      : "hover:border-foreground/40 border-border"
                  } ${t.bgClass}`}
                >
                  <p className={`text-xs font-semibold ${t.textClass}`}>{t.label}</p>
                  <p className="text-[10px] opacity-70">16:9 Widescreen</p>
                </button>
              ))}
            </div>

            {/* Slide Count & Options */}
            <div className="pt-2 border-t border-border space-y-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSlideNumbers}
                  onChange={(e) => setIncludeSlideNumbers(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-foreground">Print slide number counter (&quot;1 / {slides.length}&quot;)</span>
              </label>
            </div>

            {/* Mini Slide Deck Deck Overview */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Deck Slide Cards ({slides.length})
              </div>
              {slides.map((s, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded border border-border bg-muted/30 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>SLIDE {idx + 1}</span>
                    <span>{s.bullets.length} bullets</span>
                  </div>
                  <p className="font-semibold text-foreground truncate">{s.title}</p>
                  {s.subtitle && <p className="text-[11px] text-muted-foreground truncate">{s.subtitle}</p>}
                </div>
              ))}
            </div>

            {/* Download CTA */}
            <div className="pt-4 border-t border-border space-y-2">
              <Button
                onClick={handleDownloadPdf}
                disabled={isProcessing || slides.length === 0}
                className="w-full gap-2 py-5 font-semibold text-sm shadow-md"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rendering Slide Deck...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download 16:9 Presentation PDF
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Executive 16:9 format (960×540 pt)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
