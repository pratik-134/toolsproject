import { calculateFreelanceRate } from "./logic";

export function runTests(): boolean {
  // Test 1: $100,000 net income, $10,000 expenses, 25% tax, 10% profit, 25 billable hrs/wk, 4 wks vacation
  const res1 = calculateFreelanceRate({
    targetNetIncome: 100000,
    annualExpenses: 10000,
    taxRatePercent: 25,
    profitMarginPercent: 10,
    billableHoursPerWeek: 25,
    vacationWeeksPerYear: 4,
  });

  // 48 working weeks * 25 hrs = 1,200 billable hours
  if (res1.billableWeeksPerYear !== 48 || res1.annualBillableHours !== 1200) {
    throw new Error(`Test 1 hours failed: ${res1.annualBillableHours}`);
  }

  // Pre-tax income: 100,000 / 0.75 = 133,333.33
  // Base: 143,333.33
  // Gross (+10%): 157,666.66
  // Hourly rate: ~157,667 / 1200 = ~$132/hr
  if (res1.hourlyRate < 130 || res1.hourlyRate > 135) {
    throw new Error(`Test 1 hourlyRate failed: ${res1.hourlyRate}`);
  }

  // Day rate = 8 * hourlyRate
  if (res1.dayRate !== res1.hourlyRate * 8) {
    throw new Error(`Test 1 day rate failed: ${res1.dayRate}`);
  }

  return true;
}
