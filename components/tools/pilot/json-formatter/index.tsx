"use client";

import React, { useState, useMemo } from "react";
import { formatJson, JsonFormatOptions } from "./logic";
import { Copy, Check, Download, Trash2, FileJson, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SendToPipelineButton } from "@/components/pipeline/SendToPipelineButton";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useToolKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcut";
import { DraftRestoredBanner } from "@/components/tool-shell/DraftRestoredBanner";
import { DiffInspector } from "@/components/tools/shared/DiffInspector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SAMPLE_JSON = `{
  "platform": "Cleartrix",
  "privacy": "100% Client-Side",
  "toolsCount": 175,
  "features": [
    "No server file upload",
    "Zero registration required",
    "Completely free forever"
  ],
  "author": {
    "name": "Cleartrix Engineering",
    "verified": true
  }
}`;

export default function JsonFormatterTool() {
  const {
    value: input,
    setValue: setInput,
    isDraftRestored,
    formattedSavedAt,
    clearDraft,
    dismissRestoredBanner,
  } = useToolDraft<string>({
    toolSlug: "json-formatter",
    initialValue: SAMPLE_JSON,
  });
  const [indent, setIndent] = useState<JsonFormatOptions["indent"]>(2);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"code" | "diff">("code");

  React.useEffect(() => {
    const handlePipelineData = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail && customEvent.detail.textData) {
        setInput(customEvent.detail.textData);
      }
    };
    window.addEventListener("pipeline-apply-data", handlePipelineData);
    return () => {
      window.removeEventListener("pipeline-apply-data", handlePipelineData);
    };
  }, []);

  const result = useMemo(() => {
    return formatJson(input, { indent, sortKeys });
  }, [input, indent, sortKeys]);

  const handleCopy = async () => {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useToolKeyboardShortcuts({
    onCopy: handleCopy,
  });

  const handleDownload = () => {
    if (!result.output) return;
    const blob = new Blob([result.output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <DraftRestoredBanner
        isRestored={isDraftRestored}
        savedAtFormatted={formattedSavedAt}
        onReset={() => clearDraft(true)}
        onDismiss={dismissRestoredBanner}
      />

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Indent:</label>
          <Select
            value={String(indent)}
            onValueChange={(val) => {
              if (val === "minify" || val === "tab") setIndent(val);
              else setIndent(Number(val));
            }}
          >
            <SelectTrigger className="h-8 w-36 text-xs bg-white border-slate-300">
              <SelectValue placeholder="Indent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Spaces</SelectItem>
              <SelectItem value="4">4 Spaces</SelectItem>
              <SelectItem value="tab">Tab</SelectItem>
              <SelectItem value="minify">Minify (Compact)</SelectItem>
            </SelectContent>
          </Select>

          <label className="inline-flex items-center gap-1.5 ml-3 cursor-pointer text-xs font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Sort Keys</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput(SAMPLE_JSON)}
            className="text-xs h-8 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Sample</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput("")}
            className="text-xs h-8 gap-1.5 text-slate-600 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* View Switcher: Panels vs Visual Diff */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveView("code")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeView === "code"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            JSON Panels
          </button>
          <button
            type="button"
            onClick={() => setActiveView("diff")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === "diff"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visual Diff & Transformation</span>
          </button>
        </div>
      </div>

      {activeView === "diff" ? (
        <DiffInspector
          originalText={input}
          modifiedText={result.output || ""}
          originalLabel="Raw JSON"
          modifiedLabel="Formatted JSON"
          title="JSON Syntax & Indentation Diff"
        />
      ) : (
        /* Editor & Preview Panels */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileJson className="h-4 w-4 text-blue-600" />
                Input JSON
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {input.length} chars
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your raw JSON here..."
              rows={16}
              spellCheck={false}
              className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-transparent resize-y focus:outline-none min-h-[320px]"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Formatted Output
                </span>
                {result.success && result.stats && (
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                    Valid JSON ({result.stats.keysCount} keys, depth {result.stats.depth})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={!result.success || !result.output}
                  className="text-xs h-7 px-2.5 gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!result.success || !result.output}
                  className="text-xs h-7 px-2.5 gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Save</span>
                </Button>
                {result.success && result.output && (
                  <SendToPipelineButton
                    sourceSlug="json-formatter"
                    sourceToolName="JSON Formatter"
                    dataType="text"
                    textData={result.output}
                    title="Formatted JSON"
                  />
                )}
              </div>
            </div>

            {result.success ? (
              <textarea
                readOnly
                value={result.output}
                placeholder="Formatted output will appear here..."
                rows={16}
                spellCheck={false}
                className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-slate-50/30 resize-y focus:outline-none min-h-[320px]"
              />
            ) : (
              <div className="p-4 bg-red-50/60 text-red-700 border-l-4 border-red-500 font-mono text-xs space-y-2 min-h-[320px]">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span>Syntax Error in JSON:</span>
                </div>
                <p className="whitespace-pre-wrap">{result.error}</p>
                <p className="text-[11px] text-red-500 font-sans mt-3">
                  Check for missing quotes, trailing commas, or unmatched brackets in the left input.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
