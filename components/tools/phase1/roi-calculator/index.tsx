"use client";

import React, { useState, useMemo } from "react";
import { calculateRoi, RoiResult } from "./logic";
import { Copy, Check, RotateCcw, TrendingUp, TrendingDown, DollarSign, Calendar, Percent, AlertCircle } from "lucide-react";

const PRESETS = [
  { name: "Index Fund (3 yrs)", initial: 10000, final: 14500, years: 3 },
  { name: "Real Estate Flip (2 yrs)", initial: 50000, final: 78000, years: 2 },
  { name: "High-Growth Equity (5 yrs)", initial: 20000, final: 55000, years: 5 },
  { name: "Short-Term Trade (0.5 yr)", initial: 5000, final: 6200, years: 0.5 },
];

export default function RoiCalculatorTool() {
  const [initial, setInitial] = useState<number>(10000);
  const [finalVal, setFinalVal] = useState<number>(14500);
  const [years, setYears] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo<RoiResult>(() => {
    return calculateRoi({
      initialInvestment: initial,
      finalValue: finalVal,
      investmentYears: years,
    });
  }, [initial, finalVal, years]);

  const handleCopy = () => {
    const text = [
      "Return on Investment (ROI) Summary",
      `Initial Investment: $${initial.toLocaleString()} | Final Value: $${finalVal.toLocaleString()}`,
      `Holding Period: ${years} Years`,
      `Total ROI: ${result.totalRoiPercent}%`,
      `Net Profit/Loss: ${result.isProfit ? "+" : ""}$${result.netProfit.toLocaleString()}`,
      `Annualized ROI (CAGR): ${result.annualizedRoiPercent}% per year`,
      `Investment Multiplier: ${result.multiplier}x`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Presets Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setInitial(p.initial);
                setFinalVal(p.final);
                setYears(p.years);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setInitial(10000);
            setFinalVal(14500);
            setYears(3);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-red-600 rounded-lg border border-slate-200 hover:border-red-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Investment Values
          </h2>

          {/* Initial Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Capital Invested ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="1"
                step="500"
                value={initial}
                onChange={(e) => setInitial(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Final Value */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Final Returned Value ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={finalVal}
                onChange={(e) => setFinalVal(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Investment Duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Holding Period (Years)
              </label>
              <span className="text-xs font-bold text-blue-600 font-mono">{years} Years</span>
            </div>
            <input
              type="number"
              min="0.1"
              max="50"
              step="0.5"
              value={years}
              onChange={(e) => setYears(Math.max(0.1, Number(e.target.value)))}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              onClick={handleCopy}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Summary!" : "Copy ROI Summary"}
            </button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Card */}
          <div
            className={`border rounded-2xl p-6 shadow-xs text-center space-y-2 ${
              result.isProfit
                ? "bg-gradient-to-br from-emerald-50 via-white to-blue-50 border-emerald-200/80"
                : "bg-gradient-to-br from-red-50 via-white to-amber-50 border-red-200/80"
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider block ${
                result.isProfit ? "text-emerald-800" : "text-red-700"
              }`}
            >
              Total Return on Investment (ROI)
            </span>
            <div
              className={`text-4xl font-black font-mono tracking-tight ${
                result.isProfit ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {result.totalRoiPercent >= 0 ? "+" : ""}
              {result.totalRoiPercent}%
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Net {result.isProfit ? "Profit" : "Loss"}:{" "}
              <strong className={result.isProfit ? "text-emerald-700" : "text-red-700"}>
                {result.netProfit >= 0 ? "+" : ""}${result.netProfit.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Annualized ROI (CAGR)</div>
              <div
                className={`text-lg font-bold mt-1 ${
                  result.annualizedRoiPercent >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {result.annualizedRoiPercent >= 0 ? "+" : ""}
                {result.annualizedRoiPercent}% / yr
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Simple Annual Return</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {result.simpleAnnualReturnPercent}% / yr
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Multiplier</div>
              <div className="text-lg font-bold text-indigo-600 mt-1">
                {result.multiplier}x
              </div>
            </div>
          </div>

          {/* Formulas Explanations Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              ROI Formulas
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Total ROI:</span>
                  <span className="text-slate-500 ml-2">Total percentage gain or loss</span>
                </div>
                <code className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  ((Final - Initial) / Initial) × 100
                </code>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">CAGR (Compound Annual):</span>
                  <span className="text-slate-500 ml-2">Compound rate per year</span>
                </div>
                <code className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  (Final / Initial)^(1 / Years) - 1
                </code>
              </div>
            </div>
          </div>

          {/* Financial Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-2 items-start text-[11px] text-amber-800 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Disclaimer:</strong> ROI calculations do not account for capital gains taxes, brokerage transaction fees, inflation erosion, or dividend reinvestment schedules.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
