export type MhrFormula = "tanaka" | "karvonen" | "fox" | "gellish" | "gulati";
export type Gender = "male" | "female";

export interface HeartRateInput {
  age: number;
  restingHeartRate?: number; // bpm, default ~65
  formula?: MhrFormula;
  gender?: Gender;
}

export interface HeartRateZone {
  zone: number;
  name: string;
  minPercent: number;
  maxPercent: number;
  minBpm: number;
  maxBpm: number;
  intensity: string;
  benefits: string;
  color: string;
}

export interface HeartRateResult {
  maxHeartRate: number;
  restingHeartRate: number;
  heartRateReserve: number;
  formulaUsed: MhrFormula;
  zones: HeartRateZone[];
}

export function calculateMaxHeartRate(
  age: number,
  formula: MhrFormula = "tanaka",
  gender: Gender = "male"
): number {
  switch (formula) {
    case "fox":
      // Fox and Haskell formula (220 - age)
      return Math.round(220 - age);
    case "gellish":
      // Gellish formula (207 - 0.7 * age)
      return Math.round(207 - 0.7 * age);
    case "gulati":
      // Gulati formula for women (206 - 0.88 * age)
      return Math.round(206 - 0.88 * age);
    case "tanaka":
    case "karvonen":
    default:
      // Tanaka formula (208 - 0.7 * age)
      return Math.round(208 - 0.7 * age);
  }
}

const ZONE_DEFINITIONS = [
  {
    zone: 1,
    name: "Active Recovery",
    minPercent: 50,
    maxPercent: 60,
    intensity: "Very Light (Warm-up / Cooldown)",
    benefits: "Active recovery, gentle fat metabolism, cardiovascular baseline prep.",
    color: "slate",
  },
  {
    zone: 2,
    name: "Aerobic Base / Fat Burn",
    minPercent: 60,
    maxPercent: 70,
    intensity: "Light (Conversational Pace)",
    benefits: "Builds mitochondrial density, improves fat oxidation, increases endurance base.",
    color: "blue",
  },
  {
    zone: 3,
    name: "Aerobic Endurance (Tempo)",
    minPercent: 70,
    maxPercent: 80,
    intensity: "Moderate (Rhythmic & Steady)",
    benefits: "Increases capillary capacity, expands cardiac stroke volume, steady-state stamina.",
    color: "emerald",
  },
  {
    zone: 4,
    name: "Lactate Threshold",
    minPercent: 80,
    maxPercent: 90,
    intensity: "Hard (Breathing Heavily)",
    benefits: "Raises anaerobic threshold, improves body's ability to buffer lactate.",
    color: "amber",
  },
  {
    zone: 5,
    name: "VO2 Max / Neuromuscular",
    minPercent: 90,
    maxPercent: 100,
    intensity: "Maximum (Short Sprints & All-out)",
    benefits: "Peak athletic power, maximal oxygen consumption (VO2 max), sprint speed.",
    color: "rose",
  },
];

export function calculateHeartRateZones(input: HeartRateInput): HeartRateResult {
  const { age, restingHeartRate = 65, formula = "tanaka", gender = "male" } = input;

  if (age < 5 || age > 110) {
    throw new Error("Age must be between 5 and 110 years.");
  }

  const mhr = calculateMaxHeartRate(age, formula, gender);
  const rhr = Math.max(30, Math.min(120, restingHeartRate));

  if (rhr >= mhr) {
    throw new Error("Resting heart rate must be lower than maximum heart rate.");
  }

  const hrr = mhr - rhr;
  const isKarvonen = formula === "karvonen";

  const zones: HeartRateZone[] = ZONE_DEFINITIONS.map((def) => {
    let minBpm = 0;
    let maxBpm = 0;

    if (isKarvonen) {
      // Karvonen HRR formula: (HRR * %intensity) + RHR
      minBpm = Math.round(rhr + hrr * (def.minPercent / 100));
      maxBpm = Math.round(rhr + hrr * (def.maxPercent / 100));
    } else {
      // Straight % of MHR
      minBpm = Math.round(mhr * (def.minPercent / 100));
      maxBpm = Math.round(mhr * (def.maxPercent / 100));
    }

    return {
      zone: def.zone,
      name: def.name,
      minPercent: def.minPercent,
      maxPercent: def.maxPercent,
      minBpm,
      maxBpm,
      intensity: def.intensity,
      benefits: def.benefits,
      color: def.color,
    };
  });

  return {
    maxHeartRate: mhr,
    restingHeartRate: rhr,
    heartRateReserve: hrr,
    formulaUsed: formula,
    zones,
  };
}
