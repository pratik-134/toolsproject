"use client";

import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  minifySvg,
  validateSvg,
  formatBytes,
  DEFAULT_SVG_MINIFY_OPTIONS,
  SvgMinifyOptions,
} from "./logic";
import {
  FileCode,
  Upload,
  Download,
  Copy,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Eye,
  Code2,
  AlertCircle,
  ShieldCheck,
  Sliders,
} from "lucide-react";

const SAMPLE_SVGS: Record<string, string> = {
  "Star Icon with Metadata": `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generator: Adobe Illustrator 25.0, SVG Export Plug-In -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100" width="100" height="100">
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about="" />
    </rdf:RDF>
  </metadata>
  <defs>
    <style type="text/css">
      .st0{fill:#f59e0b;}
    </style>
  </defs>
  <g id="Layer_1" inkscape:label="Layer 1" class="">
    <polygon class="st0" points="50.12345,5.67891 63.98765,33.54321 95.12345,38.12345 72.54321,60.12345 77.87654,91.23456 50.12345,76.54321 22.34567,91.23456 27.67891,60.12345 5.12345,38.12345 36.23456,33.54321" />
  </g>
</svg>`,
  "Badge Vector": `<!-- Cleartrix SVG Badge Vector -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <g id="emptyWrapper">
  </g>
  <circle cx="60.000000" cy="60.000000" r="54.234567" fill="#6366f1" stroke="#4338ca" stroke-width="4.000000" />
  <path d="M 40.1234 60.5432 L 54.8765 75.1234 L 82.2345 45.4567" fill="none" stroke="#ffffff" stroke-width="6.54321" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,
};

export default function SvgMinifierTool() {
  const [inputSvg, setInputSvg] = useState<string>(SAMPLE_SVGS["Star Icon with Metadata"] ?? "");
  const [options, setOptions] = useState<Required<SvgMinifyOptions>>(DEFAULT_SVG_MINIFY_OPTIONS);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute minification result
  const result = useMemo(() => {
    if (!inputSvg.trim()) return null;
    return minifySvg(inputSvg, options);
  }, [inputSvg, options]);

  // Validation
  const validation = useMemo(() => {
    return validateSvg(inputSvg);
  }, [inputSvg]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") {
      alert("Please upload a valid .svg vector file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInputSvg(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = async () => {
    if (!result?.minifiedSvg) return;
    try {
      await navigator.clipboard.writeText(result.minifiedSvg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = result.minifiedSvg;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result?.minifiedSvg) return;
    const blob = new Blob([result.minifiedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vector-optimized.min.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Vector Processing — SVG files are parsed in memory and never uploaded to remote servers.
        </span>
      </div>

      {/* Preset Pickers */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Sample Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(SAMPLE_SVGS).map((presetName) => (
            <button
              key={presetName}
              onClick={() => setInputSvg(SAMPLE_SVGS[presetName] ?? "")}
              className="text-xs px-3 py-1.5 rounded-lg bg-card hover:bg-accent border border-border transition-colors font-medium text-foreground"
            >
              {presetName}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInputSvg("")}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Main Grid: Input & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Upload */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileCode className="w-4 h-4 text-primary" />
              SVG Code or File
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
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
                className="h-8 text-xs gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload SVG File
              </Button>
            </div>
          </div>

          <textarea
            value={inputSvg}
            onChange={(e) => setInputSvg(e.target.value)}
            placeholder="Paste your raw <svg>...</svg> markup here or drag & drop an SVG file..."
            rows={12}
            className="w-full p-3 font-mono text-xs bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-y"
          />

          {!validation.valid && inputSvg.trim() && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validation.error}</span>
            </div>
          )}

          {/* Minification Options Box */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                Minification Rules
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Precision:</span>
                <Select
                  value={String(options.precision)}
                  onValueChange={(val) =>
                    setOptions({ ...options, precision: parseInt(val, 10) })
                  }
                >
                  <SelectTrigger className="h-6 w-44 text-xs font-mono bg-muted border-border">
                    <SelectValue placeholder="Precision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 decimal (Aggressive)</SelectItem>
                    <SelectItem value="2">2 decimals (Balanced)</SelectItem>
                    <SelectItem value="3">3 decimals (High-Res)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={options.removeComments}
                  onChange={(e) => setOptions({ ...options, removeComments: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Remove Comments (`&lt;!-- --&gt;`)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={options.removeDoctype}
                  onChange={(e) => setOptions({ ...options, removeDoctype: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Remove DOCTYPE & XML Declarations</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={options.removeMetadata}
                  onChange={(e) => setOptions({ ...options, removeMetadata: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Strip Editor Metadata & RDF</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={options.removeUnusedNamespaces}
                  onChange={(e) => setOptions({ ...options, removeUnusedNamespaces: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Strip Illustrator/Inkscape Namespaces</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={options.removeEmptyTags}
                  onChange={(e) => setOptions({ ...options, removeEmptyTags: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Remove Empty Groups & Tags</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={options.collapseWhitespace}
                  onChange={(e) => setOptions({ ...options, collapseWhitespace: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Collapse Redundant Whitespace</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Previews */}
        <div className="lg:col-span-5 space-y-4">
          {/* Metrics summary banner */}
          {result && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-xl border border-border text-center">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Original</p>
                <p className="text-sm font-semibold font-mono text-foreground">
                  {formatBytes(result.originalBytes)}
                </p>
              </div>
              <div className="border-x border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Optimized</p>
                <p className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatBytes(result.minifiedBytes)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Saved</p>
                <p className="text-sm font-semibold font-mono text-primary">
                  {result.savingsPercent}%
                </p>
              </div>
            </div>
          )}

          {/* View Toggle Bar */}
          <div className="flex items-center justify-between bg-card p-1.5 rounded-xl border border-border">
            <div className="flex gap-1">
              <Button
                variant={viewMode === "visual" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("visual")}
                className="h-7 text-xs gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Visual Preview
              </Button>
              <Button
                variant={viewMode === "code" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("code")}
                className="h-7 text-xs gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                Minified Markup
              </Button>
            </div>

            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!result?.minifiedSvg}
                className="h-7 text-xs gap-1"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                disabled={!result?.minifiedSvg}
                className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-3.5 h-3.5" />
                Download .svg
              </Button>
            </div>
          </div>

          {/* Preview Canvas or Code */}
          <div className="bg-card border border-border rounded-xl p-4 min-h-[300px] flex flex-col justify-center items-center overflow-hidden">
            {viewMode === "visual" ? (
              <div className="w-full flex flex-col items-center justify-center space-y-4">
                <div
                  className="max-w-[280px] max-h-[280px] flex items-center justify-center p-4 border border-dashed border-border rounded-xl bg-muted/20"
                  dangerouslySetInnerHTML={{
                    __html: result?.minifiedSvg || "<p class='text-xs text-muted-foreground'>No SVG to display</p>",
                  }}
                />
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Rendered live from optimized vector markup
                </span>
              </div>
            ) : (
              <textarea
                readOnly
                value={result?.minifiedSvg ?? ""}
                rows={12}
                className="w-full h-full p-2.5 font-mono text-xs bg-muted/30 border-0 rounded-lg text-foreground resize-none focus:outline-none"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
