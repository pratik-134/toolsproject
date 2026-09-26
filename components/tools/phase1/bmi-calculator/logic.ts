/**
 * Pure Body Mass Index (BMI) & Healthy Weight Calculation Logic
 * Zero external dependencies, client-side execution.
 */

export type UnitSystem = "metric" | "imperial";

export interface BmiCategoryInfo {
  category: string;
  colorClass: string;
  description: string;
  whoRange: string;
}

export interface BmiCalculationResult {
  bmi: number;
  prime: number; // BMI / 25
  category: BmiCategoryInfo;
  healthyWeightMin: number;
  healthyWeightMax: number;
  weightDifference: number; // diff from healthy range (0 if inside)
  unitSystem: UnitSystem;
  heightInMeters: number;
}

export function getBmiCategory(bmi: number): BmiCategoryInfo {
  if (bmi < 16.0) {
    return {
      category: "Severe Thinness",
      colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 border-blue-200",
      description: "Significantly below typical weight range for height.",
      whoRange: "< 16.0",
    };
  }
  if (bmi < 17.0) {
    return {
      category: "Moderate Thinness",
      colorClass: "text-sky-600 dark:text-sky-400 bg-sky-50 border-sky-200",
      description: "Moderately below typical weight range for height.",
      whoRange: "16.0 – 16.9",
    };
  }
  if (bmi < 18.5) {
    return {
      category: "Mild Thinness",
      colorClass: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 border-cyan-200",
      description: "Slightly below typical weight range for height.",
      whoRange: "17.0 – 18.4",
    };
  }
  if (bmi < 25.0) {
    return {
      category: "Normal Weight",
      colorClass: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 border-emerald-200",
      description: "Within healthy weight range recommended by the WHO.",
      whoRange: "18.5 – 24.9",
    };
  }
  if (bmi < 30.0) {
    return {
      category: "Overweight (Pre-obese)",
      colorClass: "text-amber-700 dark:text-amber-400 bg-amber-50 border-amber-200",
      description: "Moderately above typical weight range for height.",
      whoRange: "25.0 – 29.9",
    };
  }
  if (bmi < 35.0) {
    return {
      category: "Obese Class I",
      colorClass: "text-orange-700 dark:text-orange-400 bg-orange-50 border-orange-200",
      description: "Significantly above typical weight range for height.",
      whoRange: "30.0 – 34.9",
    };
  }
  if (bmi < 40.0) {
    return {
      category: "Obese Class II",
      colorClass: "text-rose-700 dark:text-rose-400 bg-rose-50 border-rose-200",
      description: "Substantially above typical weight range for height.",
      whoRange: "35.0 – 39.9",
    };
  }
  return {
    category: "Obese Class III",
    colorClass: "text-red-800 dark:text-red-400 bg-red-50 border-red-200",
    description: "Severely above typical weight range for height.",
    whoRange: "≥ 40.0",
  };
}

export function calculateMetricBmi(weightKg: number, heightCm: number): BmiCalculationResult {
  const safeWeight = Math.max(1, weightKg);
  const safeHeight = Math.max(30, heightCm);
  const heightM = safeHeight / 100;

  const rawBmi = safeWeight / (heightM * heightM);
  const bmi = Math.round((rawBmi + Number.EPSILON) * 10) / 10;
  const prime = Math.round(((rawBmi / 25) + Number.EPSILON) * 100) / 100;

  const minNormalWeight = Math.round(18.5 * (heightM * heightM) * 10) / 10;
  const maxNormalWeight = Math.round(24.9 * (heightM * heightM) * 10) / 10;

  let weightDiff = 0;
  if (safeWeight < minNormalWeight) {
    weightDiff = Math.round((minNormalWeight - safeWeight) * 10) / 10;
  } else if (safeWeight > maxNormalWeight) {
    weightDiff = Math.round((safeWeight - maxNormalWeight) * 10) / 10;
  }

  return {
    bmi,
    prime,
    category: getBmiCategory(bmi),
    healthyWeightMin: minNormalWeight,
    healthyWeightMax: maxNormalWeight,
    weightDifference: weightDiff,
    unitSystem: "metric",
    heightInMeters: heightM,
  };
}

export function calculateImperialBmi(
  weightLbs: number,
  heightFeet: number,
  heightInches: number
): BmiCalculationResult {
  const totalInches = Math.max(12, heightFeet * 12 + heightInches);
  const safeWeightLbs = Math.max(1, weightLbs);

  const rawBmi = (703 * safeWeightLbs) / (totalInches * totalInches);
  const bmi = Math.round((rawBmi + Number.EPSILON) * 10) / 10;
  const prime = Math.round(((rawBmi / 25) + Number.EPSILON) * 100) / 100;

  const minNormalLbs = Math.round(((18.5 * totalInches * totalInches) / 703) * 10) / 10;
  const maxNormalLbs = Math.round(((24.9 * totalInches * totalInches) / 703) * 10) / 10;

  let weightDiff = 0;
  if (safeWeightLbs < minNormalLbs) {
    weightDiff = Math.round((minNormalLbs - safeWeightLbs) * 10) / 10;
  } else if (safeWeightLbs > maxNormalLbs) {
    weightDiff = Math.round((safeWeightLbs - maxNormalLbs) * 10) / 10;
  }

  return {
    bmi,
    prime,
    category: getBmiCategory(bmi),
    healthyWeightMin: minNormalLbs,
    healthyWeightMax: maxNormalLbs,
    weightDifference: weightDiff,
    unitSystem: "imperial",
    heightInMeters: (totalInches * 2.54) / 100,
  };
}
