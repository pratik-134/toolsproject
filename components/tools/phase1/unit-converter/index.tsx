"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Copy, Check, Scale, Ruler, Thermometer, HardDrive, Square, Gauge } from "lucide-react";
import {
  UNIT_CATEGORIES,
  UnitCategory,
  convertUnit,
  getAllConversionsForCategory,
} from "./logic";

const CATEGORY_ICONS: Record<UnitCategory, React.ElementType> = {
  length: Ruler,
  mass: Scale,
  temperature: Thermometer,
  data: HardDrive,
  area: Square,
  speed: Gauge,
};

export default function UnitConverterTool() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [val, setVal] = useState<number>(100);

  const currentCat = UNIT_CATEGORIES[category];
  const unitKeys = Object.keys(currentCat.units);

  const [fromUnit, setFromUnit] = useState<string>(unitKeys[0] ?? "m");
  const [toUnit, setToUnit] = useState<string>(unitKeys[1] ?? "km");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const convertedValue = convertUnit(val, category, fromUnit, toUnit);
  const allConversions = getAllConversionsForCategory(val, category, fromUnit);

  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    const keys = Object.keys(UNIT_CATEGORIES[cat].units);
    setFromUnit(keys[0] ?? "");
    setToUnit(keys[1] ?? keys[0] ?? "");
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const copyVal = async (text: string | number, id: string) => {
    try {
      await navigator.clipboard.writeText(String(text));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-b border-border pb-3">
        {(Object.keys(UNIT_CATEGORIES) as UnitCategory[]).map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const isSelected = category === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{UNIT_CATEGORIES[cat].name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Conversion Card */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
          {/* From Input & Dropdown */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              From
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={val}
                onChange={(e) => setVal(parseFloat(e.target.value) || 0)}
                className="w-1/2 rounded-lg border border-border bg-background px-3 py-2 font-mono text-base font-bold focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {unitKeys.map((k) => (
                  <option key={k} value={k}>
                    {currentCat.units[k]?.name} ({currentCat.units[k]?.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="sm:col-span-1 flex justify-center pt-5 sm:pt-4">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Swap units"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Input & Dropdown */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              To
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={convertedValue}
                className="w-1/2 rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-base font-bold focus:outline-none text-foreground select-all"
              />
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {unitKeys.map((k) => (
                  <option key={k} value={k}>
                    {currentCat.units[k]?.name} ({currentCat.units[k]?.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Primary Calculation Highlight Box */}
        <div className="rounded-lg bg-primary/[0.03] border border-primary/20 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-medium">Conversion Result</div>
            <div className="font-headings text-xl sm:text-2xl font-black text-foreground mt-0.5">
              {val} {currentCat.units[fromUnit]?.symbol} = {convertedValue}{" "}
              {currentCat.units[toUnit]?.symbol}
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyVal(convertedValue, "main")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
          >
            {copiedId === "main" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === "main" ? "Copied" : "Copy Result"}</span>
          </button>
        </div>
      </div>

      {/* Live All-Conversions Matrix */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-headings font-bold text-xs uppercase tracking-wider text-muted-foreground">
          All {currentCat.name} Conversions for {val} {currentCat.units[fromUnit]?.symbol}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allConversions.map((u) => {
            const isCurrent = u.id === fromUnit;
            return (
              <div
                key={u.id}
                onClick={() => copyVal(u.value, u.id)}
                className={`group p-3 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? "border-primary/40 bg-primary/[0.02]"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                }`}
                title="Click to copy value"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{u.name}</span>
                  <span className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                    {u.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-foreground truncate">
                    {u.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedId === u.id ? (
                      <Check className="w-3 h-3 text-green-600 inline" />
                    ) : (
                      "Copy"
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
