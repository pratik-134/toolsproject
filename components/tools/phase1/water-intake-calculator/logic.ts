/**
 * Daily Water Intake & Hydration Calculator Logic
 * Pure client-side calculations based on physiological hydration formulas.
 */

export type ClimateType = "temperate" | "hot" | "cold";
export type SpecialCondition = "none" | "pregnant" | "breastfeeding";

export interface WaterIntakeInput {
  weightKg: number;
  exerciseMinutesPerDay: number; // e.g. 30, 60 mins
  climate: ClimateType;
  condition?: SpecialCondition;
}

export interface HydrationScheduleItem {
  timeLabel: string;
  amountMl: number;
  amountOz: number;
  description: string;
}

export interface WaterIntakeResult {
  totalMl: number;
  totalLiters: number;
  totalOunces: number;
  standardGlasses8oz: number;
  schedule: HydrationScheduleItem[];
}

export function calculateWaterIntake(input: WaterIntakeInput): WaterIntakeResult {
  const { weightKg, exerciseMinutesPerDay, climate, condition = "none" } = input;

  if (weightKg <= 0) {
    throw new Error("Weight must be greater than zero");
  }

  // Base guideline: ~35 ml per kg of body weight
  let totalMl = weightKg * 35;

  // Exercise factor: ~350 ml per 30 minutes of vigorous workout
  const exerciseBonusMl = (Math.max(0, exerciseMinutesPerDay) / 30) * 350;
  totalMl += exerciseBonusMl;

  // Climate factor
  if (climate === "hot") {
    totalMl += 500; // perspiration compensation
  } else if (climate === "cold") {
    totalMl += 200; // dry respiratory water loss
  }

  // Pregnancy / Breastfeeding
  if (condition === "pregnant") {
    totalMl += 300;
  } else if (condition === "breastfeeding") {
    totalMl += 700;
  }

  totalMl = Math.round(totalMl);
  const totalLiters = Number((totalMl / 1000).toFixed(2));
  const totalOunces = Math.round(totalMl / 29.5735);
  const standardGlasses8oz = Number((totalOunces / 8).toFixed(1));

  // Daily Schedule distribution
  const portionMl = Math.round(totalMl / 6);
  const portionOz = Math.round(portionMl / 29.5735);

  const schedule: HydrationScheduleItem[] = [
    {
      timeLabel: "7:00 AM (Wake Up)",
      amountMl: portionMl,
      amountOz: portionOz,
      description: "Rehydrate after sleep and kickstart digestive metabolism.",
    },
    {
      timeLabel: "10:30 AM (Mid-Morning)",
      amountMl: portionMl,
      amountOz: portionOz,
      description: "Sustain focus and cognitive energy during work.",
    },
    {
      timeLabel: "1:00 PM (Lunch)",
      amountMl: portionMl,
      amountOz: portionOz,
      description: "Drink before or with lunch to aid nutrient absorption.",
    },
    {
      timeLabel: "4:00 PM (Afternoon / Pre-Workout)",
      amountMl: portionMl,
      amountOz: portionOz,
      description: "Prime physical hydration for evening energy.",
    },
    {
      timeLabel: "7:00 PM (Dinner)",
      amountMl: portionMl,
      amountOz: portionOz,
      description: "Dinner beverage and post-exercise recovery.",
    },
    {
      timeLabel: "9:30 PM (Evening)",
      amountMl: portionMl,
      amountOz: portionOz,
      description: "Gentle sip before resting without disrupting nighttime sleep.",
    },
  ];

  return {
    totalMl,
    totalLiters,
    totalOunces,
    standardGlasses8oz,
    schedule,
  };
}
