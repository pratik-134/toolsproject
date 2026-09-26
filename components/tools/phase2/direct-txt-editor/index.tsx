"use client";

import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  computeTextStats,
  convertLineEndings,
  transformCase,
  cleanWhitespace,
  convertIndentation,
} from "./logic";
import {
  FileText,
  Upload,
  Download,
  Copy,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  AlignLeft,
  Clock,
  HardDrive,
  Sparkles,
  Type,
  Maximize2,
  Minimize2,
} from "lucide-react";

const SAMPLE_TEXT = `Welcome to Mindkit Direct TXT Editor!

This is a distraction-free, zero-upload notepad built for fast plain text drafting, formatting, and file preparation.

Key In-Browser Features:
1. Pure local execution: Your text never travels over any network.
2. Line ending control: Switch effortlessly between Linux/macOS (LF) and Windows (CRLF).
3. Precision string analytics: Instant character counts, word density, and UTF-8 memory footprint.
4. Smart formatting utilities: Whitespace cleanup, indentation conversion, and case switching.

Paste your notes, logs, or drafts here to get started, or drag and drop any local text file directly onto the editor.`;

export default function DirectTxtEditorTool() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [filename, setFilename] = useState<string>("document.txt");
  const [lineEnding, setLineEnding] = useState<"lf" | "crlf">("lf");
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live metrics computation
  const stats = useMemo(() => computeTextStats(text), [text]);

  // File loading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Drag and drop loading
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setText(content);
      }
    };
    reader.readAsText(file);
  };

  // Download file with selected line endings
  const handleDownload = () => {
    const preparedText = convertLineEndings(text, lineEnding);
    const blob = new Blob([preparedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Transformations
  const handleCaseChange = (mode: "upper" | "lower" | "title" | "sentence") => {
    setText((prev) => transformCase(prev, mode));
  };

  const handleWhitespaceClean = (options: {
    trimTrailing?: boolean;
    normalizeBlankLines?: boolean;
    stripBlankLines?: boolean;
  }) => {
    setText((prev) => cleanWhitespace(prev, options));
  };

  const handleIndent = (target: "tabs" | "spaces") => {
    setText((prev) => convertIndentation(prev, target, 2));
  };

  return (
    <div className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-50 bg-background p-6 overflow-auto" : ""}`}>
      {/* Privacy Guarantee Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">
            100% In-Browser Text Processor • Zero Server Sync • Client Sandboxed
          </div>
        </div>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
          Strict In-Memory Buffer
        </span>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
            <AlignLeft className="w-3.5 h-3.5 text-primary" /> Words
          </div>
          <div className="text-lg font-bold text-foreground mt-1">
            {stats.words.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
            <Type className="w-3.5 h-3.5 text-primary" /> Characters
          </div>
          <div className="text-lg font-bold text-foreground mt-1">
            {stats.charactersWithSpaces.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {stats.charactersNoSpaces.toLocaleString()} no spaces
          </div>
        </div>
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium">Lines</div>
          <div className="text-lg font-bold text-foreground mt-1">
            {stats.lines.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium">Paragraphs</div>
          <div className="text-lg font-bold text-foreground mt-1">
            {stats.paragraphs.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-primary" /> Memory Size
          </div>
          <div className="text-lg font-bold text-foreground mt-1">
            {stats.bytesUtf8 < 1024
              ? `${stats.bytesUtf8} B`
              : `${(stats.bytesUtf8 / 1024).toFixed(1)} KB`}
          </div>
        </div>
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" /> Reading Time
          </div>
          <div className="text-lg font-bold text-foreground mt-1">
            ~{stats.readingTimeMinutes} min
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div
        className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Editor Toolbar */}
        <div className="p-3 bg-muted/40 border-b flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* File Operations */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.text,.log,.md,.csv,.json"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs h-8"
            >
              <Upload className="w-3.5 h-3.5" /> Open TXT
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              className="gap-1.5 text-xs h-8 bg-primary text-primary-foreground font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> Save TXT
            </Button>

            <div className="flex items-center gap-1 bg-background border px-2 py-1 rounded-lg">
              <span className="text-[11px] text-muted-foreground">Line Endings:</span>
              <button
                type="button"
                onClick={() => setLineEnding("lf")}
                className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-medium transition ${
                  lineEnding === "lf"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Unix/macOS (LF)"
              >
                LF
              </button>
              <button
                type="button"
                onClick={() => setLineEnding("crlf")}
                className={`text-[11px] px-1.5 py-0.5 rounded font-mono font-medium transition ${
                  lineEnding === "crlf"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Windows (CRLF)"
              >
                CRLF
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText("")}
              className="gap-1 text-xs h-8 text-muted-foreground hover:text-red-500"
              title="Clear all text"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Format Ribbon */}
        <div className="px-3 py-2 bg-muted/20 border-b flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> Transform:
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCaseChange("upper")}
              className="px-2 py-0.5 rounded bg-background border text-[11px] hover:bg-muted font-medium"
            >
              UPPERCASE
            </button>
            <button
              onClick={() => handleCaseChange("lower")}
              className="px-2 py-0.5 rounded bg-background border text-[11px] hover:bg-muted font-medium"
            >
              lowercase
            </button>
            <button
              onClick={() => handleCaseChange("title")}
              className="px-2 py-0.5 rounded bg-background border text-[11px] hover:bg-muted font-medium"
            >
              Title Case
            </button>
            <button
              onClick={() => handleCaseChange("sentence")}
              className="px-2 py-0.5 rounded bg-background border text-[11px] hover:bg-muted font-medium"
            >
              Sentence case
            </button>
          </div>

          <div className="h-3 w-px bg-border mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleWhitespaceClean({ trimTrailing: true })}
              className="px-2 py-0.5 rounded bg-background border text-[11px] hover:bg-muted"
            >
              Trim Spaces
            </button>
            <button
              onClick={() => handleWhitespaceClean({ normalizeBlankLines: true })}
              className="px-2 py-0.5 rounded bg-background border text-[11px] hover:bg-muted"
            >
              Normalize Blank Lines
            </button>
            <button
              onClick={() => handleWhitespaceClean({ stripBlankLines: true })}
              className="px-2 py-0.5 rounded bg-background border text-[11px] hover:bg-muted"
            >
              Remove Blank Lines
            </button>
          </div>

          <div className="h-3 w-px bg-border mx-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleIndent("tabs")}
              className="px-2 py-0.5 rounded bg-background border text-[11px] hover:bg-muted"
            >
              Spaces → Tabs
            </button>
            <button
              onClick={() => handleIndent("spaces")}
              className="px-2 py-0.5 rounded bg-background border text-[11px] hover:bg-muted"
            >
              Tabs → Spaces
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here (or drag and drop a .txt file)..."
            className={`w-full p-4 font-mono text-sm bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed ${
              isFullScreen ? "h-[calc(100vh-280px)]" : "h-[450px]"
            }`}
            spellCheck={true}
          />
        </div>

        {/* Status Footer */}
        <div className="px-4 py-2 bg-muted/30 border-t flex flex-wrap items-center justify-between text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span>Encoding: UTF-8</span>
            <span>Target Line Ending: {lineEnding.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>File:</span>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="bg-background border rounded px-1.5 py-0.5 text-[11px] w-36 font-sans text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
