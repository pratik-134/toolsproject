"use client";

import React, { useState, useMemo } from "react";
import { calculateProfitMargin, ProfitMarginResult } from "./logic";
import { Copy, Check, RotateCcw, DollarSign, Percent, TrendingUp, BarChart2, AlertCircle } from "lucide-react";

const PRESETS = [
  { name: "Retail E-Commerce", cost: 25, price: 65, opex: 15 },
  { name: "SaaS Subscription", cost: 12, price: 99, opex: 30 },
  { name: "Restaurant Food", cost: 8.5, price: 28, opex: 12 },
  { name: "Wholesale Distribution", cost: 70, price: 95, opex: 10 },
];

export default function ProfitMarginCalculatorTool() {
  const [cost, setCost] = useState<number>(25);
  const [price, setPrice] = useState<number>(65);
  const [opex, setOpex] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo<ProfitMarginResult>(() => {
    return calculateProfitMargin({
      cost,
      revenue: price,
      operatingExpenses: opex,
    });
  }, [cost, price, opex]);

  const handleCopy = () => {
    const text = [
      "Profit Margin & Markup Analysis",
      `Cost of Goods (COGS): $${cost}`,
      `Selling Price (Revenue): $${price}`,
      `Operating Expenses: $${opex}`,
      `Gross Profit: $${result.grossProfit} (${result.grossMarginPercent}% Gross Margin)`,
      `Markup: ${result.markupPercent}%`,
      `Net Profit: $${result.netProfit} (${result.netMarginPercent}% Net Margin)`,
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
                setCost(p.cost);
                setPrice(p.price);
                setOpex(p.opex);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setCost(25);
            setPrice(65);
            setOpex(15);
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
            Pricing & Cost Values
          </h2>

          {/* Cost of Goods */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cost of Goods Sold (COGS) ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={cost}
                onChange={(e) => setCost(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Direct production or purchase cost per unit.</p>
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selling Price / Revenue ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Operating Expenses */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operating Expenses per Unit ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={opex}
                onChange={(e) => setOpex(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Marketing, shipping, platform fees, and overhead.</p>
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              onClick={handleCopy}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Summary!" : "Copy Margin Breakdown"}
            </button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs text-center space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Gross Profit Margin
            </span>
            <div className="text-5xl font-black text-slate-900 font-mono tracking-tight">
              {result.grossMarginPercent}%
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Gross Profit: <strong className="text-emerald-700 font-bold">${result.grossProfit}</strong> per unit sold
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Markup Rate</div>
              <div className="text-xl font-black text-blue-600 mt-1">
                {result.markupPercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Profit / Cost</div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Net Profit</div>
              <div className="text-xl font-black text-emerald-700 mt-1">
                ${result.netProfit}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">After OpEx</div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Net Margin</div>
              <div className="text-xl font-black text-indigo-600 mt-1">
                {result.netMarginPercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Bottom line</div>
            </div>
          </div>

          {/* Revenue Breakdown Waterfall */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Revenue Split per Dollar
            </h3>

            {price > 0 && (
              <div className="space-y-2">
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100">
                  <div
                    className="bg-amber-400"
                    style={{ width: `${Math.min(100, (cost / price) * 100)}%` }}
                    title={`COGS: $${cost}`}
                  />
                  <div
                    className="bg-blue-400"
                    style={{ width: `${Math.min(100, (opex / price) * 100)}%` }}
                    title={`OpEx: $${opex}`}
                  />
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${Math.max(0, (result.netProfit / price) * 100)}%` }}
                    title={`Net Profit: $${result.netProfit}`}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-semibold pt-1">
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> COGS (${cost})
                  </span>
                  <span className="flex items-center gap-1 text-blue-700">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> OpEx (${opex})
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Net Profit (${result.netProfit})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Margin vs Markup Explanation Card */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800">Margin vs. Markup Explained:</div>
            <div>
              • <strong>Margin:</strong> Profit divided by selling price ({result.grossMarginPercent}% of your revenue is profit).
            </div>
            <div>
              • <strong>Markup:</strong> Profit divided by cost (you marked up cost by {result.markupPercent}% to get selling price).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
