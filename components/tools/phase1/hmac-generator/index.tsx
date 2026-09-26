"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, Shield, Copy, Check, Eye, EyeOff, RefreshCw, Lock, ShieldCheck } from "lucide-react";
import { generateHmac, HmacAlgorithm, HmacResult } from "./logic";

const ALGORITHMS: { id: HmacAlgorithm; label: string; bits: number }[] = [
  { id: "SHA-256", label: "HMAC-SHA-256", bits: 256 },
  { id: "SHA-512", label: "HMAC-SHA-512", bits: 512 },
  { id: "SHA-384", label: "HMAC-SHA-384", bits: 384 },
  { id: "SHA-1", label: "HMAC-SHA-1", bits: 160 },
];

export default function HmacGeneratorTool() {
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>("SHA-256");
  const [secretKey, setSecretKey] = useState<string>("super-secret-key-12345");
  const [message, setMessage] = useState<string>(
    "GET /api/v1/checkout?timestamp=1790251200"
  );
  const [showKey, setShowKey] = useState<boolean>(false);
  const [result, setResult] = useState<HmacResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function compute() {
      if (!secretKey) {
        setResult(null);
        setError("Please provide a secret key.");
        return;
      }

      try {
        const res = await generateHmac(message, secretKey, algorithm);
        if (!isCancelled) {
          setResult(res);
          setError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to compute HMAC");
          setResult(null);
        }
      }
    }

    compute();
    return () => {
      isCancelled = true;
    };
  }, [message, secretKey, algorithm]);

  const handleGenerateKey = () => {
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    const hexKey = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setSecretKey(hexKey);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Algorithm Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Hash Algorithm:
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo.id}
              type="button"
              onClick={() => setAlgorithm(algo.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                algorithm === algo.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {algo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Key and Message */}
        <div className="space-y-5 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          {/* Secret Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-600" /> Secret Key
              </label>
              <button
                type="button"
                onClick={handleGenerateKey}
                className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                <RefreshCw className="w-3 h-3" /> Generate Random Key
              </button>
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter HMAC secret key..."
                className="w-full pl-3.5 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Plaintext Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Message / Payload to Authenticate
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {message.length} chars
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Paste webhook payload, query string, or message text here..."
              className="w-full p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Signature Results */}
        <div className="space-y-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" /> HMAC Signature Output
              </h3>
              <span className="text-xs text-teal-600 font-mono font-semibold">
                {algorithm}
              </span>
            </div>

            {result ? (
              <div className="space-y-3.5">
                {/* Hex Lowercase */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Hex Signature (Lowercase)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.hex, "hex")}
                      className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      {copiedKey === "hex" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "hex" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all">
                    {result.hex}
                  </div>
                </div>

                {/* Hex Uppercase */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Hex Signature (UPPERCASE)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.hexUpper, "hexUp")}
                      className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      {copiedKey === "hexUp" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "hexUp" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all">
                    {result.hexUpper}
                  </div>
                </div>

                {/* Base64 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Base64 Signature</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.base64, "b64")}
                      className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      {copiedKey === "b64" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "b64" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all">
                    {result.base64}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                {error || "Enter secret key and message to generate HMAC."}
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Hardware Web Crypto API: Keys and signatures never leave your browser. Zero server transmission.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
