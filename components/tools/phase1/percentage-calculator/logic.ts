/**
 * Pure 4-Way Percentage Calculator Logic
 * Zero dependencies, client-side execution.
 */

export interface PercentOfResult {
  result: number;
  formula: string;
}

export interface WhatPercentResult {
  percent: number;
  formula: string;
}

export interface PercentChangeResult {
  percentChange: number;
  diff: number;
  isIncrease: boolean;
  formula: string;
}

export interface TotalFromResult {
  total: number;
  formula: string;
}

function roundTo(num: number, decimals = 4): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * 1. What is X% of Y?
 * Formula: (X / 100) * Y
 */
export function calculatePercentOf(percent: number, total: number): PercentOfResult {
  if (isNaN(percent) || isNaN(total)) {
    return { result: 0, formula: "Invalid input" };
  }
  const result = roundTo((percent / 100) * total);
  return {
    result,
    formula: `(${percent} ÷ 100) × ${total} = ${result}`,
  };
}

/**
 * 2. X is what percent of Y?
 * Formula: (X / Y) * 100
 */
export function calculateWhatPercent(part: number, total: number): WhatPercentResult {
  if (isNaN(part) || isNaN(total) || total === 0) {
    return { percent: 0, formula: total === 0 ? "Cannot divide by zero" : "Invalid input" };
  }
  const percent = roundTo((part / total) * 100);
  return {
    percent,
    formula: `(${part} ÷ ${total}) × 100 = ${percent}%`,
  };
}

/**
 * 3. Percentage Increase / Decrease from X to Y
 * Formula: ((Y - X) / |X|) * 100
 */
export function calculatePercentChange(fromVal: number, toVal: number): PercentChangeResult {
  if (isNaN(fromVal) || isNaN(toVal) || fromVal === 0) {
    return {
      percentChange: 0,
      diff: 0,
      isIncrease: true,
      formula: fromVal === 0 ? "Initial value cannot be zero" : "Invalid input",
    };
  }
  const diff = roundTo(toVal - fromVal);
  const percentChange = roundTo((diff / Math.abs(fromVal)) * 100);
  const isIncrease = diff >= 0;
  return {
    percentChange: Math.abs(percentChange),
    diff,
    isIncrease,
    formula: `((${toVal} − ${fromVal}) ÷ |${fromVal}|) × 100 = ${percentChange}%`,
  };
}

/**
 * 4. X is P% of what number?
 * Formula: X / (P / 100)
 */
export function calculateTotalFromPercent(part: number, percent: number): TotalFromResult {
  if (isNaN(part) || isNaN(percent) || percent === 0) {
    return { total: 0, formula: percent === 0 ? "Percentage cannot be zero" : "Invalid input" };
  }
  const total = roundTo(part / (percent / 100));
  return {
    total,
    formula: `${part} ÷ (${percent} ÷ 100) = ${total}`,
  };
}
