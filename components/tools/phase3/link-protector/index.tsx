"use client";

import React, { useState, useEffect } from "react";
import {
  Link2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  HelpCircle,
  FileText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  encryptLink,
  decryptLink,
  serializeLinkToHash,
  parseLinkFromHash,
  isLinkExpired,
  validateUrl,
  ProtectedLinkVault,
  ProtectedLinkPayload,
} from "./logic";

export default function LinkProtectorTool() {
  const [mode, setMode] = useState<"create" | "unlock">("create");

  // Create Mode States
  const [url, setUrl] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [hint, setHint] = useState("");
  const [note, setNote] = useState("");
  const [ttlMinutes, setTtlMinutes] = useState(0); // 0 = no expiry
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Unlock Mode States
  const [incomingVault, setIncomingVault] = useState<ProtectedLinkVault | null>(null);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [unlockedPayload, setUnlockedPayload] = useState<ProtectedLinkPayload | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Check URL hash on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash && hash.includes("link=")) {
      const vault = parseLinkFromHash(hash);
      if (vault) {
        setIncomingVault(vault);
        setMode("unlock");

        if (isLinkExpired(vault)) {
          setUnlockError("This protected link has expired and cannot be accessed.");
        }
      }
    }
  }, []);

  // Handle Encrypt & Generate Link
  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!validateUrl(url)) {
      setCreateError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    if (!passphrase.trim() || passphrase.trim().length < 3) {
      setCreateError("Password must be at least 3 characters long");
      return;
    }

    setIsEncrypting(true);
    try {
      const vault = await encryptLink(url, passphrase, {
        hint,
        note,
        ttlMinutes,
      });

      const hash = serializeLinkToHash(vault);
      const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;
      setGeneratedLink(fullUrl);
    } catch (err: any) {
      setCreateError(err.message || "Failed to encrypt link");
    } finally {
      setIsEncrypting(false);
    }
  };

  // Handle Decrypt & Unlock
  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!incomingVault || !unlockPassword) return;

    setIsDecrypting(true);
    setUnlockError(null);

    try {
      if (isLinkExpired(incomingVault)) {
        setUnlockError("This link has expired and is no longer accessible.");
        return;
      }

      const payload = await decryptLink(incomingVault, unlockPassword);
      setUnlockedPayload(payload);
    } catch (err: any) {
      setUnlockError(err.message || "Incorrect password or corrupted link data");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyDestination = () => {
    if (!unlockedPayload?.url) return;
    navigator.clipboard.writeText(unlockedPayload.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleReset = () => {
    setUrl("");
    setPassphrase("");
    setHint("");
    setNote("");
    setTtlMinutes(0);
    setGeneratedLink(null);
    setCreateError(null);
    setMode("create");
    window.location.hash = "";
  };

  // Extract destination domain for preview
  const getDomain = (rawUrl: string) => {
    try {
      const parsed = new URL(rawUrl);
      return parsed.hostname;
    } catch {
      return rawUrl;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Password-Protected Link Redirector
            </h2>
            <p className="text-xs text-muted-foreground">
              Encrypt sensitive destination URLs with AES-256-GCM. Unlocked solely via recipient passphrase in local browser memory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {mode === "unlock" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Create New Link
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero-Server Knowledge
            </span>
          )}
        </div>
      </div>

      {mode === "create" ? (
        <div className="space-y-6">
          {!generatedLink ? (
            <form onSubmit={handleGenerateLink} className="space-y-5">
              {createError && (
                <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Destination URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Destination URL to Protect
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUrl("https://github.com/qwertygen/security-manifesto");
                      setPassphrase("QwertygenShield2026!");
                      setHint("Platform security password (check README)");
                      setNote("Strictly confidential link for verified engineering team members only.");
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Try Sample
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://private-docs.internal.com/spec-review"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Must begin with http:// or https://. This URL will be encrypted and hidden until decrypted with the password.
                </p>
              </div>

              {/* Password & Hint Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    Decryption Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassphrase ? "text" : "password"}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter a secret password..."
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    Password Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    placeholder="e.g. Our project codename"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Optional Encrypted Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Confidential Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Additional message revealed only after password unlock..."
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring resize-y"
                />
              </div>

              {/* Expiration TTL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  Link Expiration
                </label>
                <Select
                  value={String(ttlMinutes)}
                  onValueChange={(val) => setTtlMinutes(Number(val))}
                >
                  <SelectTrigger className="w-full h-10 px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring">
                    <SelectValue placeholder="Select Expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Never expires</SelectItem>
                    <SelectItem value="60">Expires in 1 hour</SelectItem>
                    <SelectItem value="1440">Expires in 24 hours</SelectItem>
                    <SelectItem value="10080">Expires in 7 days</SelectItem>
                    <SelectItem value="43200">Expires in 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isEncrypting || !url.trim() || !passphrase.trim()}
                className="w-full py-6 text-sm font-medium gap-2"
              >
                {isEncrypting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Encrypting link locally...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Generate Protected Link
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Created Link Card */
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-6">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-base font-semibold">Protected Link Generated</h3>
                  <p className="text-xs text-muted-foreground">
                    Destination URL has been encrypted with AES-256-GCM. Share the link with your recipient.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Protected Link
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
                  Test Unlock Link in New Tab
                </a>
                <span className="text-muted-foreground text-xs">•</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Create Another Link
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Unlock Mode */
        <div className="space-y-6">
          {unlockedPayload ? (
            /* Unlocked Destination Screen */
            <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Link Successfully Unlocked
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Destination verified. Review the target domain below before navigating.
                  </p>
                </div>
              </div>

              {/* Target Domain Preview */}
              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">Destination Domain</span>
                  <span className="font-mono text-foreground font-medium">
                    {getDomain(unlockedPayload.url)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-background border border-input font-mono text-xs text-foreground break-all">
                  {unlockedPayload.url}
                </div>
              </div>

              {/* Optional Confidential Note */}
              {unlockedPayload.note && (
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Attached Note from Sender
                  </span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {unlockedPayload.note}
                  </p>
                </div>
              )}

              {/* Phishing Safe Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Anti-Phishing Safety: Ensure you trust the domain <strong>{getDomain(unlockedPayload.url)}</strong> before proceeding.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={unlockedPayload.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4" />
                  Proceed to Destination
                </a>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyDestination}
                  className="w-full sm:w-auto gap-2 py-3 px-4"
                >
                  {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedUrl ? "Copied" : "Copy Safe Link"}
                </Button>
              </div>
            </div>
          ) : (
            /* Password Prompt */
            <div className="max-w-md mx-auto p-6 rounded-2xl border border-border bg-card text-center space-y-5 shadow-xs">
              <div className="p-3 w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Protected Link Locked
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This destination link requires a password to unlock and decrypt.
                </p>
              </div>

              {incomingVault?.hint && (
                <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-left">
                  <span className="font-semibold text-primary block mb-0.5">Password Hint:</span>
                  <span className="text-foreground">{incomingVault.hint}</span>
                </div>
              )}

              {unlockError && (
                <div className="flex items-center gap-2 p-3 text-xs text-destructive bg-destructive/10 rounded-lg text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{unlockError}</span>
                </div>
              )}

              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="relative">
                  <input
                    type={showUnlockPassword ? "text" : "password"}
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Enter password to unlock..."
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showUnlockPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isDecrypting || !unlockPassword}
                  className="w-full py-5 text-sm gap-2"
                >
                  {isDecrypting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Decrypting Destination...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Unlock & Reveal Link
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
