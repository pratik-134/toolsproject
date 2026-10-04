"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  encryptFileBuffer,
  validatePasswordStrength,
} from "./logic";
import {
  Lock,
  Upload,
  Download,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  FileCheck,
  AlertCircle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileLock2,
} from "lucide-react";

export default function FileEncryptorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [encryptedBytes, setEncryptedBytes] = useState<Uint8Array | null>(null);
  const [encryptedFilename, setEncryptedFilename] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const strength = React.useMemo(() => validatePasswordStrength(password), [password]);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setEncryptedBytes(null);
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        setFileBytes(new Uint8Array(buffer));
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+";
    const randomVals = new Uint32Array(16);
    globalThis.crypto.getRandomValues(randomVals);
    let gen = "";
    for (let i = 0; i < 16; i++) {
      const val = randomVals[i];
      if (val !== undefined) {
        gen += chars[val % chars.length];
      }
    }
    setPassword(gen);
    setConfirmPassword(gen);
  };

  const handleEncrypt = async () => {
    if (!file || !fileBytes) {
      setError("Please select a file to encrypt.");
      return;
    }
    if (!password) {
      setError("Please enter a master password to encrypt your file.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please retype carefully.");
      return;
    }

    setIsEncrypting(true);
    setError(null);

    try {
      const encrypted = await encryptFileBuffer(
        fileBytes,
        file.name,
        file.type || "application/octet-stream",
        password
      );

      setEncryptedBytes(encrypted);
      setEncryptedFilename(`${file.name}.enc`);
    } catch (err: any) {
      setError(err?.message || "Failed to encrypt file.");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDownload = () => {
    if (!encryptedBytes) return;
    const blob = new Blob([encryptedBytes.buffer as ArrayBuffer], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = encryptedFilename || "protected_file.enc";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setFileBytes(null);
    setPassword("");
    setConfirmPassword("");
    setEncryptedBytes(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">
            100% In-Browser AES-GCM-256 File Locker • Zero Server Uploads
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
              Select or Drop Any File to Encrypt
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PDF, Word, Images, Zip, Spreadsheets, Videos, and Audio (All formats)
            </p>
          </div>
        ) : (
          <div className="p-4 bg-muted/30 border rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {(file.size / 1024).toFixed(1)} KB • {file.type || "binary"}
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary" /> Master Encryption Password
            </label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3" /> Auto-Generate Strong Password
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong master password..."
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

            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm master password..."
                className="w-full text-sm bg-background border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              />
            </div>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Password Strength:</span>
                <span
                  className={`font-semibold ${
                    strength.score <= 1
                      ? "text-red-500"
                      : strength.score === 2
                      ? "text-amber-500"
                      : strength.score === 3
                      ? "text-blue-500"
                      : "text-emerald-500"
                  }`}
                >
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 transition-all ${
                      strength.score > step
                        ? strength.score <= 1
                          ? "bg-red-500"
                          : strength.score === 2
                          ? "bg-amber-500"
                          : strength.score === 3
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                        : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {!encryptedBytes ? (
            <Button
              onClick={handleEncrypt}
              disabled={isEncrypting || !file || !password}
              className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-semibold px-6 shadow-sm hover:opacity-95"
            >
              <Lock className="w-4 h-4" />
              {isEncrypting ? "Encrypting In Local RAM..." : "Lock & Encrypt File"}
            </Button>
          ) : (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">File Successfully Locked & Encrypted</p>
                  <p className="text-xs opacity-90 font-mono">
                    {encryptedFilename} ({(encryptedBytes.length / 1024).toFixed(1)} KB)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDownload}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <Download className="w-4 h-4" /> Download .enc File
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Encrypt Another
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Technical Specification Callout */}
        <div className="p-4 bg-muted/20 border rounded-xl text-xs space-y-2 text-muted-foreground">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <FileLock2 className="w-3.5 h-3.5 text-primary" /> Cryptographic Specifications
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
            <div>
              <span className="font-sans text-muted-foreground">Cipher:</span> AES-GCM-256
            </div>
            <div>
              <span className="font-sans text-muted-foreground">Key Derivation:</span> PBKDF2 (100k rounds)
            </div>
            <div>
              <span className="font-sans text-muted-foreground">Salt / IV:</span> 128-bit / 96-bit CSPRNG
            </div>
            <div>
              <span className="font-sans text-muted-foreground">Auth Tag:</span> 128-bit Integrity Seal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
