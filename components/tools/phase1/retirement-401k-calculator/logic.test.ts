import { calculateRetirement401k } from "./logic";

export function runTests(): boolean {
  // Test age 30 to 65 (35 years), current savings $20k, salary $75k, 6% employee, 50% match up to 6%, 7% return, 2% raise
  const res = calculateRetirement401k({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 20000,
    annualSalary: 75000,
    employeeContributionPercent: 6,
    employerMatchPercent: 50,
    employerMatchCapPercent: 6,
    annualSalaryIncreasePercent: 2,
    expectedAnnualReturn: 7,
    retirementLifespanYears: 25,
    postRetirementReturnPercent: 4.5,
  });

  if (res.yearsToRetirement !== 35) {
    throw new Error(`Expected 35 years to retirement, got ${res.yearsToRetirement}`);
  }
  if (res.nestEggAtRetirement < 1000000) {
    throw new Error(`Expected nest egg over $1,000,000, got ${res.nestEggAtRetirement}`);
  }
  if (res.totalEmployeeContributed <= 0 || res.totalEmployerContributed <= 0) {
    throw new Error("Contributions must be positive");
  }
  if (res.estimatedMonthlyDrawdown <= 0) {
    throw new Error("Estimated monthly drawdown must be positive");
  }
  if (res.yearlySchedule.length !== 35) {
    throw new Error(`Expected 35 schedule entries, got ${res.yearlySchedule.length}`);
  }

  return true;
}
