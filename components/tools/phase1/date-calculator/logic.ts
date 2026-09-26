/**
 * Pure Date Math & Duration Engine
 * Zero dependencies, client-side execution.
 */

export interface DateDiffResult {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  totalWeeks: number;
  remainingDays: number;
  totalHours: number;
  businessDays: number;
  weekendDays: number;
  isPast: boolean;
}

export interface DateAddSubtractResult {
  resultDate: string; // ISO YYYY-MM-DD
  dayOfWeek: string;
  formatted: string;
}

/**
 * Calculate difference between two dates (YYYY-MM-DD)
 */
export function calculateDateDifference(startDateStr: string, endDateStr: string): DateDiffResult {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      totalDays: 0,
      years: 0,
      months: 0,
      days: 0,
      totalWeeks: 0,
      remainingDays: 0,
      totalHours: 0,
      businessDays: 0,
      weekendDays: 0,
      isPast: false,
    };
  }

  // Normalize to UTC midnight
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

  const isPast = endUtc < startUtc;
  const d1 = isPast ? new Date(endUtc) : new Date(startUtc);
  const d2 = isPast ? new Date(startUtc) : new Date(endUtc);

  const diffMs = Math.abs(endUtc - startUtc);
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = totalDays * 24;
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Calculate calendar years, months, days
  let y = d2.getUTCFullYear() - d1.getUTCFullYear();
  let m = d2.getUTCMonth() - d1.getUTCMonth();
  let d = d2.getUTCDate() - d1.getUTCDate();

  if (d < 0) {
    m--;
    const prevMonthDays = new Date(Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), 0)).getUTCDate();
    d += prevMonthDays;
  }

  if (m < 0) {
    y--;
    m += 12;
  }

  // Calculate business days vs weekend days
  let businessDays = 0;
  let weekendDays = 0;
  const curr = new Date(d1);

  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = curr.getUTCDay(); // 0 is Sunday, 6 is Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    } else {
      businessDays++;
    }
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return {
    totalDays,
    years: y,
    months: m,
    days: d,
    totalWeeks,
    remainingDays,
    totalHours,
    businessDays,
    weekendDays,
    isPast,
  };
}

/**
 * Add or subtract days/weeks/months/years from a date
 */
export function addSubtractDate(
  startDateStr: string,
  operation: "add" | "subtract",
  amounts: { years?: number; months?: number; weeks?: number; days?: number }
): DateAddSubtractResult {
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) {
    return { resultDate: "", dayOfWeek: "", formatted: "Invalid Date" };
  }

  const sign = operation === "add" ? 1 : -1;
  const years = (amounts.years || 0) * sign;
  const months = (amounts.months || 0) * sign;
  const days = ((amounts.days || 0) + (amounts.weeks || 0) * 7) * sign;

  const target = new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth() + months, date.getUTCDate() + days));

  const yyyy = target.getUTCFullYear();
  const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(target.getUTCDate()).padStart(2, "0");
  const resultDate = `${yyyy}-${mm}-${dd}`;

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = daysOfWeek[target.getUTCDay()] ?? "";

  const monthsNamed = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const formatted = `${dayOfWeek}, ${monthsNamed[target.getUTCMonth()]} ${target.getUTCDate()}, ${yyyy}`;

  return {
    resultDate,
    dayOfWeek,
    formatted,
  };
}
