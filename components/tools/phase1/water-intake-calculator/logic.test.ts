import { calculateWaterIntake } from "./logic";

export function runTests(): boolean {
  // Test 1: 70 kg, 0 mins exercise, temperate
  // Base: 70 * 35 = 2450 ml = 2.45 L
  const res1 = calculateWaterIntake({
    weightKg: 70,
    exerciseMinutesPerDay: 0,
    climate: "temperate",
  });

  if (res1.totalMl !== 2450 || res1.totalLiters !== 2.45) {
    throw new Error(`Test 1 failed: totalMl=${res1.totalMl}`);
  }

  // Test 2: 70 kg with 60 mins exercise and hot climate
  // 2450 + (60/30)*350 = 2450 + 700 = 3150 + 500 = 3650 ml = 3.65 L
  const res2 = calculateWaterIntake({
    weightKg: 70,
    exerciseMinutesPerDay: 60,
    climate: "hot",
  });

  if (res2.totalMl !== 3650 || res2.totalLiters !== 3.65) {
    throw new Error(`Test 2 failed: totalMl=${res2.totalMl}`);
  }

  // Test 3: Schedule breakdown length
  if (res1.schedule.length !== 6) {
    throw new Error(`Test 3 schedule length failed`);
  }

  return true;
}
