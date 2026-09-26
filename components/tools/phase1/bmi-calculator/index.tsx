"use client";

import React, { useState } from "react";
import { Activity, AlertCircle, Heart, Scale } from "lucide-react";
import {
  calculateMetricBmi,
  calculateImperialBmi,
  UnitSystem,
} from "./logic";

export default function BmiCalculatorTool() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  // Metric states
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);

  // Imperial states
  const [weightLbs, setWeightLbs] = useState<number>(160);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);

  const result =
    unitSystem === "metric"
      ? calculateMetricBmi(weightKg, heightCm)
      : calculateImperialBmi(weightLbs, heightFeet, heightInches);

  // Percent along the visual BMI scale (range 15 to 40)
  const clampedBmi = Math.min(40, Math.max(15, result.bmi));
  const scalePercent = ((clampedBmi - 15) / (40 - 15)) * 100;

  return (
    <div className="space-y-6">
      {/* Unit Selector */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Measurement Standard:
          </span>
        </div>
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
          <button
            type="button"
            onClick={() => setUnitSystem("metric")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              unitSystem === "metric"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Metric (kg / cm)
          </button>
          <button
            type="button"
            onClick={() => setUnitSystem("imperial")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              unitSystem === "imperial"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Imperial (lbs / ft &middot; in)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Parameters Panel */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <h2 className="font-headings font-bold text-sm text-foreground">
            Your Measurements
          </h2>

          {unitSystem === "metric" ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <label htmlFor="height-cm" className="text-muted-foreground">Height (cm)</label>
                  <span className="font-mono font-bold text-foreground">{heightCm} cm</span>
                </div>
                <input
                  id="height-cm"
                  type="range"
                  min={100}
                  max={230}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <label htmlFor="weight-kg" className="text-muted-foreground">Weight (kg)</label>
                  <span className="font-mono font-bold text-foreground">{weightKg} kg</span>
                </div>
                <input
                  id="weight-kg"
                  type="range"
                  min={30}
                  max={180}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="height-feet" className="block text-xs font-medium text-muted-foreground mb-1">
                    Height (Feet)
                  </label>
                  <input
                    id="height-feet"
                    type="number"
                    min={3}
                    max={7}
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="height-inches" className="block text-xs font-medium text-muted-foreground mb-1">
                    Height (Inches)
                  </label>
                  <input
                    id="height-inches"
                    type="number"
                    min={0}
                    max={11}
                    value={heightInches}
                    onChange={(e) => setHeightInches(Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <label htmlFor="weight-lbs" className="text-muted-foreground">Weight (lbs)</label>
                  <span className="font-mono font-bold text-foreground">{weightLbs} lbs</span>
                </div>
                <input
                  id="weight-lbs"
                  type="range"
                  min={60}
                  max={400}
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          )}

          {/* Quick preset examples */}
          <div className="pt-3 border-t border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
              Quick Reference Profiles:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setUnitSystem("metric");
                  setHeightCm(170);
                  setWeightKg(65);
                }}
                className="px-2.5 py-1 text-xs rounded border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                170cm / 65kg
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnitSystem("metric");
                  setHeightCm(180);
                  setWeightKg(75);
                }}
                className="px-2.5 py-1 text-xs rounded border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                180cm / 75kg
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnitSystem("imperial");
                  setHeightFeet(5);
                  setHeightInches(10);
                  setWeightLbs(160);
                }}
                className="px-2.5 py-1 text-xs rounded border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                5&apos;10&quot; / 160lbs
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-headings font-bold text-sm text-foreground">
              Body Mass Index Score
            </h2>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${result.category.colorClass}`}>
              {result.category.category}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-mono text-5xl font-black text-foreground">
              {result.bmi}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              kg/m² &middot; BMI Prime: {result.prime}
            </span>
          </div>

          {/* Visual BMI Scale Spectrum */}
          <div className="space-y-1.5">
            <div className="relative h-3 w-full rounded-full overflow-hidden flex bg-muted">
              {/* Underweight: < 18.5 */}
              <div className="h-full bg-cyan-500" style={{ width: "14%" }} title="Underweight (< 18.5)" />
              {/* Normal: 18.5 - 24.9 */}
              <div className="h-full bg-emerald-500" style={{ width: "26%" }} title="Normal (18.5 - 24.9)" />
              {/* Overweight: 25 - 29.9 */}
              <div className="h-full bg-amber-500" style={{ width: "20%" }} title="Overweight (25 - 29.9)" />
              {/* Obese I: 30 - 34.9 */}
              <div className="h-full bg-orange-500" style={{ width: "20%" }} title="Obese I (30 - 34.9)" />
              {/* Obese II+: >= 35 */}
              <div className="h-full bg-rose-500" style={{ width: "20%" }} title="Obese II+ (≥ 35)" />
            </div>

            {/* Position Indicator Needle */}
            <div className="relative w-full h-4">
              <div
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                style={{ left: `${scalePercent}%` }}
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-foreground" />
                <span className="text-[10px] font-mono font-bold text-foreground">
                  {result.bmi}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-0.5">
              <span>16 (Thin)</span>
              <span>18.5</span>
              <span>25.0</span>
              <span>30.0</span>
              <span>40 (Obese)</span>
            </div>
          </div>

          {/* Healthy Weight Range Target */}
          <div className="rounded-lg bg-muted/40 p-3.5 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Heart className="w-3.5 h-3.5 text-emerald-600" />
              <span>Healthy Weight Target Range</span>
            </div>
            <p className="text-xs text-muted-foreground">
              For your height, normal WHO range is{" "}
              <strong className="text-foreground font-semibold">
                {result.healthyWeightMin} &ndash; {result.healthyWeightMax}{" "}
                {unitSystem === "metric" ? "kg" : "lbs"}
              </strong>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
