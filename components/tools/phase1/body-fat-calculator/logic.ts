export type Gender = "male" | "female";
export type UnitSystem = "metric" | "imperial";

export interface BodyFatInput {
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number; // Required for females
}

export type BodyFatCategory =
  | "essential"
  | "athletes"
  | "fitness"
  | "average"
  | "obese";

export interface CategoryInfo {
  id: BodyFatCategory;
  name: string;
  minPercent: number;
  maxPercent: number;
  color: string;
}

export interface BodyFatResult {
  navyBodyFatPercent: number;
  bmiBodyFatPercent: number;
  bmi: number;
  category: CategoryInfo;
  fatMassKg: number;
  fatMassLbs: number;
  leanMassKg: number;
  leanMassLbs: number;
  idealRange: {
    minPercent: number;
    maxPercent: number;
  };
  weightToTarget?: (targetPercent: number) => {
    targetWeightKg: number;
    targetWeightLbs: number;
    fatToLoseKg: number;
    fatToLoseLbs: number;
  };
}

export const ACE_CATEGORIES: Record<Gender, CategoryInfo[]> = {
  male: [
    { id: "essential", name: "Essential Fat", minPercent: 2, maxPercent: 5, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { id: "athletes", name: "Athletes", minPercent: 6, maxPercent: 13, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { id: "fitness", name: "Fitness", minPercent: 14, maxPercent: 17, color: "text-teal-600 bg-teal-50 border-teal-200" },
    { id: "average", name: "Average", minPercent: 18, maxPercent: 24, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "obese", name: "Above Average / Obese", minPercent: 25, maxPercent: 60, color: "text-rose-600 bg-rose-50 border-rose-200" },
  ],
  female: [
    { id: "essential", name: "Essential Fat", minPercent: 10, maxPercent: 13, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { id: "athletes", name: "Athletes", minPercent: 14, maxPercent: 20, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { id: "fitness", name: "Fitness", minPercent: 21, maxPercent: 24, color: "text-teal-600 bg-teal-50 border-teal-200" },
    { id: "average", name: "Average", minPercent: 25, maxPercent: 31, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "obese", name: "Above Average / Obese", minPercent: 32, maxPercent: 60, color: "text-rose-600 bg-rose-50 border-rose-200" },
  ],
};

export function getCategory(gender: Gender, bfPercent: number): CategoryInfo {
  const categories = ACE_CATEGORIES[gender];
  for (const cat of categories) {
    if (bfPercent <= cat.maxPercent) {
      return cat;
    }
  }
  return categories[categories.length - 1] ?? categories[0]!;
}

export function calculateBodyFat(input: BodyFatInput): BodyFatResult {
  const { gender, age, weightKg, heightCm, neckCm, waistCm, hipCm = 95 } = input;

  if (age <= 0 || weightKg <= 0 || heightCm <= 0 || neckCm <= 0 || waistCm <= 0) {
    throw new Error("Age, weight, height, neck, and waist measurements must be positive numbers.");
  }

  if (gender === "male" && waistCm <= neckCm) {
    throw new Error("Waist measurement must be greater than neck measurement.");
  }

  if (gender === "female" && (waistCm + hipCm) <= neckCm) {
    throw new Error("Combined waist and hip circumference must be greater than neck measurement.");
  }

  // 1. US Navy Method Formula
  let navyBf = 0;
  if (gender === "male") {
    // 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    const denom =
      1.0324 -
      0.19077 * Math.log10(waistCm - neckCm) +
      0.15456 * Math.log10(heightCm);
    navyBf = 495 / denom - 450;
  } else {
    // 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    const denom =
      1.29579 -
      0.35004 * Math.log10(waistCm + hipCm - neckCm) +
      0.221 * Math.log10(heightCm);
    navyBf = 495 / denom - 450;
  }

  // Clamp within reasonable physical limits
  navyBf = Math.max(2, Math.min(65, Math.round(navyBf * 10) / 10));

  // 2. BMI-based Body Fat (Deurenberg et al.)
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  const sexFactor = gender === "male" ? 1 : 0;
  let bmiBf = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
  bmiBf = Math.max(2, Math.min(65, Math.round(bmiBf * 10) / 10));

  // 3. Masses
  const fatMassKg = Math.round(((weightKg * navyBf) / 100) * 10) / 10;
  const leanMassKg = Math.round((weightKg - fatMassKg) * 10) / 10;
  const fatMassLbs = Math.round(fatMassKg * 2.20462 * 10) / 10;
  const leanMassLbs = Math.round(leanMassKg * 2.20462 * 10) / 10;

  const category = getCategory(gender, navyBf);

  const idealRange =
    gender === "male"
      ? { minPercent: 10, maxPercent: 18 }
      : { minPercent: 18, maxPercent: 25 };

  const weightToTarget = (targetPercent: number) => {
    const targetFraction = Math.max(0.02, Math.min(0.5, targetPercent / 100));
    // Assuming constant lean mass: targetWeight = leanMass / (1 - targetFraction)
    const targetWeightKg = Math.round((leanMassKg / (1 - targetFraction)) * 10) / 10;
    const fatToLoseKg = Math.max(0, Math.round((weightKg - targetWeightKg) * 10) / 10);
    const targetWeightLbs = Math.round(targetWeightKg * 2.20462 * 10) / 10;
    const fatToLoseLbs = Math.round(fatToLoseKg * 2.20462 * 10) / 10;

    return {
      targetWeightKg,
      targetWeightLbs,
      fatToLoseKg,
      fatToLoseLbs,
    };
  };

  return {
    navyBodyFatPercent: navyBf,
    bmiBodyFatPercent: bmiBf,
    bmi,
    category,
    fatMassKg,
    fatMassLbs,
    leanMassKg,
    leanMassLbs,
    idealRange,
    weightToTarget,
  };
}
