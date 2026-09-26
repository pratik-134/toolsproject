import { calculateDailyHours, calculateTimeCard, TimeCardEntry } from "./logic";

export function runTests(): boolean {
  // Test daily hours: 09:00 to 17:30 with 30 min break -> 8.0 hours
  const h1 = calculateDailyHours("09:00", "17:30", 30);
  if (h1 !== 8) {
    throw new Error(`Expected 8 hours, got ${h1}`);
  }

  // Test overnight shift: 22:00 to 06:00 with 60 min break -> 7.0 hours
  const hOvernight = calculateDailyHours("22:00", "06:00", 60);
  if (hOvernight !== 7) {
    throw new Error(`Expected 7 hours for overnight shift, got ${hOvernight}`);
  }

  // Test full week 5 days x 8 hours = 40 hours, rate $25/hr
  const entries: TimeCardEntry[] = [
    { day: "Monday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
    { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
    { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
    { day: "Thursday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
    { day: "Friday", enabled: true, startTime: "09:00", endTime: "17:30", breakMinutes: 30 },
    { day: "Saturday", enabled: false, startTime: "09:00", endTime: "17:00", breakMinutes: 0 },
    { day: "Sunday", enabled: false, startTime: "09:00", endTime: "17:00", breakMinutes: 0 },
  ];

  const res = calculateTimeCard(entries, {
    hourlyRate: 25,
    dailyOvertimeThreshold: 8,
    weeklyOvertimeThreshold: 40,
    overtimeMultiplier: 1.5,
  });

  if (res.totalHours !== 40) throw new Error(`Expected 40 total hours, got ${res.totalHours}`);
  if (res.totalRegularHours !== 40) throw new Error(`Expected 40 regular hours, got ${res.totalRegularHours}`);
  if (res.totalOvertimeHours !== 0) throw new Error(`Expected 0 overtime hours, got ${res.totalOvertimeHours}`);
  if (res.grossPay !== 1000) throw new Error(`Expected $1000 gross pay, got ${res.grossPay}`);

  // Test overtime: Monday worked 10 hours (8 reg + 2 OT). Total 42 hrs -> 40 reg + 2 OT
  const otEntries = [...entries];
  otEntries[0] = { day: "Monday", enabled: true, startTime: "08:00", endTime: "18:30", breakMinutes: 30 }; // 10 hrs
  const otRes = calculateTimeCard(otEntries, {
    hourlyRate: 20,
    dailyOvertimeThreshold: 8,
    weeklyOvertimeThreshold: 40,
    overtimeMultiplier: 1.5,
  });

  if (otRes.totalHours !== 42) throw new Error(`Expected 42 total hours, got ${otRes.totalHours}`);
  if (otRes.totalRegularHours !== 40) throw new Error(`Expected 40 reg hours, got ${otRes.totalRegularHours}`);
  if (otRes.totalOvertimeHours !== 2) throw new Error(`Expected 2 OT hours, got ${otRes.totalOvertimeHours}`);
  // 40 * 20 = 800 regular pay, 2 * 20 * 1.5 = 60 OT pay -> 860 gross
  if (otRes.grossPay !== 860) throw new Error(`Expected $860 gross pay, got ${otRes.grossPay}`);

  return true;
}
