"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock, Copy, Check, Calendar, Globe, Play, Pause, RefreshCw, ArrowRight } from "lucide-react";
import { epochToDate, dateToEpoch, EpochToDateResult, DateToEpochResult } from "./logic";

export default function EpochConverterTool() {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [isLive, setIsLive] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Panel 1: Epoch to Human Date
  const [epochInput, setEpochInput] = useState<string>(String(Math.floor(Date.now() / 1000)));

  // Panel 2: Human Date to Epoch
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().slice(0, 16));

  // Live timer
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const epochResult: EpochToDateResult | null = useMemo(() => {
    try {
      if (!epochInput.trim()) return null;
      return epochToDate(epochInput);
    } catch {
      return null;
    }
  }, [epochInput]);

  const dateResult: DateToEpochResult | null = useMemo(() => {
    try {
      if (!dateInput.trim()) return null;
      return dateToEpoch(dateInput);
    } catch {
      return null;
    }
  }, [dateInput]);

  return (
    <div className="space-y-6">
      {/* Live Current Epoch Hero Bar */}
      <div className="p-5 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/5 border border-teal-200 dark:border-teal-900/60 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-600 text-white shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Current Unix Timestamp
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white">
              {currentEpoch}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            {isLive ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
            {isLive ? "Pause Ticker" : "Resume"}
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(String(currentEpoch), "current-epoch")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
          >
            {copiedKey === "current-epoch" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === "current-epoch" ? "Copied" : "Copy Epoch"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Epoch to Human Date */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" /> Convert Timestamp to Date
            </h3>
            <button
              type="button"
              onClick={() => setEpochInput(String(Math.floor(Date.now() / 1000)))}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              Set to Now
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">
              Unix Epoch (Seconds or Milliseconds)
            </label>
            <div className="relative">
              <input
                type="text"
                value={epochInput}
                onChange={(e) => setEpochInput(e.target.value)}
                placeholder="1700000000"
                className="w-full px-3.5 py-2 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {epochResult ? (
            <div className="space-y-3 pt-2">
              {[
                { label: "UTC (GMT)", value: epochResult.utcString, key: "utc" },
                { label: "Local Time", value: epochResult.localString, key: "local" },
                { label: "ISO 8601", value: epochResult.isoString, key: "iso" },
                { label: "Relative Time", value: epochResult.relativeTime, key: "rel" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                      {item.label}
                    </div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {item.value}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.value, item.key)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors shrink-0"
                    title="Copy"
                  >
                    {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}

              <div className="flex gap-2 text-xs pt-1 text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  Day of Year: <strong className="text-slate-700 dark:text-slate-300">{epochResult.dayOfYear}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  Day: <strong className="text-slate-700 dark:text-slate-300">{epochResult.dayOfWeek}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  Leap Year: <strong className="text-slate-700 dark:text-slate-300">{epochResult.isLeapYear ? "Yes" : "No"}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Please enter a valid numeric epoch timestamp.
            </div>
          )}
        </div>

        {/* Panel 2: Human Date to Epoch */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" /> Convert Date to Timestamp
            </h3>
            <button
              type="button"
              onClick={() => setDateInput(new Date().toISOString().slice(0, 16))}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              Set to Current Date
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">
              Select Calendar Date and Time
            </label>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3.5 py-2 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {dateResult ? (
            <div className="space-y-3 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                      Epoch Seconds (Unix)
                    </div>
                    <div className="text-xl font-mono font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                      {dateResult.epochSeconds}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(dateResult.epochSeconds), "res-sec")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copiedKey === "res-sec" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                      Epoch Milliseconds
                    </div>
                    <div className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {dateResult.epochMilliseconds}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(dateResult.epochMilliseconds), "res-ms")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copiedKey === "res-ms" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-mono space-y-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div>UTC: {dateResult.utcString}</div>
                <div>ISO: {dateResult.isoString}</div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Select a date and time above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
