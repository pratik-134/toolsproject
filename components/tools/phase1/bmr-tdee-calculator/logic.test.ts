import { calculateBmr } from "./logic";

export function runTests(): boolean {
  // Test Vector 1: Male 25yo, 70kg, 175cm, sedentary, Mifflin
  // base = 10*70 + 6.25*175 - 5*25 = 700 + 1093.75 - 125 = 1668.75 + 5 = 1673.75 -> 1674
  const resMale = calculateBmr({
    gender: "male",
    age: 25,
    weightKg: 70,
    heightCm: 175,
    activityLevel: "sedentary",
    formula: "mifflin",
  });
  if (resMale.bmr !== 1674) {
    throw new Error(`Male BMR mismatch: expected 1674, got ${resMale.bmr}`);
  }
  if (resMale.tdee !== Math.round(1674 * 1.2)) {
    throw new Error(`Male TDEE mismatch: ${resMale.tdee}`);
  }

  // Test Vector 2: Female 30yo, 60kg, 165cm, moderate, Mifflin
  // base = 10*60 + 6.25*165 - 5*30 = 600 + 1031.25 - 150 = 1481.25 - 161 = 1320.25 -> 1320
  const resFemale = calculateBmr({
    gender: "female",
    age: 30,
    weightKg: 60,
    heightCm: 165,
    activityLevel: "moderate",
    formula: "mifflin",
  });
  if (resFemale.bmr !== 1320) {
    throw new Error(`Female BMR mismatch: expected 1320, got ${resFemale.bmr}`);
  }
  if (resFemale.tdee !== Math.round(1320 * 1.55)) {
    throw new Error(`Female TDEE mismatch: ${resFemale.tdee}`);
  }

  // Test Macro Breakdown
  const macros = resFemale.goals.maintenance.macros;
  if (macros.proteinGrams <= 0 || macros.carbsGrams <= 0 || macros.fatGrams <= 0) {
    throw new Error(`Macro breakdown invalid: ${JSON.stringify(macros)}`);
  }

  return true;
}
