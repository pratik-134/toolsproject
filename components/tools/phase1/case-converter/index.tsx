"use client";

import React, { useState, useMemo } from "react";
import { convertCase, CaseConversions } from "./logic";
import { Copy, Check, Type, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CaseConverterTool() {
  const [input, setInput] = useState<string>("Qwertygen Privacy First Web Tools");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const results = useMemo(() => convertCase(input), [input]);

  const handleCopy = async (key: string, val: string) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CASES: { key: keyof CaseConversions; label: string; desc: string }[] = [
    { key: "camelCase", label: "camelCase", desc: "Standard JavaScript/TypeScript variable convention." },
    { key: "pascalCase", label: "PascalCase", desc: "React components, classes, and types convention." },
    { key: "snakeCase", label: "snake_case", desc: "Python, database fields, and SQL column convention." },
    { key: "kebabCase", label: "kebab-case", desc: "URLs, CSS classes, and slug naming convention." },
    { key: "constantCase", label: "CONSTANT_CASE", desc: "Environment variables and global constants." },
    { key: "titleCase", label: "Title Case", desc: "Capitalized heading for essays and articles." },
    { key: "sentenceCase", label: "Sentence case", desc: "Standard grammatically capitalized prose." },
    { key: "alternatingCase", label: "aLtErNaTiNg cAsE", desc: "Meme and social media alternating text." },
    { key: "inverseCase", label: "InVeRsE cAsE", desc: "Inverts uppercase to lowercase and vice versa." },
  ];

  return (
    <div className="space-y-6">
      {/* Input Box */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Type className="h-4 w-4 text-blue-600" />
            Input Text
          </label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInput("user_profile_data_model")}
              className="text-xs h-7 gap-1"
            >
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span>Sample</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInput("")}
              className="text-xs h-7 gap-1 text-slate-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste any text or code identifier to convert its case..."
          rows={3}
          className="w-full p-3 font-body text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
        />
      </div>

      {/* Case Conversion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {CASES.map(({ key, label, desc }) => {
          const val = results[key];
          const isCopied = copiedKey === key;

          return (
            <div
              key={key}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-all shadow-xs flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-headings font-bold text-slate-900 text-xs sm:text-sm">
                  {label}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(key, val)}
                  disabled={!val}
                  className="text-xs h-7 px-2.5 gap-1"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 font-mono text-xs text-slate-800 break-all select-all">
                {val || <span className="text-slate-400 font-sans">Type text above...</span>}
              </div>

              <p className="text-[11px] text-slate-500 font-body">{desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
