"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, PieChart, ShieldCheck, ArrowRight, Percent, Building, Wallet, Calendar } from "lucide-react";

// 2026 IRS Federal Tax Brackets for Single Filers
const FEDERAL_BRACKETS_SINGLE_2026 = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

const STANDARD_DEDUCTION_SINGLE_2026 = 15000;
const SS_WAGE_CAP_2026 = 176100;

const STATE_TAX_PRESETS: Record<string, { name: string; rate: number }> = {
  NONE: { name: "No State Tax (TX, FL, WA, NV, TN)", rate: 0.0 },
  CA: { name: "California (Avg ~8.0%)", rate: 0.08 },
  NY: { name: "New York (Avg ~6.5%)", rate: 0.065 },
  IL: { name: "Illinois (Flat 4.95%)", rate: 0.0495 },
  PA: { name: "Pennsylvania (Flat 3.07%)", rate: 0.0307 },
  MA: { name: "Massachusetts (Flat 5.0%)", rate: 0.05 },
  CUSTOM: { name: "Custom State Rate", rate: 0.05 },
};

export default function SalaryTaxCalculator() {
  const [grossSalary, setGrossSalary] = useState(120000);
  const [statePreset, setStatePreset] = useState("NONE");
  const [customStateRate, setCustomStateRate] = useState(5.0);
  const [preTax401k, setPreTax401k] = useState(6000);
  const [healthHsa, setHealthHsa] = useState(2400);

  const stateRate = statePreset === "CUSTOM" ? customStateRate / 100 : (STATE_TAX_PRESETS[statePreset]?.rate ?? 0);

  const calculation = useMemo(() => {
    const gross = Math.max(0, grossSalary);
    const preTaxTotal = Math.min(gross, preTax401k + healthHsa);

    // FICA Taxes
    const ssTaxable = Math.min(gross, SS_WAGE_CAP_2026);
    const socialSecurity = ssTaxable * 0.062;
    const medicare = gross * 0.0145 + (gross > 200000 ? (gross - 200000) * 0.009 : 0);
    const ficaTotal = socialSecurity + medicare;

    // Federal Income Tax
    const agi = Math.max(0, gross - preTaxTotal);
    const federalTaxable = Math.max(0, agi - STANDARD_DEDUCTION_SINGLE_2026);

    let federalTax = 0;
    for (const b of FEDERAL_BRACKETS_SINGLE_2026) {
      if (federalTaxable > b.min) {
        const taxableInBracket = Math.min(federalTaxable, b.max) - b.min;
        federalTax += taxableInBracket * b.rate;
      }
    }

    // State Tax Estimate
    const stateTax = Math.max(0, (gross - preTaxTotal) * stateRate);

    // Total Taxes & Net
    const totalTaxes = federalTax + ficaTotal + stateTax;
    const netAnnual = Math.max(0, gross - totalTaxes - preTaxTotal);
    const effectiveTaxRate = gross > 0 ? (totalTaxes / gross) * 100 : 0;

    return {
      gross,
      preTaxTotal,
      federalTax,
      socialSecurity,
      medicare,
      ficaTotal,
      stateTax,
      totalTaxes,
      netAnnual,
      effectiveTaxRate,
      // Frequencies
      monthlyNet: netAnnual / 12,
      biweeklyNet: netAnnual / 26,
      semiMonthlyNet: netAnnual / 24,
      weeklyNet: netAnnual / 52,
      hourlyEquivalent: gross / 2080,
    };
  }, [grossSalary, stateRate, preTax401k, healthHsa]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 font-body text-slate-900 dark:text-slate-100">
      {/* Privacy Guarantee */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          <strong>100% In-Browser Privacy:</strong> Your compensation, tax numbers, and retirement contributions are computed strictly on your device. Zero data is sent to external servers.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span>Salary & Deduction Parameters</span>
          </h2>

          {/* Gross Annual Salary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gross Annual Salary
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[60000, 95000, 120000, 160000, 220000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGrossSalary(preset)}
                  className="px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md"
                >
                  ${preset / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* State Tax Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              State Residence
            </label>
            <select
              value={statePreset}
              onChange={(e) => setStatePreset(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(STATE_TAX_PRESETS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* 401(k) Pre-Tax */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Annual 401(k) Pre-Tax Contribution (Max $23,500)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={preTax401k}
                onChange={(e) => setPreTax401k(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Health & HSA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Annual Pre-Tax Health & HSA Deductions
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={healthHsa}
                onChange={(e) => setHealthHsa(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Output: Breakdown & Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Take-Home Highlight Card */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Net Take-Home Pay (Annual)
              </span>
              <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                Effective Tax Rate: {calculation.effectiveTaxRate.toFixed(1)}%
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              {formatCurrency(calculation.netAnnual)}
              <span className="text-sm font-medium text-blue-200 ml-2">/ year</span>
            </div>

            {/* Quick Frequencies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/20 text-xs">
              <div className="bg-white/10 p-2.5 rounded-xl">
                <div className="text-blue-200 text-[10px] font-semibold uppercase">Monthly</div>
                <div className="font-bold text-sm sm:text-base">{formatCurrency(calculation.monthlyNet)}</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl">
                <div className="text-blue-200 text-[10px] font-semibold uppercase">Bi-Weekly</div>
                <div className="font-bold text-sm sm:text-base">{formatCurrency(calculation.biweeklyNet)}</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl">
                <div className="text-blue-200 text-[10px] font-semibold uppercase">Weekly</div>
                <div className="font-bold text-sm sm:text-base">{formatCurrency(calculation.weeklyNet)}</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl">
                <div className="text-blue-200 text-[10px] font-semibold uppercase">Hourly Equiv.</div>
                <div className="font-bold text-sm sm:text-base">${calculation.hourlyEquivalent.toFixed(2)}/hr</div>
              </div>
            </div>
          </div>

          {/* Tax Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Complete 2026 Tax & Deduction Breakdown
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              <div className="py-2 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Gross Salary</span>
                <span className="font-bold">{formatCurrency(calculation.gross)}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Pre-Tax Deductions (401k + Health)</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  - {formatCurrency(calculation.preTaxTotal)}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Federal Income Tax</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">
                  - {formatCurrency(calculation.federalTax)}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">FICA (Social Security 6.2% + Medicare 1.45%)</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">
                  - {formatCurrency(calculation.ficaTotal)}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">State Income Tax</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">
                  - {formatCurrency(calculation.stateTax)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-700">
                <span>Total Taxes Paid</span>
                <span className="text-rose-600 dark:text-rose-400">{formatCurrency(calculation.totalTaxes)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
