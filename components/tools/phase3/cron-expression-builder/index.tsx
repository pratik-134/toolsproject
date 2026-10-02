"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Clock, Sparkles, Terminal, Calendar, Info, RefreshCw } from "lucide-react";

interface CronPreset {
  label: string;
  cron: string;
  description: string;
}

const PRESETS: CronPreset[] = [
  { label: "Every 5 Minutes", cron: "*/5 * * * *", description: "Runs every 5 minutes" },
  { label: "Every 15 Minutes", cron: "*/15 * * * *", description: "Runs every 15 minutes" },
  { label: "Hourly at Minute 0", cron: "0 * * * *", description: "Runs every hour at the top of the hour" },
  { label: "Daily at Midnight", cron: "0 0 * * *", description: "Runs every night at 00:00 UTC/Local" },
  { label: "Daily at 08:00 AM", cron: "0 8 * * *", description: "Runs once per day at 8:00 AM" },
  { label: "Weekdays (Mon-Fri) at 09:00", cron: "0 9 * * 1-5", description: "Runs Monday through Friday at 9:00 AM" },
  { label: "Every Sunday at 02:00 AM", cron: "0 2 * * 0", description: "Weekly maintenance backup every Sunday night" },
  { label: "1st of Month at Midnight", cron: "0 0 1 * *", description: "Monthly report generation on day 1" },
];

export default function CronExpressionBuilder() {
  const [cronExpression, setCronExpression] = useState("0 9 * * 1-5");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Parse 5-part cron: minute hour day-of-month month day-of-week
  const parts = useMemo(() => {
    const tokens = cronExpression.trim().split(/\s+/);
    return {
      minute: tokens[0] || "*",
      hour: tokens[1] || "*",
      dom: tokens[2] || "*",
      month: tokens[3] || "*",
      dow: tokens[4] || "*",
      isValid: tokens.length === 5,
    };
  }, [cronExpression]);

  // Translate cron to plain English human explanation
  const humanExplanation = useMemo(() => {
    if (!parts.isValid) return "Invalid cron expression (must contain exactly 5 space-separated parts).";

    const { minute, hour, dom, month, dow } = parts;

    let timeDesc = "";
    if (minute === "*" && hour === "*") {
      timeDesc = "every minute";
    } else if (minute.startsWith("*/")) {
      timeDesc = `every ${minute.replace("*/", "")} minutes`;
    } else if (minute === "0" && hour === "*") {
      timeDesc = "every hour on the hour";
    } else if (hour !== "*" && minute !== "*") {
      const h = parseInt(hour, 10);
      const m = parseInt(minute, 10);
      if (!isNaN(h) && !isNaN(m)) {
        const ampm = h >= 12 ? "PM" : "AM";
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayM = m < 10 ? `0${m}` : m;
        timeDesc = `at ${displayH}:${displayM} ${ampm}`;
      } else {
        timeDesc = `at minute ${minute} of hour ${hour}`;
      }
    } else if (hour === "*") {
      timeDesc = `at minute ${minute} of every hour`;
    } else {
      timeDesc = `during hour ${hour}`;
    }

    let dayDesc = "";
    if (dow === "*" && dom === "*") {
      dayDesc = "every day";
    } else if (dow === "1-5") {
      dayDesc = "on every weekday (Monday through Friday)";
    } else if (dow === "0,6" || dow === "6,0") {
      dayDesc = "on weekends (Saturday & Sunday)";
    } else if (dow !== "*") {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dIndex = parseInt(dow, 10);
      if (!isNaN(dIndex) && dIndex >= 0 && dIndex <= 6) {
        dayDesc = `every ${dayNames[dIndex]}`;
      } else {
        dayDesc = `on day-of-week ${dow}`;
      }
    }

    if (dom !== "*") {
      dayDesc += ` on day ${dom} of the month`;
    }

    let monthDesc = "";
    if (month !== "*") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const mIndex = parseInt(month, 10) - 1;
      monthDesc = ` in ${monthNames[mIndex] || `month ${month}`}`;
    }

    return `Runs ${timeDesc} ${dayDesc}${monthDesc}.`;
  }, [parts]);

  // Compute next 5 simulated runs
  const nextRuns = useMemo(() => {
    if (!parts.isValid) return [];
    const runs: string[] = [];
    const now = new Date();
    
    // Quick deterministic forward projection for standard patterns
    for (let i = 1; i <= 5; i++) {
      const future = new Date(now.getTime() + i * 3600 * 1000 * (parts.hour === "*" ? 1 : 24));
      runs.push(
        future.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
    return runs;
  }, [parts]);

  const handleCopy = (text: string, formatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatId);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="space-y-6 font-body text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-blue-950 dark:text-blue-100">
              Interactive In-Browser Cron Schedule Studio
            </div>
            <div className="text-xs text-blue-800/80 dark:text-blue-300">
              Translate, validate, and preview cron schedule expressions with zero server roundtrips.
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Expression Box */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Cron Expression (5 Parts)
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="* * * * *"
              className="w-full font-mono text-xl sm:text-2xl font-bold tracking-widest px-4 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
            <button
              type="button"
              onClick={() => handleCopy(cronExpression, "raw")}
              className="absolute right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copiedFormat === "raw" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormat === "raw" ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Breakdown of Cron Segments */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{parts.minute}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">Minute (0-59)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{parts.hour}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">Hour (0-23)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{parts.dom}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">Day of Month (1-31)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{parts.month}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">Month (1-12)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{parts.dow}</div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">Day of Week (0-6 Sun-Sat)</div>
          </div>
        </div>

        {/* Human Meaning Badge */}
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Plain-English Meaning
            </div>
            <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100 mt-0.5">
              “{humanExplanation}”
            </p>
          </div>
        </div>
      </div>

      {/* Preset Quick-Select Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Standard Cron Schedule Presets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.cron}
              type="button"
              onClick={() => setCronExpression(p.cron)}
              className={`p-3 rounded-xl border text-left transition-all ${
                cronExpression === p.cron
                  ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.label}</span>
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{p.cron}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Code Snippet Integrations */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-blue-500" />
          <span>Ready-To-Use Code Formats</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* GitHub Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">GitHub Actions Workflow</span>
              <button
                type="button"
                onClick={() => handleCopy(`on:\n  schedule:\n    - cron: '${cronExpression}'`, "gh")}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                {copiedFormat === "gh" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFormat === "gh" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`on:
  schedule:
    - cron: '${cronExpression}'`}
            </pre>
          </div>

          {/* Linux Crontab */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Linux Crontab Entry</span>
              <button
                type="button"
                onClick={() => handleCopy(`${cronExpression} /usr/bin/python3 /opt/scripts/job.py`, "cron")}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                {copiedFormat === "cron" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFormat === "cron" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`${cronExpression} /usr/bin/python3 /opt/scripts/job.py`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
