"use client";

import React, { useState } from "react";
import { Calendar, Clock, Plus, Minus, ArrowRight, Copy, Check, Briefcase, Sun } from "lucide-react";
import { calculateDateDifference, addSubtractDate } from "./logic";

export default function DateCalculatorTool() {
  const [activeTab, setActiveTab] = useState<"diff" | "addsub">("diff");

  const todayStr = new Date().toISOString().slice(0, 10);
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Tab 1: Difference
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(nextMonthStr);

  // Tab 2: Add / Subtract
  const [baseDate, setBaseDate] = useState<string>(todayStr);
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [years, setYears] = useState<number>(0);
  const [months, setMonths] = useState<number>(0);
  const [weeks, setWeeks] = useState<number>(0);
  const [days, setDays] = useState<number>(45);

  const [copied, setCopied] = useState<boolean>(false);

  const diffResult = calculateDateDifference(startDate, endDate);
  const addSubResult = addSubtractDate(baseDate, operation, { years, months, weeks, days });

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("diff")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-px ${
            activeTab === "diff"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Duration Between Dates
        </button>
        <button
          onClick={() => setActiveTab("addsub")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-px ${
            activeTab === "addsub"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Add or Subtract Days
        </button>
      </div>

      {activeTab === "diff" && (
        <div className="space-y-6">
          {/* Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <label htmlFor="start-date-input" className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center justify-between">
                <span>Start Date</span>
                <button
                  type="button"
                  onClick={() => setStartDate(todayStr)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Set to Today
                </button>
              </label>
              <input
                id="start-date-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <label htmlFor="end-date-input" className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center justify-between">
                <span>End Date</span>
                <button
                  type="button"
                  onClick={() => setEndDate(todayStr)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Set to Today
                </button>
              </label>
              <input
                id="end-date-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primary Total Days Card */}
            <div className="md:col-span-3 rounded-xl border border-primary/20 bg-primary/[0.03] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Calendar Duration
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-4xl sm:text-5xl font-black text-foreground">
                    {diffResult.totalDays}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">days</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Or {diffResult.years} years, {diffResult.months} months, and {diffResult.days} days
                  {diffResult.isPast && " (in the past)"}.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyText(
                    `${diffResult.totalDays} days (${diffResult.years} years, ${diffResult.months} months, ${diffResult.days} days)`
                  )
                }
                className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Duration"}</span>
              </button>
            </div>

            {/* Weeks & Days */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Weeks Breakdown</span>
              <div className="font-mono text-2xl font-bold text-foreground">
                {diffResult.totalWeeks} wks, {diffResult.remainingDays} days
              </div>
              <span className="text-[11px] text-muted-foreground">
                {diffResult.totalHours.toLocaleString()} total hours
              </span>
            </div>

            {/* Business Days (Mon-Fri) */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Working Days (Mon&ndash;Fri)</span>
              </div>
              <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {diffResult.businessDays} days
              </div>
              <span className="text-[11px] text-muted-foreground">Excludes weekend days</span>
            </div>

            {/* Weekend Days (Sat-Sun) */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Weekend Days (Sat&ndash;Sun)</span>
              </div>
              <div className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
                {diffResult.weekendDays} days
              </div>
              <span className="text-[11px] text-muted-foreground">Saturdays and Sundays</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "addsub" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            {/* Start Date & Operation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="base-date-input" className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
                  Starting Date
                </label>
                <input
                  id="base-date-input"
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
                  Calculation Mode
                </span>
                <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40 w-full">
                  <button
                    type="button"
                    onClick={() => setOperation("add")}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                      operation === "add"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    Add Time (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperation("subtract")}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                      operation === "subtract"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5 text-rose-600" />
                    Subtract Time (&minus;)
                  </button>
                </div>
              </div>
            </div>

            {/* Time Adjustments */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/60">
              <div>
                <label htmlFor="adjust-years" className="block text-xs font-medium text-muted-foreground mb-1">
                  Years
                </label>
                <input
                  id="adjust-years"
                  type="number"
                  min={0}
                  value={years}
                  onChange={(e) => setYears(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary text-center"
                />
              </div>

              <div>
                <label htmlFor="adjust-months" className="block text-xs font-medium text-muted-foreground mb-1">
                  Months
                </label>
                <input
                  id="adjust-months"
                  type="number"
                  min={0}
                  value={months}
                  onChange={(e) => setMonths(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary text-center"
                />
              </div>

              <div>
                <label htmlFor="adjust-weeks" className="block text-xs font-medium text-muted-foreground mb-1">
                  Weeks
                </label>
                <input
                  id="adjust-weeks"
                  type="number"
                  min={0}
                  value={weeks}
                  onChange={(e) => setWeeks(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary text-center"
                />
              </div>

              <div>
                <label htmlFor="adjust-days" className="block text-xs font-medium text-muted-foreground mb-1">
                  Days
                </label>
                <input
                  id="adjust-days"
                  type="number"
                  min={0}
                  value={days}
                  onChange={(e) => setDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary text-center"
                />
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Target Date
              </span>
              <div className="font-headings text-xl sm:text-2xl font-black text-foreground mt-1">
                {addSubResult.formatted}
              </div>
              <span className="font-mono text-xs text-primary font-bold">
                ISO: {addSubResult.resultDate}
              </span>
            </div>

            <button
              type="button"
              onClick={() => copyText(addSubResult.formatted)}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Date"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
