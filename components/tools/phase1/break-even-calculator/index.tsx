"use client";

import React, { useState, useMemo } from "react";
import { calculateBreakEven, BreakEvenResult } from "./logic";
import { Copy, Check, RotateCcw, Target, DollarSign, Package, Percent, AlertCircle } from "lucide-react";

const PRESETS = [
  { name: "Coffee Shop / Cafe", fixed: 7500, variable: 1.25, price: 4.75, target: 4000 },
  { name: "Physical Product Brand", fixed: 6000, variable: 18.0, price: 55.0, target: 8000 },
  { name: "B2B SaaS / Software", fixed: 20000, variable: 8.0, price: 99.0, target: 15000 },
  { name: "Consulting / Service", fixed: 4500, variable: 15.0, price: 120.0, target: 6000 },
];

export default function BreakEvenCalculatorTool() {
  const [fixedCosts, setFixedCosts] = useState<number>(7500);
  const [variableCost, setVariableCost] = useState<number>(1.25);
  const [price, setPrice] = useState<number>(4.75);
  const [targetProfit, setTargetProfit] = useState<number>(4000);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo<BreakEvenResult>(() => {
    return calculateBreakEven({
      fixedCosts,
      variableCostPerUnit: variableCost,
      pricePerUnit: price,
      targetProfit,
    });
  }, [fixedCosts, variableCost, price, targetProfit]);

  const handleCopy = () => {
    if (!result.isValid) return;
    const text = [
      "Break-Even Analysis",
      `Fixed Costs: $${fixedCosts.toLocaleString()}`,
      `Variable Cost / Unit: $${variableCost} | Price / Unit: $${price}`,
      `Contribution Margin: $${result.contributionMargin} (${result.contributionMarginRatio}%)`,
      `Break-Even Point: ${result.breakEvenUnits.toLocaleString()} units ($${result.breakEvenRevenue.toLocaleString()} revenue)`,
      result.targetProfitUnits
        ? `Target Profit ($${targetProfit.toLocaleString()}): Requires ${result.targetProfitUnits.toLocaleString()} units ($${result.targetProfitRevenue?.toLocaleString()} revenue)`
        : "",
    ].filter(Boolean).join("\n");

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
                setFixedCosts(p.fixed);
                setVariableCost(p.variable);
                setPrice(p.price);
                setTargetProfit(p.target);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setFixedCosts(7500);
            setVariableCost(1.25);
            setPrice(4.75);
            setTargetProfit(4000);
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
            <Target className="w-4 h-4 text-blue-600" />
            Cost & Revenue Inputs
          </h2>

          {/* Fixed Costs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Fixed Overhead Costs ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Rent, payroll, insurance, hosting, software subscriptions.</p>
          </div>

          {/* Variable Cost */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Variable Cost per Unit ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={variableCost}
                onChange={(e) => setVariableCost(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Raw materials, shipping packaging, card processing fees.</p>
          </div>

          {/* Price Per Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selling Price per Unit ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Target Profit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Monthly Profit Goal ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={targetProfit}
                onChange={(e) => setTargetProfit(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              onClick={handleCopy}
              disabled={!result.isValid}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Summary!" : "Copy Break-Even Analysis"}
            </button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-4">
          {result.isValid ? (
            <>
              {/* Main Break-Even Hero */}
              <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200/80 rounded-2xl p-6 shadow-xs text-center space-y-2">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  Required Break-Even Point
                </span>
                <div className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                  {result.breakEvenUnits.toLocaleString()}{" "}
                  <span className="text-xl font-normal text-slate-500">Units</span>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Equivalent Sales Revenue:{" "}
                  <strong className="text-blue-700 font-bold text-base">
                    ${result.breakEvenRevenue.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Unit Contribution Margin</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    ${result.contributionMargin}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Price - Variable Cost</div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Contribution Margin Ratio</div>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    {result.contributionMarginRatio}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Margin / Selling Price</div>
                </div>
              </div>

              {/* Target Profit Milestone Card */}
              {result.targetProfitUnits && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Target Profit Milestone (+${targetProfit.toLocaleString()})
                    </h3>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Profit Goal
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    To cover fixed overhead (${fixedCosts.toLocaleString()}) and pocket{" "}
                    <strong>${targetProfit.toLocaleString()}</strong> in net profit, you must sell:
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
                    <div>
                      <span className="text-xs text-slate-500">Volume Goal:</span>
                      <strong className="block text-slate-900 text-base">
                        {result.targetProfitUnits.toLocaleString()} units
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Revenue Goal:</span>
                      <strong className="block text-blue-700 text-base">
                        ${result.targetProfitRevenue?.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-xs flex gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Calculation Error:</strong>
                <p className="mt-1 text-xs">{result.errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
