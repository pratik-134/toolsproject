"use client";

import React, { useState } from "react";
import { ShieldCheck, Check, Copy, AlertTriangle, Upload, File, RefreshCw, XCircle } from "lucide-react";
import { computeBufferHash, computeStringHash, compareChecksums, ChecksumAlgorithm } from "./logic";

const ALGORITHMS: ChecksumAlgorithm[] = ["SHA-256", "SHA-512", "SHA-384", "SHA-1"];

export default function ChecksumVerifierTool() {
  const [algorithm, setAlgorithm] = useState<ChecksumAlgorithm>("SHA-256");
  const [sourceType, setSourceType] = useState<"file" | "text">("file");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>("Cleartrix Privacy-First Web Platform");
  const [computedHash, setComputedHash] = useState<string>("");
  const [expectedHash, setExpectedHash] = useState<string>("");
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 50 MB in-browser limit
    if (file.size > 50 * 1024 * 1024) {
      alert("File exceeds 50 MB client-side memory safety limit.");
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");
    setIsComputing(true);

    try {
      const buffer = await file.arrayBuffer();
      const hash = await computeBufferHash(buffer, algorithm);
      setComputedHash(hash);
    } catch {
      alert("Failed to read file.");
    } finally {
      setIsComputing(false);
    }
  };

  const handleComputeText = async () => {
    setIsComputing(true);
    try {
      const hash = await computeStringHash(textInput, algorithm);
      setComputedHash(hash);
    } finally {
      setIsComputing(false);
    }
  };

  const handleCopy = () => {
    if (computedHash) {
      navigator.clipboard.writeText(computedHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const comparison = computedHash && expectedHash
    ? compareChecksums(computedHash, expectedHash, algorithm)
    : null;

  return (
    <div className="space-y-6">
      {/* Algorithm & Mode Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setSourceType("file")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              sourceType === "file"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Verify Local File
          </button>
          <button
            type="button"
            onClick={() => {
              setSourceType("text");
              handleComputeText();
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              sourceType === "text"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Verify Plaintext
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Algorithm:
          </span>
          <div className="flex gap-1">
            {ALGORITHMS.map((algo) => (
              <button
                key={algo}
                type="button"
                onClick={() => setAlgorithm(algo)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  algorithm === algo
                    ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold border border-teal-300 dark:border-teal-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Status Banner */}
      {comparison && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
            comparison.match
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          {comparison.match ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <div>
            <div className="text-sm font-bold">
              {comparison.match
                ? "CHECKSUM VERIFIED — HASHES MATCH EXACTLY"
                : "CHECKSUM MISMATCH — FILE MAY BE MODIFIED OR CORRUPTED"}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {comparison.match
                ? `The calculated ${algorithm} matches the provided expected checksum byte-for-byte.`
                : "The computed hash does not match your expected checksum. Check the algorithm or re-download the file."}
            </div>
          </div>
        </div>
      )}

      {/* Input Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Input */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
            {sourceType === "file" ? "1. Select File to Hash" : "1. Enter Text to Hash"}
          </label>

          {sourceType === "file" ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-teal-500 transition-colors">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="w-8 h-8 text-teal-600" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {fileName ? "Change selected file" : "Choose file to compute checksum"}
                </span>
                <span className="text-xs text-slate-400">
                  Runs 100% locally in your browser. Max 50 MB.
                </span>
              </label>

              {fileName && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <File className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="truncate text-slate-800 dark:text-slate-200">{fileName}</span>
                  </div>
                  <span className="text-slate-400 shrink-0">{fileSize}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                placeholder="Enter text to hash..."
                className="w-full p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
              />
              <button
                type="button"
                onClick={handleComputeText}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
              >
                Compute Hash
              </button>
            </div>
          )}

          {/* Computed Hash Box */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Calculated {algorithm}</span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!computedHash}
                className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all min-h-[46px]">
              {isComputing ? (
                <span className="text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Computing hardware digest...
                </span>
              ) : (
                computedHash || "(Upload a file or click compute to generate hash)"
              )}
            </div>
          </div>
        </div>

        {/* Expected Hash Input & Compare */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
              2. Paste Expected Checksum to Compare
            </label>
            <p className="text-xs text-slate-500">
              Paste the SHA-256 or SHA-512 published by the software author or download source.
            </p>

            <textarea
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              rows={4}
              placeholder="e.g. 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 space-y-2">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Why Verify Checksums?
            </div>
            <p className="leading-relaxed">
              Verifying cryptographic checksums ensures your downloaded installation files, disk images, and software packages have not been tampered with or corrupted during transit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
