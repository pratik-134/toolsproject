import { calculateSip } from "./logic";

export function runTests(): boolean {
  // Test baseline SIP: $1,000/mo, 12% annual return, 10 years, 0% step up
  // Invested: $120,000. Maturity should be ~ $232,339
  const res = calculateSip({
    monthlyInvestment: 1000,
    expectedAnnualReturn: 12,
    investmentYears: 10,
    annualStepUpPercent: 0,
  });

  if (res.totalInvested !== 120000) {
    throw new Error(`Expected total invested $120,000, got ${res.totalInvested}`);
  }
  if (Math.abs(res.maturityValue - 232339) > 100) {
    throw new Error(`Expected ~232,339 maturity value, got ${res.maturityValue}`);
  }
  if (res.yearlyBreakdown.length !== 10) {
    throw new Error(`Expected 10 years in breakdown, got ${res.yearlyBreakdown.length}`);
  }

  // Test with step-up 10%
  const resStepUp = calculateSip({
    monthlyInvestment: 1000,
    expectedAnnualReturn: 12,
    investmentYears: 5,
    annualStepUpPercent: 10,
  });

  if (resStepUp.totalInvested <= 60000) {
    throw new Error("Step-up invested should be strictly greater than static 5y invested ($60k)");
  }

  return true;
}
