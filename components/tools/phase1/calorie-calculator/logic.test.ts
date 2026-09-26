import { calculateCalories } from "./logic";

export function runTests(): boolean {
  // Test 1: Male, 25 years old, 75 kg, 180 cm, sedentary
  // BMR = 10 * 75 + 6.25 * 180 - 5 * 25 + 5 = 750 + 1125 - 125 + 5 = 1755
  // TDEE = 1755 * 1.2 = 2106
  const res1 = calculateCalories({
    gender: "male",
    age: 25,
    weightKg: 75,
    heightCm: 180,
    activityLevel: "sedentary",
    goal: "maintain",
    macroSplit: "balanced",
  });

  if (res1.bmr !== 1755 || res1.tdee !== 2106) {
    throw new Error(`Test 1 BMR/TDEE failed: BMR=${res1.bmr}, TDEE=${res1.tdee}`);
  }

  // Test 2: Weight loss deficit of 500 kcal
  const res2 = calculateCalories({
    gender: "male",
    age: 25,
    weightKg: 75,
    heightCm: 180,
    activityLevel: "sedentary",
    goal: "loss",
    macroSplit: "high-protein",
  });

  if (res2.targetCalories !== 1606) {
    throw new Error(`Test 2 target calories failed: ${res2.targetCalories}`);
  }
  if (res2.macros.protein.percentage !== 40) {
    throw new Error(`Test 2 macro split failed: ${res2.macros.protein.percentage}`);
  }

  // Test 3: Female BMR calculation
  // Female BMR: 10 * 60 + 6.25 * 165 - 5 * 30 - 161 = 600 + 1031.25 - 150 - 161 = 1320
  const res3 = calculateCalories({
    gender: "female",
    age: 30,
    weightKg: 60,
    heightCm: 165,
    activityLevel: "moderate", // x1.55
  });

  if (res3.bmr !== 1320) {
    throw new Error(`Test 3 female BMR failed: ${res3.bmr}`);
  }

  return true;
}
