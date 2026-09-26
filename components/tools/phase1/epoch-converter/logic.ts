/**
 * Unix Epoch & Timestamp Converter Logic
 * Pure client-side UTC and local datetime conversions.
 */

export interface EpochToDateResult {
  epochSeconds: number;
  epochMilliseconds: number;
  utcString: string;
  isoString: string;
  localString: string;
  relativeTime: string;
  dayOfYear: number;
  dayOfWeek: string;
  isLeapYear: boolean;
}

export interface DateToEpochResult {
  epochSeconds: number;
  epochMilliseconds: number;
  isoString: string;
  utcString: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getRelativeTimeString(date: Date, now: Date = new Date()): string {
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000);
  const isPast = diffSec < 0;
  const absSec = Math.abs(diffSec);

  if (absSec < 5) return "just now";
  if (absSec < 60) return `${absSec} seconds ${isPast ? "ago" : "from now"}`;
  const mins = Math.floor(absSec / 60);
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ${isPast ? "ago" : "from now"}`;
}

export function epochToDate(epochInput: number | string): EpochToDateResult {
  const num = typeof epochInput === "string" ? Number(epochInput.trim()) : epochInput;

  if (isNaN(num)) {
    throw new Error("Invalid epoch timestamp");
  }

  // Determine if seconds or milliseconds (if < 1e11, it's seconds)
  const isSeconds = Math.abs(num) < 1e11;
  const epochSeconds = isSeconds ? Math.floor(num) : Math.floor(num / 1000);
  const epochMilliseconds = isSeconds ? Math.floor(num * 1000) : Math.floor(num);

  const date = new Date(epochMilliseconds);
  if (isNaN(date.getTime())) {
    throw new Error("Date out of range");
  }

  // Day of year calculation
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const year = date.getUTCFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  return {
    epochSeconds,
    epochMilliseconds,
    utcString: date.toUTCString(),
    isoString: date.toISOString(),
    localString: date.toString(),
    relativeTime: getRelativeTimeString(date),
    dayOfYear: diffDays,
    dayOfWeek: DAYS[date.getUTCDay()] ?? "Sunday",
    isLeapYear,
  };
}

export function dateToEpoch(dateInput: string | Date): DateToEpochResult {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date input");
  }

  const epochMilliseconds = date.getTime();
  const epochSeconds = Math.floor(epochMilliseconds / 1000);

  return {
    epochSeconds,
    epochMilliseconds,
    isoString: date.toISOString(),
    utcString: date.toUTCString(),
  };
}
