export interface TimeCardEntry {
  day: string;
  enabled: boolean;
  startTime: string; // "HH:MM" 24h format
  endTime: string;   // "HH:MM" 24h format
  breakMinutes: number;
}

export interface DayCalculation {
  day: string;
  enabled: boolean;
  hoursWorked: number;
  regularHours: number;
  overtimeHours: number;
}

export interface TimeCardResult {
  days: DayCalculation[];
  totalHours: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
}

export interface TimeCardConfig {
  hourlyRate: number;
  dailyOvertimeThreshold?: number; // e.g. 8 hours/day
  weeklyOvertimeThreshold?: number; // e.g. 40 hours/week
  overtimeMultiplier?: number; // e.g. 1.5x
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0] ?? "0", 10) || 0;
  const minutes = parseInt(parts[1] ?? "0", 10) || 0;
  return hours * 60 + minutes;
}

export function calculateDailyHours(
  startTime: string,
  endTime: string,
  breakMinutes: number
): number {
  const startMins = parseTimeToMinutes(startTime);
  const endMins = parseTimeToMinutes(endTime);
  const breakM = Math.max(0, breakMinutes);

  let diffMins = endMins - startMins;
  // If overnight shift (e.g. 22:00 to 06:00)
  if (diffMins < 0) {
    diffMins += 24 * 60;
  }

  const netMins = Math.max(0, diffMins - breakM);
  return Math.round((netMins / 60) * 100) / 100;
}

export function calculateTimeCard(
  entries: TimeCardEntry[],
  config: TimeCardConfig
): TimeCardResult {
  const rate = Math.max(0, config.hourlyRate);
  const dailyThreshold = config.dailyOvertimeThreshold ?? 8;
  const weeklyThreshold = config.weeklyOvertimeThreshold ?? 40;
  const otMult = config.overtimeMultiplier ?? 1.5;

  const dayCalcs: DayCalculation[] = [];
  let cumTotalHours = 0;
  let cumDailyRegular = 0;
  let cumDailyOvertime = 0;

  for (const entry of entries) {
    if (!entry.enabled) {
      dayCalcs.push({
        day: entry.day,
        enabled: false,
        hoursWorked: 0,
        regularHours: 0,
        overtimeHours: 0,
      });
      continue;
    }

    const worked = calculateDailyHours(entry.startTime, entry.endTime, entry.breakMinutes);
    cumTotalHours += worked;

    let reg = worked;
    let ot = 0;

    if (dailyThreshold > 0 && worked > dailyThreshold) {
      reg = dailyThreshold;
      ot = worked - dailyThreshold;
    }

    cumDailyRegular += reg;
    cumDailyOvertime += ot;

    dayCalcs.push({
      day: entry.day,
      enabled: true,
      hoursWorked: worked,
      regularHours: Math.round(reg * 100) / 100,
      overtimeHours: Math.round(ot * 100) / 100,
    });
  }

  // Check weekly overtime threshold
  let finalRegular = cumDailyRegular;
  let finalOvertime = cumDailyOvertime;

  if (weeklyThreshold > 0 && cumDailyRegular > weeklyThreshold) {
    const excess = cumDailyRegular - weeklyThreshold;
    finalRegular = weeklyThreshold;
    finalOvertime += excess;
  }

  finalRegular = Math.round(finalRegular * 100) / 100;
  finalOvertime = Math.round(finalOvertime * 100) / 100;
  const totalHours = Math.round(cumTotalHours * 100) / 100;

  const regularPay = Math.round(finalRegular * rate * 100) / 100;
  const overtimePay = Math.round(finalOvertime * rate * otMult * 100) / 100;
  const grossPay = Math.round((regularPay + overtimePay) * 100) / 100;

  return {
    days: dayCalcs,
    totalHours,
    totalRegularHours: finalRegular,
    totalOvertimeHours: finalOvertime,
    regularPay,
    overtimePay,
    grossPay,
  };
}
