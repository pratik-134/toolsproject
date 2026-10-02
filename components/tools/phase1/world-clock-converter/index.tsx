"use client";

import React, { useState, useMemo } from "react";
import {
  convertWorldTimes,
  POPULAR_CITIES,
  CityTimezone,
  ConvertedTimeItem,
} from "./logic";
import { CountryFlagIcon } from "./CountryFlagIcon";
import {
  Clock,
  Globe,
  Calendar,
  Copy,
  Check,
  Search,
  Briefcase,
  Moon,
  Sun,
  RotateCcw,
} from "lucide-react";

export default function WorldClockConverterTool() {
  const [baseDate, setBaseDate] = useState<string>("2026-09-25");
  const [baseTime, setBaseTime] = useState<string>("14:00");
  const [baseIana, setBaseIana] = useState<string>("UTC");
  const [use24Hour, setUse24Hour] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const convertedList = useMemo<ConvertedTimeItem[]>(() => {
    return convertWorldTimes(baseDate, baseTime, baseIana, POPULAR_CITIES);
  }, [baseDate, baseTime, baseIana]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return convertedList;
    const q = searchQuery.toLowerCase();
    return convertedList.filter(
      (item) =>
        item.city.city.toLowerCase().includes(q) ||
        item.city.country.toLowerCase().includes(q) ||
        item.city.iana.toLowerCase().includes(q)
    );
  }, [convertedList, searchQuery]);

  const handleSetCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");

    setBaseDate(`${year}-${month}-${day}`);
    setBaseTime(`${hours}:${mins}`);
    setBaseIana(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  };

  const handleCopy = () => {
    const lines = [
      `World Meeting Time Comparison (Base: ${baseTime} on ${baseDate} in ${baseIana})`,
      "----------------------------------------------------------------",
      ...convertedList.map((item) => {
        const time = use24Hour ? item.time24 : item.time12;
        const diff =
          item.hoursDifference >= 0
            ? `+${item.hoursDifference}h`
            : `${item.hoursDifference}h`;
        const biz = item.isBusinessHours ? "[Business Hours]" : "[Outside Hours]";
        return `${item.city.city} (${item.city.country}): ${time} on ${item.dateFormatted} (${diff}) ${biz}`;
      }),
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Base Configuration */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Base Reference Time & Location
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSetCurrentTime}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Clock className="w-3.5 h-3.5" />
              Set to Current Time
            </button>
            <button
              onClick={() => setUse24Hour(!use24Hour)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
            >
              {use24Hour ? "24-Hour" : "12-Hour (AM/PM)"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Base Timezone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reference City / Timezone
            </label>
            <select
              value={baseIana}
              onChange={(e) => setBaseIana(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c.id} value={c.iana}>
                  {c.city} — {c.country} (UTC{c.utcOffset >= 0 ? `+${c.utcOffset}` : c.utcOffset})
                </option>
              ))}
            </select>
          </div>

          {/* Base Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Base Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={baseTime}
              onChange={(e) => setBaseTime(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Search & Actions Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search city, country, or zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied List!" : "Copy Schedule Table"}
          </button>
        </div>
      </div>

      {/* World Times Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item) => {
          const isBase = item.city.iana === baseIana;
          const time = use24Hour ? item.time24 : item.time12;
          const diffStr =
            item.hoursDifference === 0
              ? "Base Time"
              : item.hoursDifference > 0
              ? `+${item.hoursDifference} hrs`
              : `${item.hoursDifference} hrs`;

          return (
            <div
              key={item.city.id}
              className={`p-5 rounded-2xl border transition relative space-y-3 ${
                isBase
                  ? "bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/70 border-blue-300 shadow-sm ring-1 ring-blue-400"
                  : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
              }`}
            >
              {/* City Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CountryFlagIcon
                    countryCode={item.city.id}
                    className="w-6 h-4 rounded-xs shadow-2xs shrink-0 border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {item.city.city}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                      {item.city.country}
                    </p>
                  </div>
                </div>

                {/* Day Delta Badge */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.dayDelta === "Same Day"
                      ? "bg-slate-100 text-slate-600"
                      : item.dayDelta === "+1 Day"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.dayDelta}
                </span>
              </div>

              {/* Time Display */}
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {time}
                </div>
                <div className="text-xs font-semibold text-slate-500 font-mono">
                  {diffStr}
                </div>
              </div>

              {/* Date & Business Hours Status */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                <span className="text-slate-500 font-medium text-[11px]">
                  {item.dateFormatted}
                </span>

                {item.isBusinessHours ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <Sun className="w-3 h-3 text-emerald-500" />
                    Work Hours
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                    <Moon className="w-3 h-3 text-slate-400" />
                    Off Hours
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
