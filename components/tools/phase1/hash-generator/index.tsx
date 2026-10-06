"use client";

import React, { useState, useEffect } from "react";
import { generateHashes, HashResults } from "./logic";
import { Copy, Check, Hash, Sparkles, Trash2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionHistory } from "@/lib/hooks/use-session-history";
import { SessionHistoryDrawer } from "@/components/tools/shared/SessionHistoryDrawer";

export default function HashGeneratorTool() {
  const [input, setInput] = useState<string>("Qwertygen Privacy First");
  const [hashes, setHashes] = useState<HashResults>({
    md5: "",
    sha1: "",
    sha256: "",
    sha384: "",
    sha512: "",
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { items: historyItems, addItem: addHistoryItem, clearHistory } = useSessionHistory("hash-generator");

  useEffect(() => {
    let isCancelled = false;
    generateHashes(input).then((res) => {
      if (!isCancelled) {
        setHashes(res);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [input]);

  const handleCopy = async (key: string, val: string) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    addHistoryItem(val, key.toUpperCase());
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const HASH_LIST: { key: keyof HashResults; label: string; desc: string }[] = [
    { key: "sha256", label: "SHA-256 (Standard)", desc: "Industry-standard cryptographic hash for blockchain, passwords, and checksums." },
    { key: "md5", label: "MD5 (Legacy)", desc: "128-bit hash used for legacy file integrity verification." },
    { key: "sha1", label: "SHA-1 (Legacy)", desc: "160-bit hash widely used in Git commit trees and legacy signatures." },
    { key: "sha512", label: "SHA-512 (High Security)", desc: "512-bit maximum security hash for sensitive data authentication." },
    { key: "sha384", label: "SHA-384", desc: "NSA Suite B high-security cryptographic digest." },
  ];

  return (
    <div className="space-y-6">
      {/* Input Text Box */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <KeyRound className="h-4 w-4 text-blue-600" />
            Plain Text to Hash
          </label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInput("The quick brown fox jumps over the lazy dog")}
              className="text-xs h-7 gap-1"
            >
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span>Sample</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInput("")}
              className="text-xs h-7 gap-1 text-slate-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste any text to generate cryptographic hashes instantly..."
          rows={4}
          className="w-full p-3 font-mono text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
        />
      </div>

      {/* Generated Hash Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-blue-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Calculated Checksums & Hashes (Zero Network Calls)
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {HASH_LIST.map(({ key, label, desc }) => {
            const val = hashes[key];
            const isCopied = copiedKey === key;

            return (
              <div
                key={key}
                className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-blue-400 transition-all shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-headings font-bold text-slate-900 text-xs sm:text-sm">
                    {label}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(key, val)}
                    disabled={!val}
                    className="text-xs h-7 px-2.5 gap-1"
                  >
                    {isCopied ? (
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

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-mono text-xs text-slate-800 break-all select-all">
                  {val || <span className="text-slate-400 font-sans">Type text above...</span>}
                </div>

                <p className="text-[11px] text-slate-500 font-body">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session History Drawer */}
      <SessionHistoryDrawer
        items={historyItems}
        onClear={clearHistory}
        title="Recent Hashes (This Session)"
      />
    </div>
  );
}
