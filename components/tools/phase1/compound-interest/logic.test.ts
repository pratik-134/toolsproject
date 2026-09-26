import { calculateCompoundInterest } from "./logic";

export function runTests(): boolean {
  // Test 1: $10,000 initial + $500/month at 8% annual return over 10 years
  // Total contributed: 10,000 + 500*120 = $70,000
  // Future balance should exceed $115,000
  const res = calculateCompoundInterest({
    initialPrincipal: 10000,
    monthlyDeposit: 500,
    annualInterestRate: 8,
    investmentYears: 10,
    compoundFrequency: "monthly",
  });

  if (res.totalContributions !== 70000) {
    throw new Error(`Expected contributions 70000, got ${res.totalContributions}`);
  }
  if (res.endBalance < 110000 || res.endBalance > 125000) {
    throw new Error(`Unexpected end balance: ${res.endBalance}`);
  }
  if (res.yearlySchedule.length !== 10) {
    throw new Error(`Expected 10 years in schedule, got ${res.yearlySchedule.length}`);
  }

  return true;
}
