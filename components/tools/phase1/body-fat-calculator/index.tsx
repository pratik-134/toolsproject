"use client";

import React, { useState, useMemo } from "react";
import {
  calculateBodyFat,
  BodyFatInput,
  Gender,
  UnitSystem,
  ACE_CATEGORIES,
} from "./logic";
import {
  Copy,
  Check,
  Download,
  Activity,
  HeartPulse,
  Scale,
  ShieldAlert,
  Percent,
  TrendingDown,
  Target,
} from "lucide-react";

interface Preset {
  name: string;
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
}

const PRESETS: Preset[] = [
  {
    name: "Athletic Male",
    gender: "male",
    age: 26,
    weightKg: 78,
    heightCm: 182,
    neckCm: 41,
    waistCm: 80,
  },
  {
    name: "Average Male",
    gender: "male",
    age: 35,
    weightKg: 84,
    heightCm: 178,
    neckCm: 39,
    waistCm: 90,
  },
  {
    name: "Fit Female",
    gender: "female",
    age: 28,
    weightKg: 58,
    heightCm: 168,
    neckCm: 33,
    waistCm: 68,
    hipCm: 92,
  },
  {
    name: "Average Female",
    gender: "female",
    age: 38,
    weightKg: 68,
    heightCm: 164,
    neckCm: 35,
    waistCm: 79,
    hipCm: 102,
  },
];

export default function BodyFatCalculatorTool() {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<number>(30);

  // Stored internally as Metric
  const [weightKg, setWeightKg] = useState<number>(80);
  const [heightCm, setHeightCm] = useState<number>(180);
  const [neckCm, setNeckCm] = useState<number>(39);
  const [waistCm, setWaistCm] = useState<number>(86);
  const [hipCm, setHipCm] = useState<number>(96);

  const [targetBfPercent, setTargetBfPercent] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);

  // Conversion helpers
  const displayWeight = unit === "metric" ? weightKg : Math.round(weightKg * 2.20462 * 10) / 10;
  const displayHeight = unit === "metric" ? heightCm : Math.round(heightCm * 0.393701 * 10) / 10;
  const displayNeck = unit === "metric" ? neckCm : Math.round(neckCm * 0.393701 * 10) / 10;
  const displayWaist = unit === "metric" ? waistCm : Math.round(waistCm * 0.393701 * 10) / 10;
  const displayHip = unit === "metric" ? hipCm : Math.round(hipCm * 0.393701 * 10) / 10;

  const handleWeightChange = (val: number) => {
    setWeightKg(unit === "metric" ? val : Math.round((val / 2.20462) * 10) / 10);
  };
  const handleHeightChange = (val: number) => {
    setHeightCm(unit === "metric" ? val : Math.round((val / 0.393701) * 10) / 10);
  };
  const handleNeckChange = (val: number) => {
    setNeckCm(unit === "metric" ? val : Math.round((val / 0.393701) * 10) / 10);
  };
  const handleWaistChange = (val: number) => {
    setWaistCm(unit === "metric" ? val : Math.round((val / 0.393701) * 10) / 10);
  };
  const handleHipChange = (val: number) => {
    setHipCm(unit === "metric" ? val : Math.round((val / 0.393701) * 10) / 10);
  };

  const handleApplyPreset = (p: Preset) => {
    setGender(p.gender);
    setAge(p.age);
    setWeightKg(p.weightKg);
    setHeightCm(p.heightCm);
    setNeckCm(p.neckCm);
    setWaistCm(p.waistCm);
    if (p.hipCm) setHipCm(p.hipCm);
  };

  const input: BodyFatInput = useMemo(
    () => ({
      gender,
      age,
      weightKg,
      heightCm,
      neckCm,
      waistCm,
      hipCm,
    }),
    [gender, age, weightKg, heightCm, neckCm, waistCm, hipCm]
  );

  const result = useMemo(() => {
    try {
      return calculateBodyFat(input);
    } catch {
      return null;
    }
  }, [input]);

  const targetGoal = useMemo(() => {
    if (!result?.weightToTarget) return null;
    return result.weightToTarget(targetBfPercent);
  }, [result, targetBfPercent]);

  const handleCopy = () => {
    if (!result) return;
    const summary = [
      "Body Fat Analysis Summary",
      `Gender: ${gender === "male" ? "Male" : "Female"} | Age: ${age}`,
      `US Navy Body Fat: ${result.navyBodyFatPercent}% (${result.category.name})`,
      `BMI Method Body Fat: ${result.bmiBodyFatPercent}% (BMI: ${result.bmi})`,
      `Fat Mass: ${unit === "metric" ? `${result.fatMassKg} kg` : `${result.fatMassLbs} lbs`}`,
      `Lean Body Mass: ${unit === "metric" ? `${result.leanMassKg} kg` : `${result.leanMassLbs} lbs`}`,
      `Healthy Ideal Range: ${result.idealRange.minPercent}% - ${result.idealRange.maxPercent}%`,
    ].join("\n");

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!result) return;
    const rows = [
      "Metric,Value,Unit",
      `US Navy Body Fat,${result.navyBodyFatPercent},%`,
      `ACE Classification,${result.category.name},-`,
      `BMI Estimate Body Fat,${result.bmiBodyFatPercent},%`,
      `BMI Index,${result.bmi},kg/m²`,
      `Fat Mass (Metric),${result.fatMassKg},kg`,
      `Fat Mass (Imperial),${result.fatMassLbs},lbs`,
      `Lean Mass (Metric),${result.leanMassKg},kg`,
      `Lean Mass (Imperial),${result.leanMassLbs},lbs`,
      `Target Body Fat Goal,${targetBfPercent},%`,
      `Target Body Weight,${unit === "metric" ? targetGoal?.targetWeightKg : targetGoal?.targetWeightLbs},${unit === "metric" ? "kg" : "lbs"}`,
      `Fat to Lose,${unit === "metric" ? targetGoal?.fatToLoseKg : targetGoal?.fatToLoseLbs},${unit === "metric" ? "kg" : "lbs"}`,
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "body_fat_composition_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Presets & Units Header */}
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

        {/* Unit Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setUnit("metric")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              unit === "metric" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Metric (cm, kg)
          </button>
          <button
            onClick={() => setUnit("imperial")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              unit === "imperial" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Imperial (in, lbs)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Body Measurements
          </h2>

          {/* Gender Select */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Gender</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  gender === "male"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  gender === "female"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Age & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Age (Years)</label>
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Weight ({unit === "metric" ? "kg" : "lbs"})
              </label>
              <input
                type="number"
                min="20"
                step="0.5"
                value={displayWeight}
                onChange={(e) => handleWeightChange(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Height & Neck */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Height ({unit === "metric" ? "cm" : "in"})
              </label>
              <input
                type="number"
                min="50"
                step="0.5"
                value={displayHeight}
                onChange={(e) => handleHeightChange(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Neck Circumference ({unit === "metric" ? "cm" : "in"})
              </label>
              <input
                type="number"
                min="15"
                step="0.5"
                value={displayNeck}
                onChange={(e) => handleNeckChange(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Waist & Hip */}
          <div className={`grid ${gender === "female" ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Waist at Navel ({unit === "metric" ? "cm" : "in"})
              </label>
              <input
                type="number"
                min="30"
                step="0.5"
                value={displayWaist}
                onChange={(e) => handleWaistChange(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            {gender === "female" && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Hip at Widest ({unit === "metric" ? "cm" : "in"})
                </label>
                <input
                  type="number"
                  min="30"
                  step="0.5"
                  value={displayHip}
                  onChange={(e) => handleHipChange(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Target Body Fat Goal Simulator */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                Target Body Fat Goal
              </label>
              <span className="text-xs font-extrabold text-blue-600 font-mono">
                {targetBfPercent}%
              </span>
            </div>
            <input
              type="range"
              min={gender === "male" ? 5 : 12}
              max="35"
              step="1"
              value={targetBfPercent}
              onChange={(e) => setTargetBfPercent(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Right: Results & Analytics */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* Primary Navy Hero Card */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    US Navy Body Fat Estimate
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                      title="Copy Summary"
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

                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                    {result.navyBodyFatPercent}%
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${result.category.color}`}
                  >
                    {result.category.name}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2">
                  Healthy ideal range for your profile:{" "}
                  <strong>
                    {result.idealRange.minPercent}% – {result.idealRange.maxPercent}%
                  </strong>
                </p>

                {/* Body Composition Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-teal-700">
                      Lean Mass: {unit === "metric" ? `${result.leanMassKg} kg` : `${result.leanMassLbs} lbs`} (
                      {100 - result.navyBodyFatPercent}%)
                    </span>
                    <span className="text-amber-700">
                      Fat Mass: {unit === "metric" ? `${result.fatMassKg} kg` : `${result.fatMassLbs} lbs`} (
                      {result.navyBodyFatPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-teal-500 transition-all duration-500"
                      style={{ width: `${100 - result.navyBodyFatPercent}%` }}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${result.navyBodyFatPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500">Fat Mass</div>
                  <div className="text-base font-bold text-amber-600 mt-1 font-mono">
                    {unit === "metric" ? `${result.fatMassKg} kg` : `${result.fatMassLbs} lbs`}
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500">Lean Mass</div>
                  <div className="text-base font-bold text-teal-600 mt-1 font-mono">
                    {unit === "metric" ? `${result.leanMassKg} kg` : `${result.leanMassLbs} lbs`}
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500">BMI Method BF</div>
                  <div className="text-base font-bold text-slate-800 mt-1 font-mono">
                    {result.bmiBodyFatPercent}%
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-500">BMI Index</div>
                  <div className="text-base font-bold text-indigo-600 mt-1 font-mono">
                    {result.bmi}
                  </div>
                </div>
              </div>

              {/* Target Goal Projection Card */}
              {targetGoal && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-600" />
                    Target Goal: Reach {targetBfPercent}% Body Fat
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-slate-500 font-medium">Estimated Target Weight</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
                        {unit === "metric"
                          ? `${targetGoal.targetWeightKg} kg`
                          : `${targetGoal.targetWeightLbs} lbs`}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Preserving current lean tissue</p>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="text-blue-700 font-medium">Fat Mass To Burn</div>
                      <div className="text-lg font-bold text-blue-700 mt-0.5 font-mono">
                        {unit === "metric"
                          ? `${targetGoal.fatToLoseKg} kg`
                          : `${targetGoal.fatToLoseLbs} lbs`}
                      </div>
                      <p className="text-[11px] text-blue-600 mt-1">
                        {result.navyBodyFatPercent <= targetBfPercent
                          ? "You are currently at or below this target!"
                          : "Net reduction needed in body fat"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ACE Classification Reference Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-slate-600" />
                  American Council on Exercise (ACE) Standards
                </h3>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {ACE_CATEGORIES[gender].map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-xl border transition ${
                        result.category.id === c.id ? `${c.color} ring-2 ring-blue-500/20 font-bold` : "bg-slate-50 border-slate-100 text-slate-600"
                      }`}
                    >
                      <div className="text-[11px] font-semibold">{c.name}</div>
                      <div className="font-mono text-xs mt-1">
                        {c.minPercent}% - {c.maxPercent}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl">
              Please enter valid body measurements (waist must exceed neck).
            </div>
          )}

          {/* Statutory Medical Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-2 items-start text-[11px] text-amber-800 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Medical Disclaimer:</strong> Body fat estimations provided by the US Navy circumference method and BMI equations are statistical estimates. Individual body density varies based on muscle mass, bone structure, and hydration. For clinical body composition diagnostics, consult a healthcare professional using DEXA or hydrostatic weighing.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
