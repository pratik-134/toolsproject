"use client";

import React, { useState, useMemo } from "react";
import { calculateCompoundInterest, CompoundInterestInput } from "./logic";
import { TrendingUp, DollarSign, Calendar, Percent, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompoundInterestTool() {
  const [initialPrincipal, setInitialPrincipal] = useState<number>(10000);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(500);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(8);
  const [investmentYears, setInvestmentYears] = useState<number>(15);
  const [compoundFrequency, setCompoundFrequency] =
    useState<CompoundInterestInput["compoundFrequency"]>("monthly");

  const result = useMemo(() => {
    return calculateCompoundInterest({
      initialPrincipal,
      monthlyDeposit,
      annualInterestRate,
      investmentYears,
      compoundFrequency,
    });
  }, [initialPrincipal, monthlyDeposit, annualInterestRate, investmentYears, compoundFrequency]);

  const interestPercentage =
    result.endBalance > 0
      ? Math.round((result.totalInterest / result.endBalance) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form Controls */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            Investment Parameters
          </h2>

          {/* Initial Principal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Deposit / Starting Principal ($)
            </label>
            <div className="relative rounded-lg">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={initialPrincipal}
                onChange={(e) => setInitialPrincipal(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Monthly Contribution */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Regular Monthly Contribution ($)
            </label>
            <div className="relative rounded-lg">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="50"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Rate & Horizon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Annual Return (%)
              </label>
              <div className="relative rounded-lg">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={annualInterestRate}
                  onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Investment Horizon (Years)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={investmentYears}
                onChange={(e) => setInvestmentYears(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Compound Frequency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Compounding Frequency
            </label>
            <Select
              value={compoundFrequency}
              onValueChange={(val) =>
                setCompoundFrequency(
                  val as CompoundInterestInput["compoundFrequency"]
                )
              }
            >
              <SelectTrigger className="w-full text-sm font-semibold text-slate-900 bg-white border-slate-300">
                <SelectValue placeholder="Compounding Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly (Recommended / Standard)</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: Growth Summary Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-1.5 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="h-4 w-4" />
              <span>Projected Future Balance</span>
            </div>
            <div className="text-4xl sm:text-5xl font-black font-headings text-white mt-1">
              ${result.endBalance.toLocaleString()}
            </div>
          </div>

          {/* Principal vs Interest Breakdown */}
          <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Principal Invested:</span>
              <span className="font-bold text-white font-mono">
                ${result.totalContributions.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-emerald-300">Compound Interest Earned:</span>
              <span className="font-bold text-emerald-400 font-mono">
                +${result.totalInterest.toLocaleString()} ({interestPercentage}%)
              </span>
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${100 - interestPercentage}%` }}
                title="Principal"
              />
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${interestPercentage}%` }}
                title="Compound Interest"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
              <span className="text-blue-300">Principal: {100 - interestPercentage}%</span>
              <span className="text-emerald-300">Interest: {interestPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Growth Schedule Table (Top 10 years or condensed) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Annual Growth Schedule
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body divide-y divide-slate-100">
            <thead>
              <tr className="text-slate-400 font-semibold">
                <th className="py-2">Year</th>
                <th className="py-2">Total Contributed</th>
                <th className="py-2">Total Interest</th>
                <th className="py-2 text-right">End Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-mono text-slate-700">
              {result.yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/60">
                  <td className="py-2 font-bold text-slate-900">Year {row.year}</td>
                  <td className="py-2">${row.totalContributions.toLocaleString()}</td>
                  <td className="py-2 text-emerald-600">+${row.totalInterestEarned.toLocaleString()}</td>
                  <td className="py-2 text-right font-bold text-slate-900">
                    ${row.endBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer:</strong> This compound interest calculator is designed for educational estimation purposes. Market returns fluctuate and past performance does not guarantee future results. Does not account for investment fees, taxes, or inflation.
        </p>
      </div>
    </div>
  );
}
