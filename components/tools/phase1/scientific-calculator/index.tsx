"use client";

import React, { useState, useMemo } from "react";
import { Calculator, Delete, RotateCcw, History, ArrowRight } from "lucide-react";
import { evaluateExpression, AngleMode } from "./logic";

interface HistoryItem {
  expr: string;
  result: number;
}

export default function ScientificCalculatorTool() {
  const [expression, setExpression] = useState<string>("sin(30) + sqrt(16)");
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");
  const [history, setHistory] = useState<HistoryItem[]>([
    { expr: "sqrt(144) + 5!", result: 132 },
    { expr: "2 ^ 8", result: 256 },
  ]);

  const { liveResult, error } = useMemo(() => {
    if (!expression.trim()) return { liveResult: 0, error: null };
    try {
      const res = evaluateExpression(expression, angleMode);
      return { liveResult: res, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Calculation error";
      return { liveResult: null, error: msg };
    }
  }, [expression, angleMode]);

  const handleAppend = (token: string) => {
    setExpression((prev) => prev + token);
  };

  const handleClear = () => {
    setExpression("");
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleEquals = () => {
    if (liveResult !== null && !error) {
      setHistory((prev) => [{ expr: expression, result: liveResult }, ...prev.slice(0, 9)]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Calculator Body */}
        <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          {/* Display Screen */}
          <div className="p-4 bg-slate-900 text-white rounded-xl font-mono space-y-1 shadow-inner">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="uppercase tracking-wider font-semibold text-teal-400">
                Mode: {angleMode}
              </span>
              <span className="text-[11px] truncate max-w-[200px]">{expression || "0"}</span>
            </div>
            <div className="text-right text-3xl sm:text-4xl font-extrabold tracking-tight truncate pt-2">
              {error ? (
                <span className="text-red-400 text-lg font-normal">{error}</span>
              ) : (
                liveResult !== null ? liveResult.toLocaleString() : "0"
              )}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="space-y-2 pt-2">
            {/* Top Scientific Controls */}
            <div className="grid grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => setAngleMode(angleMode === "deg" ? "rad" : "deg")}
                className="py-2 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
              >
                {angleMode.toUpperCase()}
              </button>
              <button
                type="button"
                onClick={() => handleAppend("sin(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                sin
              </button>
              <button
                type="button"
                onClick={() => handleAppend("cos(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                cos
              </button>
              <button
                type="button"
                onClick={() => handleAppend("tan(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                tan
              </button>
              <button
                type="button"
                onClick={() => handleAppend("pi")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                π
              </button>
              <button
                type="button"
                onClick={() => handleAppend("e")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                e
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleAppend("asin(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                asin
              </button>
              <button
                type="button"
                onClick={() => handleAppend("acos(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                acos
              </button>
              <button
                type="button"
                onClick={() => handleAppend("atan(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                atan
              </button>
              <button
                type="button"
                onClick={() => handleAppend("sqrt(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                √x
              </button>
              <button
                type="button"
                onClick={() => handleAppend("^")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                x^y
              </button>
              <button
                type="button"
                onClick={() => handleAppend("!")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                n!
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleAppend("ln(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                ln
              </button>
              <button
                type="button"
                onClick={() => handleAppend("log(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                log10
              </button>
              <button
                type="button"
                onClick={() => handleAppend("(")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                (
              </button>
              <button
                type="button"
                onClick={() => handleAppend(")")}
                className="py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                )
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-2 text-xs font-medium rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center"
              >
                <Delete className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="py-2 text-xs font-bold rounded-lg bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
              >
                AC
              </button>
            </div>

            {/* Main Numeric Keypad */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {["7", "8", "9", "/"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleAppend(k)}
                  className={`py-3 text-base font-semibold rounded-xl transition-colors ${
                    k === "/"
                      ? "bg-slate-200 dark:bg-slate-700 text-teal-600 dark:text-teal-400"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {k === "/" ? "÷" : k}
                </button>
              ))}

              {["4", "5", "6", "*"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleAppend(k)}
                  className={`py-3 text-base font-semibold rounded-xl transition-colors ${
                    k === "*"
                      ? "bg-slate-200 dark:bg-slate-700 text-teal-600 dark:text-teal-400"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {k === "*" ? "×" : k}
                </button>
              ))}

              {["1", "2", "3", "-"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleAppend(k)}
                  className={`py-3 text-base font-semibold rounded-xl transition-colors ${
                    k === "-"
                      ? "bg-slate-200 dark:bg-slate-700 text-teal-600 dark:text-teal-400"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {k}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleAppend("0")}
                className="py-3 text-base font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleAppend(".")}
                className="py-3 text-base font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                .
              </button>
              <button
                type="button"
                onClick={handleEquals}
                className="py-3 text-base font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
              >
                =
              </button>
              <button
                type="button"
                onClick={() => handleAppend("+")}
                className="py-3 text-base font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-teal-600 dark:text-teal-400"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Right: History & Scientific Help */}
        <div className="lg:col-span-4 space-y-4">
          {/* History */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-teal-600" /> Calculation History
              </h4>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No previous calculations recorded yet.
                </div>
              ) : (
                history.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setExpression(h.expr)}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors text-xs font-mono space-y-0.5"
                  >
                    <div className="text-slate-400 truncate">{h.expr}</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      = {h.result.toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quick Syntax Tips */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 space-y-1.5">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Keyboard Supported
            </div>
            <p className="text-[11px] leading-relaxed">
              Type expressions directly using your keyboard: <code className="text-teal-600">sin(45)</code>, <code className="text-teal-600">sqrt(16)</code>, <code className="text-teal-600">5!</code>, <code className="text-teal-600">2^8</code>, or <code className="text-teal-600">pi * 4</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
