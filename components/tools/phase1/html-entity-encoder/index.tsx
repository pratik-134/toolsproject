"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, ArrowRightLeft, Sparkles, Code2 } from "lucide-react";
import {
  encodeHtmlEntities,
  decodeHtmlEntities,
  EntityFormat,
  EncodeScope,
} from "./logic";

const PRESETS = [
  {
    name: "HTML Snippet",
    text: `<div class="card">\n  <h2>Mindkit &amp; Co.</h2>\n  <p>Price: $49.99 &lt; 50</p>\n</div>`,
  },
  {
    name: "Symbols & Accents",
    text: `© Mindkit™ 2026 — All Rights Reserved. Special: €100 / £80 / ¥1000 • café & résumé`,
  },
  {
    name: "Math & Logic",
    text: `If x ≤ 10 and y ≥ 20, then x ≠ y & α + β → ∞`,
  },
];

export default function HtmlEntityEncoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [format, setFormat] = useState<EntityFormat>("named");
  const [scope, setScope] = useState<EncodeScope>("special");
  const [input, setInput] = useState<string>(
    `<div class="banner">\n  <h1>Welcome to Mindkit & Co.</h1>\n  <p>Price: "Only $19.99" & 100% Free!</p>\n</div>`
  );
  const [copied, setCopied] = useState<boolean>(false);

  const output = useMemo(() => {
    if (mode === "encode") {
      return encodeHtmlEntities(input, { format, scope });
    } else {
      return decodeHtmlEntities(input);
    }
  }, [input, mode, format, scope]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    setInput(output);
    setMode(mode === "encode" ? "decode" : "encode");
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMode("encode")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === "encode"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Encode to Entities
            </button>
            <button
              type="button"
              onClick={() => setMode("decode")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === "decode"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Decode to Text
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Samples:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setInput(p.text)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Encode Sub-Options */}
        {mode === "encode" && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Format:</span>
              <div className="flex gap-1">
                {(["named", "decimal", "hex"] as EntityFormat[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                      format === f
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {f} {f === "named" ? "(&amp;)" : f === "decimal" ? "(&#38;)" : "(&#x26;)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Characters:</span>
              <div className="flex gap-1">
                {(
                  [
                    { id: "special", label: "Special Only (<>&\"')" },
                    { id: "non-ascii", label: "Non-ASCII & Special" },
                    { id: "all", label: "All Characters" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScope(s.id)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      scope === s.id
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Pane */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-teal-600" />
              {mode === "encode" ? "Raw HTML / Plain Text" : "HTML Entities to Decode"}
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {input.length} characters
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            placeholder={
              mode === "encode"
                ? "Paste HTML or characters you want to encode..."
                : "Paste HTML entities (e.g. &lt;h1&gt;Hello &amp; welcome&lt;/h1&gt;)..."
            }
            className="w-full p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Output Pane */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              {mode === "encode" ? "Encoded HTML Entities" : "Decoded Plain Text"}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap input and output"
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-400 font-mono">
                {output.length} characters
              </span>
            </div>
          </div>

          <textarea
            value={output}
            readOnly
            rows={12}
            placeholder="Result will appear here automatically..."
            className="w-full flex-1 p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none resize-y"
            spellCheck={false}
          />

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied to Clipboard" : "Copy Output"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
