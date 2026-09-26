import { calculateDateDifference, addSubtractDate } from "./logic";

export function runTests(): boolean {
  // Test 1: Date difference between 2026-01-01 and 2026-01-15 (14 days, 2 weeks)
  const diff1 = calculateDateDifference("2026-01-01", "2026-01-15");
  if (diff1.totalDays !== 14) {
    throw new Error(`Expected 14 days, got ${diff1.totalDays}`);
  }
  if (diff1.totalWeeks !== 2) {
    throw new Error(`Expected 2 weeks, got ${diff1.totalWeeks}`);
  }
  if (diff1.businessDays !== 10) {
    throw new Error(`Expected 10 business days, got ${diff1.businessDays}`);
  }

  // Test 2: Add 30 days to 2026-01-01
  const add1 = addSubtractDate("2026-01-01", "add", { days: 30 });
  if (add1.resultDate !== "2026-01-31") {
    throw new Error(`Expected 2026-01-31, got ${add1.resultDate}`);
  }

  // Test 3: Subtract 1 year from 2026-05-10
  const sub1 = addSubtractDate("2026-05-10", "subtract", { years: 1 });
  if (sub1.resultDate !== "2025-05-10") {
    throw new Error(`Expected 2025-05-10, got ${sub1.resultDate}`);
  }

  return true;
}
