/**
 * Calorie, BMR, TDEE & Macronutrient Calculator Logic
 * Pure client-side calculations using Mifflin-St Jeor formula.
 */

export type Gender = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "extreme";

export type CalorieGoal =
  | "maintain"
  | "mild-loss"
  | "loss"
  | "extreme-loss"
  | "mild-gain"
  | "gain";

export type MacroSplitType = "balanced" | "high-protein" | "low-carb" | "keto";

export interface CalorieInput {
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal?: CalorieGoal;
  macroSplit?: MacroSplitType;
}

export interface MacroDetail {
  calories: number;
  grams: number;
  percentage: number;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  goal: CalorieGoal;
  macros: {
    protein: MacroDetail;
    carbs: MacroDetail;
    fats: MacroDetail;
  };
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extreme: 1.9,
};

const GOAL_OFFSETS: Record<CalorieGoal, number> = {
  maintain: 0,
  "mild-loss": -250,
  loss: -500,
  "extreme-loss": -1000,
  "mild-gain": 250,
  gain: 500,
};

const MACRO_SPLITS: Record<
  MacroSplitType,
  { protein: number; carbs: number; fats: number }
> = {
  balanced: { carbs: 40, protein: 30, fats: 30 },
  "high-protein": { carbs: 35, protein: 40, fats: 25 },
  "low-carb": { carbs: 20, protein: 45, fats: 35 },
  keto: { carbs: 5, protein: 25, fats: 70 },
};

export function calculateCalories(input: CalorieInput): CalorieResult {
  const {
    gender,
    age,
    weightKg,
    heightCm,
    activityLevel,
    goal = "maintain",
    macroSplit = "balanced",
  } = input;

  if (age <= 0 || weightKg <= 0 || heightCm <= 0) {
    throw new Error("Age, weight, and height must be positive numbers");
  }

  // Mifflin-St Jeor BMR formula
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  const tdee = Math.round(bmr * multiplier);

  const offset = GOAL_OFFSETS[goal] ?? 0;
  // Floor safe calories at 1200 kcal for general health
  const targetCalories = Math.max(1200, Math.round(tdee + offset));

  const split = MACRO_SPLITS[macroSplit] ?? MACRO_SPLITS.balanced;

  const proteinCals = (targetCalories * split.protein) / 100;
  const carbsCals = (targetCalories * split.carbs) / 100;
  const fatsCals = (targetCalories * split.fats) / 100;

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    goal,
    macros: {
      protein: {
        calories: Math.round(proteinCals),
        grams: Math.round(proteinCals / 4),
        percentage: split.protein,
      },
      carbs: {
        calories: Math.round(carbsCals),
        grams: Math.round(carbsCals / 4),
        percentage: split.carbs,
      },
      fats: {
        calories: Math.round(fatsCals),
        grams: Math.round(fatsCals / 9),
        percentage: split.fats,
      },
    },
  };
}
