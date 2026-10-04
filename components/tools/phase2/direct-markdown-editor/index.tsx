"use client";

import React, { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { DraftRestoredBanner } from "@/components/tool-shell/DraftRestoredBanner";
import {
  computeTaskProgress,
  generateMarkdownTable,
  insertMarkdownFormat,
  renderMarkdownToHtml,
} from "./logic";
import {
  FileText,
  Upload,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  Link as LinkIcon,
  Minus,
  Eye,
  FileCode,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";

const SAMPLE_MARKDOWN = `# Modern Privacy-First Architecture

Welcome to the **Cleartrix Direct Markdown Editor** — a high-speed, zero-upload workspace for drafting technical documentation, roadmaps, and release notes.

## Architectural Pillars
- **Zero-Cloud Compute**: Everything executes locally inside your browser sandbox.
- **Instant Preview**: Live formatting updates with sub-millisecond latency.
- **Universal Portability**: Export your work as standard \`.md\` or standalone styled \`.html\`.

### Interactive Task Tracking
- [x] Establish client-side privacy architecture
- [x] Implement in-browser vector PDF compilers
- [x] Deliver 5-star direct document editing suites
- [ ] Onboard offline audio processing modules

> "True digital privacy begins when data never leaves the client in the first place."

### Performance Benchmarks
| Benchmark Item | Cloud Server | Cleartrix In-Browser | Advantage |
| --- | --- | --- | --- |
| Parsing Latency | 340ms | 2ms | 170x Faster |
| Network Egress | 4.2 MB | 0 KB | 100% Free |
| Privacy Risk | High | Zero | Absolute |

\`\`\`typescript
interface DocumentEngine {
  mode: "in-browser";
  privacyLevel: "absolute";
  networkTransfers: 0;
}
\`\`\`

---
*Drafted securely in Cleartrix Privacy Suite.*`;

export default function DirectMarkdownEditorTool() {
  const {
    value: markdown,
    setValue: setMarkdown,
    isDraftRestored,
    formattedSavedAt,
    clearDraft,
    dismissRestoredBanner,
  } = useToolDraft<string>({
    toolSlug: "direct-markdown-editor",
    initialValue: SAMPLE_MARKDOWN,
  });
  const [filename, setFilename] = useState<string>("document.md");
  const [activeTab, setActiveTab] = useState<"split" | "edit" | "preview">("split");
  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute live statistics
  const stats = useMemo(() => {
    const chars = markdown.length;
    const wordsMatch = markdown.trim().match(/\S+/g);
    const words = wordsMatch ? wordsMatch.length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const tasks = computeTaskProgress(markdown);
    return { chars, words, readingTime, tasks };
  }, [markdown]);

  // Render HTML preview
  const renderedHtml = useMemo(() => {
    return renderMarkdownToHtml(markdown);
  }, [markdown]);

  // Format insertion handler
  const handleFormat = (type: any) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (type === "table") {
      const tableSnippet = `\n\n${generateMarkdownTable(3, 3)}\n`;
      const before = markdown.substring(0, start);
      const after = markdown.substring(end);
      setMarkdown(before + tableSnippet + after);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tableSnippet.length, start + tableSnippet.length);
      }, 0);
      return;
    }

    const { newText, newCursor } = insertMarkdownFormat(markdown, start, end, type);
    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  // File loading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setMarkdown(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Download Markdown file
  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Standalone Styled HTML
  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${filename.replace(/\.md$/i, "")}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; background: #fff; }
    h1, h2, h3 { color: #0f172a; margin-top: 24px; margin-bottom: 12px; }
    h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    h2 { border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    code { font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #e11d48; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
    pre code { background: transparent; color: inherit; padding: 0; }
    blockquote { border-left: 4px solid #3b82f6; padding: 8px 16px; margin: 16px 0; background: #eff6ff; color: #1e40af; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: bold; }
    hr { border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0; }
    ul, ol { padding-left: 24px; margin: 12px 0; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename.replace(/\.md$/i, "")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Markdown
  const handleCopyMd = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      // fallback
    }
  };

  // Copy HTML
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(renderedHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
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
            100% In-Browser Markdown Engine • Live Client Parsing • Zero Uploads
          </div>
        </div>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
          Sandboxed Memory
        </span>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium">Words</div>
          <div className="text-lg font-bold text-foreground mt-1">
            {stats.words.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium">Characters</div>
          <div className="text-lg font-bold text-foreground mt-1">
            {stats.chars.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium">Est. Reading</div>
          <div className="text-lg font-bold text-foreground mt-1">
            ~{stats.readingTime} min
          </div>
        </div>
        <div className="p-3 bg-card border rounded-xl shadow-sm text-center">
          <div className="text-xs text-muted-foreground font-medium">Task Progress</div>
          <div className="text-lg font-bold text-foreground mt-1">
            {stats.tasks.total > 0
              ? `${stats.tasks.completed}/${stats.tasks.total} (${stats.tasks.percentage}%)`
              : "No tasks"}
          </div>
        </div>
      </div>

      {/* Workspace Container */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Main Toolbar */}
        <div className="p-3 bg-muted/40 border-b flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* File Operations */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".md,.markdown,.txt"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs h-8"
            >
              <Upload className="w-3.5 h-3.5" /> Open MD
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadMd}
              className="gap-1.5 text-xs h-8 bg-primary text-primary-foreground font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> Save MD
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadHtml}
              className="gap-1.5 text-xs h-8"
            >
              <FileCode className="w-3.5 h-3.5" /> Export HTML
            </Button>
          </div>

          {/* View Toggles & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-background border rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("split")}
                className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                  activeTab === "split"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                  activeTab === "edit"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                  activeTab === "preview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyMd}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
              title="Copy Markdown"
            >
              {copiedMd ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" /> Copied MD
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy MD
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyHtml}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
              title="Copy Rendered HTML"
            >
              {copiedHtml ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" /> Copied HTML
                </>
              ) : (
                <>
                  <FileCode className="w-3.5 h-3.5 mr-1" /> Copy HTML
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              {isFullScreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Formatting Shortcuts Ribbon */}
        <div className="px-3 py-2 bg-muted/20 border-b flex flex-wrap items-center gap-1 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("bold")}
            className="h-7 w-7 p-0"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("italic")}
            className="h-7 w-7 p-0"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("strike")}
            className="h-7 w-7 p-0"
            title="Strikethrough (~~text~~)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("h1")}
            className="h-7 w-7 p-0"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("h2")}
            className="h-7 w-7 p-0"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("h3")}
            className="h-7 w-7 p-0"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("quote")}
            className="h-7 w-7 p-0"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("code")}
            className="h-7 w-7 p-0"
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("codeblock")}
            className="h-7 px-2 text-[11px]"
            title="Fenced Codeblock"
          >
            {"{ }"} Block
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("ul")}
            className="h-7 w-7 p-0"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("ol")}
            className="h-7 w-7 p-0"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("task")}
            className="h-7 w-7 p-0"
            title="Checklist / Task List"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("table")}
            className="h-7 w-7 p-0"
            title="Insert Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("link")}
            className="h-7 w-7 p-0"
            title="Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("hr")}
            className="h-7 w-7 p-0"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>

          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMarkdown(SAMPLE_MARKDOWN)}
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset Template
            </Button>
          </div>
        </div>

        {/* Workspace Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x">
          {/* Markdown Editor Pane */}
          {(activeTab === "split" || activeTab === "edit") && (
            <div className={`p-4 flex flex-col ${activeTab === "edit" ? "lg:col-span-2" : ""}`}>
              <div className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center justify-between">
                <span>Markdown Editor</span>
                <span className="font-mono">{stats.chars} chars</span>
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Write Markdown here..."
                className={`w-full p-4 font-mono text-xs bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed ${
                  isFullScreen ? "h-[calc(100vh-320px)]" : "h-[500px]"
                }`}
                spellCheck={false}
              />
            </div>
          )}

          {/* HTML Preview Pane */}
          {(activeTab === "split" || activeTab === "preview") && (
            <div className={`p-4 flex flex-col ${activeTab === "preview" ? "lg:col-span-2" : ""}`}>
              <div className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-primary" /> Live HTML Preview
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Synced</span>
              </div>
              <div
                className={`w-full p-6 bg-card border rounded-lg overflow-y-auto leading-relaxed ${
                  isFullScreen ? "h-[calc(100vh-320px)]" : "h-[500px]"
                }`}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-muted/30 border-t flex flex-wrap items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>Format: CommonMark / GFM Compliant</span>
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
