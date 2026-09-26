import { calculateAge, getZodiacSign } from "./logic";

export function runTests(): boolean {
  // Test 1: Known birthdate age check
  // Birth: 2000-01-15, Target: 2026-09-24
  const res1 = calculateAge("2000-01-15", "2026-09-24");
  if (res1.years !== 26 || res1.months !== 8 || res1.days !== 9) {
    throw new Error(
      `Test 1 failed: expected 26y 8m 9d, got ${res1.years}y ${res1.months}m ${res1.days}d`
    );
  }
  if (res1.dayOfWeekBorn !== "Saturday") {
    throw new Error(`Test 1 day of week failed: ${res1.dayOfWeekBorn}`);
  }
  if (!res1.zodiacSign.includes("Capricorn")) {
    throw new Error(`Test 1 zodiac failed: ${res1.zodiacSign}`);
  }

  // Test 2: Next birthday calculation
  if (res1.nextBirthday.turnsAge !== 27) {
    throw new Error(`Test 2 turnsAge failed: ${res1.nextBirthday.turnsAge}`);
  }

  // Test 3: Total days and weeks
  if (res1.totalDays <= 9000) {
    throw new Error(`Test 3 total days failed: ${res1.totalDays}`);
  }

  // Test 4: Zodiac sign helper
  if (!getZodiacSign(7, 4).includes("Cancer")) {
    throw new Error(`Test 4 zodiac failed`);
  }

  return true;
}
