"use client";

import React, { useState, useMemo } from "react";
import { calculateSip, SipResult } from "./logic";
import { Copy, Check, Download, TrendingUp, DollarSign, Calendar, Percent, AlertCircle } from "lucide-react";

const PRESETS = [
  { name: "Balanced Wealth", monthly: 500, returnRate: 12, years: 15, stepUp: 0 },
  { name: "Aggressive Equity", monthly: 1000, returnRate: 14, years: 20, stepUp: 5 },
  { name: "Conservative Mutual Fund", monthly: 300, returnRate: 8, years: 10, stepUp: 0 },
  { name: "Step-Up Compounding (10%)", monthly: 500, returnRate: 12, years: 15, stepUp: 10 },
];

export default function SipCalculatorTool() {
  const [monthly, setMonthly] = useState<number>(500);
  const [returnRate, setReturnRate] = useState<number>(12);
  const [years, setYears] = useState<number>(15);
  const [stepUp, setStepUp] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo<SipResult>(() => {
    return calculateSip({
      monthlyInvestment: monthly,
      expectedAnnualReturn: returnRate,
      investmentYears: years,
      annualStepUpPercent: stepUp,
    });
  }, [monthly, returnRate, years, stepUp]);

  const gainPercent =
    result.maturityValue > 0
      ? Math.round((result.estimatedReturns / result.maturityValue) * 100)
      : 0;

  const handleCopy = () => {
    const text = [
      "SIP Investment Summary",
      `Monthly Deposit: $${monthly.toLocaleString()}${stepUp > 0 ? ` (+${stepUp}% annual step-up)` : ""}`,
      `Expected Return: ${returnRate}% p.a. | Duration: ${years} Years`,
      `Total Amount Invested: $${result.totalInvested.toLocaleString()}`,
      `Estimated Wealth Gain: $${result.estimatedReturns.toLocaleString()}`,
      `Expected Maturity Value: $${result.maturityValue.toLocaleString()}`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      "Year,Total Invested,Estimated Returns,Maturity Balance",
      ...result.yearlyBreakdown.map(
        (y) => `${y.year},${y.invested},${y.returns},${y.balance}`
      ),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sip_growth_schedule.csv";
    link.click();
    URL.revokeObjectURL(url);
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
                setMonthly(p.monthly);
                setReturnRate(p.returnRate);
                setYears(p.years);
                setStepUp(p.stepUp);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            SIP Investment Parameters
          </h2>

          {/* Monthly Investment */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Monthly Contribution ($)</label>
              <span className="text-xs font-bold text-blue-600 font-mono">
                ${monthly.toLocaleString()}
              </span>
            </div>
            <input
              type="number"
              min="10"
              step="50"
              value={monthly}
              onChange={(e) => setMonthly(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Expected Return Rate */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Expected Annual Return (%)
              </label>
              <span className="text-xs font-bold text-emerald-600 font-mono">{returnRate}%</span>
            </div>
            <input
              type="number"
              min="1"
              max="35"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Duration in Years */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Time Horizon (Years)</label>
              <span className="text-xs font-bold text-indigo-600 font-mono">{years} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Step-up SIP (%) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Annual Step-Up Increase (%)
              </label>
              <span className="text-xs font-bold text-slate-600 font-mono">+{stepUp}% / yr</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={stepUp}
              onChange={(e) => setStepUp(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Increase your SIP contribution automatically each year as income grows.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Summary!" : "Copy Summary"}
            </button>
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              CSV
            </button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Estimated Total Maturity Value
            </span>
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              ${result.maturityValue.toLocaleString()}
            </div>

            {/* Growth Ratio Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-blue-700">
                  Invested: ${result.totalInvested.toLocaleString()} ({100 - gainPercent}%)
                </span>
                <span className="text-emerald-700">
                  Returns: ${result.estimatedReturns.toLocaleString()} ({gainPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${100 - gainPercent}%` }}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${gainPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cards Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Total Amount Invested</div>
              <div className="text-xl font-bold text-blue-600 mt-1">
                ${result.totalInvested.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Estimated Wealth Gain</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                +${result.estimatedReturns.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Year-by-Year Growth Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Annual Growth Projection
            </h3>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-4 py-2 font-bold text-slate-400 uppercase text-[10px] sticky top-0 bg-white">
                <div>Year</div>
                <div>Invested</div>
                <div>Returns</div>
                <div className="text-right">Balance</div>
              </div>
              {result.yearlyBreakdown.map((row) => (
                <div key={row.year} className="grid grid-cols-4 py-2 text-slate-700">
                  <div className="font-semibold text-slate-900">Year {row.year}</div>
                  <div className="text-slate-600">${row.invested.toLocaleString()}</div>
                  <div className="text-emerald-600 font-medium">+${row.returns.toLocaleString()}</div>
                  <div className="text-right font-bold text-slate-900">
                    ${row.balance.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-2 items-start text-[11px] text-amber-800 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Disclaimer:</strong> Mutual fund investments are subject to market risks. Past returns do not guarantee future performance. Projections are illustrative.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
