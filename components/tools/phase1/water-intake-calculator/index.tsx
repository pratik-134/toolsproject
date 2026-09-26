"use client";

import React, { useState, useMemo } from "react";
import { Droplet, Sun, Dumbbell, ShieldAlert, Sparkles, Clock, GlassWater } from "lucide-react";
import {
  calculateWaterIntake,
  ClimateType,
  SpecialCondition,
  WaterIntakeResult,
} from "./logic";

export default function WaterIntakeCalculatorTool() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weightKg, setWeightKg] = useState<number>(70);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [exerciseMins, setExerciseMins] = useState<number>(30);
  const [climate, setClimate] = useState<ClimateType>("temperate");
  const [condition, setCondition] = useState<SpecialCondition>("none");

  const effectiveWeightKg =
    unit === "metric" ? weightKg : Number((weightLbs * 0.45359237).toFixed(1));

  const result: WaterIntakeResult = useMemo(() => {
    return calculateWaterIntake({
      weightKg: effectiveWeightKg || 60,
      exerciseMinutesPerDay: exerciseMins,
      climate,
      condition,
    });
  }, [effectiveWeightKg, exerciseMins, climate, condition]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-teal-600" /> Hydration Factors
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
                Metric (kg)
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
                Imperial (lbs)
              </button>
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Body Weight ({unit === "metric" ? "kg" : "lbs"})
            </label>
            <div className="relative">
              <input
                type="number"
                min="30"
                max="300"
                value={(unit === "metric" ? weightKg : weightLbs) || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (unit === "metric") setWeightKg(val);
                  else setWeightLbs(val);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Daily Exercise */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-teal-600" /> Daily Exercise Duration
              </label>
              <span className="font-mono text-teal-600 font-bold">{exerciseMins} mins / day</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="15"
              value={exerciseMins}
              onChange={(e) => setExerciseMins(parseInt(e.target.value) || 0)}
              className="w-full accent-teal-600"
            />
          </div>

          {/* Climate */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Local Climate / Temperature
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "temperate", label: "Moderate / Mild" },
                { id: "hot", label: "Hot / Humid (+500ml)" },
                { id: "cold", label: "Cold / Dry (+200ml)" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClimate(c.id as ClimateType)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                    climate === c.id
                      ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Special Condition */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Special Physiological Condition
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "none", label: "Standard" },
                { id: "pregnant", label: "Pregnant (+300ml)" },
                { id: "breastfeeding", label: "Nursing (+700ml)" },
              ].map((cond) => (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setCondition(cond.id as SpecialCondition)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                    condition === cond.id
                      ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results & Timeline */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-200 dark:border-teal-900/60 rounded-2xl shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Target Daily Water Intake
            </span>

            <div className="flex items-baseline gap-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono">
                {result.totalLiters}
              </div>
              <span className="text-lg font-bold text-slate-500">Liters / day</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 font-medium">Fluid Ounces</div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  {result.totalOunces} oz
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 font-medium">Standard Glasses (8 oz)</div>
                <div className="text-base font-bold text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                  ~{result.standardGlasses8oz} glasses
                </div>
              </div>
            </div>
          </div>

          {/* Hydration Schedule */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-3">
            <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" /> Recommended Drinking Schedule
            </h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {result.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.timeLabel}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                      {item.amountMl} ml
                    </span>
                    <div className="text-[10px] text-slate-400">({item.amountOz} oz)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Notice */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3 text-xs text-slate-500 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-700 dark:text-slate-300 font-semibold block mb-0.5">
                Not Medical Advice
              </strong>
              Fluid needs vary with metabolic conditions, renal function, heart health, and medications. Individuals on fluid-restricted diets should strictly consult their physician.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
