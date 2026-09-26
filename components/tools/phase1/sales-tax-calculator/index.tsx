"use client";

import React, { useState, useMemo } from "react";
import { Receipt, DollarSign, Percent, ShieldAlert, ArrowRightLeft } from "lucide-react";
import { calculateSalesTax, SalesTaxResult } from "./logic";

interface CountryConfig {
  name: string;
  currency: string;
  defaultRate: number;
  rates: { label: string; rate: number }[];
}

const COUNTRIES: Record<string, CountryConfig> = {
  us: {
    name: "United States",
    currency: "$",
    defaultRate: 7.25,
    rates: [
      { label: "California (7.25%)", rate: 7.25 },
      { label: "New York (4.0%)", rate: 4.0 },
      { label: "Texas (6.25%)", rate: 6.25 },
      { label: "Florida (6.0%)", rate: 6.0 },
      { label: "Washington (6.5%)", rate: 6.5 },
    ],
  },
  uk: {
    name: "United Kingdom (VAT)",
    currency: "£",
    defaultRate: 20,
    rates: [
      { label: "Standard (20%)", rate: 20 },
      { label: "Reduced (5%)", rate: 5 },
      { label: "Zero (0%)", rate: 0 },
    ],
  },
  eu: {
    name: "European Union (VAT)",
    currency: "€",
    defaultRate: 20,
    rates: [
      { label: "Germany (19%)", rate: 19 },
      { label: "France (20%)", rate: 20 },
      { label: "Italy (22%)", rate: 22 },
      { label: "Spain (21%)", rate: 21 },
      { label: "Netherlands (21%)", rate: 21 },
    ],
  },
  in: {
    name: "India (GST)",
    currency: "₹",
    defaultRate: 18,
    rates: [
      { label: "Standard (18%)", rate: 18 },
      { label: "Services (12%)", rate: 12 },
      { label: "Essential (5%)", rate: 5 },
      { label: "Luxury (28%)", rate: 28 },
    ],
  },
  au: {
    name: "Australia (GST)",
    currency: "A$",
    defaultRate: 10,
    rates: [
      { label: "Standard GST (10%)", rate: 10 },
      { label: "GST-Free (0%)", rate: 0 },
    ],
  },
  ca: {
    name: "Canada (GST/HST)",
    currency: "CA$",
    defaultRate: 13,
    rates: [
      { label: "Ontario HST (13%)", rate: 13 },
      { label: "BC GST+PST (12%)", rate: 12 },
      { label: "Federal GST (5%)", rate: 5 },
      { label: "Atlantic HST (15%)", rate: 15 },
    ],
  },
};

export default function SalesTaxCalculatorTool() {
  const [countryKey, setCountryKey] = useState<string>("us");
  const [calculationType, setCalculationType] = useState<"add-tax" | "reverse-tax">("add-tax");
  const [amount, setAmount] = useState<number>(100);
  const [taxRate, setTaxRate] = useState<number>(7.25);

  const country = COUNTRIES[countryKey] || COUNTRIES.us!;
  const symbol = country.currency;

  const result: SalesTaxResult = useMemo(() => {
    return calculateSalesTax({
      amount: Number(amount) || 0,
      rate: Number(taxRate) || 0,
      calculationType,
    });
  }, [amount, taxRate, calculationType]);

  const handleCountryChange = (cKey: string) => {
    setCountryKey(cKey);
    const targetCountry = COUNTRIES[cKey];
    if (targetCountry) {
      setTaxRate(targetCountry.defaultRate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Country Selector Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Jurisdiction / Country Preset:
          </label>
          <div className="flex flex-wrap gap-1">
            {Object.entries(COUNTRIES).map(([k, c]) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCountryChange(k)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  countryKey === k
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Preset rate chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Standard Rates:</span>
          {country.rates.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setTaxRate(r.rate)}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                taxRate === r.rate
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-5">
          {/* Calculation Type Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-teal-600" />
              Calculation Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setCalculationType("add-tax")}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                  calculationType === "add-tax"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Add Tax (Tax Exclusive)
              </button>
              <button
                type="button"
                onClick={() => setCalculationType("reverse-tax")}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                  calculationType === "reverse-tax"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Extract Tax (Tax Inclusive)
              </button>
            </div>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {calculationType === "add-tax"
                ? "Net Price (Pre-Tax Amount)"
                : "Gross Price (Total with Tax)"}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold">
                {symbol}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="100.00"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Tax Rate Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Tax Rate Percentage (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxRate || ""}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="7.25"
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-base outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute right-3.5 top-3 text-slate-400 font-semibold">%</span>
            </div>
          </div>
        </div>

        {/* Right: Results Card & Receipt */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-200 dark:border-teal-900/60 rounded-2xl shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Tax Calculation Summary
            </span>

            <div>
              <div className="text-xs text-slate-500 font-medium">Final Gross Total</div>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                {symbol}{result.grossAmount.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">
                  Net (Pre-Tax)
                </div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  {symbol}{result.netAmount.toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium uppercase tracking-wide">
                  Tax Component ({result.taxRate}%)
                </div>
                <div className="text-base font-bold text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                  +{symbol}{result.taxAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Legal / Tax Notice */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3 text-xs text-slate-500 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-700 dark:text-slate-300 font-semibold block mb-0.5">
                Tax Disclaimer
              </strong>
              Sales tax rates and exemptions vary by local municipality, county, state, and merchandise classification. This calculator is provided for estimation purposes only. Consult a certified tax advisor for official filings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
