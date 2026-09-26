"use client";

import React, { useState, useMemo } from "react";
import { calculateDebtPayoff, DebtItem, DebtPayoffComparison } from "./logic";
import { Copy, Check, Plus, Trash2, TrendingDown, DollarSign, Zap, Shield, AlertCircle } from "lucide-react";

const INITIAL_DEBTS: DebtItem[] = [
  { id: "1", name: "High-Interest Credit Card", balance: 3500, interestRate: 24.99, minPayment: 105 },
  { id: "2", name: "Store Retail Card", balance: 1200, interestRate: 29.99, minPayment: 45 },
  { id: "3", name: "Used Car Auto Loan", balance: 9500, interestRate: 7.25, minPayment: 230 },
  { id: "4", name: "Personal Loan", balance: 4000, interestRate: 11.5, minPayment: 120 },
];

export default function DebtPayoffCalculatorTool() {
  const [debts, setDebts] = useState<DebtItem[]>(INITIAL_DEBTS);
  const [extraPayment, setExtraPayment] = useState<number>(200);
  const [copied, setCopied] = useState<boolean>(false);

  const comparison = useMemo<DebtPayoffComparison>(() => {
    return calculateDebtPayoff(debts, extraPayment);
  }, [debts, extraPayment]);

  const totalDebtBalance = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.balance, 0);
  }, [debts]);

  const totalMinPayment = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.minPayment, 0);
  }, [debts]);

  const addDebt = () => {
    const newId = String(Date.now());
    setDebts((prev) => [
      ...prev,
      { id: newId, name: `Debt #${prev.length + 1}`, balance: 2000, interestRate: 18.0, minPayment: 60 },
    ]);
  };

  const removeDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDebt = (id: string, updates: Partial<DebtItem>) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const handleCopy = () => {
    const text = [
      "Debt Payoff Strategy Comparison",
      `Total Current Debt: $${totalDebtBalance.toLocaleString()} across ${debts.length} accounts`,
      `Minimum Monthly Payment: $${totalMinPayment.toLocaleString()} | Extra Monthly: $${extraPayment.toLocaleString()}`,
      "\n--- Debt Avalanche Strategy (Highest APR First) ---",
      `Debt-Free In: ${comparison.avalanche.monthsToPayoff} Months (${(comparison.avalanche.monthsToPayoff / 12).toFixed(1)} years)`,
      `Total Interest Paid: $${comparison.avalanche.totalInterestPaid.toLocaleString()}`,
      `Total Paid: $${comparison.avalanche.totalAmountPaid.toLocaleString()}`,
      "\n--- Debt Snowball Strategy (Smallest Balance First) ---",
      `Debt-Free In: ${comparison.snowball.monthsToPayoff} Months (${(comparison.snowball.monthsToPayoff / 12).toFixed(1)} years)`,
      `Total Interest Paid: $${comparison.snowball.totalInterestPaid.toLocaleString()}`,
      `Total Paid: $${comparison.snowball.totalAmountPaid.toLocaleString()}`,
      `\nAvalanche Savings: $${comparison.interestSavedByAvalanche.toLocaleString()} in interest saved!`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Combined Debt
          </h2>
          <div className="text-3xl font-black text-slate-900 mt-0.5">
            ${totalDebtBalance.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Minimum Required Monthly Payments: <strong>${totalMinPayment.toLocaleString()}</strong>
          </p>
        </div>

        {/* Extra Payment Input */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700">
              Extra Monthly Payment ($)
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="25"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
                className="w-32 pl-6 pr-2 py-1 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              />
            </div>
          </div>
          <button
            onClick={addDebt}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition self-end"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Debt
          </button>
        </div>
      </div>

      {/* Debts Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Your Debt Accounts ({debts.length})
        </h3>
        <div className="divide-y divide-slate-100">
          {debts.map((d) => (
            <div key={d.id} className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-semibold text-slate-400">Account Name</label>
                <input
                  type="text"
                  value={d.name}
                  onChange={(e) => updateDebt(d.id, { name: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-900"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-semibold text-slate-400">Balance ($)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={d.balance}
                  onChange={(e) => updateDebt(d.id, { balance: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-400">Interest (APR %)</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="0.5"
                  value={d.interestRate}
                  onChange={(e) => updateDebt(d.id, { interestRate: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-400">Min Payment ($)</label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={d.minPayment}
                  onChange={(e) => updateDebt(d.id, { minPayment: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-900"
                />
              </div>
              <div className="sm:col-span-1 text-right pt-4 sm:pt-0">
                <button
                  onClick={() => removeDebt(d.id)}
                  disabled={debts.length <= 1}
                  className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 transition"
                  title="Remove account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avalanche Method */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs space-y-4 relative">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              Debt Avalanche (Math Optimal)
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Saves Most Money
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Targets highest interest rate debts first. Mathematically minimizes the total interest you pay to lenders.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Debt-Free Time</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {comparison.avalanche.monthsToPayoff} Months
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {(comparison.avalanche.monthsToPayoff / 12).toFixed(1)} Years
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Total Interest Paid</div>
              <div className="text-xl font-black text-emerald-700 mt-1">
                ${comparison.avalanche.totalInterestPaid.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Saves ${comparison.interestSavedByAvalanche.toLocaleString()} vs Snowball
              </div>
            </div>
          </div>
        </div>

        {/* Snowball Method */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200/80 rounded-2xl p-6 shadow-xs space-y-4 relative">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-blue-600" />
              Debt Snowball (Psychological Wins)
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Fastest Early Wins
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Targets smallest balances first. Builds quick psychological momentum as individual accounts disappear.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Debt-Free Time</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {comparison.snowball.monthsToPayoff} Months
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {(comparison.snowball.monthsToPayoff / 12).toFixed(1)} Years
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Total Interest Paid</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                ${comparison.snowball.totalInterestPaid.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Total: ${comparison.snowball.totalAmountPaid.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Action & Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied Analysis!" : "Copy Payoff Comparison"}
        </button>
      </div>

      {/* Financial Disclaimer */}
      <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-2 items-start text-[11px] text-amber-800 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Statutory Disclaimer:</strong> Calculations assume fixed interest rates and consistent minimum monthly payments without new charges. Actual lender compounding and fees may vary.
        </span>
      </div>
    </div>
  );
}
