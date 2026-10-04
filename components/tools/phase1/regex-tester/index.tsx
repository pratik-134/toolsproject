"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, AlertCircle, Sparkles, RefreshCw, List, Replace } from "lucide-react";
import { testRegex, RegexOptions } from "./logic";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { DraftRestoredBanner } from "@/components/tool-shell/DraftRestoredBanner";

const PRESETS = [
  { name: "Email Address", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { name: "URL / Web Link", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", flags: "gi" },
  { name: "IPv4 Address", pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g" },
  { name: "ISO Date (YYYY-MM-DD)", pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})", flags: "g" },
  { name: "HTML Tags", pattern: "<\\/?([a-zA-Z0-9]+)(\\s+[^>]*)?>", flags: "g" },
];

const AVAILABLE_FLAGS = [
  { flag: "g", label: "Global", desc: "Don't return after first match" },
  { flag: "i", label: "Case Insensitive", desc: "Ignore casing" },
  { flag: "m", label: "Multiline", desc: "^ and $ match line boundaries" },
  { flag: "s", label: "DotAll", desc: ". matches newline characters" },
  { flag: "u", label: "Unicode", desc: "Treat pattern as full unicode" },
];

interface RegexDraft {
  pattern: string;
  flags: string;
  testString: string;
  replacePattern: string;
}

const DEFAULT_REGEX_DRAFT: RegexDraft = {
  pattern: "([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})",
  flags: "g",
  testString:
    "Welcome to Cleartrix! You can contact our support team at support@cleartrix.com or sales team at team@cleartrix.com anytime.",
  replacePattern: "[REDACTED_EMAIL]",
};

export default function RegexTesterTool() {
  const {
    value: draftState,
    setValue: setDraftState,
    isDraftRestored,
    formattedSavedAt,
    clearDraft,
    dismissRestoredBanner,
  } = useToolDraft<RegexDraft>({
    toolSlug: "regex-tester",
    initialValue: DEFAULT_REGEX_DRAFT,
  });

  const pattern = draftState.pattern;
  const flags = draftState.flags;
  const testString = draftState.testString;
  const replacePattern = draftState.replacePattern;

  const setPattern = (p: string) => setDraftState((prev) => ({ ...prev, pattern: p }));
  const setFlags = (f: string) => setDraftState((prev) => ({ ...prev, flags: f }));
  const setTestString = (t: string) => setDraftState((prev) => ({ ...prev, testString: t }));
  const setReplacePattern = (rp: string) => setDraftState((prev) => ({ ...prev, replacePattern: rp }));

  const [showReplace, setShowReplace] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ""));
    } else {
      setFlags(flags + flag);
    }
  };

  const options: RegexOptions = useMemo(
    () => ({
      pattern,
      flags,
      testString,
      replacementPattern: showReplace ? replacePattern : undefined,
    }),
    [pattern, flags, testString, showReplace, replacePattern]
  );

  const evaluation = useMemo(() => testRegex(options), [options]);

  const handleCopyReplace = () => {
    if (evaluation.replaceResult) {
      navigator.clipboard.writeText(evaluation.replaceResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <DraftRestoredBanner
        isRestored={isDraftRestored}
        savedAtFormatted={formattedSavedAt}
        onReset={() => clearDraft(true)}
        onDismiss={dismissRestoredBanner}
      />

      {/* Pattern & Flags Bar */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Regular Expression Pattern
          </label>
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setPattern(p.pattern);
                  setFlags(p.flags);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input with regex delimiters */}
        <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
          <span className="px-3 text-slate-400 select-none">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Type regex pattern here..."
            className="flex-1 bg-transparent py-2.5 text-slate-900 dark:text-slate-100 outline-none font-mono"
            spellCheck={false}
          />
          <span className="px-3 text-slate-400 select-none">/{flags}</span>
        </div>

        {/* Flags Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flags:</span>
          {AVAILABLE_FLAGS.map((f) => {
            const isActive = flags.includes(f.flag);
            return (
              <button
                key={f.flag}
                type="button"
                onClick={() => toggleFlag(f.flag)}
                title={f.desc}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f.flag} <span className="font-sans font-normal opacity-80">({f.label})</span>
              </button>
            );
          })}
        </div>

        {/* Error Notification */}
        {!evaluation.isValid && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Regex Error: {evaluation.errorMessage}</span>
          </div>
        )}
      </div>

      {/* Test String and Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Test String Input */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <List className="w-4 h-4 text-teal-600" /> Test String
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPattern("([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
                  setFlags("g");
                  setTestString("Support inquiries: support@cleartrix.com, billing issues: billing@domain.org, general info: hello@sample.io.");
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                Try Sample
              </button>
              <button
                type="button"
                onClick={() => setTestString("")}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            rows={10}
            placeholder="Insert the text you want to test against your regular expression..."
            className="w-full p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            spellCheck={false}
          />

          {/* Replace Toggle Bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowReplace(!showReplace)}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                <Replace className="w-3.5 h-3.5" />
                {showReplace ? "Hide String Replacement" : "Test Substitution / Replace"}
              </button>
            </div>

            {showReplace && (
              <div className="space-y-3 mt-3">
                <input
                  type="text"
                  value={replacePattern}
                  onChange={(e) => setReplacePattern(e.target.value)}
                  placeholder="Replacement string (e.g. $1, $&, or custom text)"
                  className="w-full p-2.5 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-200 break-all max-h-32 overflow-y-auto">
                  {evaluation.replaceResult || "(No output)"}
                </div>
                <button
                  type="button"
                  onClick={handleCopyReplace}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied Replacement" : "Copy Result"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Match Results */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Matches Found ({evaluation.matchCount})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {evaluation.executionTimeMs} ms
            </span>
          </div>

          <div className="flex-1 mt-3 overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
            {evaluation.matches.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                {evaluation.isValid
                  ? "No matches found in the test string."
                  : "Fix the regular expression syntax above to see matches."}
              </div>
            ) : (
              evaluation.matches.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-teal-600 dark:text-teal-400">Match #{idx + 1}</span>
                    <span>Index: {item.index}</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold break-all">
                    {item.match}
                  </div>

                  {/* Captured Groups */}
                  {item.captured.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400">Captured Groups:</div>
                      {item.captured.map((c, cIdx) => (
                        <div key={cIdx} className="flex gap-2 text-slate-600 dark:text-slate-300">
                          <span className="text-teal-600 dark:text-teal-400 font-semibold">${cIdx + 1}:</span>
                          <span className="break-all">{c ?? "(undefined)"}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Named Groups */}
                  {item.groups && Object.keys(item.groups).length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400">Named Groups:</div>
                      {Object.entries(item.groups).map(([gName, gVal]) => (
                        <div key={gName} className="flex gap-2 text-slate-600 dark:text-slate-300">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{gName}:</span>
                          <span className="break-all">{gVal ?? "(undefined)"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
