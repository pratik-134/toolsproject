"use client";

import React, { useState } from "react";
import { encodeBase64, decodeBase64 } from "./logic";
import { Copy, Check, ArrowRightLeft, UploadCloud, Trash2, Binary, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Base64ConverterTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState<string>("Qwertygen: 100% Client-Side Privacy Platform");
  const [copied, setCopied] = useState<boolean>(false);

  const result = mode === "encode" ? encodeBase64(input) : decodeBase64(input);

  const handleCopy = async () => {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB for in-memory browser handling
    if (file.size > 5 * 1024 * 1024) {
      alert("File exceeds maximum browser memory limit of 5 MB.");
      return;
    }

    const reader = new FileReader();
    if (mode === "encode") {
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1] || "";
        setInput(base64);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        setInput(reader.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("encode")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              mode === "encode"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Encode (Text → Base64)
          </button>
          <button
            type="button"
            onClick={() => setMode("decode")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              mode === "decode"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Decode (Base64 → Text)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors">
            <UploadCloud className="h-3.5 w-3.5 text-blue-600" />
            <span>Upload File</span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput("")}
            className="text-xs h-8 gap-1 text-slate-600 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* Editor & Preview Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Binary className="h-4 w-4 text-blue-600" />
              {mode === "encode" ? "Raw Text / Input" : "Base64 String Input"}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {input.length} chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Type or paste text to convert into Base64..."
                : "Paste Base64 encoded string here..."
            }
            rows={14}
            spellCheck={false}
            className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-transparent resize-y focus:outline-none min-h-[300px]"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/60">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {mode === "encode" ? "Base64 Encoded Result" : "Decoded Plain Text"}
            </span>

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
          </div>

          {result.success ? (
            <textarea
              readOnly
              value={result.output}
              placeholder="Output will appear here automatically..."
              rows={14}
              spellCheck={false}
              className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-slate-50/30 resize-y focus:outline-none min-h-[300px]"
            />
          ) : (
            <div className="p-4 bg-red-50/60 text-red-700 border-l-4 border-red-500 font-mono text-xs space-y-2 min-h-[300px]">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Decoding Error:</span>
              </div>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
