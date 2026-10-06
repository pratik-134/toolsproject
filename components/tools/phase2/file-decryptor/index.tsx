"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  inspectEncryptedContainer,
  decryptFileBuffer,
  DecryptedFileInfo,
} from "./logic";
import {
  Unlock,
  Upload,
  Download,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  FileCheck,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  FileLock2,
} from "lucide-react";

export default function FileDecryptorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [containerBytes, setContainerBytes] = useState<Uint8Array | null>(null);
  const [headerInfo, setHeaderInfo] = useState<{ filename?: string; mimeType?: string } | null>(null);
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [decryptedResult, setDecryptedResult] = useState<DecryptedFileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setDecryptedResult(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        const bytes = new Uint8Array(buffer);
        setContainerBytes(bytes);
        const inspection = inspectEncryptedContainer(bytes);
        if (inspection.valid) {
          setHeaderInfo({ filename: inspection.filename, mimeType: inspection.mimeType });
        } else {
          setError(inspection.error || "Selected file is not a valid Qwertygen encrypted container.");
        }
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleDecrypt = async () => {
    if (!containerBytes) {
      setError("Please select a .enc file to decrypt.");
      return;
    }
    if (!password) {
      setError("Please enter the master password.");
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      const result = await decryptFileBuffer(containerBytes, password);
      setDecryptedResult(result);
    } catch (err: any) {
      setError(err?.message || "Failed to decrypt file.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDownload = () => {
    if (!decryptedResult) return;
    const blob = new Blob([decryptedResult.originalBytes.buffer as ArrayBuffer], {
      type: decryptedResult.mimeType || "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = decryptedResult.filename || "decrypted_file";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setContainerBytes(null);
    setHeaderInfo(null);
    setPassword("");
    setDecryptedResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">
            100% In-Browser AES-GCM-256 File Decryptor • Zero Server Uploads
          </div>
        </div>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
          Hardware Crypto Sandbox
        </span>
      </div>

      {/* Main Container */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        {/* Drop Zone */}
        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 transition bg-muted/20 hover:bg-muted/40"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".enc"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
                e.target.value = "";
              }}
              className="hidden"
            />
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-semibold text-sm text-foreground">
              Select or Drop an Encrypted (.enc) File
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports files encrypted with Qwertygen AES-GCM-256 File Locker
            </p>
          </div>
        ) : (
          <div className="p-4 bg-muted/30 border rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                <FileLock2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                  {headerInfo?.filename && (
                    <span> • Encapsulates: &quot;{headerInfo.filename}&quot; ({headerInfo.mimeType})</span>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Choose Different File
            </Button>
          </div>
        )}

        {/* Master Password Input */}
        <div className="space-y-4 pt-2 border-t">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-primary" /> Master Decryption Password
          </label>

          <div className="relative max-w-md">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the password used to lock this file..."
              className="w-full text-sm bg-background border rounded-lg pl-3 pr-10 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {!decryptedResult ? (
            <Button
              onClick={handleDecrypt}
              disabled={isDecrypting || !containerBytes || !password}
              className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-semibold px-6 shadow-sm hover:opacity-95"
            >
              <Unlock className="w-4 h-4" />
              {isDecrypting ? "Deriving Key & Verifying Integrity..." : "Unlock & Decrypt File"}
            </Button>
          ) : (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">File Decrypted & Authenticated!</p>
                  <p className="text-xs opacity-90 font-mono">
                    {decryptedResult.filename} ({(decryptedResult.originalBytes.length / 1024).toFixed(1)} KB • {decryptedResult.mimeType})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDownload}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <Download className="w-4 h-4" /> Download Restored File
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Decrypt Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
