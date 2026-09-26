import { calculateBodyFat } from "./logic";

export function runTests(): boolean {
  // Test 1: Standard male: 30yo, 80kg, 180cm, neck 39cm, waist 86cm
  const maleRes = calculateBodyFat({
    gender: "male",
    age: 30,
    weightKg: 80,
    heightCm: 180,
    neckCm: 39,
    waistCm: 86,
  });

  if (maleRes.navyBodyFatPercent < 12 || maleRes.navyBodyFatPercent > 22) {
    throw new Error(`Unexpected male navy BF: ${maleRes.navyBodyFatPercent}%`);
  }
  if (maleRes.fatMassKg <= 0 || maleRes.leanMassKg <= 0) {
    throw new Error("Fat mass and lean mass must be strictly positive");
  }
  if (Math.abs(maleRes.fatMassKg + maleRes.leanMassKg - 80) > 0.5) {
    throw new Error("Fat mass + lean mass must sum approximately to total body weight");
  }
  if (!maleRes.category || !maleRes.category.name) {
    throw new Error("Expected valid body fat category");
  }

  // Test 2: Standard female: 28yo, 60kg, 165cm, neck 33cm, waist 70cm, hip 96cm
  const femaleRes = calculateBodyFat({
    gender: "female",
    age: 28,
    weightKg: 60,
    heightCm: 165,
    neckCm: 33,
    waistCm: 70,
    hipCm: 96,
  });

  if (femaleRes.navyBodyFatPercent < 18 || femaleRes.navyBodyFatPercent > 30) {
    throw new Error(`Unexpected female navy BF: ${femaleRes.navyBodyFatPercent}%`);
  }
  if (femaleRes.leanMassKg <= 0) {
    throw new Error("Female lean mass must be positive");
  }

  // Test 3: Weight to target simulation
  const targetGoal = maleRes.weightToTarget?.(12);
  if (!targetGoal || targetGoal.targetWeightKg <= 0) {
    throw new Error("Expected target goal calculation");
  }

  // Test 4: Invalid inputs throw error
  let threw = false;
  try {
    calculateBodyFat({
      gender: "male",
      age: 25,
      weightKg: 75,
      heightCm: 175,
      neckCm: 45,
      waistCm: 40, // waist <= neck is invalid
    });
  } catch {
    threw = true;
  }

  if (!threw) {
    throw new Error("Waist <= neck should throw an error");
  }

  return true;
}
