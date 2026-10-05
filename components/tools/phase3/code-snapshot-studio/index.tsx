"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  SupportedLanguage,
  ThemeId,
  BackgroundPreset,
  WindowStyle,
  PaddingSize,
  THEMES,
  BACKGROUND_PRESETS,
  SAMPLE_CODE_SNIPPETS,
  generateSvgSnapshot,
} from "./logic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Copy,
  Check,
  FileCode,
  Palette,
  Layers,
  Settings2,
  RefreshCw,
} from "lucide-react";

export default function CodeSnapshotStudio() {
  const [code, setCode] = useState<string>(SAMPLE_CODE_SNIPPETS.typescript);
  const [language, setLanguage] = useState<SupportedLanguage>("typescript");
  const [theme, setTheme] = useState<ThemeId>("dracula");
  const [background, setBackground] = useState<BackgroundPreset>("cosmic");
  const [windowStyle, setWindowStyle] = useState<WindowStyle>("mac");
  const [padding, setPadding] = useState<PaddingSize>("balanced");
  const [title, setTitle] = useState<string>("cache.ts");
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(14);
  const [exportScale, setExportScale] = useState<number>(2); // 2x Retina

  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // When language changes, update sample code if unchanged
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const prevSample = SAMPLE_CODE_SNIPPETS[language];
    if (code.trim() === prevSample?.trim()) {
      setCode(SAMPLE_CODE_SNIPPETS[newLang] ?? "");
      setTitle(`example.${newLang === "python" ? "py" : newLang === "rust" ? "rs" : newLang === "go" ? "go" : newLang}`);
    }
  };

  const currentSvg = generateSvgSnapshot({
    code,
    language,
    theme,
    background,
    windowStyle,
    padding,
    title,
    showLineNumbers,
    fontSize,
  });

  // Render SVG onto hidden Canvas for raster export
  const renderToCanvas = useCallback(
    (scale = exportScale): Promise<HTMLCanvasElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const svgBlob = new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" });
        const URL = window.URL || window.webkitURL || window;
        const blobUrl = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(blobUrl);
            return reject(new Error("Failed to get 2d canvas context"));
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);

          URL.revokeObjectURL(blobUrl);
          resolve(canvas);
        };

        img.onerror = (err) => {
          URL.revokeObjectURL(blobUrl);
          reject(err);
        };

        img.src = blobUrl;
      });
    },
    [currentSvg, exportScale]
  );

  // 1-Click Download High-Res PNG
  const handleDownloadPng = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderToCanvas(exportScale);
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, "_") || "code-snapshot"}-${exportScale}x.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // 1-Click Download Vector SVG
  const handleDownloadSvg = () => {
    const blob = new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, "_") || "code-snapshot"}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 1-Click Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderToCanvas(2);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2000);
        } catch {
          // Fallback if clipboard.write image item not supported
          setCopiedImage(false);
        } finally {
          setIsExporting(false);
        }
      }, "image/png");
    } catch (err) {
      console.error("Copy image error:", err);
      setIsExporting(false);
    }
  };

  // 1-Click Copy Raw Code
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Preset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-slate-500" />
            <Select value={language} onValueChange={(val) => handleLanguageChange(val as SupportedLanguage)}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="bash">Bash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-500" />
            <Select value={theme} onValueChange={(val) => setTheme(val as ThemeId)}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(THEMES).map(([id, t]) => (
                  <SelectItem key={id} value={id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Background Preset */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <Select value={background} onValueChange={(val) => setBackground(val as BackgroundPreset)}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue placeholder="Background" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BACKGROUND_PRESETS).map(([id, b]) => (
                  <SelectItem key={id} value={id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyImage}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedImage ? "Image Copied!" : "Copy Image"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>SVG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG ({exportScale}x)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Layout Customization */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Source Code
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                {copiedText ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste or write code here..."
              rows={14}
              className="w-full p-3 font-mono text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-y"
              spellCheck={false}
            />

            {/* Customization Options */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Card Appearance</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    Filename / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. index.ts"
                    className="w-full px-2.5 py-1.5 rounded-md text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Window Style */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    Window Controls
                  </label>
                  <Select value={windowStyle} onValueChange={(val) => setWindowStyle(val as WindowStyle)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mac">macOS Dots</SelectItem>
                      <SelectItem value="windows">Windows Header</SelectItem>
                      <SelectItem value="simple">Minimalist</SelectItem>
                      <SelectItem value="none">Borderless</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Padding */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    Canvas Padding
                  </label>
                  <Select value={padding} onValueChange={(val) => setPadding(val as PaddingSize)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight (16px)</SelectItem>
                      <SelectItem value="compact">Compact (32px)</SelectItem>
                      <SelectItem value="balanced">Balanced (48px)</SelectItem>
                      <SelectItem value="spacious">Spacious (64px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Resolution */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    Export Scale
                  </label>
                  <Select value={String(exportScale)} onValueChange={(val) => setExportScale(Number(val))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1x Standard</SelectItem>
                      <SelectItem value="2">2x Retina HD</SelectItem>
                      <SelectItem value="3">3x Ultra 4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLineNumbers}
                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show Line Numbers</span>
                </label>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Font:</span>
                  <button
                    type="button"
                    onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                    className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-mono">{fontSize}</span>
                  <button
                    type="button"
                    onClick={() => setFontSize(Math.min(20, fontSize + 1))}
                    className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live High-Res Snapshot Preview */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Preview
              </span>
              <span className="text-[11px] text-slate-400">
                {THEMES[theme]?.name} · {BACKGROUND_PRESETS[background]?.name}
              </span>
            </div>

            {/* Scrollable Container with centered snapshot */}
            <div className="flex-1 overflow-auto rounded-lg bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center min-h-[420px]">
              <div
                className="max-w-full transition-transform duration-200 shadow-xl rounded-xl overflow-hidden"
                dangerouslySetInnerHTML={{ __html: currentSvg }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
