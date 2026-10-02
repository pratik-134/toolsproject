"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  KeyRound,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Clock,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";

// Standard Sample JWT for instant testing
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InYxLXByaXZhdGUifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggUml2ZXJhIiwiZW1haWwiOiJhbGV4LnJpdmVyYUBleGFtcGxlLmNvbSIsInJvbGUiOiJzdGFmZi1lbmdpbmVlciIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDgwMDAwMDAwLCJpc3MiOiJodHRwczovL2F1dGguY2xlYXJ0cml4LmNvbSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function base64UrlDecode(str: string): string {
  try {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw new Error("Illegal base64url string");
    }
    const binary = atob(output);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  } catch {
    throw new Error("Unable to decode Base64Url segment");
  }
}

export default function JwtDecoderTool() {
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_JWT);
  const [headerJson, setHeaderJson] = useState<string>("");
  const [payloadJson, setPayloadJson] = useState<string>("");
  const [signaturePart, setSignaturePart] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [headerCopied, setHeaderCopied] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);

  // Time claims
  const [expStatus, setExpStatus] = useState<{
    exp?: number;
    iat?: number;
    nbf?: number;
    isExpired?: boolean;
    timeLeftStr?: string;
  }>({});

  useEffect(() => {
    const raw = tokenInput.trim();
    if (!raw) {
      setHeaderJson("");
      setPayloadJson("");
      setSignaturePart("");
      setError(null);
      setExpStatus({});
      return;
    }

    const parts = raw.split(".");
    if (parts.length < 2) {
      setError("Invalid JWT structure: A valid token must have at least 2 dot-separated parts (Header.Payload).");
      setHeaderJson("");
      setPayloadJson("");
      setSignaturePart("");
      setExpStatus({});
      return;
    }

    try {
      const decodedHeader = base64UrlDecode(parts[0] || "");
      const parsedHeader = JSON.parse(decodedHeader);
      setHeaderJson(JSON.stringify(parsedHeader, null, 2));

      const decodedPayload = base64UrlDecode(parts[1] || "");
      const parsedPayload = JSON.parse(decodedPayload);
      setPayloadJson(JSON.stringify(parsedPayload, null, 2));

      setSignaturePart(parts[2] || "");
      setError(null);

      // Check timestamps
      const now = Math.floor(Date.now() / 1000);
      const exp = typeof parsedPayload.exp === "number" ? parsedPayload.exp : undefined;
      const iat = typeof parsedPayload.iat === "number" ? parsedPayload.iat : undefined;
      const nbf = typeof parsedPayload.nbf === "number" ? parsedPayload.nbf : undefined;

      if (exp) {
        const isExpired = now >= exp;
        const diffSeconds = Math.abs(exp - now);
        const days = Math.floor(diffSeconds / 86400);
        const hours = Math.floor((diffSeconds % 86400) / 3600);
        const mins = Math.floor((diffSeconds % 3600) / 60);

        let timeLeftStr = "";
        if (days > 0) timeLeftStr = `${days}d ${hours}h`;
        else if (hours > 0) timeLeftStr = `${hours}h ${mins}m`;
        else timeLeftStr = `${mins}m`;

        setExpStatus({ exp, iat, nbf, isExpired, timeLeftStr });
      } else {
        setExpStatus({ exp, iat, nbf });
      }
    } catch (err: any) {
      setError(`Failed to decode token: ${err.message || "Malformed token syntax"}`);
      setHeaderJson("");
      setPayloadJson("");
    }
  }, [tokenInput]);

  const handleCopyHeader = async () => {
    if (!headerJson) return;
    await navigator.clipboard.writeText(headerJson);
    setHeaderCopied(true);
    setTimeout(() => setHeaderCopied(false), 2000);
  };

  const handleCopyPayload = async () => {
    if (!payloadJson) return;
    await navigator.clipboard.writeText(payloadJson);
    setPayloadCopied(true);
    setTimeout(() => setPayloadCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-body text-slate-900 dark:text-slate-100">
      {/* Privacy Callout Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-xs text-blue-900 dark:text-blue-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>100% In-Browser Inspection:</strong> Your confidential tokens and bearer credentials are decoded strictly inside browser memory. Zero network transmission.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTokenInput(SAMPLE_JWT)}
          className="h-7 text-xs px-2.5 rounded-md border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100/60"
        >
          <Sparkles className="h-3 w-3 mr-1" /> Load Sample
        </Button>
      </div>

      {/* Main Grid: Input Column & Decoded Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Raw Token Input */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Encoded JWT Token</span>
            </label>
            {tokenInput && (
              <button
                type="button"
                onClick={() => setTokenInput("")}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste your JSON Web Token here (header.payload.signature)..."
              rows={14}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 p-3.5 font-mono text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Color Breakdown Legend */}
          <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Header
            </span>
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-purple-500" /> Payload
            </span>
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Signature
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Decoded Header, Payload & Expiration */}
        <div className="lg:col-span-6 space-y-4">
          {/* Expiration Status Pill Bar */}
          {expStatus.exp && (
            <div
              className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                expStatus.isExpired
                  ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
                  : "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="font-bold">
                  {expStatus.isExpired
                    ? `Token Expired (${expStatus.timeLeftStr} ago)`
                    : `Active Token (Valid for ${expStatus.timeLeftStr})`}
                </span>
              </div>
              <div className="font-mono text-[11px] opacity-80">
                exp: {new Date(expStatus.exp * 1000).toLocaleString()}
              </div>
            </div>
          )}

          {/* Decoded Header Section */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Decoded Header (Algorithm & Token Type)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyHeader}
                disabled={!headerJson}
                className="h-7 text-xs px-2 gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {headerCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{headerCopied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
            <pre className="p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-48 leading-relaxed">
              {headerJson || "// Header data will appear here..."}
            </pre>
          </div>

          {/* Decoded Payload Section */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Decoded Payload (Claims & Subject)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPayload}
                disabled={!payloadJson}
                className="h-7 text-xs px-2 gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {payloadCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{payloadCopied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
            <pre className="p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-64 leading-relaxed">
              {payloadJson || "// Payload claims will appear here..."}
            </pre>
          </div>

          {/* Signature Segment Status */}
          {signaturePart && (
            <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 text-xs space-y-1">
              <span className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block text-[11px]">
                Signature Verification Block
              </span>
              <p className="font-mono text-slate-500 dark:text-slate-400 text-[11px] truncate">
                {signaturePart}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block pt-0.5">
                Note: HMAC/RSA secret verification requires private keys and should only be performed in your verified authentication server.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
