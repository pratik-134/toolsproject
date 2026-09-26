export interface Retirement401kInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  annualSalary: number;
  employeeContributionPercent: number; // e.g. 8%
  employerMatchPercent: number;        // e.g. 50% match
  employerMatchCapPercent: number;     // up to 6% of salary
  annualSalaryIncreasePercent: number; // e.g. 3%
  expectedAnnualReturn: number;        // e.g. 7.5%
  retirementLifespanYears?: number;    // e.g. 25 years in retirement
  postRetirementReturnPercent?: number;// e.g. 5% in retirement
}

export interface RetirementYearRecord {
  age: number;
  salary: number;
  employeeContr: number;
  employerContr: number;
  yearGrowth: number;
  balance: number;
}

export interface Retirement401kResult {
  nestEggAtRetirement: number;
  totalEmployeeContributed: number;
  totalEmployerContributed: number;
  totalGrowth: number;
  yearsToRetirement: number;
  estimatedMonthlyDrawdown: number;
  yearlySchedule: RetirementYearRecord[];
}

export function calculateRetirement401k(
  input: Retirement401kInput
): Retirement401kResult {
  const currentAge = Math.max(18, Math.min(80, Math.round(input.currentAge)));
  const retirementAge = Math.max(currentAge + 1, Math.min(90, Math.round(input.retirementAge)));
  const yearsToRetirement = retirementAge - currentAge;

  let balance = Math.max(0, input.currentSavings);
  let salary = Math.max(0, input.annualSalary);
  const salaryIncrease = Math.max(0, input.annualSalaryIncreasePercent) / 100;
  const growthRate = Math.max(0, input.expectedAnnualReturn) / 100;

  const empPercent = Math.max(0, input.employeeContributionPercent) / 100;
  const matchFactor = Math.max(0, input.employerMatchPercent) / 100;
  const matchCap = Math.max(0, input.employerMatchCapPercent) / 100;

  let totalEmployeeContributed = 0;
  let totalEmployerContributed = 0;
  const yearlySchedule: RetirementYearRecord[] = [];

  for (let y = 1; y <= yearsToRetirement; y++) {
    const age = currentAge + y;

    // Contributions this year
    const employeeAnnual = salary * empPercent;
    // Employer matches employee contributions up to matchCap
    const eligibleForMatch = Math.min(salary * matchCap, employeeAnnual);
    const employerAnnual = eligibleForMatch * matchFactor;

    totalEmployeeContributed += employeeAnnual;
    totalEmployerContributed += employerAnnual;

    const totalContributionThisYear = employeeAnnual + employerAnnual;
    // Mid-year contribution growth approximation
    const yearGrowth = balance * growthRate + totalContributionThisYear * (growthRate / 2);
    balance = balance + totalContributionThisYear + yearGrowth;

    yearlySchedule.push({
      age,
      salary: Math.round(salary),
      employeeContr: Math.round(employeeAnnual),
      employerContr: Math.round(employerAnnual),
      yearGrowth: Math.round(yearGrowth),
      balance: Math.round(balance),
    });

    // Salary increases for next year
    salary = salary * (1 + salaryIncrease);
  }

  const nestEgg = Math.round(balance);
  const totalGrowth = Math.max(
    0,
    nestEgg - Math.round(input.currentSavings) - Math.round(totalEmployeeContributed) - Math.round(totalEmployerContributed)
  );

  // Post-retirement monthly drawdown estimate (Amortization formula over retirement lifespan)
  const lifespanYears = input.retirementLifespanYears ?? 25;
  const postReturn = (input.postRetirementReturnPercent ?? 4.5) / 100 / 12;
  const totalRetirementMonths = lifespanYears * 12;

  let monthlyDrawdown = 0;
  if (postReturn > 0 && totalRetirementMonths > 0) {
    monthlyDrawdown =
      (nestEgg * (postReturn * Math.pow(1 + postReturn, totalRetirementMonths))) /
      (Math.pow(1 + postReturn, totalRetirementMonths) - 1);
  } else if (totalRetirementMonths > 0) {
    monthlyDrawdown = nestEgg / totalRetirementMonths;
  }

  return {
    nestEggAtRetirement: nestEgg,
    totalEmployeeContributed: Math.round(totalEmployeeContributed),
    totalEmployerContributed: Math.round(totalEmployerContributed),
    totalGrowth,
    yearsToRetirement,
    estimatedMonthlyDrawdown: Math.round(monthlyDrawdown),
    yearlySchedule,
  };
}
