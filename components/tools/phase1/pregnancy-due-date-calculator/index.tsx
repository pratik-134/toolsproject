"use client";

import React, { useState, useMemo } from "react";
import {
  calculatePregnancy,
  PregnancyInput,
  CalculationMethod,
  IvfType,
} from "./logic";
import {
  Copy,
  Check,
  Download,
  Calendar,
  Baby,
  Clock,
  CheckCircle2,
  Circle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

function getRelativeDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PregnancyDueDateCalculatorTool() {
  const [method, setMethod] = useState<CalculationMethod>("lmp");
  const [refDate, setRefDate] = useState<string>(() => getRelativeDateStr(56)); // ~8 weeks ago
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [ivfType, setIvfType] = useState<IvfType>("day5");
  const [scanWeeks, setScanWeeks] = useState<number>(10);
  const [scanDays, setScanDays] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const input: PregnancyInput = useMemo(
    () => ({
      method,
      referenceDate: refDate,
      cycleLengthDays: cycleLength,
      ivfType,
      ultrasoundWeeks: scanWeeks,
      ultrasoundDays: scanDays,
    }),
    [method, refDate, cycleLength, ivfType, scanWeeks, scanDays]
  );

  const result = useMemo(() => {
    try {
      return calculatePregnancy(input);
    } catch {
      return null;
    }
  }, [input]);

  const handleCopy = () => {
    if (!result) return;
    const summary = [
      "Pregnancy Due Date & Gestational Timeline",
      `Estimated Due Date: ${result.formattedDueDate}`,
      `Current Gestational Age: ${result.currentWeeks} Weeks, ${result.currentDays} Days`,
      `Current Trimester: ${result.trimesterLabel}`,
      `Days Remaining: ${result.daysRemaining} Days (${result.percentComplete}% complete)`,
      `Estimated Conception: ${result.estimatedConceptionDate}`,
      "",
      "Key Milestones:",
      ...result.milestones.map(
        (m) => `- Week ${m.week} (${m.label}): ${m.date} [${m.isCompleted ? "Completed" : "Upcoming"}]`
      ),
    ].join("\n");

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!result) return;
    const rows = [
      "Milestone Week,Milestone Name,Estimated Date,Status,Description",
      ...result.milestones.map(
        (m) =>
          `Week ${m.week},"${m.label}",${m.date},${m.isCompleted ? "Completed" : "Upcoming"},"${m.description}"`
      ),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pregnancy_timeline_milestones.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
            Quick Timeline Presets:
          </span>
          <button
            onClick={() => {
              setMethod("lmp");
              setRefDate(getRelativeDateStr(42)); // 6 weeks
              setCycleLength(28);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
          >
            Early 1st Trimester (6 Wks)
          </button>
          <button
            onClick={() => {
              setMethod("lmp");
              setRefDate(getRelativeDateStr(126)); // 18 weeks
              setCycleLength(28);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
          >
            Mid 2nd Trimester (18 Wks)
          </button>
          <button
            onClick={() => {
              setMethod("lmp");
              setRefDate(getRelativeDateStr(210)); // 30 weeks
              setCycleLength(28);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
          >
            3rd Trimester (30 Wks)
          </button>
          <button
            onClick={() => {
              setMethod("ivf");
              setIvfType("day5");
              setRefDate(getRelativeDateStr(50));
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition"
          >
            IVF Day 5 Blastocyst
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" />
            Calculation Method
          </h2>

          {/* Method Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMethod("lmp")}
              className={`py-1.5 rounded-lg transition ${
                method === "lmp" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              First Day of LMP
            </button>
            <button
              type="button"
              onClick={() => setMethod("conception")}
              className={`py-1.5 rounded-lg transition ${
                method === "conception"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Conception Date
            </button>
            <button
              type="button"
              onClick={() => setMethod("ivf")}
              className={`py-1.5 rounded-lg transition ${
                method === "ivf" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              IVF Transfer
            </button>
            <button
              type="button"
              onClick={() => setMethod("ultrasound")}
              className={`py-1.5 rounded-lg transition ${
                method === "ultrasound"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ultrasound Scan
            </button>
          </div>

          {/* Reference Date Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {method === "lmp" && "First Day of Last Period (LMP)"}
              {method === "conception" && "Estimated Conception Date"}
              {method === "ivf" && "Embryo Transfer Date"}
              {method === "ultrasound" && "Ultrasound Scan Date"}
            </label>
            <input
              type="date"
              value={refDate}
              onChange={(e) => setRefDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            />
          </div>

          {/* Method-specific controls */}
          {method === "lmp" && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Average Menstrual Cycle</label>
                <span className="text-xs font-bold text-rose-600 font-mono">{cycleLength} Days</span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Standard cycle is 28 days. Deviations automatically adjust Naegele&apos;s formula.
              </p>
            </div>
          )}

          {method === "ivf" && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Embryo Transfer Type
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIvfType("day3")}
                  className={`py-1.5 rounded-lg transition ${
                    ivfType === "day3"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Day 3 Embryo
                </button>
                <button
                  type="button"
                  onClick={() => setIvfType("day5")}
                  className={`py-1.5 rounded-lg transition ${
                    ivfType === "day5"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Day 5 Blastocyst
                </button>
              </div>
            </div>
          )}

          {method === "ultrasound" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Weeks at Scan</label>
                <input
                  type="number"
                  min="4"
                  max="40"
                  value={scanWeeks}
                  onChange={(e) => setScanWeeks(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Days at Scan</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={scanDays}
                  onChange={(e) => setScanDays(Math.max(0, Math.min(6, Number(e.target.value))))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Results & Timeline */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* Due Date Hero Card */}
              <div className="bg-gradient-to-br from-rose-50 via-pink-50/50 to-slate-50 border border-rose-200/80 rounded-2xl p-6 shadow-xs relative">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-rose-600" />
                    Estimated Due Date (EDD)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                      title="Copy Summary"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownloadCsv}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                      title="Export CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      CSV
                    </button>
                  </div>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {result.formattedDueDate}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    <Clock className="w-3.5 h-3.5" />
                    {result.daysRemaining} days to go
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Currently: <strong>{result.currentWeeks} Weeks, {result.currentDays} Days</strong>
                  </span>
                </div>

                {/* Trimester Progress Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span className="text-rose-700 font-bold">{result.trimesterLabel}</span>
                    <span>{result.percentComplete}% Complete</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
                      style={{ width: `${result.percentComplete}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center pt-1">
                    <div className={result.currentTrimester >= 1 ? "text-rose-600" : ""}>
                      1st Trimester (W1-13)
                    </div>
                    <div className={result.currentTrimester >= 2 ? "text-rose-600" : ""}>
                      2nd Trimester (W14-27)
                    </div>
                    <div className={result.currentTrimester >= 3 ? "text-rose-600" : ""}>
                      3rd Trimester (W28-40)
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Development & Clinical Milestones
                </h3>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {result.milestones.map((m) => (
                    <div
                      key={m.week}
                      className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                        m.isCompleted
                          ? "bg-emerald-50/40 border-emerald-200/70"
                          : "bg-slate-50/60 border-slate-200"
                      }`}
                    >
                      {m.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-baseline gap-1">
                          <span className="text-xs font-bold text-slate-900">
                            Week {m.week}: {m.label}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 font-mono">
                            {m.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl">
              Please enter a valid reference date.
            </div>
          )}

          {/* Statutory Medical Disclaimer */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl flex gap-2 items-start text-[11px] text-amber-800 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Medical Disclaimer:</strong> Only about 4% to 5% of babies are born on their exact estimated due date. Most healthy deliveries occur anywhere between 37 and 42 weeks. This calculator provides educational estimates based on standard clinical algorithms. Always follow your obstetrician or midwife&apos;s guidance.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
