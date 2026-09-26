export type CalculationMethod = "lmp" | "conception" | "ivf" | "ultrasound";
export type IvfType = "day3" | "day5";

export interface PregnancyInput {
  method: CalculationMethod;
  referenceDate: string; // YYYY-MM-DD
  cycleLengthDays?: number; // default 28 days for LMP
  ivfType?: IvfType; // for IVF method
  ultrasoundWeeks?: number; // for ultrasound method
  ultrasoundDays?: number; // for ultrasound method
  currentDate?: string; // defaults to today (YYYY-MM-DD)
}

export interface Milestone {
  week: number;
  label: string;
  description: string;
  date: string;
  isCompleted: boolean;
}

export interface PregnancyResult {
  estimatedDueDate: string;
  formattedDueDate: string;
  estimatedConceptionDate: string;
  currentWeeks: number;
  currentDays: number;
  totalDaysPregnant: number;
  daysRemaining: number;
  percentComplete: number;
  currentTrimester: 1 | 2 | 3;
  trimesterLabel: string;
  milestones: Milestone[];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPrettyDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function calculatePregnancy(input: PregnancyInput): PregnancyResult {
  const ref = new Date(`${input.referenceDate}T00:00:00`);
  if (isNaN(ref.getTime())) {
    throw new Error("Invalid reference date provided.");
  }

  const now = input.currentDate ? new Date(`${input.currentDate}T00:00:00`) : new Date();
  now.setHours(0, 0, 0, 0);

  let dueDate: Date;
  let conceptionDate: Date;

  if (input.method === "conception") {
    // Due date = conception + 266 days (38 weeks)
    dueDate = addDays(ref, 266);
    conceptionDate = ref;
  } else if (input.method === "ivf") {
    const transferOffset = input.ivfType === "day5" ? 261 : 263;
    dueDate = addDays(ref, transferOffset);
    conceptionDate = addDays(ref, input.ivfType === "day5" ? -5 : -3);
  } else if (input.method === "ultrasound") {
    const scanWeeks = Math.max(0, input.ultrasoundWeeks || 8);
    const scanDays = Math.max(0, Math.min(6, input.ultrasoundDays || 0));
    const scanTotalDays = scanWeeks * 7 + scanDays;
    // Due date is 280 days from LMP equivalent
    dueDate = addDays(ref, 280 - scanTotalDays);
    conceptionDate = addDays(dueDate, -266);
  } else {
    // LMP (Naegele's Rule with cycle adjustment)
    const cycleAdjustment = (input.cycleLengthDays || 28) - 28;
    dueDate = addDays(ref, 280 + cycleAdjustment);
    conceptionDate = addDays(ref, 14 + cycleAdjustment);
  }

  // Gestational start is due date - 280 days
  const gestationalStart = addDays(dueDate, -280);

  const diffTime = now.getTime() - gestationalStart.getTime();
  const rawDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalDaysPregnant = Math.max(0, Math.min(300, rawDays));

  const currentWeeks = Math.floor(totalDaysPregnant / 7);
  const currentDays = totalDaysPregnant % 7;

  const remainingTime = dueDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));

  const percentComplete = Math.min(100, Math.max(0, Math.round((totalDaysPregnant / 280) * 100)));

  let currentTrimester: 1 | 2 | 3 = 1;
  let trimesterLabel = "First Trimester (Weeks 1–13)";
  if (currentWeeks >= 28) {
    currentTrimester = 3;
    trimesterLabel = "Third Trimester (Weeks 28–40+)";
  } else if (currentWeeks >= 14) {
    currentTrimester = 2;
    trimesterLabel = "Second Trimester (Weeks 14–27)";
  }

  const milestonesRaw = [
    { week: 2, label: "Estimated Conception", description: "Fertilization and initial blastocyst cell division" },
    { week: 6, label: "First Heartbeat", description: "Cardiac tube activity detectable via transvaginal ultrasound" },
    { week: 10, label: "Embryonic to Fetal Stage", description: "Major vital organs and limb buds formed" },
    { week: 13, label: "End of First Trimester", description: "Placenta fully functioning, risk of loss drops significantly" },
    { week: 20, label: "Mid-Pregnancy Anatomy Scan", description: "Detailed 20-week ultrasound structural evaluation" },
    { week: 24, label: "Viability Milestone", description: "Lungs begin surfactant production; neonatal survival threshold" },
    { week: 28, label: "Third Trimester Begins", description: "Rapid brain and body growth; baby can open eyes" },
    { week: 37, label: "Full Term Milestone", description: "Baby's lungs and digestive system mature for birth" },
    { week: 40, label: "Estimated Due Date", description: "Official 40-week delivery target" },
  ];

  const milestones: Milestone[] = milestonesRaw.map((m) => {
    const milestoneDate = addDays(gestationalStart, m.week * 7);
    return {
      week: m.week,
      label: m.label,
      description: m.description,
      date: formatPrettyDate(milestoneDate),
      isCompleted: now.getTime() >= milestoneDate.getTime(),
    };
  });

  return {
    estimatedDueDate: formatDateISO(dueDate),
    formattedDueDate: formatPrettyDate(dueDate),
    estimatedConceptionDate: formatDateISO(conceptionDate),
    currentWeeks,
    currentDays,
    totalDaysPregnant,
    daysRemaining,
    percentComplete,
    currentTrimester,
    trimesterLabel,
    milestones,
  };
}
