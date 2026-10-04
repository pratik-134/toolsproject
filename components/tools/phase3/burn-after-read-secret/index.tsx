"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  KeyRound,
  Flame,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Clock,
  Share2,
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
  encryptSecret,
  decryptSecret,
  serializeVaultToHash,
  parseVaultFromHash,
  isSecretExpired,
  EncryptedVault,
} from "./logic";

const SAMPLE_SECRET = `# Demo Database Credentials & Tokens (Sample Only)
DATABASE_HOST=db.internal.example.org
DATABASE_PORT=5432
DATABASE_USER=app_user_demo
DATABASE_PASS=DemoPassphrase_9876543210!
SERVICE_AUTH_TOKEN=demo_token_abc123xyz789_placeholder
APP_SECRET_PHRASE=sunflower-cascade-quantum-velocity-ocean

Note: Use Burn-After-Read to safely share sensitive text directly over client hash URLs.`;

export default function BurnAfterReadSecretTool() {
  const [mode, setMode] = useState<"create" | "reveal">("create");

  // Create Mode States
  const [plaintext, setPlaintext] = useState("");
  const [usePassphrase, setUsePassphrase] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [ttlMinutes, setTtlMinutes] = useState(0); // 0 = burn on view
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reveal Mode States
  const [incomingVault, setIncomingVault] = useState<EncryptedVault | null>(null);
  const [revealPassphrase, setRevealPassphrase] = useState("");
  const [showRevealPassphrase, setShowRevealPassphrase] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [isBurned, setIsBurned] = useState(false);

  // Detect URL Hash on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash && hash.includes("data=")) {
      const vault = parseVaultFromHash(hash);
      if (vault) {
        setIncomingVault(vault);
        setMode("reveal");

        if (isSecretExpired(vault)) {
          setRevealError("This secret has expired and can no longer be retrieved.");
        }
      }
    }

    const handlePipelineData = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail && customEvent.detail.textData) {
        setPlaintext(customEvent.detail.textData);
        setMode("create");
      }
    };

    window.addEventListener("pipeline-apply-data", handlePipelineData);
    return () => {
      window.removeEventListener("pipeline-apply-data", handlePipelineData);
    };
  }, []);

  // Handle Encrypt & Generate Link
  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plaintext.trim()) return;

    setIsEncrypting(true);
    try {
      const vault = await encryptSecret(plaintext, {
        passphrase: usePassphrase ? passphrase : undefined,
        ttlMinutes,
      });

      const hash = serializeVaultToHash(vault);
      const url = `${window.location.origin}${window.location.pathname}${hash}`;
      setGeneratedLink(url);
    } catch (err: any) {
      alert(`Encryption failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Handle Decrypt & Burn
  const handleReveal = async () => {
    if (!incomingVault) return;

    setIsDecrypting(true);
    setRevealError(null);

    try {
      if (isSecretExpired(incomingVault)) {
        throw new Error("This secret has expired and was automatically destroyed.");
      }

      const text = await decryptSecret(incomingVault, {
        passphrase: incomingVault.requiresPassphrase ? revealPassphrase : undefined,
      });

      setDecryptedText(text);
      setIsBurned(true);

      // Clean the hash from the browser URL immediately
      window.history.replaceState(null, "", window.location.pathname);
    } catch (err: any) {
      setRevealError(err.message || "Failed to decrypt secret. Please verify the password.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySecret = async () => {
    if (!decryptedText) return;
    await navigator.clipboard.writeText(decryptedText);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleResetCreate = () => {
    setPlaintext("");
    setPassphrase("");
    setUsePassphrase(false);
    setGeneratedLink(null);
    setCopiedLink(false);
  };

  return (
    <div className="space-y-6 font-body text-slate-900 dark:text-slate-100 max-w-4xl mx-auto">
      {/* Privacy Guarantee Header */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-blue-950 dark:text-blue-100">
              Zero-Knowledge Client-Side Vault
            </div>
            <div className="text-xs text-blue-800/80 dark:text-blue-300">
              Encrypted locally with AES-GCM 256-bit. The decryption key exists solely in the link hash and is never transmitted to any server.
            </div>
          </div>
        </div>

        {incomingVault && (
          <button
            type="button"
            onClick={() => {
              setIncomingVault(null);
              setMode("create");
              window.history.replaceState(null, "", window.location.pathname);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Create New Secret</span>
          </button>
        )}
      </div>

      {/* Mode 1: Reveal / Burn Mode */}
      {mode === "reveal" && incomingVault ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 mb-2">
              <Flame className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
              Confidential Encrypted Secret
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              This message was encrypted in-browser. Once decrypted, it will be permanently burned from memory.
            </p>
          </div>

          {revealError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{revealError}</span>
            </div>
          )}

          {!decryptedText ? (
            <div className="space-y-4 max-w-md mx-auto">
              {incomingVault.requiresPassphrase && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Required Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRevealPassphrase ? "text" : "password"}
                      value={revealPassphrase}
                      onChange={(e) => setRevealPassphrase(e.target.value)}
                      placeholder="Enter decryption password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRevealPassphrase(!showRevealPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showRevealPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={handleReveal}
                disabled={isDecrypting || (incomingVault.requiresPassphrase && !revealPassphrase)}
                className="w-full py-3 h-auto text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition-all gap-2"
              >
                <Flame className="w-4 h-4" />
                <span>{isDecrypting ? "Decrypting In-Memory..." : "Reveal & Burn Secret"}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Decrypted successfully & burned from link</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-xs transition-colors"
                >
                  {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSecret ? "Copied" : "Copy Secret"}</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words border border-slate-800 select-all max-h-96 overflow-y-auto">
                {decryptedText}
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Flame className="w-4 h-4 shrink-0" />
                <span>The link hash was removed. Reloading this page will permanently lose the message.</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode 2: Create Secret Mode */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {!generatedLink ? (
            <form onSubmit={handleGenerateLink} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Secret Message, Password, or Token
                  </label>
                  <button
                    type="button"
                    onClick={() => setPlaintext(SAMPLE_SECRET)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Load Sample Secret
                  </button>
                </div>
                <textarea
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value)}
                  placeholder="Paste confidential credentials, private API keys, or sensitive text here..."
                  rows={6}
                  required
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Security Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expiration Settings */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Auto-Destruct Policy</span>
                  </label>
                  <Select
                    value={String(ttlMinutes)}
                    onValueChange={(val) => setTtlMinutes(Number(val))}
                  >
                    <SelectTrigger className="w-full h-9 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <SelectValue placeholder="Select Auto-Destruct Policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Burn on First View (Single Read)</SelectItem>
                      <SelectItem value="60">Expire after 1 Hour</SelectItem>
                      <SelectItem value="1440">Expire after 24 Hours</SelectItem>
                      <SelectItem value="10080">Expire after 7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional Passphrase Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                      <span>Require Password</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={usePassphrase}
                      onChange={(e) => setUsePassphrase(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {usePassphrase ? (
                    <div className="relative mt-2">
                      <input
                        type={showPassphrase ? "text" : "password"}
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Enter secret passphrase"
                        required={usePassphrase}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassphrase(!showPassphrase)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        aria-label="Toggle password visibility"
                      >
                        {showPassphrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Auto-generates a secure 256-bit AES key embedded solely in the link hash.
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isEncrypting || !plaintext.trim()}
                className="w-full py-3 h-auto text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isEncrypting ? "Encrypting in Browser..." : "Generate Burn-After-Read Link"}</span>
              </Button>
            </form>
          ) : (
            /* Link Ready View */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 mb-1">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-heading">
                  Encrypted Secret Link Ready
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Share this single-use link. When opened, the secret will decrypt in the recipient's browser and self-destruct.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Shareable Secret URL
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 select-all"
                  />
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto px-5 py-2.5 h-auto text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetCreate}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Create Another Secret</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
