"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Info, FileText, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { normalizeUnicode, UnicodeNormalizationForm, UnicodeNormalizationResult } from "./logic";

const PRESETS = [
  { name: "Accents: résumé", text: "re\u0301sume\u0301" }, // decomposed
  { name: "Ligatures: ﬁle ﬂight", text: "ﬁle & ﬂight" },
  { name: "Fullwidth: Ｈｅｌｌｏ", text: "Ｈｅｌｌｏ　Ｗｏｒｌｄ！" },
  { name: "Math & Superscripts: ² ³ ½", text: "x² + y³ = ½" },
];

const FORMS: { form: UnicodeNormalizationForm; name: string; desc: string }[] = [
  {
    form: "NFC",
    name: "NFC (Canonical Composition)",
    desc: "Decomposes characters then combines them into precomposed forms. Best for web & databases.",
  },
  {
    form: "NFD",
    name: "NFD (Canonical Decomposition)",
    desc: "Separates composite characters into base letters and combining diacritics.",
  },
  {
    form: "NFKC",
    name: "NFKC (Compatibility Composition)",
    desc: "Replaces compatible variants (ligatures, fullwidth, subscripts) and recomposes.",
  },
  {
    form: "NFKD",
    name: "NFKD (Compatibility Decomposition)",
    desc: "Replaces compatible variants and decomposes into separate codepoints.",
  },
];

export default function UnicodeNormalizerTool() {
  const [input, setInput] = useState<string>("re\u0301sume\u0301 & ﬁle");
  const [form, setForm] = useState<UnicodeNormalizationForm>("NFC");
  const [copied, setCopied] = useState<boolean>(false);

  const result: UnicodeNormalizationResult = useMemo(() => {
    return normalizeUnicode(input, form);
  }, [input, form]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.normalized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Forms Selector */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Normalization Form:
          </label>
          <div className="flex flex-wrap gap-1">
            {FORMS.map((f) => (
              <button
                key={f.form}
                type="button"
                onClick={() => setForm(f.form)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  form === f.form
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f.form}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {FORMS.find((f) => f.form === form)?.desc}
        </p>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Test Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setInput(p.text)}
              className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Raw Input Text
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {result.originalCodePoints} codepoints • {result.originalBytes} B
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            placeholder="Type or paste Unicode text to normalize..."
            className="w-full p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Normalized Text ({form})
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {result.normalizedCodePoints} codepoints • {result.normalizedBytes} B
            </span>
          </div>

          <textarea
            value={result.normalized}
            readOnly
            rows={6}
            className="w-full flex-1 p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none resize-y"
            spellCheck={false}
          />

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs flex items-center gap-1.5">
              {result.isUnchanged ? (
                <span className="flex items-center gap-1 text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Already normalized in {form}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Transformed ({result.originalCodePoints} → {result.normalizedCodePoints} codepoints)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!result.normalized}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy Normalized"}
            </button>
          </div>
        </div>
      </div>

      {/* Unicode Character Inspector Table */}
      {result.characters.length > 0 && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Unicode Code Point Inspector ({result.characters.length} characters)
            </h3>
            <span className="text-xs text-slate-400">Normalized breakdown</span>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-950 sticky top-0">
                <tr>
                  <th className="px-3 py-2">Glyph</th>
                  <th className="px-3 py-2">Code Point</th>
                  <th className="px-3 py-2">Decimal</th>
                  <th className="px-3 py-2">UTF-8 Bytes</th>
                  <th className="px-3 py-2">HTML Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {result.characters.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors">
                    <td className="px-3 py-2 text-base font-sans font-bold text-slate-900 dark:text-slate-100">
                      {c.character === " " ? <span className="text-slate-300 text-xs font-sans">(space)</span> : c.character}
                    </td>
                    <td className="px-3 py-2 text-teal-600 dark:text-teal-400 font-bold">{c.codePointHex}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{c.codePointDec}</td>
                    <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400">{c.utf8Bytes}</td>
                    <td className="px-3 py-2 text-slate-500">{c.htmlEntity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
