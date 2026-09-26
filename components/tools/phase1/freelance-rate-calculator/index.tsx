"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, Briefcase, Clock, Calendar, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { calculateFreelanceRate, FreelanceRateResult } from "./logic";

export default function FreelanceRateCalculatorTool() {
  const [targetNetIncome, setTargetNetIncome] = useState<number>(85000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(8000);
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(25);
  const [vacationWeeks, setVacationWeeks] = useState<number>(4);
  const [taxRate, setTaxRate] = useState<number>(28);
  const [profitMargin, setProfitMargin] = useState<number>(10);

  const result: FreelanceRateResult = useMemo(() => {
    return calculateFreelanceRate({
      targetNetIncome: Number(targetNetIncome) || 0,
      annualExpenses: Number(annualExpenses) || 0,
      billableHoursPerWeek: Number(billableHoursPerWeek) || 1,
      vacationWeeksPerYear: Number(vacationWeeks) || 0,
      taxRatePercent: Number(taxRate) || 0,
      profitMarginPercent: Number(profitMargin) || 0,
    });
  }, [
    targetNetIncome,
    annualExpenses,
    billableHoursPerWeek,
    vacationWeeks,
    taxRate,
    profitMargin,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Parameters */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-teal-600" /> Income & Workload Parameters
          </h3>

          {/* Target Take-Home Net Income */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                Target Annual Take-Home Income (After Tax)
              </label>
              <span className="font-mono text-teal-600 font-bold">${targetNetIncome.toLocaleString()}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium">$</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={targetNetIncome || ""}
                onChange={(e) => setTargetNetIncome(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Annual Business Expenses */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                Annual Business Expenses (Hardware, SaaS, Insurance, Desk)
              </label>
              <span className="font-mono text-slate-600 font-semibold">${annualExpenses.toLocaleString()}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium">$</span>
              <input
                type="number"
                min="0"
                step="500"
                value={annualExpenses || ""}
                onChange={(e) => setAnnualExpenses(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Billable Hours / Week */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Billable Hours / Week
                </label>
                <span className="font-mono text-teal-600 font-semibold">{billableHoursPerWeek} hrs</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="1"
                value={billableHoursPerWeek}
                onChange={(e) => setBillableHoursPerWeek(parseInt(e.target.value) || 20)}
                className="w-full accent-teal-600"
              />
              <p className="text-[11px] text-slate-400">
                Note: Non-billable admin, marketing, and invoices typically take 10-15 hrs/wk.
              </p>
            </div>

            {/* Vacation & Sick Weeks */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Vacation & Off Weeks / Year
                </label>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{vacationWeeks} weeks</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={vacationWeeks}
                onChange={(e) => setVacationWeeks(parseInt(e.target.value) || 0)}
                className="w-full accent-teal-600"
              />
              <p className="text-[11px] text-slate-400">
                Leaves {result.billableWeeksPerYear} working weeks ({result.annualBillableHours} billable hours/yr).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Tax Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Estimated Tax Rate
                </label>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{taxRate}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseInt(e.target.value) || 20)}
                className="w-full accent-teal-600"
              />
            </div>

            {/* Profit Margin Buffer */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Business Profit / Growth Buffer
                </label>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{profitMargin}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={profitMargin}
                onChange={(e) => setProfitMargin(parseInt(e.target.value) || 0)}
                className="w-full accent-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Right: Recommended Rate Output */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hero Rate Cards */}
          <div className="p-6 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-200 dark:border-teal-900/60 rounded-2xl shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Recommended Minimum Rates
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 font-medium">Hourly Rate</div>
                <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                  ${result.hourlyRate}
                  <span className="text-sm font-normal text-slate-400 font-sans">/hr</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 font-medium">Day Rate (8h)</div>
                <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono mt-1">
                  ${result.dayRate}
                  <span className="text-sm font-normal text-slate-400 font-sans">/day</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
              <div>
                <div className="text-[11px] text-slate-400">Weekly Target</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  ${result.weeklyTarget.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Monthly Target</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  ${result.monthlyTarget.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Gross Annual</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  ${result.annualGrossRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Allocation Breakdown */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3 font-mono text-xs">
            <div className="font-sans font-semibold text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
              Gross Revenue Allocation
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Take-Home Pay (Net):</span>
              <span>${targetNetIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Taxes & Self-Employment:</span>
              <span>${result.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Business Operating Expenses:</span>
              <span>${annualExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-purple-600 dark:text-purple-400">
              <span>Profit Reserve & Buffer:</span>
              <span>${result.profitReserveAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Financial Disclaimer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3 text-xs text-slate-500 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-700 dark:text-slate-300 font-semibold block mb-0.5">
                Financial Guidance Disclaimer
              </strong>
              This tool provides suggested baseline rates based on input assumptions. Client market rates, geographic location, and tax obligations vary. Always budget for downtime and consult an accountant for personalized financial plans.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
