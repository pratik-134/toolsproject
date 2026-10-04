"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generateRtfDocument,
  RTF_TEMPLATES,
  RtfDocumentOptions,
} from "./logic";
import {
  FileText,
  Download,
  Copy,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Code2,
  Eye,
  Type,
  List,
} from "lucide-react";

export default function DirectRtfCreatorTool() {
  const [title, setTitle] = useState<string>("Executive Summary");
  const [author, setAuthor] = useState<string>("Cleartrix Author");
  const [body, setBody] = useState<string>(RTF_TEMPLATES["Business Proposal"]?.body ?? "");
  const [fontFamily, setFontFamily] = useState<"Arial" | "Calibri" | "Times New Roman">("Calibri");
  const [fontSizePt, setFontSizePt] = useState<number>(12);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState<boolean>(false);

  // Generate RTF document
  const rtfSource = useMemo(() => {
    return generateRtfDocument({
      title,
      author,
      body,
      fontFamily,
      fontSizePt,
    });
  }, [title, author, body, fontFamily, fontSizePt]);

  const handleDownload = () => {
    const blob = new Blob([rtfSource], { type: "application/rtf;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.rtf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rtfSource);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const insertSnippet = (snippet: string) => {
    setBody((prev) => `${prev}\n${snippet}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy guarantee badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          100% In-Browser Document Engine — RTF syntax and files are compiled in memory and never sent to a server.
        </span>
      </div>

      {/* Templates Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Sample Templates:
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(RTF_TEMPLATES).map((templateKey) => (
            <button
              key={templateKey}
              onClick={() => {
                const t = RTF_TEMPLATES[templateKey];
                if (t) {
                  setTitle(t.title);
                  setBody(t.body);
                }
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-card hover:bg-accent border border-border transition-colors font-medium text-foreground"
            >
              {templateKey}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTitle("");
              setBody("");
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor & Formatting Toolbar */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            {/* Document Metadata Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-foreground font-medium text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Business Proposal"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg text-foreground font-medium text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Jane Doe"
                />
              </div>
            </div>

            {/* Typography Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs">
                <Select
                  value={fontFamily}
                  onValueChange={(v) =>
                    setFontFamily(v as "Arial" | "Calibri" | "Times New Roman")
                  }
                >
                  <SelectTrigger className="h-7 w-[120px] text-xs bg-muted border-border">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calibri">Calibri</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={String(fontSizePt)}
                  onValueChange={(v) => setFontSizePt(parseInt(v, 10))}
                >
                  <SelectTrigger className="h-7 w-[120px] text-xs bg-muted border-border">
                    <SelectValue placeholder="Font Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 pt</SelectItem>
                    <SelectItem value="11">11 pt</SelectItem>
                    <SelectItem value="12">12 pt (Standard)</SelectItem>
                    <SelectItem value="14">14 pt</SelectItem>
                    <SelectItem value="16">16 pt</SelectItem>
                    <SelectItem value="18">18 pt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Snippets */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSnippet("• ")}
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                  title="Insert Bullet"
                >
                  <List className="w-3.5 h-3.5 mr-1" />
                  Bullet
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSnippet("--------------------------------------------------")}
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                  title="Insert Divider"
                >
                  Divider
                </Button>
              </div>
            </div>

            {/* Document Content Textarea */}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your document content here..."
              rows={14}
              className="w-full p-3 font-sans text-xs bg-muted/20 border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Previews & Download */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl min-h-[440px] flex flex-col justify-between space-y-3">
            <div>
              {/* Header Toggle & Actions */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex gap-1">
                  <Button
                    variant={activeTab === "preview" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("preview")}
                    className="h-7 text-xs gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Document Sheet
                  </Button>
                  <Button
                    variant={activeTab === "code" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("code")}
                    className="h-7 text-xs gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    RTF Code
                  </Button>
                </div>

                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-xs gap-1"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownload}
                    className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .rtf
                  </Button>
                </div>
              </div>

              {/* View Content */}
              <div className="pt-3">
                {activeTab === "preview" ? (
                  <div className="p-5 bg-card border border-border shadow-xs rounded-lg min-h-[320px] max-h-[380px] overflow-y-auto space-y-3">
                    {title && (
                      <h2 className="text-base font-bold text-foreground pb-2 border-b border-border">
                        {title}
                      </h2>
                    )}
                    <pre
                      style={{
                        fontFamily:
                          fontFamily === "Times New Roman"
                            ? "Times New Roman, serif"
                            : fontFamily === "Arial"
                            ? "Arial, sans-serif"
                            : "Calibri, sans-serif",
                        fontSize: `${fontSizePt}px`,
                      }}
                      className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-normal"
                    >
                      {body || "Empty document"}
                    </pre>
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={rtfSource}
                    rows={15}
                    className="w-full p-2.5 font-mono text-[11px] bg-muted/40 border border-border rounded-lg text-foreground resize-none focus:outline-none"
                  />
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Standard 7-bit ASCII RTF 1.5</span>
              <span>Opens in Word, TextEdit &amp; WordPad</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
