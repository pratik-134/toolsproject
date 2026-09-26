"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  decryptAndUnlockPdf,
  createDemoEncryptedPdf,
  isMindkitEncryptedPdf,
  DecryptResult,
} from "./logic";
import {
  Unlock,
  Download,
  Upload,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  FileCheck,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function PdfDecryptorTool() {
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("document-protected.encpdf");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [unlockedResult, setUnlockedResult] = useState<DecryptResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLoadDemo = async () => {
    setIsProcessing(true);
    setStatusMessage("Generating demo AES-256 encrypted PDF in RAM...");
    try {
      const demoPass = "Mindkit2026!";
      const bytes = await createDemoEncryptedPdf(demoPass);
      setFileData(bytes);
      setFileName("demo-encrypted.encpdf");
      setPassword(demoPass);
      setUnlockedResult(null);
      setStatusMessage("Demo encrypted file ready! Password autofilled: Mindkit2026!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage("Reading locked document into browser memory...");
    try {
      const buffer = await file.arrayBuffer();
      const u8 = new Uint8Array(buffer);
      setFileData(u8);
      setFileName(file.name);
      setUnlockedResult(null);
      const isMk = isMindkitEncryptedPdf(u8);
      setStatusMessage(
        `Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB) — Format: ${
          isMk ? "Mindkit AES-256 Container" : "Standard Encrypted PDF"
        }`
      );
    } catch {
      setStatusMessage("Could not read file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlockAndDecrypt = async () => {
    if (!fileData) {
      alert("Please upload an encrypted PDF or load the demo file.");
      return;
    }
    if (!password) {
      alert("Please enter the decryption password.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Deriving key and unlocking PDF security handler...");
    try {
      const result = await decryptAndUnlockPdf(fileData, password);
      setUnlockedResult(result);
      setStatusMessage("PDF unlocked and restrictions stripped successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Decryption failed";
      setStatusMessage(`Error: ${msg}`);
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadUnlockedPdf = () => {
    if (!unlockedResult) return;
    const blob = new Blob([unlockedResult.pdfBytes as unknown as BlobPart], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.(encpdf|pdf)$/i, "")}-unlocked.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>100% In-Browser Unlocking:</strong> PDF password verification, decryption, and DRM restriction removal execute entirely in device memory. Your confidential files never touch the cloud.
          </span>
        </div>
        <span className="font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded text-[10px]">
          ZERO NETWORK CALLS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: File & Password */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Select Encrypted PDF Document</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.encpdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Locked PDF
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 text-muted-foreground"
                  onClick={handleLoadDemo}
                  disabled={isProcessing}
                >
                  Load Demo
                </Button>
              </div>
            </div>

            {/* Current File Card */}
            <div className="p-3 bg-muted/30 border border-border rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{fileName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {fileData
                      ? `${(fileData.length / 1024).toFixed(1)} KB in browser RAM`
                      : "No file loaded"}
                  </p>
                </div>
              </div>
              {fileData && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-semibold rounded">
                  {isMindkitEncryptedPdf(fileData) ? "AES-256 Vault" : "Encrypted PDF"}
                </span>
              )}
            </div>

            {/* Password Entry */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                Enter Document Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the password to unlock..."
                  className="w-full px-3 py-2 pr-10 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Unlock Action Button */}
            <Button
              onClick={handleUnlockAndDecrypt}
              disabled={isProcessing || !fileData || !password}
              className="w-full gap-2 py-4 font-semibold text-xs"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Decrypting & Removing Restrictions...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Unlock Document & Remove Restrictions
                </>
              )}
            </Button>

            {statusMessage && (
              <p className="text-xs text-muted-foreground font-medium">{statusMessage}</p>
            )}
          </div>
        </div>

        {/* Right Column: Decrypted Document & Download */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Unlock className="w-4 h-4 text-emerald-600" />
              <h2 className="font-semibold text-sm">Decrypted PDF Output</h2>
            </div>

            {unlockedResult ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Document Unlocked Successfully!
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Size: {(unlockedResult.pdfBytes.length / 1024).toFixed(1)} KB • All passwords and DRM restrictions permanently removed.
                  </p>
                </div>

                {unlockedResult.permissions && (
                  <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1.5 border border-border">
                    <p className="font-medium text-foreground">Original Document Security Flags:</p>
                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      <p>Printing: {unlockedResult.permissions.allowPrinting ? "Allowed" : "Blocked"}</p>
                      <p>Copying: {unlockedResult.permissions.allowCopying ? "Allowed" : "Blocked"}</p>
                      <p>Modifications: {unlockedResult.permissions.allowModifications ? "Allowed" : "Blocked"}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleDownloadUnlockedPdf}
                  className="w-full gap-2 py-5 font-semibold text-sm shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Download Unlocked PDF
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-xs space-y-2">
                <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p>Upload a password-protected PDF or load the demo, enter the password, and click Unlock.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
