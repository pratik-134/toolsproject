"use client";

import React, { useState, useId } from "react";
import { Activity, Flame, Heart, AlertCircle, Sparkles } from "lucide-react";
import { calculateBmr, Gender, ActivityLevel, BmrFormula } from "./logic";

export default function BmrTdeeCalculator() {
  const ageInputId = useId();
  const weightInputId = useId();
  const heightInputId = useId();
  const feetInputId = useId();
  const inchesInputId = useId();
  const activityLevelSelectId = useId();
  const formulaSelectId = useId();
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<number>(28);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [heightCm, setHeightCm] = useState<number>(178);

  // Imperial states
  const [weightLbs, setWeightLbs] = useState<number>(160);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(10);

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [formula, setFormula] = useState<BmrFormula>("mifflin");

  // Normalized values
  const effectiveWeightKg =
    unitSystem === "metric" ? weightKg : Math.round(weightLbs * 0.453592 * 10) / 10;
  const effectiveHeightCm =
    unitSystem === "metric"
      ? heightCm
      : Math.round((heightFeet * 12 + heightInches) * 2.54 * 10) / 10;

  let result = null;
  let errorMsg = null;
  try {
    result = calculateBmr({
      gender,
      age,
      weightKg: effectiveWeightKg,
      heightCm: effectiveHeightCm,
      activityLevel,
      formula,
    });
  } catch (err: any) {
    errorMsg = err.message;
  }

  return (
    <div className="space-y-6">
      {/* Unit & Gender Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit System:</span>
          <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setUnitSystem("metric")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                unitSystem === "metric"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Metric (kg / cm)
            </button>
            <button
              onClick={() => setUnitSystem("imperial")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                unitSystem === "imperial"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Imperial (lbs / ft-in)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Biological Sex:</span>
          <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setGender("male")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                gender === "male"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                gender === "female"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Female
            </button>
          </div>
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Age */}
        <div>
          <label htmlFor={ageInputId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Age (years)
          </label>
          <input
            id={ageInputId}
            type="number"
            min={10}
            max={120}
            value={age}
            onChange={(e) => setAge(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>

        {/* Weight */}
        <div>
          <label htmlFor={weightInputId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Weight ({unitSystem === "metric" ? "kg" : "lbs"})
          </label>
          {unitSystem === "metric" ? (
            <input
              id={weightInputId}
              type="number"
              min={20}
              max={300}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          ) : (
            <input
              id={weightInputId}
              type="number"
              min={40}
              max={600}
              value={weightLbs}
              onChange={(e) => setWeightLbs(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          )}
        </div>

        {/* Height */}
        <div>
          <label htmlFor={unitSystem === "metric" ? heightInputId : feetInputId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Height ({unitSystem === "metric" ? "cm" : "ft & in"})
          </label>
          {unitSystem === "metric" ? (
            <input
              id={heightInputId}
              type="number"
              min={50}
              max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          ) : (
            <div className="flex gap-2">
              <input
                id={feetInputId}
                type="number"
                min={2}
                max={8}
                value={heightFeet}
                onChange={(e) => setHeightFeet(Number(e.target.value) || 0)}
                placeholder="ft"
                className="w-1/2 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
              <input
                id={inchesInputId}
                type="number"
                min={0}
                max={11}
                value={heightInches}
                onChange={(e) => setHeightInches(Number(e.target.value) || 0)}
                placeholder="in"
                className="w-1/2 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
          )}
        </div>

        {/* Activity Level */}
        <div>
          <label htmlFor={activityLevelSelectId} className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Activity Level
          </label>
          <select
            id={activityLevelSelectId}
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="sedentary">Sedentary (desk job, little exercise)</option>
            <option value="light">Lightly Active (1-3 days/week)</option>
            <option value="moderate">Moderately Active (3-5 days/week)</option>
            <option value="heavy">Very Active (6-7 days/week)</option>
            <option value="extreme">Extra Active (labor job or 2x/day)</option>
          </select>
        </div>
      </div>

      {/* Formula toggle */}
      <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
        <label htmlFor={formulaSelectId}>Formula:</label>
        <select
          id={formulaSelectId}
          value={formula}
          onChange={(e) => setFormula(e.target.value as BmrFormula)}
          className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="mifflin">Mifflin-St Jeor (Recommended)</option>
          <option value="harris">Revised Harris-Benedict</option>
        </select>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 text-sm border border-red-200 dark:border-red-900">
          {errorMsg}
        </div>
      )}

      {/* Primary KPI Results */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-900 dark:to-blue-950/20 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Heart className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Basal Metabolic Rate (BMR)</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 font-mono">
                {result.bmr.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-500">calories / day</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              The minimum energy your body burns at complete rest just to keep vital organs functioning.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-900 dark:to-emerald-950/20 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Flame className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Daily Energy Expenditure (TDEE)</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {result.tdee.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-500">calories / day</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Your maintenance calories including exercise and daily movement (x{result.activityMultiplier} multiplier).
            </p>
          </div>
        </div>
      )}

      {/* Goal Targets and Macro Breakdown */}
      {result && (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Daily Caloric Targets by Goal
            </h3>
            <span className="text-xs text-slate-400">Balanced 30P / 40C / 30F split</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.values(result.goals).map((goal) => (
              <div
                key={goal.label}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{goal.label}</span>
                  <span className="text-[11px] text-slate-500 block mb-2">{goal.description}</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    {goal.calories.toLocaleString()} <span className="text-xs font-normal text-slate-500">kcal</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Protein:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{goal.macros.proteinGrams}g</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Carbs:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{goal.macros.carbsGrams}g</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Fats:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{goal.macros.fatGrams}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Medical Disclaimer Notice */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="leading-relaxed">
          <strong className="font-semibold block mb-0.5">Medical & Health Disclaimer</strong>
          This calculator provides general metabolic and caloric estimations for healthy adults based on scientific equations. It does not constitute medical, nutritional, or healthcare advice. Individual metabolic rates vary significantly based on body composition, hormones, and medical history. Always consult a licensed physician or registered dietitian before starting any significant caloric restriction, surplus, or intense exercise program.
        </div>
      </div>
    </div>
  );
}
