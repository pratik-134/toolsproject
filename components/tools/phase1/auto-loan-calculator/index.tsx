"use client";

import React, { useState, useMemo } from "react";
import { Car, DollarSign, Calendar, Percent, ShieldAlert, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateAutoLoan, AutoLoanResult } from "./logic";

const LOAN_TERMS = [
  { months: 24, label: "24 mo (2 yr)" },
  { months: 36, label: "36 mo (3 yr)" },
  { months: 48, label: "48 mo (4 yr)" },
  { months: 60, label: "60 mo (5 yr)" },
  { months: 72, label: "72 mo (6 yr)" },
  { months: 84, label: "84 mo (7 yr)" },
];

export default function AutoLoanCalculatorTool() {
  const [vehiclePrice, setVehiclePrice] = useState<number>(32000);
  const [downPayment, setDownPayment] = useState<number>(4000);
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [amountOwed, setAmountOwed] = useState<number>(0);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(6.5);
  const [fees, setFees] = useState<number>(500);
  const [interestRate, setInterestRate] = useState<number>(5.9);
  const [loanTerm, setLoanTerm] = useState<number>(60);

  const result: AutoLoanResult = useMemo(() => {
    return calculateAutoLoan({
      vehiclePrice: Number(vehiclePrice) || 0,
      downPayment: Number(downPayment) || 0,
      tradeInValue: Number(tradeInValue) || 0,
      amountOwedOnTradeIn: Number(amountOwed) || 0,
      salesTaxRate: Number(salesTaxRate) || 0,
      fees: Number(fees) || 0,
      interestRateAnnual: Number(interestRate) || 0,
      loanTermMonths: loanTerm,
    });
  }, [
    vehiclePrice,
    downPayment,
    tradeInValue,
    amountOwed,
    salesTaxRate,
    fees,
    interestRate,
    loanTerm,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Car className="w-4 h-4 text-teal-600" /> Vehicle Purchase Details
          </h3>

          {/* Vehicle Price & Down Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Vehicle Price ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={vehiclePrice || ""}
                  onChange={(e) => setVehiclePrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cash Down Payment ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={downPayment || ""}
                  onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Trade-in Value & Amount Owed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Trade-in Allowance ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={tradeInValue || ""}
                  onChange={(e) => setTradeInValue(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Amount Owed on Trade-in ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={amountOwed || ""}
                  onChange={(e) => setAmountOwed(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* APR & Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Interest Rate (APR %)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={interestRate || ""}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 font-medium">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Loan Term
              </label>
              <Select
                value={String(loanTerm)}
                onValueChange={(val) => setLoanTerm(parseInt(val, 10) || 60)}
              >
                <SelectTrigger className="w-full text-sm bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Loan Term" />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TERMS.map((t) => (
                    <SelectItem key={t.months} value={String(t.months)}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tax & Fees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Sales Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={salesTaxRate || ""}
                onChange={(e) => setSalesTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Documentation / Registration Fees ($)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={fees || ""}
                onChange={(e) => setFees(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Payment Card & Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-200 dark:border-teal-900/60 rounded-2xl shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Estimated Monthly Payment
            </span>

            <div className="flex items-baseline gap-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono">
                ${result.monthlyPayment.toFixed(2)}
              </div>
              <span className="text-sm font-medium text-slate-500">/ month</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Total Financed</div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  ${result.totalFinanced.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Total Interest</div>
                <div className="text-base font-bold text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                  ${result.totalInterest.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Cost Breakdown */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-2.5 font-mono text-xs">
            <div className="font-sans font-semibold text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
              Loan & Purchase Summary
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Vehicle Base Price:</span>
              <span>${vehiclePrice.toLocaleString()}</span>
            </div>
            {result.salesTaxAmount > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Sales Tax ({salesTaxRate}%):</span>
                <span>+${result.salesTaxAmount.toLocaleString()}</span>
              </div>
            )}
            {fees > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Dealer / Registration Fees:</span>
                <span>+${fees.toLocaleString()}</span>
              </div>
            )}
            {downPayment > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Down Payment Applied:</span>
                <span>-${downPayment.toLocaleString()}</span>
              </div>
            )}
            {result.netTradeIn > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Net Trade-in Equity:</span>
                <span>-${result.netTradeIn.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Total Cost (with interest):</span>
              <span>${result.totalCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Financial Disclaimer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3 text-xs text-slate-500 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-700 dark:text-slate-300 font-semibold block mb-0.5">
                Financial Disclaimer
              </strong>
              Actual loan terms, interest rates, and dealership fees are determined by individual lending institutions and credit scores. This calculator provides estimates for informational budgeting only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
