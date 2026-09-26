"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, Percent, Tag, Plus, Receipt, ShieldCheck } from "lucide-react";
import { calculateDiscount, DiscountResult } from "./logic";

const COMMON_DISCOUNTS = [10, 15, 20, 25, 30, 40, 50, 70];

export default function DiscountCalculatorTool() {
  const [originalPrice, setOriginalPrice] = useState<number>(120);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(25);

  const [hasExtraDiscount, setHasExtraDiscount] = useState<boolean>(false);
  const [extraDiscountType, setExtraDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [extraDiscountValue, setExtraDiscountValue] = useState<number>(10);

  const [hasTax, setHasTax] = useState<boolean>(true);
  const [taxRate, setTaxRate] = useState<number>(8.25);

  const result: DiscountResult = useMemo(() => {
    return calculateDiscount({
      originalPrice: Number(originalPrice) || 0,
      discountType,
      discountValue: Number(discountValue) || 0,
      extraDiscountType: hasExtraDiscount ? extraDiscountType : undefined,
      extraDiscountValue: hasExtraDiscount ? Number(extraDiscountValue) || 0 : 0,
      taxRate: hasTax ? Number(taxRate) || 0 : 0,
    });
  }, [
    originalPrice,
    discountType,
    discountValue,
    hasExtraDiscount,
    extraDiscountType,
    extraDiscountValue,
    hasTax,
    taxRate,
  ]);

  const paidRatio =
    result.originalPrice > 0
      ? Math.min(100, Math.max(0, (result.subtotal / result.originalPrice) * 100))
      : 100;
  const savedRatio = 100 - paidRatio;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Inputs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Original Price */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-2">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" />
              Original Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={originalPrice || ""}
                onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                placeholder="100.00"
                className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-base outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Primary Discount */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-600" />
                Primary Discount
              </label>
              <div className="flex rounded-md p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setDiscountType("percentage")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    discountType === "percentage"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  % Off
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    discountType === "fixed"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  $ Off
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                step={discountType === "percentage" ? "1" : "0.01"}
                value={discountValue || ""}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="20"
                className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-base outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 font-medium">
                {discountType === "percentage" ? "%" : "$"}
              </span>
            </div>

            {/* Quick Percentage Chips */}
            {discountType === "percentage" && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_DISCOUNTS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiscountValue(d)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                      discountValue === d
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {d}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stacked Extra Discount Toggle */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-600" />
                Additional / Stacked Discount
              </label>
              <input
                type="checkbox"
                checked={hasExtraDiscount}
                onChange={(e) => setHasExtraDiscount(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>

            {hasExtraDiscount && (
              <div className="pt-2 space-y-3">
                <div className="flex gap-2">
                  <div className="flex rounded-md p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setExtraDiscountType("percentage")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        extraDiscountType === "percentage"
                          ? "bg-teal-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      % Off
                    </button>
                    <button
                      type="button"
                      onClick={() => setExtraDiscountType("fixed")}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        extraDiscountType === "fixed"
                          ? "bg-teal-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      $ Off
                    </button>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      value={extraDiscountValue || ""}
                      onChange={(e) => setExtraDiscountValue(parseFloat(e.target.value) || 0)}
                      placeholder="10"
                      className="w-full pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 text-xs font-medium">
                      {extraDiscountType === "percentage" ? "%" : "$"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sales Tax */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                Include Estimated Sales Tax
              </label>
              <input
                type="checkbox"
                checked={hasTax}
                onChange={(e) => setHasTax(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </div>

            {hasTax && (
              <div className="relative pt-1">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxRate || ""}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="8.25"
                  className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3.5 top-3.5 text-slate-400 font-medium">%</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Calculations & Receipt */}
        <div className="lg:col-span-5 space-y-5">
          {/* Final Price Card */}
          <div className="p-6 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-200 dark:border-teal-900/60 rounded-2xl shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Final Out-of-Pocket Price
            </span>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono">
                ${result.finalPrice.toFixed(2)}
              </div>
              {result.totalDiscountAmount > 0 && (
                <div className="text-sm line-through text-slate-400 font-mono">
                  ${result.originalPrice.toFixed(2)}
                </div>
              )}
            </div>

            {/* Savings Pill */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                You save ${result.totalDiscountAmount.toFixed(2)} ({result.effectiveDiscountPercentage}% off)
              </span>
            </div>

            {/* Visual ratio bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>You Pay: {paidRatio.toFixed(0)}%</span>
                <span>You Save: {savedRatio.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${paidRatio}%` }}
                  className="bg-teal-600 transition-all duration-300"
                />
                <div
                  style={{ width: `${savedRatio}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Line-Item Breakdown */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3 font-mono text-xs">
            <div className="font-sans font-semibold text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
              Receipt Breakdown
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Original Retail:</span>
              <span>${result.originalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Primary Discount:</span>
              <span>-${result.firstDiscountAmount.toFixed(2)}</span>
            </div>
            {hasExtraDiscount && result.extraDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Extra Discount:</span>
                <span>-${result.extraDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Subtotal:</span>
              <span>${result.subtotal.toFixed(2)}</span>
            </div>
            {hasTax && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Sales Tax ({taxRate}%):</span>
                <span>+${result.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Final Total:</span>
              <span>${result.finalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Legal / Tax Disclaimer */}
          <p className="text-[11px] text-slate-400 leading-relaxed">
            * Disclaimer: Sales tax calculations are estimations based on user-provided rates. Actual checkout taxes and store promotions may vary by jurisdiction and store terms.
          </p>
        </div>
      </div>
    </div>
  );
}
