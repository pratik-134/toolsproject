"use client";

import React, { useState } from "react";
import { Copy, Check, Percent, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import {
  calculatePercentOf,
  calculateWhatPercent,
  calculatePercentChange,
  calculateTotalFromPercent,
} from "./logic";

export default function PercentageCalculatorTool() {
  // Calculator 1: What is X% of Y?
  const [c1Percent, setC1Percent] = useState<number>(15);
  const [c1Total, setC1Total] = useState<number>(200);

  // Calculator 2: X is what % of Y?
  const [c2Part, setC2Part] = useState<number>(45);
  const [c2Total, setC2Total] = useState<number>(180);

  // Calculator 3: % Increase/Decrease from X to Y
  const [c3From, setC3From] = useState<number>(120);
  const [c3To, setC3To] = useState<number>(150);

  // Calculator 4: X is P% of what?
  const [c4Part, setC4Part] = useState<number>(30);
  const [c4Percent, setC4Percent] = useState<number>(20);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyVal = async (val: string | number, id: string) => {
    try {
      await navigator.clipboard.writeText(String(val));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const res1 = calculatePercentOf(c1Percent, c1Total);
  const res2 = calculateWhatPercent(c2Part, c2Total);
  const res3 = calculatePercentChange(c3From, c3To);
  const res4 = calculateTotalFromPercent(c4Part, c4Percent);

  const resetAll = () => {
    setC1Percent(15);
    setC1Total(200);
    setC2Part(45);
    setC2Total(180);
    setC3From(120);
    setC3To(150);
    setC4Part(30);
    setC4Percent(20);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Multi-Mode Percentage Engine
        </span>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: What is X% of Y? */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-foreground font-headings font-bold text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
              1
            </span>
            <h3>What is X% of Y?</h3>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium text-xs">What is</span>
            <input
              type="number"
              value={c1Percent}
              onChange={(e) => setC1Percent(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
            />
            <span className="text-muted-foreground font-medium text-xs">% of</span>
            <input
              type="number"
              value={c1Total}
              onChange={(e) => setC1Total(parseFloat(e.target.value) || 0)}
              className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
            />
            <span className="text-muted-foreground font-medium text-xs">?</span>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 flex items-center justify-between border border-border/50">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Result</div>
              <div className="font-mono text-xl font-black text-foreground">{res1.result}</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{res1.formula}</div>
            </div>
            <button
              type="button"
              onClick={() => copyVal(res1.result, "c1")}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Copy result"
            >
              {copiedId === "c1" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Module 2: X is what % of Y? */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-foreground font-headings font-bold text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              2
            </span>
            <h3>X is what % of Y?</h3>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="number"
              value={c2Part}
              onChange={(e) => setC2Part(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
            />
            <span className="text-muted-foreground font-medium text-xs">is what % of</span>
            <input
              type="number"
              value={c2Total}
              onChange={(e) => setC2Total(parseFloat(e.target.value) || 0)}
              className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
            />
            <span className="text-muted-foreground font-medium text-xs">?</span>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 flex items-center justify-between border border-border/50">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Result</div>
              <div className="font-mono text-xl font-black text-foreground">{res2.percent}%</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{res2.formula}</div>
            </div>
            <button
              type="button"
              onClick={() => copyVal(`${res2.percent}%`, "c2")}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Copy result"
            >
              {copiedId === "c2" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Module 3: % Increase / Decrease */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-foreground font-headings font-bold text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold">
              3
            </span>
            <h3>Percentage Change (From X to Y)</h3>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium text-xs">From</span>
            <input
              type="number"
              value={c3From}
              onChange={(e) => setC3From(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
            />
            <span className="text-muted-foreground font-medium text-xs">to</span>
            <input
              type="number"
              value={c3To}
              onChange={(e) => setC3To(parseFloat(e.target.value) || 0)}
              className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
            />
          </div>

          <div className="rounded-lg bg-muted/40 p-3 flex items-center justify-between border border-border/50">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Difference & Change</div>
              <div className="flex items-center gap-2 font-mono text-xl font-black">
                {res3.isIncrease ? (
                  <span className="inline-flex items-center text-emerald-600">
                    <ArrowUpRight className="w-5 h-5 mr-0.5" />
                    +{res3.percentChange}%
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-600">
                    <ArrowDownRight className="w-5 h-5 mr-0.5" />
                    -{res3.percentChange}%
                  </span>
                )}
                <span className="text-xs font-normal text-muted-foreground">
                  ({res3.diff >= 0 ? `+${res3.diff}` : res3.diff})
                </span>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{res3.formula}</div>
            </div>
            <button
              type="button"
              onClick={() => copyVal(`${res3.isIncrease ? "+" : "-"}${res3.percentChange}%`, "c3")}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Copy result"
            >
              {copiedId === "c3" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Module 4: X is P% of what? */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-foreground font-headings font-bold text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
              4
            </span>
            <h3>X is P% of What Number?</h3>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="number"
              value={c4Part}
              onChange={(e) => setC4Part(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
            />
            <span className="text-muted-foreground font-medium text-xs">is</span>
            <input
              type="number"
              value={c4Percent}
              onChange={(e) => setC4Percent(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary text-center font-bold"
            />
            <span className="text-muted-foreground font-medium text-xs">% of what?</span>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 flex items-center justify-between border border-border/50">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Original Whole (100%)</div>
              <div className="font-mono text-xl font-black text-foreground">{res4.total}</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{res4.formula}</div>
            </div>
            <button
              type="button"
              onClick={() => copyVal(res4.total, "c4")}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Copy result"
            >
              {copiedId === "c4" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
