"use client";

import React, { useState, useId } from "react";
import { DollarSign, TrendingUp, AlertCircle, Calendar, ArrowRight } from "lucide-react";
import { calculateInflation } from "./logic";

const RATE_PRESETS = [
  { label: "Fed Target (2.0%)", rate: 2.0 },
  { label: "US Avg (3.2%)", rate: 3.2 },
  { label: "Moderate (4.5%)", rate: 4.5 },
  { label: "Elevated (7.0%)", rate: 7.0 },
];

export default function InflationCalculator() {
  const amountInputId = useId();
  const rateInputId = useId();
  const yearsInputId = useId();
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [annualRate, setAnnualRate] = useState<number>(3.2);
  const [years, setYears] = useState<number>(10);

  let result = null;
  let errorMsg = null;
  try {
    result = calculateInflation({
      initialAmount,
      annualRate,
      years,
    });
  } catch (err: any) {
    errorMsg = err.message;
  }

  return (
    <div className="space-y-6">
      {/* Input Parameters Panel */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Initial Amount */}
          <div>
            <label htmlFor={amountInputId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Initial Amount ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">$</span>
              <input
                id={amountInputId}
                type="number"
                min={0}
                max={100000000}
                value={initialAmount}
                onChange={(e) => setInitialAmount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
          </div>

          {/* Annual Inflation Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor={rateInputId} className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Annual Inflation Rate (%)
              </label>
            </div>
            <input
              id={rateInputId}
              type="number"
              step={0.1}
              min={-5}
              max={50}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {RATE_PRESETS.map((p) => (
                <button
                  key={p.rate}
                  onClick={() => setAnnualRate(p.rate)}
                  className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                    annualRate === p.rate
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Horizon (Years) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor={yearsInputId} className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Time Horizon: {years} Years
              </label>
            </div>
            <input
              id={yearsInputId}
              type="range"
              min={1}
              max={40}
              value={years}
              onChange={(e) => setYears(Number(e.target.value) || 1)}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>1 yr</span>
              <span>10 yrs</span>
              <span>20 yrs</span>
              <span>40 yrs</span>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 text-sm border border-red-200 dark:border-red-900">
          {errorMsg}
        </div>
      )}

      {/* Primary KPI Results */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Future Cost */}
          <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50/40 to-white dark:from-slate-900 dark:to-red-950/20 shadow-sm">
            <div className="flex items-center justify-between text-red-600 dark:text-red-400">
              <span className="text-xs font-bold uppercase tracking-wider">Future Equivalent Cost</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 font-mono">
                ${result.futureEquivalentCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              In {result.years} years, you will need this much to purchase what costs <strong>${result.initialAmount.toLocaleString()}</strong> today (+{result.cumulativeInflationPercent}% total inflation).
            </p>
          </div>

          {/* Purchasing Power */}
          <div className="p-6 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/40 to-white dark:from-slate-900 dark:to-amber-950/20 shadow-sm">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">Future Purchasing Power</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                ${result.purchasingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              A fixed <strong>${result.initialAmount.toLocaleString()}</strong> stored in cash will only have the purchasing power of this amount in {result.years} years (-{result.purchasingPowerLossPercent}% loss of value).
            </p>
          </div>
        </div>
      )}

      {/* Year-by-Year Compounding Table */}
      {result && result.yearlyBreakdown.length > 0 && (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Compounding Schedule Over Time
            </h3>
            <span className="text-xs text-slate-400">{result.annualRate}% annual rate</span>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase sticky top-0">
                <tr>
                  <th className="p-2.5">Year</th>
                  <th className="p-2.5">Equivalent Cost</th>
                  <th className="p-2.5">Purchasing Power</th>
                  <th className="p-2.5 text-right">Cumulative Inflation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {result.yearlyBreakdown.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">Year {row.year}</td>
                    <td className="p-2.5 text-red-600 dark:text-red-400 font-semibold">
                      ${row.futureCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-amber-600 dark:text-amber-400">
                      ${row.purchasingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right text-slate-500">
                      +{row.cumulativeInflationPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mandatory Statutory Financial Disclaimer */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div className="leading-relaxed">
          <strong className="font-semibold block mb-0.5">Statutory Financial Disclaimer</strong>
          This calculator provides theoretical mathematical projections of compound inflation and purchasing power. It is provided for educational and illustrative purposes only and does not constitute financial, investment, or tax advice. Actual future inflation rates and real investment returns are unpredictable and subject to macroeconomic volatility.
        </div>
      </div>
    </div>
  );
}
