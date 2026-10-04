"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  bundleHtmlDocument,
  extractTagsCount,
  validateHtmlMarkup,
  HTML_TEMPLATES,
} from "./logic";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { DraftRestoredBanner } from "@/components/tool-shell/DraftRestoredBanner";
import {
  FileCode,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Play,
  RotateCcw,
  Sparkles,
  Eye,
  Layers,
  Code2,
  Palette,
  Terminal,
  AlertTriangle,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface HtmlEditorDraft {
  html: string;
  css: string;
  js: string;
  title: string;
}

export default function DirectHtmlEditorTool() {
  const defaultTmpl = HTML_TEMPLATES.landing;
  const [selectedTemplate, setSelectedTemplate] = useState<string>("landing");

  const {
    value: draftState,
    setValue: setDraftState,
    isDraftRestored,
    formattedSavedAt,
    clearDraft,
    dismissRestoredBanner,
  } = useToolDraft<HtmlEditorDraft>({
    toolSlug: "direct-html-editor",
    initialValue: {
      html: defaultTmpl?.html || "",
      css: defaultTmpl?.css || "",
      js: defaultTmpl?.js || "",
      title: defaultTmpl?.title || "Product Landing Card",
    },
  });

  const html = draftState.html;
  const css = draftState.css;
  const js = draftState.js;
  const title = draftState.title;

  const setHtml = (val: string) => setDraftState((prev) => ({ ...prev, html: val }));
  const setCss = (val: string) => setDraftState((prev) => ({ ...prev, css: val }));
  const setJs = (val: string) => setDraftState((prev) => ({ ...prev, js: val }));
  const setTitle = (val: string) => setDraftState((prev) => ({ ...prev, title: val }));

  const [activeCodeTab, setActiveCodeTab] = useState<"html" | "css" | "js">("html");
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Template switch handler
  const handleTemplateChange = (key: string) => {
    setSelectedTemplate(key);
    const tmpl = HTML_TEMPLATES[key];
    if (tmpl) {
      setDraftState({
        html: tmpl.html,
        css: tmpl.css,
        js: tmpl.js,
        title: tmpl.title,
      });
    }
  };

  // Compile bundle
  const bundledSource = useMemo(() => {
    return bundleHtmlDocument(html, css, js, title);
  }, [html, css, js, title]);

  // Validation
  const validation = useMemo(() => {
    return validateHtmlMarkup(html);
  }, [html]);

  // Tag frequency
  const tagCounts = useMemo(() => {
    return extractTagsCount(html);
  }, [html]);

  // Update iframe
  useEffect(() => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(bundledSource);
        doc.close();
      }
    } catch {
      // In case of sandbox security edge case
    }
  }, [bundledSource]);

  const handleDownload = () => {
    const blob = new Blob([bundledSource], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9_-]/g, "_") || "bundle"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyBundle = async () => {
    try {
      await navigator.clipboard.writeText(bundledSource);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-50 bg-background p-6 overflow-auto" : ""}`}>
      <DraftRestoredBanner
        isRestored={isDraftRestored}
        savedAtFormatted={formattedSavedAt}
        onReset={() => clearDraft(true)}
        onDismiss={dismissRestoredBanner}
      />

      {/* Privacy Guarantee Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">
            100% In-Browser Code Playground • Client-Side Sandboxing • Zero Egress
          </div>
        </div>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
          Isolated Sandbox
        </span>
      </div>

      {/* Control Bar: Templates & Bundle Actions */}
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Template Preset
              </label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="h-8 w-44 text-xs font-medium bg-background border rounded-lg text-foreground">
                  <SelectValue placeholder="Template Preset" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HTML_TEMPLATES).map(([key, t]) => (
                    <SelectItem key={key} value={key}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs bg-background border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 w-48 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              size="sm"
              className="gap-1.5 text-xs bg-primary text-primary-foreground font-semibold shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export HTML Bundle
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyBundle}
              className="gap-1.5 text-xs"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Bundle
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTemplateChange(selectedTemplate)}
              className="text-xs text-muted-foreground hover:text-foreground"
              title="Reset code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {isFullScreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Tag Frequency Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <span className="text-[11px] font-semibold flex items-center gap-1">
            <Layers className="w-3 h-3 text-primary" /> Elements:
          </span>
          {Object.keys(tagCounts).length === 0 ? (
            <span className="text-[11px] italic">None</span>
          ) : (
            Object.entries(tagCounts)
              .slice(0, 8)
              .map(([tag, count]) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-muted border text-[10px] font-mono text-foreground font-medium"
                >
                  &lt;{tag}&gt; {count}
                </span>
              ))
          )}
          <span className="ml-auto text-[11px] font-mono">
            {bundledSource.length.toLocaleString()} total bundle bytes
          </span>
        </div>
      </div>

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl text-xs space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Markup Warnings
          </div>
          {validation.warnings.map((w, i) => (
            <div key={i} className="pl-5 text-[11px]">
              • {w}
            </div>
          ))}
        </div>
      )}

      {/* Split Workspace: Tabs/Editor + Sandbox Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[580px]">
        {/* Editor Column */}
        <div className="flex flex-col border rounded-xl overflow-hidden bg-card shadow-sm">
          {/* Tab Selector */}
          <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b">
            <div className="flex items-center gap-1 bg-background border p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveCodeTab("html")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded font-medium transition ${
                  activeCodeTab === "html"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" /> HTML
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab("css")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded font-medium transition ${
                  activeCodeTab === "css"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> CSS
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab("js")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded font-medium transition ${
                  activeCodeTab === "js"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> JavaScript
              </button>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {activeCodeTab === "html"
                ? `${html.length} chars`
                : activeCodeTab === "css"
                ? `${css.length} chars`
                : `${js.length} chars`}
            </span>
          </div>

          {/* Active Pane Textarea */}
          <div className="flex-1 p-3 bg-muted/10">
            {activeCodeTab === "html" && (
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Write HTML markup here..."
                className="w-full h-full min-h-[480px] p-3 text-xs font-mono bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                spellCheck={false}
              />
            )}
            {activeCodeTab === "css" && (
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                placeholder="Write CSS styling rules here..."
                className="w-full h-full min-h-[480px] p-3 text-xs font-mono bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                spellCheck={false}
              />
            )}
            {activeCodeTab === "js" && (
              <textarea
                value={js}
                onChange={(e) => setJs(e.target.value)}
                placeholder="Write JavaScript logic here..."
                className="w-full h-full min-h-[480px] p-3 text-xs font-mono bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                spellCheck={false}
              />
            )}
          </div>
        </div>

        {/* Live Sandboxed Preview */}
        <div className="flex flex-col border rounded-xl overflow-hidden bg-card shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" /> Live Sandboxed Execution
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Play className="w-3 h-3 fill-current" /> Reactive
            </span>
          </div>
          <div className="flex-1 p-2 bg-muted/20 flex flex-col">
            <div className="flex-1 bg-white rounded-lg border border-neutral-300 overflow-hidden shadow-inner flex flex-col">
              <iframe
                ref={iframeRef}
                title="Live Sandbox Output"
                className="w-full h-full min-h-[500px] border-0 bg-white"
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
