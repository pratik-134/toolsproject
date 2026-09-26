"use client";

import React, { useState, useMemo } from "react";
import { parseNumbersInput, calculateStatistics } from "./logic";
import { Copy, Check, Download, RotateCcw, BarChart2, Hash, ArrowUpDown } from "lucide-react";

const PRESETS = [
  {
    name: "Exam Test Scores",
    data: "88, 92, 75, 64, 88, 95, 82, 90, 78, 85, 91, 73",
  },
  {
    name: "Daily Temperatures (°C)",
    data: "21.5, 23.0, 22.4, 25.1, 26.8, 24.2, 21.9, 20.5, 23.8",
  },
  {
    name: "Customer Ratings (1-5)",
    data: "5, 4, 5, 3, 4, 5, 2, 5, 4, 4, 5, 1, 4, 5, 5, 3",
  },
  {
    name: "Small Sample (Fibonacci)",
    data: "1, 1, 2, 3, 5, 8, 13, 21, 34, 55",
  },
];

export default function StatisticsCalculatorTool() {
  const [rawInput, setRawInput] = useState<string>(PRESETS[0]?.data ?? "");
  const [copied, setCopied] = useState<boolean>(false);

  const numbers = useMemo(() => parseNumbersInput(rawInput), [rawInput]);
  const stats = useMemo(() => calculateStatistics(numbers), [numbers]);

  const handleCopy = () => {
    if (!stats) return;
    const text = [
      `Statistics Summary (${stats.count} values)`,
      `Sum: ${stats.sum}`,
      `Mean (Average): ${stats.mean}`,
      `Median: ${stats.median}`,
      `Mode: ${stats.modes.length > 0 ? stats.modes.join(", ") : "No mode"}`,
      `Min: ${stats.min} | Max: ${stats.max} | Range: ${stats.range}`,
      `Sample Std Dev (s): ${stats.sampleStdDev}`,
      `Population Std Dev (σ): ${stats.populationStdDev}`,
      `Sample Variance (s²): ${stats.sampleVariance}`,
      `Population Variance (σ²): ${stats.populationVariance}`,
      `Q1: ${stats.q1} | Q3: ${stats.q3} | IQR: ${stats.iqr}`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!stats) return;
    const content = [
      "Metric,Value",
      `Count,${stats.count}`,
      `Sum,${stats.sum}`,
      `Mean,${stats.mean}`,
      `Median,${stats.median}`,
      `Mode,"${stats.modes.join(";")}"`,
      `Minimum,${stats.min}`,
      `Maximum,${stats.max}`,
      `Range,${stats.range}`,
      `Sample Variance,${stats.sampleVariance}`,
      `Population Variance,${stats.populationVariance}`,
      `Sample Standard Deviation,${stats.sampleStdDev}`,
      `Population Standard Deviation,${stats.populationStdDev}`,
      `Q1 (25th percentile),${stats.q1}`,
      `Q2 (50th percentile),${stats.q2}`,
      `Q3 (75th percentile),${stats.q3}`,
      `Interquartile Range (IQR),${stats.iqr}`,
      `Sorted Data,"${stats.sortedNumbers.join(",")}"`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "statistics_summary.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Presets & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setRawInput(p.data)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setRawInput("")}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-red-600 rounded-lg border border-slate-200 hover:border-red-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Textarea */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-600" />
              Raw Numbers Input
            </h2>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {numbers.length} {numbers.length === 1 ? "value" : "values"}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Enter your dataset separated by commas, spaces, semicolons, or newlines.
          </p>

          <textarea
            rows={10}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="e.g. 12, 15, 12, 24, 30, 18, 22"
            className="w-full p-3 text-sm font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-slate-50/50 resize-y"
          />

          {stats && (
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied Summary!" : "Copy Summary"}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
              >
                <Download className="w-4 h-4 text-slate-500" />
                CSV
              </button>
            </div>
          )}
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-4">
          {stats ? (
            <>
              {/* Primary Key Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Mean (Average)</div>
                  <div className="text-xl font-bold text-blue-600 mt-1">{stats.mean}</div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Median</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{stats.median}</div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Mode</div>
                  <div className="text-xl font-bold text-slate-900 mt-1 truncate">
                    {stats.modes.length > 0 ? stats.modes.join(", ") : "None"}
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Total Sum (Σx)</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{stats.sum}</div>
                </div>
              </div>

              {/* Detailed Dispersion & Variance Metrics */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  Dispersion & Standard Deviation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-xs font-semibold text-slate-600">Sample Std Dev (s)</div>
                    <div className="text-lg font-bold text-slate-900">{stats.sampleStdDev}</div>
                    <div className="text-[11px] text-slate-400">Divisor (n - 1) for sample data</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-xs font-semibold text-slate-600">Population Std Dev (σ)</div>
                    <div className="text-lg font-bold text-slate-900">{stats.populationStdDev}</div>
                    <div className="text-[11px] text-slate-400">Divisor (N) for full population</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-xs font-semibold text-slate-600">Sample Variance (s²)</div>
                    <div className="text-lg font-bold text-slate-900">{stats.sampleVariance}</div>
                    <div className="text-[11px] text-slate-400">Squared deviation (sample)</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="text-xs font-semibold text-slate-600">Population Variance (σ²)</div>
                    <div className="text-lg font-bold text-slate-900">{stats.populationVariance}</div>
                    <div className="text-[11px] text-slate-400">Squared deviation (population)</div>
                  </div>
                </div>
              </div>

              {/* Range & Quartiles */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-blue-600" />
                  Range & Quartiles (IQR)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500">Min</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{stats.min}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500">Max</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{stats.max}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500">Range</div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{stats.range}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500">IQR (Q3 - Q1)</div>
                    <div className="text-base font-bold text-blue-600 mt-0.5">{stats.iqr}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center pt-1">
                  <div className="p-2.5 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Q1 (25%)</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{stats.q1}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Q2 (Median)</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{stats.q2}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Q3 (75%)</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{stats.q3}</div>
                  </div>
                </div>

                {/* Sorted Data Sequence */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-500 mb-1.5">
                    Sorted Sequence ({stats.count} items):
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 max-h-28 overflow-y-auto break-words leading-relaxed">
                    {stats.sortedNumbers.join(", ")}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
              <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">No Data Available</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Type or paste a list of numbers in the input box on the left, or click one of the preset datasets above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
