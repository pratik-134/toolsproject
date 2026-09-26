export interface CompoundInterestInput {
  initialPrincipal: number;
  monthlyDeposit: number;
  annualInterestRate: number;
  investmentYears: number;
  compoundFrequency: "annually" | "semi-annually" | "quarterly" | "monthly" | "daily";
}

export interface YearlyBreakdown {
  year: number;
  totalContributions: number;
  totalInterestEarned: number;
  endBalance: number;
}

export interface CompoundInterestResult {
  endBalance: number;
  totalContributions: number;
  totalInterest: number;
  yearlySchedule: YearlyBreakdown[];
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const P0 = Math.max(0, input.initialPrincipal || 0);
  const PMT = Math.max(0, input.monthlyDeposit || 0);
  const r = Math.max(0, (input.annualInterestRate || 0) / 100);
  const years = Math.max(1, Math.min(100, input.investmentYears || 10));

  let n = 12; // periods per year
  if (input.compoundFrequency === "annually") n = 1;
  else if (input.compoundFrequency === "semi-annually") n = 2;
  else if (input.compoundFrequency === "quarterly") n = 4;
  else if (input.compoundFrequency === "monthly") n = 12;
  else if (input.compoundFrequency === "daily") n = 365;

  let currentBalance = P0;
  let totalDeposited = P0;
  const yearlySchedule: YearlyBreakdown[] = [];

  const ratePerMonth = r / 12;

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      currentBalance += PMT;
      totalDeposited += PMT;
      // Monthly interest compounding adjustment
      currentBalance += currentBalance * ratePerMonth;
    }

    const totalInterest = Math.max(0, currentBalance - totalDeposited);

    yearlySchedule.push({
      year: y,
      totalContributions: Math.round(totalDeposited),
      totalInterestEarned: Math.round(totalInterest),
      endBalance: Math.round(currentBalance),
    });
  }

  const finalBalance = Math.round(currentBalance);
  const finalDeposited = Math.round(totalDeposited);
  const finalInterest = Math.max(0, finalBalance - finalDeposited);

  return {
    endBalance: finalBalance,
    totalContributions: finalDeposited,
    totalInterest: finalInterest,
    yearlySchedule,
  };
}
