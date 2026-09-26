"use client";

import React, { useState, useMemo } from "react";
import { Database, Copy, Check, Sparkles, Download, ArrowRightLeft, FileCode } from "lucide-react";
import { formatSql, minifySql } from "./logic";

const SAMPLES = [
  {
    name: "Complex JOIN",
    sql: "select u.id, u.full_name, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.status = 'active' and u.created_at >= '2025-01-01' group by u.id, u.full_name having count(o.id) > 2 order by total_spent desc limit 50;",
  },
  {
    name: "CREATE TABLE",
    sql: "create table users (id bigint primary key, email varchar(255) not null, created_at timestamp default current_timestamp);",
  },
  {
    name: "INSERT / UPDATE",
    sql: "insert into products (title, sku, price, in_stock) values ('Mechanical Keyboard', 'KB-99', 129.99, true); update products set price = 119.99 where sku = 'KB-99';",
  },
];

export default function SqlFormatterTool() {
  const [inputSql, setInputSql] = useState<string>(SAMPLES[0]!.sql);
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const [indentSize, setIndentSize] = useState<2 | 4 | "tab">(2);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const outputSql = useMemo(() => {
    if (!inputSql.trim()) return "";
    if (mode === "minify") {
      return minifySql(inputSql);
    } else {
      return formatSql(inputSql, { indentSize, uppercaseKeywords: uppercase });
    }
  }, [inputSql, mode, indentSize, uppercase]);

  const handleCopy = () => {
    if (outputSql) {
      navigator.clipboard.writeText(outputSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!outputSql) return;
    const blob = new Blob([outputSql], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query.sql";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mode Switch */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMode("beautify")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === "beautify"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Beautify / Format
            </button>
            <button
              type="button"
              onClick={() => setMode("minify")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === "minify"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Minify / Compact
            </button>
          </div>

          {/* Quick Samples */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium">Samples:</span>
            {SAMPLES.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setInputSql(s.sql)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Beautify Sub-Options */}
        {mode === "beautify" && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Keywords:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setUppercase(true)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    uppercase
                      ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  UPPERCASE
                </button>
                <button
                  type="button"
                  onClick={() => setUppercase(false)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    !uppercase
                      ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  lowercase
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Indentation:</span>
              <div className="flex gap-1">
                {([2, 4, "tab"] as const).map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setIndentSize(ind)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      indentSize === ind
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {ind === "tab" ? "Tab" : `${ind} spaces`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-600" />
              Raw SQL Query
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {inputSql.length} characters
            </span>
          </div>
          <textarea
            value={inputSql}
            onChange={(e) => setInputSql(e.target.value)}
            rows={14}
            placeholder="Paste your raw or unformatted SQL query here..."
            className="w-full p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Right: Output */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              {mode === "beautify" ? "Beautified SQL" : "Minified SQL"}
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {outputSql.length} characters
            </span>
          </div>

          <textarea
            value={outputSql}
            readOnly
            rows={14}
            placeholder="Formatted SQL output will appear here..."
            className="w-full flex-1 p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none resize-y"
            spellCheck={false}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!outputSql}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .sql
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!outputSql}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy SQL"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
