export interface BreakEvenInput {
  fixedCosts: number;          // Rent, utilities, salaries, software ($)
  variableCostPerUnit: number; // Materials, shipping, fees per unit ($)
  pricePerUnit: number;        // Selling price per unit ($)
  targetProfit?: number;       // Optional target profit ($)
}

export interface BreakEvenResult {
  contributionMargin: number;      // Price - Variable Cost
  contributionMarginRatio: number; // (Contribution Margin / Price) * 100
  breakEvenUnits: number;          // Fixed Costs / Contribution Margin
  breakEvenRevenue: number;        // BreakEvenUnits * Price
  targetProfitUnits?: number;      // (Fixed Costs + Target Profit) / Contribution Margin
  targetProfitRevenue?: number;
  isValid: boolean;
  errorMessage?: string;
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const fixed = Math.max(0, input.fixedCosts);
  const variable = Math.max(0, input.variableCostPerUnit);
  const price = Math.max(0, input.pricePerUnit);
  const target = Math.max(0, input.targetProfit ?? 0);

  if (price <= variable) {
    return {
      contributionMargin: 0,
      contributionMarginRatio: 0,
      breakEvenUnits: 0,
      breakEvenRevenue: 0,
      isValid: false,
      errorMessage: "Selling price must be strictly greater than variable cost per unit to achieve break-even.",
    };
  }

  const contributionMargin = price - variable;
  const contributionMarginRatio = (contributionMargin / price) * 100;

  const breakEvenUnits = Math.ceil(fixed / contributionMargin);
  const breakEvenRevenue = breakEvenUnits * price;

  let targetProfitUnits: number | undefined;
  let targetProfitRevenue: number | undefined;

  if (target > 0) {
    targetProfitUnits = Math.ceil((fixed + target) / contributionMargin);
    targetProfitRevenue = targetProfitUnits * price;
  }

  return {
    contributionMargin: Math.round(contributionMargin * 100) / 100,
    contributionMarginRatio: Math.round(contributionMarginRatio * 100) / 100,
    breakEvenUnits,
    breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
    targetProfitUnits,
    targetProfitRevenue: targetProfitRevenue ? Math.round(targetProfitRevenue * 100) / 100 : undefined,
    isValid: true,
  };
}
