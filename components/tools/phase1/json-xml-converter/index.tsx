"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, ArrowRightLeft, FileCode, AlertCircle, Download } from "lucide-react";
import { jsonToXml, xmlToJson } from "./logic";

const SAMPLES = {
  json: JSON.stringify(
    {
      catalog: {
        book: [
          { id: "bk101", author: "Gambardella, Matthew", title: "XML Developer's Guide", price: 44.95 },
          { id: "bk102", author: "Ralls, Kim", title: "Midnight Rain", price: 5.95 },
        ],
      },
    },
    null,
    2
  ),
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book>
    <id>bk101</id>
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <price>44.95</price>
  </book>
</catalog>`,
};

export default function JsonXmlConverterTool() {
  const [direction, setDirection] = useState<"json-to-xml" | "xml-to-json">("json-to-xml");
  const [input, setInput] = useState<string>(SAMPLES.json);
  const [rootName, setRootName] = useState<string>("root");
  const [indent, setIndent] = useState<2 | 4 | "minified">(2);
  const [declaration, setDeclaration] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      if (direction === "json-to-xml") {
        const res = jsonToXml(input, { rootName, indent, declaration });
        return { output: res, error: null };
      } else {
        const res = xmlToJson(input, { indent: indent === "minified" ? 2 : indent });
        return { output: res, error: null };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Conversion error";
      return { output: "", error: msg };
    }
  }, [input, direction, rootName, indent, declaration]);

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
      setDirection(direction === "json-to-xml" ? "xml-to-json" : "json-to-xml");
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = direction === "json-to-xml" ? "xml" : "json";
    const mime = direction === "json-to-xml" ? "application/xml" : "application/json";
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
                setDirection("json-to-xml");
                if (input === SAMPLES.xml) setInput(SAMPLES.json);
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                direction === "json-to-xml"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              JSON to XML
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection("xml-to-json");
                if (input === SAMPLES.json) setInput(SAMPLES.xml);
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                direction === "xml-to-json"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              XML to JSON
            </button>
          </div>

          {/* Quick Sample Button */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sample:</span>
            <button
              type="button"
              onClick={() => setInput(direction === "json-to-xml" ? SAMPLES.json : SAMPLES.xml)}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Load Example
            </button>
          </div>
        </div>

        {/* JSON to XML Extra Options */}
        {direction === "json-to-xml" && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Root Tag:</span>
              <input
                type="text"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                placeholder="root"
                className="w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Indent:</span>
              <div className="flex gap-1">
                {([2, 4, "minified"] as const).map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setIndent(ind)}
                    className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                      indent === ind
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {ind === "minified" ? "Minified" : `${ind} spaces`}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={declaration}
                onChange={(e) => setDeclaration(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-600 dark:text-slate-400">Include &lt;?xml declaration?&gt;</span>
            </label>
          </div>
        )}
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
              <FileCode className="w-4 h-4 text-teal-600" />
              {direction === "json-to-xml" ? "Input JSON" : "Input XML"}
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {input.length} chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            placeholder={direction === "json-to-xml" ? "Paste JSON here..." : "Paste XML here..."}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Right: Output */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-600" />
              {direction === "json-to-xml" ? "Output XML" : "Output JSON"}
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
              Download .{direction === "json-to-xml" ? "xml" : "json"}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-colors shadow-sm"
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
