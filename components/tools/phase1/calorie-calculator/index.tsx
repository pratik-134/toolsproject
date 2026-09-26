"use client";

import React, { useState, useMemo } from "react";
import { Flame, Activity, Target, PieChart, ShieldAlert, HeartPulse } from "lucide-react";
import {
  calculateCalories,
  Gender,
  ActivityLevel,
  CalorieGoal,
  MacroSplitType,
  CalorieResult,
} from "./logic";

export default function CalorieCalculatorTool() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<number>(28);
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(178);

  // Imperial helper state
  const [weightLbs, setWeightLbs] = useState<number>(165);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(10);

  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<CalorieGoal>("maintain");
  const [macroSplit, setMacroSplit] = useState<MacroSplitType>("balanced");

  const effectiveWeightKg =
    unit === "metric" ? weightKg : Number((weightLbs * 0.45359237).toFixed(1));
  const effectiveHeightCm =
    unit === "metric"
      ? heightCm
      : Number(((heightFt * 12 + heightIn) * 2.54).toFixed(1));

  const result: CalorieResult = useMemo(() => {
    return calculateCalories({
      gender,
      age: Number(age) || 25,
      weightKg: effectiveWeightKg || 70,
      heightCm: effectiveHeightCm || 175,
      activityLevel: activity,
      goal,
      macroSplit,
    });
  }, [gender, age, effectiveWeightKg, effectiveHeightCm, activity, goal, macroSplit]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-5">
          {/* Header & Unit Switch */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-600" /> Personal Body Metrics
            </h3>
            <div className="flex rounded-md p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setUnit("metric")}
                className={`px-3 py-1 rounded transition-colors ${
                  unit === "metric"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Metric (kg/cm)
              </button>
              <button
                type="button"
                onClick={() => setUnit("imperial")}
                className={`px-3 py-1 rounded transition-colors ${
                  unit === "imperial"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Imperial (lbs/ft)
              </button>
            </div>
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Biological Sex
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                    gender === "male"
                      ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                    gender === "female"
                      ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Age (Years)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={age || ""}
                onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Weight & Height */}
          {unit === "metric" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={weightKg || ""}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  value={heightCm || ""}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  min="40"
                  max="600"
                  value={weightLbs || ""}
                  onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Height (ft & in)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="3"
                    max="7"
                    value={heightFt || ""}
                    onChange={(e) => setHeightFt(parseInt(e.target.value) || 5)}
                    className="w-1/2 px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Ft"
                  />
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightIn || ""}
                    onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
                    className="w-1/2 px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="In"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Activity Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Activity Level
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="sedentary">Sedentary (desk job, minimal exercise)</option>
              <option value="light">Lightly Active (light exercise 1-3 days/week)</option>
              <option value="moderate">Moderately Active (exercise 3-5 days/week)</option>
              <option value="active">Very Active (hard exercise 6-7 days/week)</option>
              <option value="extreme">Extra Active (physical job or athlete 2x/day)</option>
            </select>
          </div>

          {/* Calorie Goal & Macro Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Primary Weight Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as CalorieGoal)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="maintain">Maintain Weight (TDEE)</option>
                <option value="mild-loss">Mild Weight Loss (-0.5 lb / wk)</option>
                <option value="loss">Standard Weight Loss (-1 lb / wk)</option>
                <option value="extreme-loss">Rapid Weight Loss (-2 lb / wk)</option>
                <option value="mild-gain">Mild Weight Gain (+0.5 lb / wk)</option>
                <option value="gain">Weight / Muscle Gain (+1 lb / wk)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Macronutrient Ratio
              </label>
              <select
                value={macroSplit}
                onChange={(e) => setMacroSplit(e.target.value as MacroSplitType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="balanced">Balanced (40% C / 30% P / 30% F)</option>
                <option value="high-protein">High Protein (35% C / 40% P / 25% F)</option>
                <option value="low-carb">Low Carb (20% C / 45% P / 35% F)</option>
                <option value="keto">Keto (5% C / 25% P / 70% F)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Results Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-200 dark:border-teal-900/60 rounded-2xl shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Daily Calorie Target
            </span>

            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
                {result.targetCalories.toLocaleString()}
              </div>
              <span className="text-sm font-medium text-slate-500">kcal / day</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 font-medium">BMR (Basal Rate)</div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  {result.bmr} kcal
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 font-medium">TDEE (Maintenance)</div>
                <div className="text-base font-bold text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                  {result.tdee} kcal
                </div>
              </div>
            </div>
          </div>

          {/* Macronutrients Cards */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
            <div className="font-semibold text-xs text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Daily Macronutrient Breakdown</span>
              <span className="text-slate-400 font-normal uppercase">{macroSplit}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Protein */}
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-red-700 dark:text-red-300 uppercase">
                  Protein
                </div>
                <div className="text-xl font-extrabold text-red-900 dark:text-red-100 font-mono">
                  {result.macros.protein.grams}g
                </div>
                <div className="text-[10px] text-red-600 dark:text-red-400">
                  {result.macros.protein.calories} kcal ({result.macros.protein.percentage}%)
                </div>
              </div>

              {/* Carbs */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase">
                  Carbs
                </div>
                <div className="text-xl font-extrabold text-amber-900 dark:text-amber-100 font-mono">
                  {result.macros.carbs.grams}g
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400">
                  {result.macros.carbs.calories} kcal ({result.macros.carbs.percentage}%)
                </div>
              </div>

              {/* Fats */}
              <div className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 rounded-xl space-y-1">
                <div className="text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase">
                  Fats
                </div>
                <div className="text-xl font-extrabold text-teal-900 dark:text-teal-100 font-mono">
                  {result.macros.fats.grams}g
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400">
                  {result.macros.fats.calories} kcal ({result.macros.fats.percentage}%)
                </div>
              </div>
            </div>
          </div>

          {/* Medical Notice */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3 text-xs text-slate-500 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-700 dark:text-slate-300 font-semibold block mb-0.5">
                Not Medical Advice
              </strong>
              Calorie expenditure estimates are based on scientific population averages. Individual metabolic rates vary with lean muscle mass, hormones, and genetics. Consult a physician or registered dietitian before beginning any diet regimen.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
