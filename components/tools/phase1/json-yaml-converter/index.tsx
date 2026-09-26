"use client";

import React, { useState, useMemo } from "react";
import { FileCode2, Copy, Check, ArrowRightLeft, Download, AlertCircle } from "lucide-react";
import { jsonToYaml, yamlToJson } from "./logic";

const SAMPLES = {
  json: JSON.stringify(
    {
      app: "mindkit-web",
      version: "1.0.0",
      environment: "production",
      services: ["api", "workers", "proxy"],
      database: {
        host: "localhost",
        port: 5432,
        ssl: true,
      },
    },
    null,
    2
  ),
  yaml: `app: mindkit-web
version: 1.0.0
environment: production
services:
  - api
  - workers
  - proxy
database:
  host: localhost
  port: 5432
  ssl: true`,
};

export default function JsonYamlConverterTool() {
  const [direction, setDirection] = useState<"json-to-yaml" | "yaml-to-json">("json-to-yaml");
  const [input, setInput] = useState<string>(SAMPLES.json);
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      if (direction === "json-to-yaml") {
        const res = jsonToYaml(input, { indentSize });
        return { output: res, error: null };
      } else {
        const res = yamlToJson(input, { indentSize });
        return { output: res, error: null };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Syntax parsing error";
      return { output: "", error: msg };
    }
  }, [input, direction, indentSize]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setDirection(direction === "json-to-yaml" ? "yaml-to-json" : "json-to-yaml");
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = direction === "json-to-yaml" ? "yaml" : "json";
    const mime = direction === "json-to-yaml" ? "text/yaml" : "application/json";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Direction Switch */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setDirection("json-to-yaml");
                if (input === SAMPLES.yaml) setInput(SAMPLES.json);
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                direction === "json-to-yaml"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              JSON to YAML
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection("yaml-to-json");
                if (input === SAMPLES.json) setInput(SAMPLES.yaml);
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                direction === "yaml-to-json"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              YAML to JSON
            </button>
          </div>

          {/* Quick Sample Button */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sample:</span>
            <button
              type="button"
              onClick={() => setInput(direction === "json-to-yaml" ? SAMPLES.json : SAMPLES.yaml)}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Load Example
            </button>
          </div>
        </div>

        {/* Indent Options */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400">Indentation:</span>
          <div className="flex gap-1">
            {([2, 4] as const).map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => setIndentSize(ind)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  indentSize === ind
                    ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {ind} spaces
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-teal-600" />
              {direction === "json-to-yaml" ? "Input JSON" : "Input YAML"}
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {input.length} chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            placeholder={direction === "json-to-yaml" ? "Paste JSON here..." : "Paste YAML here..."}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Right: Output */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-teal-600" />
              {direction === "json-to-yaml" ? "Output YAML" : "Output JSON"}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwap}
                disabled={!output}
                title="Swap input and output"
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-400 font-mono">
                {output.length} chars
              </span>
            </div>
          </div>

          <textarea
            value={output}
            readOnly
            rows={14}
            placeholder="Converted output will appear here..."
            className="w-full flex-1 p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none resize-y"
            spellCheck={false}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .{direction === "json-to-yaml" ? "yaml" : "json"}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Output"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
