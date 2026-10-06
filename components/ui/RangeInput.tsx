"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RangeInputProps {
  id?: string;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  displayValue?: string | number;
  valueDisplay?: string | number;
  onChange: (value: number) => void;
  minLabel?: string;
  midLabel?: string;
  maxLabel?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  accentColor?: "blue" | "emerald" | "purple";
}

export const RangeInput: React.FC<RangeInputProps> = ({
  id,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  displayValue,
  valueDisplay,
  onChange,
  minLabel,
  midLabel,
  maxLabel,
  helperText,
  disabled = false,
  className = "",
  accentColor = "blue",
}) => {
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min || 1)) * 100)
  );

  const formattedDisplay =
    valueDisplay !== undefined
      ? valueDisplay
      : displayValue !== undefined
      ? displayValue
      : `${value}${unit ? ` ${unit}` : ""}`;

  return (
    <div className={cn("w-full space-y-1.5 font-body", className)}>
      {(label || formattedDisplay) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
          {label && <label htmlFor={id}>{label}</label>}
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-900/60 px-2 py-0.5 rounded-md">
            {formattedDisplay}
          </span>
        </div>
      )}

      <div className="relative flex items-center py-1">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, var(--border-slate, #E2E8F0) ${percentage}%, var(--border-slate, #E2E8F0) 100%)`,
          }}
          className={cn(
            "w-full h-2 rounded-full appearance-none cursor-pointer transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "range-input"
          )}
        />
      </div>

      {(minLabel || maxLabel || midLabel || helperText) && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none pt-0.5">
          {minLabel ? <span>{minLabel}</span> : helperText ? <span>{helperText}</span> : <span />}
          {midLabel && <span>{midLabel}</span>}
          {maxLabel ? <span>{maxLabel}</span> : <span />}
        </div>
      )}
    </div>
  );
};
