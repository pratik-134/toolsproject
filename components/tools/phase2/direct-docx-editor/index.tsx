"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DocxBlock,
  DocxDocumentConfig,
  DOCX_TEMPLATES,
  buildDocxDocument,
} from "./logic";
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Palette,
  Heading1,
  Heading2,
  AlignLeft,
  List,
  Quote,
} from "lucide-react";

const THEME_COLORS: { name: string; hex: string }[] = [
  { name: "Corporate Blue", hex: "2563EB" },
  { name: "Modern Emerald", hex: "059669" },
  { name: "Executive Slate", hex: "1E293B" },
  { name: "Creative Violet", hex: "7C3AED" },
  { name: "Crimson Red", hex: "DC2626" },
];

export default function DirectDocxEditorTool() {
  const [title, setTitle] = useState<string>("Enterprise Architecture Proposal");
  const [subtitle, setSubtitle] = useState<string>("Client-Side Utility Platform Specification");
  const [author, setAuthor] = useState<string>("Mindkit Author");
  const [accentColor, setAccentColor] = useState<string>("2563EB");
  const [blocks, setBlocks] = useState<DocxBlock[]>(
    DOCX_TEMPLATES["Project Proposal"]?.blocks ?? []
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const addBlock = (type: DocxBlock["type"]) => {
    const newBlock: DocxBlock = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      content:
        type === "heading1"
          ? "New Section Heading"
          : type === "heading2"
          ? "Subsection Title"
          : type === "bullet"
          ? "Key requirement or feature"
          : type === "callout"
          ? "Important highlight or notice"
          : "Enter your paragraph text here.",
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const loadTemplate = (templateName: string) => {
    const t = DOCX_TEMPLATES[templateName];
    if (t) {
      setTitle(t.title);
      setSubtitle(t.subtitle);
      setBlocks([...t.blocks]);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const config: DocxDocumentConfig = {
        title,
        subtitle,
        author,
        accentColorHex: accentColor,
        blocks,
      };

      const docxBytes = await buildDocxDocument(config);
      const blob = new Blob([docxBytes as unknown as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate DOCX:", err);
      alert("Error generating DOCX document.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Word Document Generator — DOCX binary packages are built locally in memory with zero cloud uploads.
        </span>
      </div>

      {/* Templates Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Templates:
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(DOCX_TEMPLATES).map((tmplName) => (
            <button
              key={tmplName}
              onClick={() => loadTemplate(tmplName)}
              className="text-xs px-3 py-1.5 rounded-lg bg-card hover:bg-accent border border-border transition-colors font-medium text-foreground"
            >
              {tmplName}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTitle("Untitled Document");
              setSubtitle("");
              setBlocks([]);
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Builder Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-border">
              <FileText className="w-4 h-4 text-primary" />
              Document Properties
            </h3>

            {/* Document Title & Subtitle */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-foreground font-semibold text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Project Proposal"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Scope & Requirements"
                />
              </div>

              {/* Accent Color Theme */}
              <div className="pt-1">
                <label className="text-muted-foreground block mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-primary" />
                  Heading Accent Color
                </label>
                <div className="flex gap-2">
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setAccentColor(c.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        accentColor === c.hex ? "scale-110 border-foreground shadow-sm" : "border-transparent"
                      }`}
                      style={{ backgroundColor: `#${c.hex}` }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Add Section Buttons */}
            <div className="pt-2 border-t border-border space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Add Content Block
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock("heading1")}
                  className="h-7 text-[11px] px-1 gap-1"
                >
                  <Heading1 className="w-3 h-3" />
                  H1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock("heading2")}
                  className="h-7 text-[11px] px-1 gap-1"
                >
                  <Heading2 className="w-3 h-3" />
                  H2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock("paragraph")}
                  className="h-7 text-[11px] px-1 gap-1"
                >
                  <AlignLeft className="w-3 h-3" />
                  Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock("bullet")}
                  className="h-7 text-[11px] px-1 gap-1"
                >
                  <List className="w-3 h-3" />
                  Bullet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock("callout")}
                  className="h-7 text-[11px] px-1 gap-1"
                >
                  <Quote className="w-3 h-3" />
                  Callout
                </Button>
              </div>
            </div>

            {/* Block Items List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="p-2.5 bg-muted/20 border border-border rounded-lg space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-primary uppercase">
                      {index + 1}. {block.type}
                    </span>
                    <button
                      onClick={() => removeBlock(block.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete block"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {block.type === "paragraph" || block.type === "callout" ? (
                    <textarea
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, e.target.value)}
                      rows={2}
                      className="w-full p-1.5 bg-card border border-border rounded text-xs text-foreground focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, e.target.value)}
                      className="w-full px-2 py-1 bg-card border border-border rounded text-xs text-foreground focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Paper Preview & Download */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl min-h-[460px] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Live Document Sheet
                </span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isGenerating ? "Building DOCX..." : "Download .docx"}
                </Button>
              </div>

              {/* Rendered Paper Document Preview */}
              <div className="mt-3 p-6 bg-white dark:bg-slate-900 border border-border rounded-lg shadow-sm max-h-[380px] overflow-y-auto space-y-3 font-sans text-xs">
                {title && (
                  <h1
                    className="text-base font-bold pb-1"
                    style={{ color: `#${accentColor}` }}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-[11px] text-slate-500 italic pb-2 border-b border-slate-200 dark:border-slate-800">
                    {subtitle}
                  </p>
                )}

                <div className="space-y-2.5 pt-1">
                  {blocks.map((b) => {
                    if (b.type === "heading1") {
                      return (
                        <h2
                          key={b.id}
                          className="text-sm font-bold pt-2 pb-0.5"
                          style={{ color: `#${accentColor}` }}
                        >
                          {b.content}
                        </h2>
                      );
                    }
                    if (b.type === "heading2") {
                      return (
                        <h3 key={b.id} className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
                          {b.content}
                        </h3>
                      );
                    }
                    if (b.type === "bullet") {
                      return (
                        <li key={b.id} className="list-disc ml-4 text-slate-700 dark:text-slate-300">
                          {b.content}
                        </li>
                      );
                    }
                    if (b.type === "callout") {
                      return (
                        <div
                          key={b.id}
                          className="p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded border-l-4 text-slate-800 dark:text-slate-200 italic"
                          style={{ borderLeftColor: `#${accentColor}` }}
                        >
                          {b.content}
                        </div>
                      );
                    }
                    return (
                      <p key={b.id} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {b.content}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Standard OOXML Microsoft Word (.docx)</span>
              <span>Fully compatible with Word &amp; Google Docs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
