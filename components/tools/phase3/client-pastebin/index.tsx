"use client";

import React, { useState, useEffect } from "react";
import {
  FileCode,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  Share2,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  FileText,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SendToPipelineButton } from "@/components/pipeline/SendToPipelineButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  encryptPaste,
  decryptPaste,
  serializePasteToHash,
  parsePasteFromHash,
  SUPPORTED_LANGUAGES,
  EncryptedPasteVault,
  PastePayload,
} from "./logic";

import { Sparkles } from "lucide-react";

const SAMPLE_PASTE_TITLE = "Browser Cryptographic Hash Helper";
const SAMPLE_PASTE_LANG = "typescript";
const SAMPLE_PASTE_CONTENT = `// Zero-knowledge client-side hashing utility
// Share this snippet privately using the link below

async function computeSHA256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Example usage:
// computeSHA256("Qwertygen privacy standard").then(console.log);
export { computeSHA256 };`;

export default function ClientPastebinTool() {
  const [mode, setMode] = useState<"create" | "view">("create");

  // Create Mode States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [usePassphrase, setUsePassphrase] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // View Mode States
  const [incomingVault, setIncomingVault] = useState<EncryptedPasteVault | null>(null);
  const [viewPassphrase, setViewPassphrase] = useState("");
  const [showViewPassphrase, setShowViewPassphrase] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedPaste, setDecryptedPaste] = useState<PastePayload | null>(null);
  const [copiedContent, setCopiedContent] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);

  // Check URL hash on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash && hash.includes("paste=")) {
      const vault = parsePasteFromHash(hash);
      if (vault) {
        setIncomingVault(vault);
        setMode("view");

        // If no password required, decrypt immediately
        if (!vault.requiresPassphrase) {
          decryptPaste(vault)
            .then((data) => setDecryptedPaste(data))
            .catch((err) => setViewError(err.message || "Failed to decrypt paste"));
        }
      }
    }

    const handlePipelineData = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail && customEvent.detail.textData) {
        setContent(customEvent.detail.textData);
        if (customEvent.detail.title) {
          setTitle(customEvent.detail.title);
        }
        setMode("create");
      }
    };

    window.addEventListener("pipeline-apply-data", handlePipelineData);
    return () => {
      window.removeEventListener("pipeline-apply-data", handlePipelineData);
    };
  }, []);

  // Handle Tab key in textarea for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent = content.substring(0, start) + "  " + content.substring(end);
      setContent(newContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Encrypt & Generate Link
  const handleCreatePaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsEncrypting(true);
    try {
      const vault = await encryptPaste(
        { title, content, language },
        { passphrase: usePassphrase ? passphrase : undefined }
      );

      const hash = serializePasteToHash(vault);
      const url = `${window.location.origin}${window.location.pathname}${hash}`;
      setGeneratedLink(url);
    } catch (err: any) {
      alert(`Encryption failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Decrypt incoming password-protected paste
  const handleDecryptView = async () => {
    if (!incomingVault) return;

    setIsDecrypting(true);
    setViewError(null);

    try {
      const payload = await decryptPaste(incomingVault, {
        passphrase: viewPassphrase,
      });
      setDecryptedPaste(payload);
    } catch (err: any) {
      setViewError(err.message || "Incorrect passphrase or corrupted data");
    } finally {
      setIsDecrypting(false);
    }
  };

  // Copy helpers
  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyContent = () => {
    if (!decryptedPaste?.content) return;
    navigator.clipboard.writeText(decryptedPaste.content);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  // Download paste file
  const handleDownload = () => {
    if (!decryptedPaste) return;
    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.id === decryptedPaste.language);
    const ext = langInfo?.ext || "txt";
    const filename = `${decryptedPaste.title.toLowerCase().replace(/[^a-z0-9_-]/g, "_") || "paste"}.${ext}`;

    const blob = new Blob([decryptedPaste.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fork / Edit as new
  const handleFork = () => {
    if (!decryptedPaste) return;
    setTitle(`${decryptedPaste.title} (Fork)`);
    setContent(decryptedPaste.content);
    setLanguage(decryptedPaste.language);
    setGeneratedLink(null);
    setMode("create");
    window.location.hash = "";
  };

  // Reset to empty editor
  const handleReset = () => {
    setTitle("");
    setContent("");
    setLanguage("plaintext");
    setUsePassphrase(false);
    setPassphrase("");
    setGeneratedLink(null);
    setMode("create");
    window.location.hash = "";
  };

  const lineCount = content ? content.split("\n").length : 0;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Encrypted Client Pastebin
            </h2>
            <p className="text-xs text-muted-foreground">
              Zero-knowledge text & code vault encrypted with AES-256-GCM. Decryption keys live exclusively in your URL hash.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {mode === "view" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Paste
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Client-Side Privacy
            </span>
          )}
        </div>
      </div>

      {/* Main Container */}
      {mode === "create" ? (
        <div className="space-y-6">
          {!generatedLink ? (
            <form onSubmit={handleCreatePaste} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Paste Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Production Configuration / Snippet"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Syntax / Language
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full h-10 px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring">
                      <SelectValue placeholder="Select Syntax / Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Textarea Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase tracking-wider">Paste Content</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTitle(SAMPLE_PASTE_TITLE);
                        setLanguage(SAMPLE_PASTE_LANG);
                        setContent(SAMPLE_PASTE_CONTENT);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      Try Sample
                    </button>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span>{lineCount} lines</span>
                    <span>{wordCount} words</span>
                    <span>{charCount} chars</span>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-input bg-muted/20 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={14}
                    placeholder="Type or paste your text, code, or private configuration here (Tab key supported)..."
                    className="w-full p-4 font-mono text-xs sm:text-sm bg-transparent resize-y border-none focus:outline-hidden text-foreground leading-relaxed"
                  />
                </div>
              </div>

              {/* Security & Password Settings */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Require Passphrase to Decrypt
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={usePassphrase}
                    onChange={(e) => setUsePassphrase(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                  />
                </div>

                {usePassphrase && (
                  <div className="pt-2">
                    <div className="relative">
                      <input
                        type={showPassphrase ? "text" : "password"}
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Enter a strong passphrase for this paste..."
                        required={usePassphrase}
                        className="w-full px-3.5 py-2 pr-10 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassphrase(!showPassphrase)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Recipients will be required to input this exact passphrase to unlock the paste.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isEncrypting || !content.trim()}
                className="w-full py-6 text-sm font-medium gap-2"
              >
                {isEncrypting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Encrypting Paste locally...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Create Encrypted Paste Link
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Created Link Card */
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-6">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
                <div>
                  <h3 className="text-base font-semibold">Paste Encrypted & Ready to Share</h3>
                  <p className="text-xs text-muted-foreground">
                    The text has been encrypted with AES-256-GCM. The decryption key is embedded solely in the URL hash fragment.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client-Encrypted Share Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background font-mono text-xs text-foreground focus:outline-hidden select-all"
                  />
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    variant={copiedLink ? "default" : "secondary"}
                    className="shrink-0 gap-1.5"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? "Copied" : "Copy Link"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Test Paste Link in New Tab
                </a>
                <span className="text-muted-foreground text-xs">•</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Create Another Paste
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* View Paste Mode */
        <div className="space-y-6">
          {decryptedPaste ? (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {decryptedPaste.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 font-mono">
                    <span className="uppercase font-semibold tracking-wider text-primary">
                      {decryptedPaste.language}
                    </span>
                    <span>•</span>
                    <span>{new Date(decryptedPaste.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyContent}
                    className="text-xs gap-1.5"
                  >
                    {copiedContent ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedContent ? "Copied" : "Copy Content"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="text-xs gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleFork}
                    className="text-xs gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Fork / Edit
                  </Button>
                  <SendToPipelineButton
                    sourceSlug="client-pastebin"
                    sourceToolName="Encrypted Client Pastebin"
                    dataType="text"
                    textData={decryptedPaste.content}
                    title={decryptedPaste.title}
                  />
                </div>
              </div>

              {/* Paste Display with Line Numbers */}
              <div className="rounded-2xl border border-border bg-muted/20 overflow-hidden">
                <div className="p-4 overflow-x-auto">
                  <pre className="font-mono text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre">
                    <code>{decryptedPaste.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* Passphrase Required Prompt */
            <div className="max-w-md mx-auto p-6 rounded-2xl border border-border bg-card text-center space-y-4 shadow-xs">
              <div className="p-3 w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Passphrase-Protected Paste
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This paste was encrypted with a custom passphrase. Enter it below to decrypt.
                </p>
              </div>

              {viewError && (
                <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 rounded-lg text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{viewError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showViewPassphrase ? "text" : "password"}
                    value={viewPassphrase}
                    onChange={(e) => setViewPassphrase(e.target.value)}
                    placeholder="Enter passphrase..."
                    onKeyDown={(e) => e.key === "Enter" && handleDecryptView()}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowViewPassphrase(!showViewPassphrase)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showViewPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button
                  onClick={handleDecryptView}
                  disabled={isDecrypting || !viewPassphrase}
                  className="w-full py-5 text-sm gap-2"
                >
                  {isDecrypting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Unlock & View Paste
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
