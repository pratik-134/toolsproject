"use client";

import React, { useState, useMemo } from "react";
import { calculateMortgage } from "./logic";
import { DollarSign, Percent, Calendar, AlertCircle } from "lucide-react";

export default function MortgageCalculatorTool() {
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPayment, setDownPayment] = useState<number>(80000);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [interestRateAnnual, setInterestRateAnnual] = useState<number>(6.5);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState<number>(4800);
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState<number>(1200);
  const [hoaMonthly, setHoaMonthly] = useState<number>(0);

  const downPaymentPercent = homePrice > 0 ? Math.round((downPayment / homePrice) * 100) : 0;

  const result = useMemo(() => {
    return calculateMortgage({
      homePrice,
      downPayment,
      loanTermYears,
      interestRateAnnual,
      propertyTaxAnnual,
      homeInsuranceAnnual,
      hoaMonthly,
    });
  }, [
    homePrice,
    downPayment,
    loanTermYears,
    interestRateAnnual,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaMonthly,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form Controls */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            Loan & Property Details
          </h2>

          {/* Home Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Home Purchase Price
            </label>
            <div className="relative rounded-lg">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="5000"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Down Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Down Payment ($)
              </label>
              <div className="relative rounded-lg">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Down Payment (%)
              </label>
              <div className="relative rounded-lg">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={downPaymentPercent}
                  onChange={(e) => {
                    const pct = Number(e.target.value);
                    setDownPayment(Math.round((pct / 100) * homePrice));
                  }}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Loan Term & Interest Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loan Term
              </label>
              <select
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 bg-white"
              >
                <option value={30}>30 Years (Fixed)</option>
                <option value={20}>20 Years (Fixed)</option>
                <option value={15}>15 Years (Fixed)</option>
                <option value={10}>10 Years (Fixed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Interest Rate
              </label>
              <div className="relative rounded-lg">
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.1"
                  value={interestRateAnnual}
                  onChange={(e) => setInterestRateAnnual(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Optional Taxes & HOA */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Taxes & Fees (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Property Tax ($/yr)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={propertyTaxAnnual}
                  onChange={(e) => setPropertyTaxAnnual(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Home Insurance ($/yr)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={homeInsuranceAnnual}
                  onChange={(e) => setHomeInsuranceAnnual(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  HOA Fee ($/mo)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={hoaMonthly}
                  onChange={(e) => setHoaMonthly(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Breakdown Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
              Estimated Monthly Payment
            </span>
            <div className="text-4xl sm:text-5xl font-black font-headings text-white mt-1">
              ${result.totalMonthlyPayment.toLocaleString()}
              <span className="text-xs font-normal text-slate-300">/mo</span>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Principal & Interest:</span>
              <span className="font-bold text-white font-mono">
                ${result.monthlyPrincipalAndInterest.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Property Taxes:</span>
              <span className="font-bold text-white font-mono">
                ${result.monthlyPropertyTax.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Homeowners Insurance:</span>
              <span className="font-bold text-white font-mono">
                ${result.monthlyInsurance.toLocaleString()}
              </span>
            </div>

            {result.monthlyHoa > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">HOA Fee:</span>
                <span className="font-bold text-white font-mono">
                  ${result.monthlyHoa.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Overall Loan Totals */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-blue-200">Total Loan Amount:</span>
              <span className="font-bold text-white font-mono">
                ${result.loanAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200">Total Interest Paid:</span>
              <span className="font-bold text-emerald-400 font-mono">
                ${result.totalInterestPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200">Total Cost of Loan:</span>
              <span className="font-bold text-white font-mono">
                ${result.totalLoanCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Financial Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer:</strong> This mortgage calculator is provided for informational and estimation purposes only. It does not constitute official financial advice, a loan estimate, or a commitment to lend. Final interest rates and fees vary based on credit history and lender guidelines.
        </p>
      </div>
    </div>
  );
}
