export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "heavy" | "extreme";
export type BmrFormula = "mifflin" | "harris";

export interface BmrInput {
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  formula: BmrFormula;
}

export interface MacroBreakdown {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface CalorieGoal {
  label: string;
  calories: number;
  description: string;
  macros: MacroBreakdown;
}

export interface BmrResult {
  bmr: number;
  tdee: number;
  activityMultiplier: number;
  goals: {
    maintenance: CalorieGoal;
    mildWeightLoss: CalorieGoal;
    weightLoss: CalorieGoal;
    mildWeightGain: CalorieGoal;
    weightGain: CalorieGoal;
  };
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Little or no exercise
  light: 1.375, // Light exercise 1-3 days/week
  moderate: 1.55, // Moderate exercise 3-5 days/week
  heavy: 1.725, // Hard exercise 6-7 days/week
  extreme: 1.9, // Very intense daily exercise/physical job
};

export function calculateMacros(calories: number): MacroBreakdown {
  // Balanced macro split: 30% protein, 40% carbs, 30% fat
  const proteinCals = calories * 0.3;
  const carbsCals = calories * 0.4;
  const fatCals = calories * 0.3;

  return {
    proteinGrams: Math.round(proteinCals / 4),
    carbsGrams: Math.round(carbsCals / 4),
    fatGrams: Math.round(fatCals / 9),
  };
}

export function calculateBmr(input: BmrInput): BmrResult {
  const { gender, age, weightKg, heightCm, activityLevel, formula } = input;

  if (age <= 0 || weightKg <= 0 || heightCm <= 0) {
    throw new Error("Age, weight, and height must be positive numbers.");
  }

  let bmr = 0;

  if (formula === "mifflin") {
    // Mifflin-St Jeor Formula
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr = gender === "male" ? base + 5 : base - 161;
  } else {
    // Revised Harris-Benedict
    if (gender === "male") {
      bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
    }
  }

  const roundedBmr = Math.round(bmr);
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  const tdee = Math.round(roundedBmr * multiplier);

  const maintenanceCals = tdee;
  const mildLossCals = Math.round(tdee * 0.9); // -10%
  const lossCals = Math.round(tdee * 0.8); // -20%
  const mildGainCals = Math.round(tdee * 1.1); // +10%
  const gainCals = Math.round(tdee * 1.2); // +20%

  return {
    bmr: roundedBmr,
    tdee,
    activityMultiplier: multiplier,
    goals: {
      maintenance: {
        label: "Maintenance",
        calories: maintenanceCals,
        description: "Maintain current weight",
        macros: calculateMacros(maintenanceCals),
      },
      mildWeightLoss: {
        label: "Mild Weight Loss",
        calories: mildLossCals,
        description: "0.25 kg / ~0.5 lb loss per week",
        macros: calculateMacros(mildLossCals),
      },
      weightLoss: {
        label: "Weight Loss",
        calories: lossCals,
        description: "0.5 kg / ~1 lb loss per week",
        macros: calculateMacros(lossCals),
      },
      mildWeightGain: {
        label: "Mild Weight Gain",
        calories: mildGainCals,
        description: "0.25 kg / ~0.5 lb gain per week",
        macros: calculateMacros(mildGainCals),
      },
      weightGain: {
        label: "Weight Gain",
        calories: gainCals,
        description: "0.5 kg / ~1 lb gain per week",
        macros: calculateMacros(gainCals),
      },
    },
  };
}
