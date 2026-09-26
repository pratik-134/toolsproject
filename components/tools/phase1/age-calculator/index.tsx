"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Cake, Sparkles, Clock, Compass, CalendarDays } from "lucide-react";
import { calculateAge, AgeCalculationResult } from "./logic";

export default function AgeCalculatorTool() {
  const [birthDate, setBirthDate] = useState<string>("2000-01-01");
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split("T")[0] ?? "2026-09-24"
  );

  const result: AgeCalculationResult | null = useMemo(() => {
    try {
      if (!birthDate || !targetDate) return null;
      return calculateAge(birthDate, targetDate);
    } catch {
      return null;
    }
  }, [birthDate, targetDate]);

  return (
    <div className="space-y-6">
      {/* Date Selectors Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Birth Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Cake className="w-4 h-4 text-teal-600" />
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Age at the Date of */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              Calculate Age As Of
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {result ? (
        <div className="space-y-6">
          {/* Hero Age Result */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-200 dark:border-teal-900/60 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Exact Chronological Age
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {result.years}{" "}
                <span className="text-lg sm:text-xl font-normal text-slate-500">years</span>{" "}
                {result.months}{" "}
                <span className="text-lg sm:text-xl font-normal text-slate-500">months</span>{" "}
                {result.days}{" "}
                <span className="text-lg sm:text-xl font-normal text-slate-500">days</span>
              </div>
              <p className="text-xs text-slate-500">
                Born on a <span className="font-semibold text-slate-700 dark:text-slate-300">{result.dayOfWeekBorn}</span> • Astrological Sign: <span className="font-semibold text-teal-600 dark:text-teal-400">{result.zodiacSign}</span>
              </p>
            </div>

            {/* Next Birthday Pill */}
            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs text-center min-w-[200px]">
              <div className="text-xs text-slate-500 font-medium">Next Birthday In</div>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {result.nextBirthday.daysRemaining} days
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Turning {result.nextBirthday.turnsAge} on {result.nextBirthday.dayOfWeek}
              </div>
            </div>
          </div>

          {/* Life Milestones Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Months", value: result.totalMonths.toLocaleString(), icon: CalendarDays },
              { label: "Total Weeks", value: result.totalWeeks.toLocaleString(), icon: Calendar },
              { label: "Total Days", value: result.totalDays.toLocaleString(), icon: Sparkles },
              { label: "Total Hours", value: result.totalHours.toLocaleString(), icon: Clock },
              { label: "Total Minutes", value: result.totalMinutes.toLocaleString(), icon: Clock },
              { label: "Total Seconds", value: result.totalSeconds.toLocaleString(), icon: Compass },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-center space-y-1"
              >
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                  {stat.label}
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm">
          Please select a valid birth date to calculate your age.
        </div>
      )}
    </div>
  );
}
