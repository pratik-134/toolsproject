"use client";

import React, { useState, useMemo } from "react";
import { calculateTimeCard, TimeCardEntry, TimeCardConfig, TimeCardResult } from "./logic";
import { Copy, Check, Download, RotateCcw, Clock, DollarSign, Calendar, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INITIAL_DAYS: TimeCardEntry[] = [
  { day: "Monday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
  { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
  { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
  { day: "Thursday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
  { day: "Friday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
  { day: "Saturday", enabled: false, startTime: "09:00", endTime: "17:00", breakMinutes: 0 },
  { day: "Sunday", enabled: false, startTime: "09:00", endTime: "17:00", breakMinutes: 0 },
];

export default function TimeCardCalculatorTool() {
  const [entries, setEntries] = useState<TimeCardEntry[]>(INITIAL_DAYS);
  const [hourlyRate, setHourlyRate] = useState<number>(25);
  const [dailyThreshold, setDailyThreshold] = useState<number>(8);
  const [weeklyThreshold, setWeeklyThreshold] = useState<number>(40);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo<TimeCardResult>(() => {
    return calculateTimeCard(entries, {
      hourlyRate,
      dailyOvertimeThreshold: dailyThreshold,
      weeklyOvertimeThreshold: weeklyThreshold,
      overtimeMultiplier,
    });
  }, [entries, hourlyRate, dailyThreshold, weeklyThreshold, overtimeMultiplier]);

  const updateEntry = (index: number, updates: Partial<TimeCardEntry>) => {
    setEntries((prev) => {
      const copy = [...prev];
      const existing = copy[index];
      if (existing) {
        copy[index] = { ...existing, ...updates };
      }
      return copy;
    });
  };

  const handleCopy = () => {
    const text = [
      "Weekly Time Card Summary",
      `Gross Pay: $${result.grossPay.toFixed(2)}`,
      `Total Hours: ${result.totalHours} hrs`,
      `Regular Hours: ${result.totalRegularHours} hrs ($${result.regularPay.toFixed(2)})`,
      `Overtime Hours: ${result.totalOvertimeHours} hrs ($${result.overtimePay.toFixed(2)})`,
      "\nDaily Breakdown:",
      ...result.days
        .filter((d) => d.enabled)
        .map(
          (d) =>
            `  ${d.day}: ${d.hoursWorked} hrs (Reg: ${d.regularHours}h, OT: ${d.overtimeHours}h)`
        ),
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      "Day,Enabled,Start Time,End Time,Break (Mins),Hours Worked,Regular Hours,Overtime Hours",
      ...entries.map((e, idx) => {
        const d = result.days[idx];
        return `${e.day},${e.enabled ? "Yes" : "No"},${e.startTime},${e.endTime},${e.breakMinutes},${d?.hoursWorked ?? 0},${d?.regularHours ?? 0},${d?.overtimeHours ?? 0}`;
      }),
      "",
      `Total Hours,,,,,${result.totalHours},${result.totalRegularHours},${result.totalOvertimeHours}`,
      `Hourly Rate,$${hourlyRate}/hr`,
      `Regular Pay,$${result.regularPay.toFixed(2)}`,
      `Overtime Pay,$${result.overtimePay.toFixed(2)}`,
      `Gross Total Pay,$${result.grossPay.toFixed(2)}`,
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "timecard_timesheet.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyPreset = (type: "standard" | "overtime" | "parttime") => {
    if (type === "standard") {
      setHourlyRate(25);
      setEntries(INITIAL_DAYS);
    } else if (type === "overtime") {
      setHourlyRate(30);
      setEntries([
        { day: "Monday", enabled: true, startTime: "08:00", endTime: "18:30", breakMinutes: 30 },
        { day: "Tuesday", enabled: true, startTime: "08:00", endTime: "18:30", breakMinutes: 30 },
        { day: "Wednesday", enabled: true, startTime: "08:00", endTime: "18:30", breakMinutes: 30 },
        { day: "Thursday", enabled: true, startTime: "08:00", endTime: "18:30", breakMinutes: 30 },
        { day: "Friday", enabled: true, startTime: "08:00", endTime: "17:00", breakMinutes: 30 },
        { day: "Saturday", enabled: true, startTime: "09:00", endTime: "14:00", breakMinutes: 0 },
        { day: "Sunday", enabled: false, startTime: "09:00", endTime: "17:00", breakMinutes: 0 },
      ]);
    } else if (type === "parttime") {
      setHourlyRate(18);
      setEntries([
        { day: "Monday", enabled: true, startTime: "10:00", endTime: "15:00", breakMinutes: 30 },
        { day: "Tuesday", enabled: false, startTime: "09:00", endTime: "17:00", breakMinutes: 0 },
        { day: "Wednesday", enabled: true, startTime: "10:00", endTime: "15:00", breakMinutes: 30 },
        { day: "Thursday", enabled: false, startTime: "09:00", endTime: "17:00", breakMinutes: 0 },
        { day: "Friday", enabled: true, startTime: "10:00", endTime: "15:00", breakMinutes: 30 },
        { day: "Saturday", enabled: true, startTime: "10:00", endTime: "16:00", breakMinutes: 30 },
        { day: "Sunday", enabled: false, startTime: "09:00", endTime: "17:00", breakMinutes: 0 },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Presets Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Presets:
          </span>
          <button
            onClick={() => applyPreset("standard")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
          >
            Standard 40h (Mon-Fri 9-5)
          </button>
          <button
            onClick={() => applyPreset("overtime")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
          >
            Overtime Heavy (50+ hrs)
          </button>
          <button
            onClick={() => applyPreset("parttime")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
          >
            Part-Time (~20 hrs)
          </button>
        </div>
        <button
          onClick={() => applyPreset("standard")}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-red-600 rounded-lg border border-slate-200 hover:border-red-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Weekly Timecard Entries */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Weekly Shifts (Monday – Sunday)
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Checked days are calculated
            </span>
          </div>

          {/* Time Entry Rows */}
          <div className="space-y-3">
            {entries.map((entry, idx) => {
              const dayCalc = result.days[idx];
              return (
                <div
                  key={entry.day}
                  className={`p-3.5 rounded-xl border transition ${
                    entry.enabled
                      ? "bg-white border-slate-200/90 shadow-xs"
                      : "bg-slate-50/70 border-slate-200/50 opacity-60"
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Day checkbox */}
                    <div className="sm:col-span-3 flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={entry.enabled}
                        onChange={(e) => updateEntry(idx, { enabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-800">{entry.day}</span>
                    </div>

                    {/* Start Time */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        Start
                      </label>
                      <input
                        type="time"
                        disabled={!entry.enabled}
                        value={entry.startTime}
                        onChange={(e) => updateEntry(idx, { startTime: e.target.value })}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      />
                    </div>

                    {/* End Time */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                        End
                      </label>
                      <input
                        type="time"
                        disabled={!entry.enabled}
                        value={entry.endTime}
                        onChange={(e) => updateEntry(idx, { endTime: e.target.value })}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      />
                    </div>

                    {/* Break Minutes & Daily Total */}
                    <div className="sm:col-span-3 flex items-center gap-2">
                      <div className="w-16">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                          Break (m)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          disabled={!entry.enabled}
                          value={entry.breakMinutes}
                          onChange={(e) =>
                            updateEntry(idx, { breakMinutes: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-full px-2 py-1 text-xs font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 text-center"
                        />
                      </div>
                      <div className="flex-1 text-right">
                        <span className="block text-[10px] font-semibold text-slate-400">Total</span>
                        <span className="text-xs font-extrabold text-blue-600">
                          {dayCalc?.hoursWorked.toFixed(1) ?? "0.0"}h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Summary!" : "Copy Timesheet"}
            </button>
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Right 4 Columns: Wage & Overtime Settings + Payroll Summary */}
        <div className="lg:col-span-4 space-y-4">
          {/* Rate & Overtime Settings Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Wage & Overtime Settings
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hourly Base Rate ($/hr)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-7 pr-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Daily OT (&gt; hrs)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={dailyThreshold}
                  onChange={(e) => setDailyThreshold(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Weekly OT (&gt; hrs)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={weeklyThreshold}
                  onChange={(e) => setWeeklyThreshold(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Overtime Multiplier Rate
              </label>
              <Select
                value={String(overtimeMultiplier)}
                onValueChange={(val) => setOvertimeMultiplier(Number(val))}
              >
                <SelectTrigger className="w-full text-xs font-semibold text-slate-900 bg-white border-slate-300">
                  <SelectValue placeholder="Multiplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.5">1.5x (Time and a half)</SelectItem>
                  <SelectItem value="2.0">2.0x (Double time)</SelectItem>
                  <SelectItem value="1.0">1.0x (Straight time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Paycheck Hero Card */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 border border-blue-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              Estimated Gross Pay
            </span>
            <div className="text-3xl font-black text-slate-900">
              ${result.grossPay.toFixed(2)}
            </div>

            <div className="space-y-2 border-t border-slate-200/70 pt-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Hours:</span>
                <span className="font-bold text-slate-900">{result.totalHours} hrs</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Regular Hours ({result.totalRegularHours}h @ ${hourlyRate}):</span>
                <span className="font-semibold text-slate-900">${result.regularPay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Overtime ({result.totalOvertimeHours}h @ ${hourlyRate * overtimeMultiplier}):</span>
                <span className="font-semibold text-emerald-700">
                  ${result.overtimePay.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-2 items-start text-[11px] text-amber-800 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Gross pay estimations exclude state/federal income tax, social security, health insurance, and 401(k) deductions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
