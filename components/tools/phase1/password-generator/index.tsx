"use client";

import React, { useState, useEffect } from "react";
import { generatePassword, generatePassphrase, PasswordOptions, PassphraseOptions } from "./logic";
import { Copy, Check, RefreshCw, ShieldCheck, Key, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PasswordGeneratorTool() {
  const [mode, setMode] = useState<"password" | "passphrase">("password");

  // Password options
  const [length, setLength] = useState<number>(20);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState<boolean>(true);

  // Passphrase options
  const [wordsCount, setWordsCount] = useState<number>(4);
  const [separator, setSeparator] = useState<string>("-");
  const [capitalize, setCapitalize] = useState<boolean>(true);
  const [includeNumber, setIncludeNumber] = useState<boolean>(true);

  const [currentValue, setCurrentValue] = useState<string>("");
  const [entropyBits, setEntropyBits] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const regenerate = () => {
    if (mode === "password") {
      const res = generatePassword({
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        avoidAmbiguous,
      });
      setCurrentValue(res.password);
      setEntropyBits(res.entropyBits);
    } else {
      const res = generatePassphrase({
        wordsCount,
        separator,
        capitalize,
        includeNumber,
      });
      setCurrentValue(res.passphrase);
      setEntropyBits(res.entropyBits);
    }
  };

  useEffect(() => {
    regenerate();
  }, [
    mode,
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    avoidAmbiguous,
    wordsCount,
    separator,
    capitalize,
    includeNumber,
  ]);

  const handleCopy = async () => {
    if (!currentValue) return;
    await navigator.clipboard.writeText(currentValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let strengthLabel = "Weak";
  let strengthColor = "text-red-500 bg-red-50 border-red-200";
  if (entropyBits >= 80) {
    strengthLabel = "Very Strong";
    strengthColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  } else if (entropyBits >= 60) {
    strengthLabel = "Strong";
    strengthColor = "text-blue-700 bg-blue-50 border-blue-200";
  } else if (entropyBits >= 40) {
    strengthLabel = "Fair";
    strengthColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  return (
    <div className="space-y-6">
      {/* Generated Password Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {mode === "password" ? "Generated Random Password" : "Generated Memorable Passphrase"}
            </span>
          </div>

          <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${strengthColor}`}>
            {strengthLabel} ({entropyBits} bits entropy)
          </div>
        </div>

        {/* Display Field */}
        <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 sm:p-4 border border-white/10 gap-2">
          <span className="font-mono text-base sm:text-xl font-bold tracking-wider text-white break-all select-all">
            {currentValue}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={regenerate}
              title="Generate new password"
              className="text-xs h-8 w-8 p-0 border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={handleCopy}
              className="text-xs h-8 px-3 gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mode & Customization Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl max-w-sm">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "password"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Random Password
          </button>
          <button
            type="button"
            onClick={() => setMode("passphrase")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "passphrase"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Memorable Passphrase
          </button>
        </div>

        {mode === "password" ? (
          <div className="space-y-4">
            {/* Length Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Password Length</span>
                <span className="font-mono text-sm font-bold text-blue-600">{length} characters</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Checkbox Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Uppercase Letters (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Lowercase Letters (a-z)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Special Symbols (!@#$%)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none sm:col-span-2">
                <input
                  type="checkbox"
                  checked={avoidAmbiguous}
                  onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Avoid Ambiguous Characters (O, 0, l, 1, I)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Passphrase Word Count Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Number of Words</span>
                <span className="font-mono text-sm font-bold text-blue-600">{wordsCount} words</span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                value={wordsCount}
                onChange={(e) => setWordsCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Separator & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Word Separator
                </label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none font-semibold text-slate-800 bg-white"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value=".">Period (.)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=" ">Space ( )</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none mt-4 sm:mt-0">
                  <input
                    type="checkbox"
                    checked={capitalize}
                    onChange={(e) => setCapitalize(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Capitalize Words</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none mt-2 sm:mt-0">
                  <input
                    type="checkbox"
                    checked={includeNumber}
                    onChange={(e) => setIncludeNumber(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Append Random Number</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Guarantee Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          Generated using the browser&apos;s standard Cryptographically Secure Pseudo-Random Number Generator (CSPRNG, <code className="bg-blue-100/60 px-1 py-0.5 rounded font-mono">crypto.getRandomValues</code>). Your password is never logged or transmitted over any network.
        </p>
      </div>
    </div>
  );
}
