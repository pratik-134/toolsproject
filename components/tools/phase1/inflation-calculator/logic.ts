export interface InflationInput {
  initialAmount: number;
  annualRate: number; // e.g. 3.2 for 3.2%
  years: number;
}

export interface YearInflationPoint {
  year: number;
  futureCost: number;
  purchasingPower: number;
  cumulativeInflationPercent: number;
}

export interface InflationResult {
  initialAmount: number;
  annualRate: number;
  years: number;
  futureEquivalentCost: number;
  purchasingPower: number;
  cumulativeInflationPercent: number;
  purchasingPowerLossPercent: number;
  yearlyBreakdown: YearInflationPoint[];
}

export function calculateInflation(input: InflationInput): InflationResult {
  const { initialAmount, annualRate, years } = input;

  if (initialAmount < 0 || years < 0) {
    throw new Error("Initial amount and years must be non-negative.");
  }

  const rateFactor = 1 + annualRate / 100;
  const compoundMultiplier = Math.pow(rateFactor, years);

  const futureEquivalentCost = Math.round(initialAmount * compoundMultiplier * 100) / 100;
  const purchasingPower =
    compoundMultiplier !== 0
      ? Math.round((initialAmount / compoundMultiplier) * 100) / 100
      : 0;

  const cumulativeInflationPercent =
    initialAmount > 0
      ? Math.round(((futureEquivalentCost - initialAmount) / initialAmount) * 1000) / 10
      : 0;

  const purchasingPowerLossPercent =
    initialAmount > 0
      ? Math.round(((initialAmount - purchasingPower) / initialAmount) * 1000) / 10
      : 0;

  const yearlyBreakdown: YearInflationPoint[] = [];

  for (let y = 1; y <= Math.min(years, 50); y++) {
    const factor = Math.pow(rateFactor, y);
    const cost = Math.round(initialAmount * factor * 100) / 100;
    const power = Math.round((initialAmount / factor) * 100) / 100;
    const cumRate = Math.round((factor - 1) * 1000) / 10;

    yearlyBreakdown.push({
      year: y,
      futureCost: cost,
      purchasingPower: power,
      cumulativeInflationPercent: cumRate,
    });
  }

  return {
    initialAmount,
    annualRate,
    years,
    futureEquivalentCost,
    purchasingPower,
    cumulativeInflationPercent,
    purchasingPowerLossPercent,
    yearlyBreakdown,
  };
}
