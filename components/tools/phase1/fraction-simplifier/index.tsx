"use client";

import React, { useState, useMemo } from "react";
import {
  simplifyFraction,
  calculateFractionArithmetic,
  SimplifiedFraction,
  ArithmeticResult,
} from "./logic";
import { Copy, Check, RotateCcw, Divide, Plus, Minus, X, ArrowRight, Percent } from "lucide-react";

const PRESETS = [
  { name: "Common Reduction", n1: 24, d1: 36, n2: 1, d2: 2, op: "+" as const },
  { name: "Recipe Halving (12/16)", n1: 12, d1: 16, n2: 1, d2: 2, op: "*" as const },
  { name: "Aspect 1920/1080", n1: 1920, d1: 1080, n2: 16, d2: 9, op: "-" as const },
  { name: "Improper (35/8)", n1: 35, d1: 8, n2: 3, d2: 4, op: "+" as const },
];

export default function FractionSimplifierTool() {
  const [tab, setTab] = useState<"simplify" | "arithmetic">("simplify");
  const [num1, setNum1] = useState<number>(24);
  const [den1, setDen1] = useState<number>(36);
  const [num2, setNum2] = useState<number>(5);
  const [den2, setDen2] = useState<number>(8);
  const [operator, setOperator] = useState<"+" | "-" | "*" | "/">("+");
  const [copied, setCopied] = useState<boolean>(false);

  // Single simplify computation
  const singleResult = useMemo<SimplifiedFraction | null>(() => {
    if (den1 === 0) return null;
    try {
      return simplifyFraction(num1, den1);
    } catch {
      return null;
    }
  }, [num1, den1]);

  // Arithmetic computation
  const arithmeticResult = useMemo<ArithmeticResult | null>(() => {
    if (den1 === 0 || den2 === 0) return null;
    if (operator === "/" && num2 === 0) return null;
    try {
      return calculateFractionArithmetic(operator, num1, den1, num2, den2);
    } catch {
      return null;
    }
  }, [operator, num1, den1, num2, den2]);

  const handleCopy = () => {
    let text = "";
    if (tab === "simplify" && singleResult) {
      text = [
        `Fraction: ${num1}/${den1}`,
        `Simplified: ${singleResult.simplifiedNum}/${singleResult.simplifiedDen}`,
        `GCD: ${singleResult.gcd}`,
        singleResult.mixedNumber
          ? `Mixed Number: ${singleResult.mixedNumber.whole} ${singleResult.mixedNumber.num}/${singleResult.mixedNumber.den}`
          : "Proper Fraction",
        `Decimal: ${singleResult.decimal}`,
        `Percentage: ${singleResult.percentage}%`,
      ].join("\n");
    } else if (tab === "arithmetic" && arithmeticResult) {
      text = [
        `${num1}/${den1} ${operator} ${num2}/${den2} = ${arithmeticResult.result.simplifiedNum}/${arithmeticResult.result.simplifiedDen}`,
        `Decimal: ${arithmeticResult.result.decimal}`,
        ...arithmeticResult.steps.map((s) => `${s.description}: ${s.expression}`),
      ].join("\n");
    }

    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setTab("simplify")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              tab === "simplify"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Simplify Fraction
          </button>
          <button
            onClick={() => setTab("arithmetic")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              tab === "arithmetic"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Fraction Arithmetic (+, -, ×, ÷)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setNum1(p.n1);
                setDen1(p.d1);
                setNum2(p.n2);
                setDen2(p.d2);
                setOperator(p.op);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Fraction Cards */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {tab === "simplify" ? "Enter Fraction" : "Enter Two Fractions"}
          </h2>

          {/* Fraction 1 Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
            <span className="text-xs font-semibold text-slate-500">Numerator</span>
            <input
              type="number"
              value={num1}
              onChange={(e) => setNum1(Number(e.target.value))}
              className="w-28 text-center text-lg font-bold py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            />
            <div className="w-32 h-0.5 bg-slate-400 rounded-full my-1" />
            <span className="text-xs font-semibold text-slate-500">Denominator</span>
            <input
              type="number"
              value={den1}
              onChange={(e) => setDen1(Number(e.target.value))}
              className="w-28 text-center text-lg font-bold py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            />
            {den1 === 0 && (
              <span className="text-xs text-red-500 font-semibold pt-1">
                Denominator cannot be zero
              </span>
            )}
          </div>

          {/* Arithmetic Operator and Fraction 2 */}
          {tab === "arithmetic" && (
            <>
              {/* Operator Selectors */}
              <div className="flex justify-center items-center gap-2">
                {[
                  { op: "+", icon: Plus, label: "Add" },
                  { op: "-", icon: Minus, label: "Subtract" },
                  { op: "*", icon: X, label: "Multiply" },
                  { op: "/", icon: Divide, label: "Divide" },
                ].map(({ op, icon: Icon, label }) => (
                  <button
                    key={op}
                    onClick={() => setOperator(op as any)}
                    className={`p-2.5 rounded-xl border font-bold text-sm flex items-center justify-center transition ${
                      operator === op
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Fraction 2 Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
                <span className="text-xs font-semibold text-slate-500">Numerator</span>
                <input
                  type="number"
                  value={num2}
                  onChange={(e) => setNum2(Number(e.target.value))}
                  className="w-28 text-center text-lg font-bold py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
                <div className="w-32 h-0.5 bg-slate-400 rounded-full my-1" />
                <span className="text-xs font-semibold text-slate-500">Denominator</span>
                <input
                  type="number"
                  value={den2}
                  onChange={(e) => setDen2(Number(e.target.value))}
                  className="w-28 text-center text-lg font-bold py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
                {den2 === 0 && (
                  <span className="text-xs text-red-500 font-semibold pt-1">
                    Denominator cannot be zero
                  </span>
                )}
                {operator === "/" && num2 === 0 && (
                  <span className="text-xs text-red-500 font-semibold pt-1">
                    Cannot divide by zero
                  </span>
                )}
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCopy}
              disabled={tab === "simplify" ? !singleResult : !arithmeticResult}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Result!" : "Copy Result"}
            </button>
            <button
              onClick={() => {
                setNum1(1);
                setDen1(2);
                setNum2(1);
                setDen2(4);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-4">
          {tab === "simplify" && singleResult && (
            <>
              {/* Big Result Visual Hero */}
              <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200/80 rounded-2xl p-6 shadow-xs text-center space-y-3">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Simplified Fraction
                </span>
                <div className="flex items-center justify-center gap-4 text-2xl font-black text-slate-900 py-2">
                  <span className="text-slate-400 font-medium text-lg">
                    {num1}/{den1} =
                  </span>
                  <div className="inline-flex flex-col items-center">
                    <span className="text-blue-600 text-3xl font-extrabold leading-none pb-1">
                      {singleResult.simplifiedNum}
                    </span>
                    <span className="w-full h-1 bg-blue-600 rounded-full my-0.5" />
                    <span className="text-blue-600 text-3xl font-extrabold leading-none pt-1">
                      {singleResult.simplifiedDen}
                    </span>
                  </div>
                  {singleResult.mixedNumber && (
                    <span className="text-slate-600 font-bold text-xl ml-2">
                      = {singleResult.mixedNumber.whole}{" "}
                      <span className="text-base text-blue-700">
                        {singleResult.mixedNumber.num}/{singleResult.mixedNumber.den}
                      </span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Reduced by dividing by Great Common Divisor (GCD = {singleResult.gcd})
                </div>
              </div>

              {/* Conversion Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Decimal</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    {singleResult.decimal}
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Percentage</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    {singleResult.percentage}%
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Type</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {singleResult.isProper ? "Proper" : "Improper"}
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Reciprocal</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {singleResult.reciprocal
                      ? `${singleResult.reciprocal.num}/${singleResult.reciprocal.den}`
                      : "None"}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Explanation */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Reduction Steps
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-semibold text-slate-800">1. Find GCD:</span>
                    <div>
                      The Greatest Common Divisor of {Math.abs(num1)} and {Math.abs(den1)} is{" "}
                      <strong className="text-blue-600">{singleResult.gcd}</strong>.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-semibold text-slate-800">2. Divide Terms:</span>
                    <div>
                      ({num1} ÷ {singleResult.gcd}) / ({den1} ÷ {singleResult.gcd}) ={" "}
                      <strong className="text-blue-600">
                        {singleResult.simplifiedNum} / {singleResult.simplifiedDen}
                      </strong>
                    </div>
                  </div>
                  {singleResult.mixedNumber && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="font-semibold text-slate-800">3. Convert to Mixed Number:</span>
                      <div>
                        {Math.abs(singleResult.simplifiedNum)} ÷ {singleResult.simplifiedDen} ={" "}
                        {Math.abs(singleResult.mixedNumber.whole)} with remainder{" "}
                        {singleResult.mixedNumber.num} →{" "}
                        <strong className="text-blue-600">
                          {singleResult.mixedNumber.whole} {singleResult.mixedNumber.num}/
                          {singleResult.mixedNumber.den}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === "arithmetic" && arithmeticResult && (
            <>
              {/* Arithmetic Result Hero */}
              <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200/80 rounded-2xl p-6 shadow-xs text-center space-y-3">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Arithmetic Result
                </span>
                <div className="flex items-center justify-center gap-3 text-xl font-black text-slate-900 py-2 flex-wrap">
                  <span>
                    {num1}/{den1} {operator} {num2}/{den2} =
                  </span>
                  <div className="inline-flex flex-col items-center">
                    <span className="text-blue-600 text-3xl font-extrabold leading-none pb-1">
                      {arithmeticResult.result.simplifiedNum}
                    </span>
                    <span className="w-full h-1 bg-blue-600 rounded-full my-0.5" />
                    <span className="text-blue-600 text-3xl font-extrabold leading-none pt-1">
                      {arithmeticResult.result.simplifiedDen}
                    </span>
                  </div>
                  {arithmeticResult.result.mixedNumber && (
                    <span className="text-slate-600 font-bold text-xl ml-2">
                      = {arithmeticResult.result.mixedNumber.whole}{" "}
                      <span className="text-base text-blue-700">
                        {arithmeticResult.result.mixedNumber.num}/
                        {arithmeticResult.result.mixedNumber.den}
                      </span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Decimal Value: <strong>{arithmeticResult.result.decimal}</strong> ({arithmeticResult.result.percentage}%)
                </div>
              </div>

              {/* Steps Accordion */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Step-by-Step Solution
                </h3>
                <div className="space-y-2">
                  {arithmeticResult.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1"
                    >
                      <div className="text-xs font-semibold text-slate-800">
                        Step {idx + 1}: {step.description}
                      </div>
                      <div className="font-mono text-xs text-blue-700 bg-white p-2 rounded-lg border border-slate-200">
                        {step.expression}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
