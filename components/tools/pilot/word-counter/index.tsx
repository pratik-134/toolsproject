"use client";

import React, { useState, useMemo } from "react";
import { analyzeText } from "./logic";
import { Copy, Check, Trash2, Clock, AlignLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAMPLE_TEXT = `Qwertygen is a privacy-first collection of free, high-performance web tools.
Every calculation, file conversion, and document compilation executes entirely on your device inside standard browser memory.

No files are ever uploaded to cloud servers. No accounts or registrations are mandatory.
Experience modern client-side speed without tracking or paywalls.`;

export default function WordCounterTool() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo(() => analyzeText(text), [text]);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCaseChange = (mode: "upper" | "lower" | "title") => {
    if (!text) return;
    if (mode === "upper") setText(text.toUpperCase());
    else if (mode === "lower") setText(text.toLowerCase());
    else if (mode === "title") {
      setText(
        text.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-center shadow-xs">
          <span className="text-2xl font-black text-blue-600 font-headings">
            {stats.words}
          </span>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Words
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-center shadow-xs">
          <span className="text-2xl font-black text-slate-900 font-headings">
            {stats.characters}
          </span>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Characters
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-center shadow-xs">
          <span className="text-2xl font-black text-slate-900 font-headings">
            {stats.charactersNoSpaces}
          </span>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Chars (No Spaces)
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-center shadow-xs">
          <span className="text-2xl font-black text-slate-900 font-headings">
            {stats.sentences}
          </span>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Sentences
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-center shadow-xs">
          <span className="text-2xl font-black text-slate-900 font-headings">
            {stats.paragraphs}
          </span>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Paragraphs
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-center shadow-xs">
          <span className="text-2xl font-black text-emerald-600 font-headings flex items-center justify-center gap-1">
            <Clock className="h-4 w-4 text-emerald-500 inline" />
            {stats.readingTimeMinutes}m
          </span>
          <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            Read Time
          </span>
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50/70 border-b border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCaseChange("upper")}
              className="text-xs h-7 px-2"
            >
              UPPERCASE
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCaseChange("lower")}
              className="text-xs h-7 px-2"
            >
              lowercase
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCaseChange("title")}
              className="text-xs h-7 px-2"
            >
              Title Case
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              disabled={!text}
              className="text-xs h-7 px-2.5 gap-1"
            >
              {copied ? (
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setText("")}
              className="text-xs h-7 px-2.5 gap-1 text-slate-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste text here to count words..."
          rows={12}
          className="w-full p-4 font-body text-sm sm:text-base text-slate-800 bg-transparent resize-y focus:outline-none min-h-[240px] leading-relaxed"
        />
      </div>

      {/* Keyword Density Table */}
      {stats.keywordDensity.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Top Keywords & Frequency
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stats.keywordDensity.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                  {item.word}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
