import { calculatePregnancy } from "./logic";

export function runTests(): boolean {
  // Test 1: Standard LMP (Jan 1, 2026, 28-day cycle)
  // Due date should be Jan 1 + 280 days = Oct 8, 2026
  const lmpRes = calculatePregnancy({
    method: "lmp",
    referenceDate: "2026-01-01",
    cycleLengthDays: 28,
    currentDate: "2026-05-01",
  });

  if (lmpRes.estimatedDueDate !== "2026-10-08") {
    throw new Error(`Expected due date 2026-10-08, got ${lmpRes.estimatedDueDate}`);
  }
  if (lmpRes.currentWeeks < 16 || lmpRes.currentWeeks > 18) {
    throw new Error(`Unexpected current weeks: ${lmpRes.currentWeeks}`);
  }
  if (lmpRes.currentTrimester !== 2) {
    throw new Error(`Expected 2nd trimester, got ${lmpRes.currentTrimester}`);
  }
  if (lmpRes.milestones.length !== 9) {
    throw new Error(`Expected 9 milestones, got ${lmpRes.milestones.length}`);
  }

  // Test 2: Cycle length adjustment (32-day cycle adds 4 days)
  const lmp32Res = calculatePregnancy({
    method: "lmp",
    referenceDate: "2026-01-01",
    cycleLengthDays: 32,
    currentDate: "2026-05-01",
  });
  if (lmp32Res.estimatedDueDate !== "2026-10-12") {
    throw new Error(`Expected due date 2026-10-12 for 32d cycle, got ${lmp32Res.estimatedDueDate}`);
  }

  // Test 3: Conception method (Conception Jan 15 + 266 days = Oct 8)
  const conceptionRes = calculatePregnancy({
    method: "conception",
    referenceDate: "2026-01-15",
    currentDate: "2026-05-01",
  });
  if (conceptionRes.estimatedDueDate !== "2026-10-08") {
    throw new Error(`Expected conception due date 2026-10-08, got ${conceptionRes.estimatedDueDate}`);
  }

  // Test 4: IVF day 5 transfer
  const ivfRes = calculatePregnancy({
    method: "ivf",
    referenceDate: "2026-01-20",
    ivfType: "day5",
    currentDate: "2026-05-01",
  });
  if (!ivfRes.estimatedDueDate || ivfRes.daysRemaining <= 0) {
    throw new Error("IVF calculation returned invalid due date or days remaining");
  }

  return true;
}
