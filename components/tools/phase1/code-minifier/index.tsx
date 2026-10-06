"use client";

import React, { useState, useId } from "react";
import { Copy, Check, Download, RefreshCw, FileCode, Sparkles } from "lucide-react";
import { minifyCode, MinifyLanguage } from "./logic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useToolKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcut";
import { DraftRestoredBanner } from "@/components/tool-shell/DraftRestoredBanner";
import { DiffInspector } from "@/components/tools/shared/DiffInspector";

const SAMPLES: Record<MinifyLanguage, string> = {
  html: `<!DOCTYPE html>
<!-- Navigation Bar -->
<header class="navbar">
  <div class="container">
    <a href="/" class="brand-logo"> Qwertygen </a>
    <ul class="nav-links">
      <li> <a href="/tools"> Tools </a> </li>
      <li> <a href="/about"> About </a> </li>
    </ul>
  </div>
</header>`,
  css: `/* Global Stylesheet */
:root {
  --primary-color: #2563eb;
  --bg-color: #ffffff;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--bg-color);
}

.card {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 24px;
}`,
  js: `// User authentication service
function authenticateUser(username, token) {
  console.log("Authenticating user:", username);
  if (!username || !token) {
    return false;
  }
  /* Return validation status */
  const isValid = token.length >= 32;
  return isValid;
}`,
  json: `{
  "tool": "code-minifier",
  "version": "1.0.0",
  "privacy": "100% in-browser client-side execution",
  "supportedLanguages": [
    "HTML",
    "CSS",
    "JavaScript",
    "JSON"
  ]
}`,
};

interface MinifierDraft {
  language: MinifyLanguage;
  input: string;
}

export default function CodeMinifier() {
  const languageSelectId = useId();
  const removeCommentsId = useId();
  const collapseWhitespaceId = useId();
  const removeConsoleId = useId();

  const {
    value: draftState,
    setValue: setDraftState,
    isDraftRestored,
    formattedSavedAt,
    clearDraft,
    dismissRestoredBanner,
  } = useToolDraft<MinifierDraft>({
    toolSlug: "code-minifier",
    initialValue: {
      language: "html",
      input: SAMPLES.html,
    },
  });

  const language = draftState.language;
  const input = draftState.input;

  const setLanguage = (lang: MinifyLanguage) => setDraftState((prev) => ({ ...prev, language: lang }));
  const setInput = (code: string) => setDraftState((prev) => ({ ...prev, input: code }));

  const [removeComments, setRemoveComments] = useState(true);
  const [collapseWhitespace, setCollapseWhitespace] = useState(true);
  const [removeConsole, setRemoveConsole] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = (newLang: MinifyLanguage) => {
    setDraftState({
      language: newLang,
      input: SAMPLES[newLang],
    });
    setError(null);
  };

  let result = null;
  try {
    result = minifyCode(input, language, {
      removeComments,
      collapseWhitespace,
      removeConsole: language === "js" && removeConsole,
    });
  } catch (err: any) {
    // handled gracefully
  }

  const [activeView, setActiveView] = useState<"code" | "diff">("code");

  const handleCopy = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useToolKeyboardShortcuts({
    onCopy: handleCopy,
  });

  const handleDownload = () => {
    if (!result?.code) return;
    const extensions: Record<MinifyLanguage, string> = {
      html: "min.html",
      css: "min.css",
      js: "min.js",
      json: "min.json",
    };
    const mimeTypes: Record<MinifyLanguage, string> = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
    };
    const blob = new Blob([result.code], { type: mimeTypes[language] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output.${extensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <DraftRestoredBanner
        isRestored={isDraftRestored}
        savedAtFormatted={formattedSavedAt}
        onReset={() => clearDraft(true)}
        onDismiss={dismissRestoredBanner}
      />

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3">
          <label htmlFor={languageSelectId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Language:
          </label>
          <Select
            value={language}
            onValueChange={(val) => handleLanguageChange(val as MinifyLanguage)}
          >
            <SelectTrigger id={languageSelectId} className="h-8 w-32 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="js">JavaScript</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          {language !== "json" && (
            <>
              <label htmlFor={removeCommentsId} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  id={removeCommentsId}
                  type="checkbox"
                  checked={removeComments}
                  onChange={(e) => setRemoveComments(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Strip comments
              </label>
              <label htmlFor={collapseWhitespaceId} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  id={collapseWhitespaceId}
                  type="checkbox"
                  checked={collapseWhitespace}
                  onChange={(e) => setCollapseWhitespace(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Collapse whitespace
              </label>
            </>
          )}

          {language === "js" && (
            <label htmlFor={removeConsoleId} className="flex items-center gap-1.5 cursor-pointer">
              <input
                id={removeConsoleId}
                type="checkbox"
                checked={removeConsole}
                onChange={(e) => setRemoveConsole(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Strip console.*
            </label>
          )}

          <button
            onClick={() => setInput(SAMPLES[language])}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Sample
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Original Size</span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{result.originalSize.toLocaleString()} B</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Minified Size</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{result.minifiedSize.toLocaleString()} B</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Bytes Saved</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{result.bytesSaved.toLocaleString()} B</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 block flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Space Saved
            </span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {result.savingsPercent}%
            </span>
          </div>
        </div>
      )}

      {/* View Switcher: Code Editors vs Visual Diff Inspector */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveView("code")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeView === "code"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Code Editors
          </button>
          <button
            type="button"
            onClick={() => setActiveView("diff")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeView === "diff"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visual Diff & Savings</span>
          </button>
        </div>
      </div>

      {activeView === "diff" ? (
        <DiffInspector
          originalText={input}
          modifiedText={result?.code || ""}
          originalLabel={`Source ${language.toUpperCase()}`}
          modifiedLabel={`Minified ${language.toUpperCase()}`}
          title="Minification Token & Byte Savings Diff"
        />
      ) : (
        /* Editors Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Pane */}
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-blue-500" /> Source {language.toUpperCase()}
            </span>
            <button
              onClick={() => setInput("")}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${language.toUpperCase()} code here...`}
            rows={14}
            className="w-full p-4 font-mono text-xs leading-relaxed bg-transparent resize-y focus:outline-none dark:text-slate-200"
            spellCheck={false}
          />
        </div>

        {/* Output Pane */}
        <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Minified Output
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!result?.code}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!result?.code}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
          <textarea
            value={result?.code || ""}
            readOnly
            placeholder="Minified output will appear here..."
            rows={14}
            className="w-full p-4 font-mono text-xs leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 resize-y focus:outline-none text-emerald-800 dark:text-emerald-300"
            spellCheck={false}
          />
        </div>
      </div>
      )}
    </div>
  );
}
