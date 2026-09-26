"use client";

import React, { useState, useMemo } from "react";
import { calculateRetirement401k, Retirement401kResult } from "./logic";
import { Copy, Check, Download, TrendingUp, DollarSign, Calendar, ShieldCheck, AlertCircle } from "lucide-react";

const PRESETS = [
  { name: "Young Starter (25)", currentAge: 25, retireAge: 65, savings: 15000, salary: 65000, empContr: 8, matchPct: 50, matchCap: 6, returnPct: 8 },
  { name: "Mid-Career (38)", currentAge: 38, retireAge: 65, savings: 120000, salary: 110000, empContr: 10, matchPct: 100, matchCap: 4, returnPct: 7.5 },
  { name: "Catch-Up Booster (50)", currentAge: 50, retireAge: 67, savings: 350000, salary: 145000, empContr: 15, matchPct: 50, matchCap: 6, returnPct: 6.5 },
];

export default function Retirement401kCalculatorTool() {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [savings, setSavings] = useState<number>(45000);
  const [salary, setSalary] = useState<number>(85000);
  const [employeeContr, setEmployeeContr] = useState<number>(8);
  const [matchPercent, setMatchPercent] = useState<number>(50); // 50% match
  const [matchCap, setMatchCap] = useState<number>(6); // up to 6% of salary
  const [expectedReturn, setExpectedReturn] = useState<number>(7.5);
  const [salaryRaise, setSalaryRaise] = useState<number>(2.5);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo<Retirement401kResult>(() => {
    return calculateRetirement401k({
      currentAge,
      retirementAge,
      currentSavings: savings,
      annualSalary: salary,
      employeeContributionPercent: employeeContr,
      employerMatchPercent: matchPercent,
      employerMatchCapPercent: matchCap,
      annualSalaryIncreasePercent: salaryRaise,
      expectedAnnualReturn: expectedReturn,
    });
  }, [
    currentAge,
    retirementAge,
    savings,
    salary,
    employeeContr,
    matchPercent,
    matchCap,
    expectedReturn,
    salaryRaise,
  ]);

  const handleCopy = () => {
    const text = [
      "401(k) & Retirement Nest Egg Projection",
      `Ages: Current ${currentAge} → Retirement ${retirementAge} (${result.yearsToRetirement} years)`,
      `Projected Nest Egg: $${result.nestEggAtRetirement.toLocaleString()}`,
      `Est. Monthly Retirement Income: $${result.estimatedMonthlyDrawdown.toLocaleString()}/mo (25-yr drawdown)`,
      `Your Contributions: $${result.totalEmployeeContributed.toLocaleString()}`,
      `Employer Match (Free Money): $${result.totalEmployerContributed.toLocaleString()}`,
      `Investment Growth: $${result.totalGrowth.toLocaleString()}`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      "Age,Salary,Employee Contribution,Employer Match,Annual Growth,Ending 401(k) Balance",
      ...result.yearlySchedule.map(
        (r) => `${r.age},${r.salary},${r.employeeContr},${r.employerContr},${r.yearGrowth},${r.balance}`
      ),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "401k_retirement_projection.csv";
    link.click();
    URL.revokeObjectURL(url);
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
                setCurrentAge(p.currentAge);
                setRetirementAge(p.retireAge);
                setSavings(p.savings);
                setSalary(p.salary);
                setEmployeeContr(p.empContr);
                setMatchPercent(p.matchPct);
                setMatchCap(p.matchCap);
                setExpectedReturn(p.returnPct);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Ages & Salary Parameters
          </h2>

          {/* Ages Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Age</label>
              <input
                type="number"
                min="18"
                max="80"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Retire Age
              </label>
              <input
                type="number"
                min={currentAge + 1}
                max="90"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Savings & Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current 401(k) ($)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={savings}
                onChange={(e) => setSavings(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Salary ($)
              </label>
              <input
                type="number"
                min="10000"
                step="5000"
                value={salary}
                onChange={(e) => setSalary(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Contributions */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Your Contribution (% of salary)
                </label>
                <span className="text-xs font-bold text-blue-600 font-mono">{employeeContr}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={employeeContr}
                onChange={(e) => setEmployeeContr(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Employer Match %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="10"
                  value={matchPercent}
                  onChange={(e) => setMatchPercent(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Match Cap (% Salary)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="1"
                  value={matchCap}
                  onChange={(e) => setMatchCap(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 text-center"
                />
              </div>
            </div>

            {/* Return and Raise */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Est. Annual Return (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Annual Raise (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={salaryRaise}
                  onChange={(e) => setSalaryRaise(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 text-center"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Summary!" : "Copy Summary"}
            </button>
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              CSV
            </button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 border border-blue-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Total Nest Egg at Age {retirementAge}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {result.yearsToRetirement} Years of Compounding
              </span>
            </div>
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              ${result.nestEggAtRetirement.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Estimated Monthly Income:{" "}
              <strong className="text-emerald-700 text-sm">
                ${result.estimatedMonthlyDrawdown.toLocaleString()} / month
              </strong>{" "}
              (based on a 25-year retirement period)
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Your Deposits</div>
              <div className="text-base font-bold text-blue-600 mt-1">
                ${result.totalEmployeeContributed.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Company Match</div>
              <div className="text-base font-bold text-indigo-600 mt-1">
                ${result.totalEmployerContributed.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Growth / Gain</div>
              <div className="text-base font-bold text-emerald-600 mt-1">
                +${result.totalGrowth.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Year-by-Year Growth Table
            </h3>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-4 py-2 font-bold text-slate-400 uppercase text-[10px] sticky top-0 bg-white">
                <div>Age</div>
                <div>Salary</div>
                <div>Contribs</div>
                <div className="text-right">Balance</div>
              </div>
              {result.yearlySchedule.map((row) => (
                <div key={row.age} className="grid grid-cols-4 py-2 text-slate-700">
                  <div className="font-semibold text-slate-900">Age {row.age}</div>
                  <div className="text-slate-600">${row.salary.toLocaleString()}</div>
                  <div className="text-slate-600">
                    ${(row.employeeContr + row.employerContr).toLocaleString()}
                  </div>
                  <div className="text-right font-bold text-blue-700">
                    ${row.balance.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-2 items-start text-[11px] text-amber-800 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Disclaimer:</strong> 401(k) calculators provide educational illustrations only. Actual returns, IRS contribution limits, inflation, and market conditions vary. Consult a certified financial planner.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
