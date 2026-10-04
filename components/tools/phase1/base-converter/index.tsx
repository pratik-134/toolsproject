"use client";

import React, { useState, useMemo } from "react";
import { Binary, Copy, Check, Hash, Sparkles, AlertCircle } from "lucide-react";
import { convertNumberBase, BaseConversionResult } from "./logic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESETS = [
  { label: "255 (0xFF)", val: "255", base: 10 },
  { label: "1024 (1KB)", val: "1024", base: 10 },
  { label: "65,535 (16-bit)", val: "65535", base: 10 },
  { label: "0xDEADBEEF", val: "DEADBEEF", base: 16 },
  { label: "Binary 10101010", val: "10101010", base: 2 },
];

export default function BaseConverterTool() {
  const [inputVal, setInputVal] = useState<string>("255");
  const [fromBase, setFromBase] = useState<number>(10);
  const [customTargetBase, setCustomTargetBase] = useState<number>(36);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { result, error } = useMemo(() => {
    if (!inputVal.trim()) return { result: null, error: null };
    try {
      const res = convertNumberBase(inputVal, fromBase, customTargetBase);
      return { result: res, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid number for selected base";
      return { result: null, error: msg };
    }
  }, [inputVal, fromBase, customTargetBase]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Configuration Card */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Convert From:
            </span>
            <div className="flex rounded-md p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              {[
                { label: "Decimal (10)", base: 10 },
                { label: "Binary (2)", base: 2 },
                { label: "Hex (16)", base: 16 },
                { label: "Octal (8)", base: 8 },
              ].map((b) => (
                <button
                  key={b.base}
                  type="button"
                  onClick={() => setFromBase(b.base)}
                  className={`px-3 py-1 rounded transition-colors ${
                    fromBase === b.base
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Samples:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setFromBase(p.base);
                  setInputVal(p.val);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-1">
          <div className="relative">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter number..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-base outline-none focus:ring-2 focus:ring-teal-500"
              spellCheck={false}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Display */}
      {result ? (
        <div className="space-y-4">
          {/* Main 4 Bases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Decimal */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                  Decimal (Base 10)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.decimal, "dec")}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {copiedKey === "dec" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "dec" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm text-slate-900 dark:text-slate-100 break-all select-all">
                {result.decimal}
              </div>
            </div>

            {/* Hexadecimal */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                  Hexadecimal (Base 16)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.hexadecimal, "hex")}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {copiedKey === "hex" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "hex" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm text-slate-900 dark:text-slate-100 break-all select-all flex justify-between items-center">
                <span>0x{result.hexadecimal}</span>
                <span className="text-xs text-slate-400">({result.hexGrouped})</span>
              </div>
            </div>

            {/* Binary */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2 md:col-span-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                  Binary (Base 2)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.binary, "bin")}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {copiedKey === "bin" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "bin" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm text-slate-900 dark:text-slate-100 break-all select-all">
                0b{result.binaryGrouped}
              </div>
            </div>

            {/* Octal */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                  Octal (Base 8)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.octal, "oct")}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {copiedKey === "oct" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "oct" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm text-slate-900 dark:text-slate-100 break-all select-all">
                0o{result.octal}
              </div>
            </div>

            {/* Custom Base */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
                    Custom Base:
                  </span>
                  <Select
                    value={String(customTargetBase)}
                    onValueChange={(val) => setCustomTargetBase(Number(val))}
                  >
                    <SelectTrigger className="h-6 w-24 px-2 py-0 text-xs bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700">
                      <SelectValue placeholder="Base" />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 9, 11, 12, 20, 32, 36].map((b) => (
                        <SelectItem key={b} value={String(b)}>
                          Base {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  type="button"
                  onClick={() => result.customBaseValue && copyToClipboard(result.customBaseValue, "custom")}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {copiedKey === "custom" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "custom" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm text-slate-900 dark:text-slate-100 break-all select-all">
                {result.customBaseValue}
              </div>
            </div>
          </div>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
            <span>
              Bit Length: <strong className="text-slate-900 dark:text-slate-100 font-mono">{result.bitCount} bits</strong>
            </span>
            <span>•</span>
            <span>
              Byte Length: <strong className="text-slate-900 dark:text-slate-100 font-mono">{result.byteCount} bytes</strong>
            </span>
            {result.asciiChar && (
              <>
                <span>•</span>
                <span>
                  ASCII Symbol: <strong className="text-teal-600 dark:text-teal-400 font-mono text-sm">'{result.asciiChar}'</strong>
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400">
          Enter a valid number above to calculate representations across all number bases.
        </div>
      )}
    </div>
  );
}
