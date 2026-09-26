/**
 * Freelance Hourly & Day Rate Calculator Logic
 * Pure client-side calculations for independent consultants and freelancers.
 */

export interface FreelanceRateInput {
  targetNetIncome: number; // e.g. 80,000
  annualExpenses: number; // e.g. 12,000 (software, insurance, hardware)
  taxRatePercent: number; // e.g. 25-30%
  profitMarginPercent: number; // e.g. 10-15% buffer
  billableHoursPerWeek: number; // e.g. 25 hours
  vacationWeeksPerYear: number; // e.g. 4 weeks
}

export interface FreelanceRateResult {
  hourlyRate: number;
  dayRate: number; // 8 billable hours
  weeklyTarget: number;
  monthlyTarget: number;
  annualGrossRevenue: number;
  billableWeeksPerYear: number;
  annualBillableHours: number;
  taxAmount: number;
  profitReserveAmount: number;
}

export function calculateFreelanceRate(
  input: FreelanceRateInput
): FreelanceRateResult {
  const {
    targetNetIncome,
    annualExpenses,
    taxRatePercent,
    profitMarginPercent,
    billableHoursPerWeek,
    vacationWeeksPerYear,
  } = input;

  if (targetNetIncome < 0 || billableHoursPerWeek <= 0) {
    throw new Error("Target income and billable hours must be positive numbers");
  }

  const billableWeeksPerYear = Math.max(1, 52 - Math.min(51, vacationWeeksPerYear));
  const annualBillableHours = Math.max(1, billableWeeksPerYear * billableHoursPerWeek);

  // Income after tax = targetNetIncome
  // Gross before tax = (targetNetIncome / (1 - taxRate / 100)) + annualExpenses
  const safeTaxRate = Math.min(90, Math.max(0, taxRatePercent)) / 100;
  const incomeBeforeTax = targetNetIncome / (1 - safeTaxRate);
  const taxAmount = incomeBeforeTax - targetNetIncome;

  const baseCost = incomeBeforeTax + annualExpenses;
  const profitMarginMultiplier = 1 + Math.max(0, profitMarginPercent) / 100;
  const annualGrossRevenue = baseCost * profitMarginMultiplier;
  const profitReserveAmount = annualGrossRevenue - baseCost;

  const hourlyRate = Math.ceil(annualGrossRevenue / annualBillableHours);
  const dayRate = hourlyRate * 8;
  const weeklyTarget = Math.round(annualGrossRevenue / billableWeeksPerYear);
  const monthlyTarget = Math.round(annualGrossRevenue / 12);

  return {
    hourlyRate,
    dayRate,
    weeklyTarget,
    monthlyTarget,
    annualGrossRevenue: Math.round(annualGrossRevenue),
    billableWeeksPerYear,
    annualBillableHours,
    taxAmount: Math.round(taxAmount),
    profitReserveAmount: Math.round(profitReserveAmount),
  };
}
