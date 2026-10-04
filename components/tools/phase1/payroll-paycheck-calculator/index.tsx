"use client";

import React, { useState, useMemo } from "react";
import {
  calculatePayroll,
  PayrollInput,
  PayrollResult,
  PayFrequency,
  FilingStatus,
  PayType,
  PAY_FREQUENCIES,
} from "./logic";
import {
  Copy,
  Check,
  Download,
  DollarSign,
  Wallet,
  Receipt,
  ShieldAlert,
  Percent,
  TrendingDown,
  Building,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Preset {
  name: string;
  payType: PayType;
  annualSalary?: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
  payFrequency: PayFrequency;
  filingStatus: FilingStatus;
  stateTaxRatePercent: number;
  k401ContributionPercent: number;
  healthInsurancePerPeriod: number;
}

const PRESETS: Preset[] = [
  {
    name: "Mid-Career Professional ($85k)",
    payType: "salary",
    annualSalary: 85000,
    payFrequency: "bi-weekly",
    filingStatus: "single",
    stateTaxRatePercent: 5,
    k401ContributionPercent: 6,
    healthInsurancePerPeriod: 85,
  },
  {
    name: "Software Engineer ($135k)",
    payType: "salary",
    annualSalary: 135000,
    payFrequency: "semi-monthly",
    filingStatus: "single",
    stateTaxRatePercent: 6,
    k401ContributionPercent: 10,
    healthInsurancePerPeriod: 120,
  },
  {
    name: "Hourly Worker ($25/hr)",
    payType: "hourly",
    hourlyRate: 25,
    hoursPerWeek: 40,
    payFrequency: "weekly",
    filingStatus: "single",
    stateTaxRatePercent: 4.5,
    k401ContributionPercent: 3,
    healthInsurancePerPeriod: 45,
  },
  {
    name: "Married Household Earner ($110k)",
    payType: "salary",
    annualSalary: 110000,
    payFrequency: "bi-weekly",
    filingStatus: "married",
    stateTaxRatePercent: 5,
    k401ContributionPercent: 8,
    healthInsurancePerPeriod: 160,
  },
];

export default function PayrollPaycheckCalculatorTool() {
  const [payType, setPayType] = useState<PayType>("salary");
  const [annualSalary, setAnnualSalary] = useState<number>(85000);
  const [hourlyRate, setHourlyRate] = useState<number>(30);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("bi-weekly");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [stateTaxRate, setStateTaxRate] = useState<number>(5);
  const [k401Percent, setK401Percent] = useState<number>(6);
  const [healthInsurance, setHealthInsurance] = useState<number>(85);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const input: PayrollInput = useMemo(
    () => ({
      payType,
      annualSalary,
      hourlyRate,
      hoursPerWeek,
      payFrequency,
      filingStatus,
      stateTaxRatePercent: stateTaxRate,
      k401ContributionPercent: k401Percent,
      healthInsurancePerPeriod: healthInsurance,
      otherDeductionsPerPeriod: otherDeductions,
    }),
    [
      payType,
      annualSalary,
      hourlyRate,
      hoursPerWeek,
      payFrequency,
      filingStatus,
      stateTaxRate,
      k401Percent,
      healthInsurance,
      otherDeductions,
    ]
  );

  const result: PayrollResult = useMemo(() => calculatePayroll(input), [input]);

  const handleApplyPreset = (p: Preset) => {
    setPayType(p.payType);
    if (p.annualSalary !== undefined) setAnnualSalary(p.annualSalary);
    if (p.hourlyRate !== undefined) setHourlyRate(p.hourlyRate);
    if (p.hoursPerWeek !== undefined) setHoursPerWeek(p.hoursPerWeek);
    setPayFrequency(p.payFrequency);
    setFilingStatus(p.filingStatus);
    setStateTaxRate(p.stateTaxRatePercent);
    setK401Percent(p.k401ContributionPercent);
    setHealthInsurance(p.healthInsurancePerPeriod);
  };

  const handleCopy = () => {
    const summary = [
      "Paycheck Take-Home Calculation Summary",
      `Pay Frequency: ${PAY_FREQUENCIES[payFrequency].label}`,
      `Filing Status: ${filingStatus === "married" ? "Married Filing Jointly" : "Single"}`,
      `Gross Pay / Paycheck: $${result.grossPayPerPeriod.toLocaleString()}`,
      `Federal Income Tax: -$${result.federalTaxPerPeriod.toLocaleString()}`,
      `FICA (SS & Medicare): -$${result.totalFicaPerPeriod.toLocaleString()}`,
      `State Tax: -$${result.stateTaxPerPeriod.toLocaleString()}`,
      `Pre-tax Benefits (401k & Health): -$${result.preTaxDeductionsPerPeriod.toLocaleString()}`,
      `Estimated Net Paycheck: $${result.netPayPerPeriod.toLocaleString()}`,
      `Annual Take-Home Equivalent: $${result.netPayAnnual.toLocaleString()}`,
      `Take-Home Rate: ${result.takeHomePercentage}%`,
    ].join("\n");

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      "Category,Per Paycheck,Annual Equivalent,% of Gross",
      ...result.breakdown.map(
        (b) => `"${b.label}",$${b.amountPerPeriod},$${b.amountAnnual},${b.percentageOfGross}%`
      ),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "paycheck_takehome_breakdown.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Pay & Compensation Details
          </h2>

          {/* Pay Type Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Compensation Structure
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPayType("salary")}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  payType === "salary"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Annual Salary
              </button>
              <button
                type="button"
                onClick={() => setPayType("hourly")}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  payType === "hourly"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hourly Wage
              </button>
            </div>
          </div>

          {/* Salary vs Hourly inputs */}
          {payType === "salary" ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Annual Gross Salary ($)</label>
                <span className="text-xs font-bold text-blue-600 font-mono">
                  ${annualSalary.toLocaleString()}
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Hourly Rate ($/hr)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Hours / Week</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Pay Frequency & Filing Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Pay Frequency</label>
              <Select
                value={payFrequency}
                onValueChange={(val) => setPayFrequency(val as PayFrequency)}
              >
                <SelectTrigger className="w-full text-xs font-semibold text-slate-900 bg-white border-slate-300">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly (52x/yr)</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly (26x/yr)</SelectItem>
                  <SelectItem value="semi-monthly">Semi-Monthly (24x/yr)</SelectItem>
                  <SelectItem value="monthly">Monthly (12x/yr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tax Filing Status</label>
              <Select
                value={filingStatus}
                onValueChange={(val) => setFilingStatus(val as FilingStatus)}
              >
                <SelectTrigger className="w-full text-xs font-semibold text-slate-900 bg-white border-slate-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married (Joint)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Tax Rates & Deductions
            </h3>

            {/* State Tax Rate */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    State Income Tax Rate (%)
                  </label>
                  <span className="text-xs font-bold text-indigo-600 font-mono">{stateTaxRate}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="0.1"
                  value={stateTaxRate}
                  onChange={(e) => setStateTaxRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              {/* 401(k) Pre-Tax Contribution % */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    401(k) Contribution (% of gross)
                  </label>
                  <span className="text-xs font-bold text-amber-600 font-mono">{k401Percent}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={k401Percent}
                  onChange={(e) => setK401Percent(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              {/* Health Insurance & Post-tax Deductions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Health Ins. / Paycheck ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={healthInsurance}
                    onChange={(e) => setHealthInsurance(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Post-Tax Other ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Waterfall */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Take-Home Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs relative">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                Estimated Take-Home Pay (Per Paycheck)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                  title="Copy Calculation Summary"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                  title="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
              </div>
            </div>

            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              ${result.netPayPerPeriod.toLocaleString()}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {result.takeHomePercentage}% of gross income
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Annual Equivalent: ${result.netPayAnnual.toLocaleString()} / year
              </span>
            </div>

            {/* Income Waterfall Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-700">Take-Home: ${result.netPayPerPeriod.toLocaleString()}</span>
                <span className="text-slate-500">Gross: ${result.grossPayPerPeriod.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${result.takeHomePercentage}%` }}
                  title={`Take Home: ${result.takeHomePercentage}%`}
                />
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${result.grossPayAnnual > 0 ? (result.federalTaxAnnual / result.grossPayAnnual) * 100 : 0}%`,
                  }}
                  title="Federal Tax"
                />
                <div
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{
                    width: `${result.grossPayAnnual > 0 ? (result.totalFicaAnnual / result.grossPayAnnual) * 100 : 0}%`,
                  }}
                  title="FICA (Social Security & Medicare)"
                />
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{
                    width: `${result.grossPayAnnual > 0 ? (result.stateTaxAnnual / result.grossPayAnnual) * 100 : 0}%`,
                  }}
                  title="State Tax"
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${result.grossPayAnnual > 0 ? (result.preTaxDeductionsAnnual / result.grossPayAnnual) * 100 : 0}%`,
                  }}
                  title="Pre-Tax Deductions"
                />
              </div>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Gross / Paycheck</div>
              <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                ${result.grossPayPerPeriod.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Total Taxes</div>
              <div className="text-lg font-bold text-rose-600 mt-1 font-mono">
                -${result.totalTaxesPerPeriod.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Pre-Tax Benefits</div>
              <div className="text-lg font-bold text-amber-600 mt-1 font-mono">
                -${result.preTaxDeductionsPerPeriod.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Effective Tax Rate</div>
              <div className="text-lg font-bold text-indigo-600 mt-1 font-mono">
                {result.effectiveTaxRate}%
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-blue-600" />
              Detailed Paycheck & Deduction Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-right">Per Paycheck</th>
                    <th className="py-2 text-right">Annual Equivalent</th>
                    <th className="py-2 text-right">% of Gross</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {result.breakdown.map((row) => (
                    <tr
                      key={row.label}
                      className={
                        row.category === "net"
                          ? "bg-emerald-50/50 font-bold text-emerald-950"
                          : "text-slate-700"
                      }
                    >
                      <td className="py-2.5 flex items-center gap-1.5">
                        {row.category === "net" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                        {row.category === "tax" && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                        {row.category === "pre-tax" && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                        {row.category === "post-tax" && (
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                        )}
                        {row.label}
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        ${row.amountPerPeriod.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-500">
                        ${row.amountAnnual.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-600">
                        {row.percentageOfGross}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Financial Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-2 items-start text-[11px] text-amber-800 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Disclaimer:</strong> This calculator provides an educational estimate based on standard 2024 IRS withholding brackets, standard deductions, and FICA statutory rates. Exact withholdings will vary depending on your Form W-4 elections, local municipal taxes, and employer payroll configurations. Consult a certified tax advisor or CPA for personal tax advice.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
