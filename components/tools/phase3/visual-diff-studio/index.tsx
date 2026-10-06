"use client";

import React, { useState, useMemo } from "react";
import {
  GitCompare,
  Copy,
  Check,
  Download,
  ArrowRightLeft,
  FileCode,
  FileText,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  computeVisualDiff,
  generateUnifiedPatch,
  VisualDiffResult,
} from "./logic";

const SAMPLE_LEFT = `// Original Serverless Handler
export async function handler(event) {
  const user = event.user;
  if (!user) {
    return { status: 401, error: "Unauthorized" };
  }
  const result = await processData(user.id);
  return { status: 200, data: result };
}`;

const SAMPLE_RIGHT = `// Refactored Privacy-First Handler
export async function handler(event) {
  const user = event.user;
  if (!user || !user.token) {
    return { status: 401, error: "Missing authentication credentials" };
  }
  const sanitized = sanitizeInput(user);
  const result = await processLocally(sanitized.id);
  return { status: 200, data: result, cached: true };
}`;

export default function VisualDiffStudioTool() {
  const [leftText, setLeftText] = useState<string>(SAMPLE_LEFT);
  const [rightText, setRightText] = useState<string>(SAMPLE_RIGHT);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);

  const diffResult: VisualDiffResult = useMemo(() => {
    return computeVisualDiff(leftText, rightText, {
      ignoreWhitespace,
      ignoreCase,
    });
  }, [leftText, rightText, ignoreWhitespace, ignoreCase]);

  const patchString = useMemo(() => {
    return generateUnifiedPatch(diffResult, "handler.ts");
  }, [diffResult]);

  const handleSwap = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const handleCopyPatch = () => {
    navigator.clipboard.writeText(patchString);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([patchString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qwertygen-changes.patch";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & Stats */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">
              Multi-Format Visual Diff Studio
            </span>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Diffchecker Pro Alternative
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Swap Left / Right
            </button>

            <button
              type="button"
              onClick={handleCopyPatch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 shadow-sm transition-opacity"
            >
              {copiedPatch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedPatch ? "Copied Patch" : "Copy Unified Patch"}
            </button>

            <button
              type="button"
              onClick={handleDownloadPatch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .patch
            </button>
          </div>
        </div>

        {/* Filters and Metric Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  viewMode === "split" ? "bg-foreground text-background font-semibold" : "bg-muted text-muted-foreground"
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("unified")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  viewMode === "unified" ? "bg-foreground text-background font-semibold" : "bg-muted text-muted-foreground"
                }`}
              >
                Unified View
              </button>
            </div>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-foreground select-none">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              Ignore Whitespace
            </label>

            <label className="inline-flex items-center gap-1.5 cursor-pointer text-foreground select-none">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              Ignore Case
            </label>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <span className="text-emerald-500 font-semibold">+{diffResult.additions} added</span>
            <span className="text-rose-500 font-semibold">-{diffResult.deletions} removed</span>
            <span className="text-amber-500 font-semibold">~{diffResult.modifications} modified</span>
            <span className="bg-muted px-2 py-0.5 rounded text-foreground font-semibold">
              {diffResult.similarityRatio}% identical
            </span>
          </div>
        </div>
      </div>

      {/* Text Input Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground">Original Document / Code</span>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            rows={7}
            className="w-full p-3 rounded-xl border border-border bg-card font-mono text-xs focus:ring-2 focus:ring-primary outline-none"
            placeholder="Paste original text..."
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground">Modified Document / Code</span>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            rows={7}
            className="w-full p-3 rounded-xl border border-border bg-card font-mono text-xs focus:ring-2 focus:ring-primary outline-none"
            placeholder="Paste modified text..."
          />
        </div>
      </div>

      {/* Visual Diff Rendering Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-3 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground flex items-center justify-between">
          <span>Interactive Synchronized Diff Viewer</span>
          <span className="font-mono text-[11px]">{diffResult.lines.length} rendered rows</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {viewMode === "split" ? (
            <div className="grid grid-cols-2 divide-x divide-border font-mono text-xs">
              {/* Left Column */}
              <div className="divide-y divide-border/40">
                {diffResult.lines.map((line, idx) => (
                  <div
                    key={`l_${idx}`}
                    className={`flex items-start px-3 py-1.5 gap-3 ${
                      line.type === "removed"
                        ? "bg-rose-500/15 text-rose-800 dark:text-rose-200"
                        : line.type === "modified"
                        ? "bg-amber-500/10 text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    <span className="w-7 text-right select-none opacity-40 font-mono text-[11px]">
                      {line.lineNumLeft ?? ""}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {line.charDiffsLeft ? (
                        line.charDiffsLeft.map((c, ci) => (
                          <span
                            key={ci}
                            className={c.isChanged ? "bg-rose-500/30 font-semibold rounded px-0.5" : ""}
                          >
                            {c.text}
                          </span>
                        ))
                      ) : (
                        line.textLeft ?? ""
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="divide-y divide-border/40">
                {diffResult.lines.map((line, idx) => (
                  <div
                    key={`r_${idx}`}
                    className={`flex items-start px-3 py-1.5 gap-3 ${
                      line.type === "added"
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                        : line.type === "modified"
                        ? "bg-amber-500/10 text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    <span className="w-7 text-right select-none opacity-40 font-mono text-[11px]">
                      {line.lineNumRight ?? ""}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {line.charDiffsRight ? (
                        line.charDiffsRight.map((c, ci) => (
                          <span
                            key={ci}
                            className={c.isChanged ? "bg-emerald-500/30 font-semibold rounded px-0.5" : ""}
                          >
                            {c.text}
                          </span>
                        ))
                      ) : (
                        line.textRight ?? ""
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Unified View */
            <div className="divide-y divide-border/40 font-mono text-xs">
              {diffResult.lines.map((line, idx) => {
                if (line.type === "modified") {
                  return (
                    <React.Fragment key={`u_${idx}`}>
                      <div className="flex items-start px-3 py-1 gap-3 bg-rose-500/15 text-rose-800 dark:text-rose-200">
                        <span className="w-6 opacity-40 select-none">-</span>
                        <span className="w-8 text-right opacity-40 select-none">{line.lineNumLeft}</span>
                        <span className="flex-1 whitespace-pre-wrap break-all">{line.textLeft}</span>
                      </div>
                      <div className="flex items-start px-3 py-1 gap-3 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200">
                        <span className="w-6 opacity-40 select-none">+</span>
                        <span className="w-8 text-right opacity-40 select-none">{line.lineNumRight}</span>
                        <span className="flex-1 whitespace-pre-wrap break-all">{line.textRight}</span>
                      </div>
                    </React.Fragment>
                  );
                }

                return (
                  <div
                    key={`u_${idx}`}
                    className={`flex items-start px-3 py-1 gap-3 ${
                      line.type === "added"
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                        : line.type === "removed"
                        ? "bg-rose-500/15 text-rose-800 dark:text-rose-200"
                        : "text-foreground"
                    }`}
                  >
                    <span className="w-6 opacity-40 select-none">
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                    </span>
                    <span className="w-8 text-right opacity-40 select-none">
                      {line.lineNumLeft ?? line.lineNumRight}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {line.textLeft ?? line.textRight}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
