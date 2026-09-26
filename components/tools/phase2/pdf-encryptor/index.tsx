"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import {
  encryptPdfBuffer,
  evaluatePasswordStrength,
  PdfSecurityPermissions,
  DEFAULT_PERMISSIONS,
} from "./logic";
import {
  Lock,
  Download,
  Upload,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function PdfEncryptorTool() {
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("sample-document.pdf");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<PdfSecurityPermissions>(DEFAULT_PERMISSIONS);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pwdEvaluation = evaluatePasswordStrength(password);

  const handleCreateSamplePdf = async () => {
    setIsProcessing(true);
    try {
      const doc = await PDFDocument.create();
      const page = doc.addPage([600, 400]);
      page.drawText("Confidential Mindkit Financial & Architectural Brief", {
        x: 50,
        y: 350,
        size: 16,
      });
      page.drawText(
        "This document contains proprietary information protected by military-grade AES-256.",
        { x: 50, y: 310, size: 10 }
      );
      page.drawText("Protected with Mindkit In-Browser PDF Locker.", { x: 50, y: 280, size: 10 });
      const bytes = await doc.save();
      setFileData(bytes);
      setFileName("confidential-sample.pdf");
      setStatusMessage("Sample PDF generated in device RAM.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage("Loading PDF file into browser memory...");
    try {
      const buffer = await file.arrayBuffer();
      setFileData(new Uint8Array(buffer));
      setFileName(file.name);
      setStatusMessage(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
    } catch {
      setStatusMessage("Failed to read PDF file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEncryptAndDownload = async () => {
    if (!fileData) {
      alert("Please upload a PDF or generate the sample first.");
      return;
    }
    if (!password) {
      alert("Please enter a master password to encrypt the PDF.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Deriving AES-256 key and encrypting payload...");
    try {
      const lockedBytes = await encryptPdfBuffer(fileData, password, {
        ...permissions,
        documentTitle: fileName,
      });

      const blob = new Blob([lockedBytes as unknown as BlobPart], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.pdf$/i, "")}-protected.encpdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage("PDF successfully encrypted and downloaded!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Encryption failed";
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Zero Server Transmission:</strong> AES-GCM-256 encryption executes entirely inside your browser using the W3C Web Cryptography API. Passwords and file contents never touch a network.
          </span>
        </div>
        <span className="font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded text-[10px]">
          PBKDF2 + AES-256
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: File & Password */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Select PDF to Protect</h2>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
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
                  Upload PDF
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 text-muted-foreground"
                  onClick={handleCreateSamplePdf}
                  disabled={isProcessing}
                >
                  Create Sample
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
                    {fileData ? `${(fileData.length / 1024).toFixed(1)} KB in browser RAM` : "No file loaded"}
                  </p>
                </div>
              </div>
              {fileData && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-semibold rounded">
                  Ready to Encrypt
                </span>
              )}
            </div>

            {/* Password Entry */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  Set Document Master Password
                </label>
                <span className={`text-[10px] font-semibold ${
                  pwdEvaluation.score >= 3 ? "text-emerald-600" : pwdEvaluation.score === 2 ? "text-amber-500" : "text-rose-500"
                }`}>
                  {pwdEvaluation.label}
                </span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password..."
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

              {/* Password Strength Meter Bar */}
              <div className="grid grid-cols-4 gap-1 h-1.5 pt-1">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-sm transition-all ${
                      pwdEvaluation.score > step
                        ? pwdEvaluation.score >= 3
                          ? "bg-emerald-500"
                          : pwdEvaluation.score === 2
                          ? "bg-amber-400"
                          : "bg-rose-500"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {pwdEvaluation.suggestions.length > 0 && password.length > 0 && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                  {pwdEvaluation.suggestions[0]}
                </p>
              )}
            </div>

            {statusMessage && (
              <p className="text-xs text-muted-foreground font-medium">{statusMessage}</p>
            )}
          </div>
        </div>

        {/* Right Column: Security Policy & Download CTA */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Lock className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Document Security Policy</h2>
            </div>

            {/* Permission Checkboxes */}
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2 rounded-lg border border-border bg-background cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Allow Document Printing</p>
                  <p className="text-[10px] text-muted-foreground">Recipients can send pages to physical printers</p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.allowPrinting}
                  onChange={(e) => setPermissions({ ...permissions, allowPrinting: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg border border-border bg-background cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Allow Text & Image Copying</p>
                  <p className="text-[10px] text-muted-foreground">Allow clipboard extraction from document</p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.allowCopying}
                  onChange={(e) => setPermissions({ ...permissions, allowCopying: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg border border-border bg-background cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Allow Form Filling & Annotation</p>
                  <p className="text-[10px] text-muted-foreground">Allow highlighting, comments, and form input</p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.allowAnnotations}
                  onChange={(e) => setPermissions({ ...permissions, allowAnnotations: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>
            </div>

            {/* Encryption CTA */}
            <div className="pt-4 border-t border-border space-y-2">
              <Button
                onClick={handleEncryptAndDownload}
                disabled={isProcessing || !password || !fileData}
                className="w-full gap-2 py-5 font-semibold text-sm shadow-md"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Encrypting PDF...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Encrypt & Download Protected PDF
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted with AES-GCM-256 (100,000 PBKDF2 rounds)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
