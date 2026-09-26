export interface SipInput {
  monthlyInvestment: number;
  expectedAnnualReturn: number; // e.g. 12 for 12%
  investmentYears: number;      // e.g. 15
  annualStepUpPercent?: number; // e.g. 10 for 10% annual increase
}

export interface SipYearlyBreakdown {
  year: number;
  invested: number;
  returns: number;
  balance: number;
}

export interface SipResult {
  totalInvested: number;
  estimatedReturns: number;
  maturityValue: number;
  yearlyBreakdown: SipYearlyBreakdown[];
}

export function calculateSip(input: SipInput): SipResult {
  const baseMonthly = Math.max(0, input.monthlyInvestment);
  const annualRate = Math.max(0, input.expectedAnnualReturn);
  const years = Math.max(1, Math.min(50, Math.round(input.investmentYears)));
  const stepUp = Math.max(0, input.annualStepUpPercent ?? 0);

  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = years * 12;

  let balance = 0;
  let totalInvested = 0;
  let currentMonthly = baseMonthly;
  const yearlyBreakdown: SipYearlyBreakdown[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    // Annual step-up at start of each year after year 1
    if (m > 1 && (m - 1) % 12 === 0 && stepUp > 0) {
      currentMonthly = currentMonthly * (1 + stepUp / 100);
    }

    balance = (balance + currentMonthly) * (1 + monthlyRate);
    totalInvested += currentMonthly;

    if (m % 12 === 0) {
      const year = m / 12;
      const roundedInvested = Math.round(totalInvested);
      const roundedBalance = Math.round(balance);
      yearlyBreakdown.push({
        year,
        invested: roundedInvested,
        returns: Math.max(0, roundedBalance - roundedInvested),
        balance: roundedBalance,
      });
    }
  }

  const finalInvested = Math.round(totalInvested);
  const finalMaturity = Math.round(balance);
  const estimatedReturns = Math.max(0, finalMaturity - finalInvested);

  return {
    totalInvested: finalInvested,
    estimatedReturns,
    maturityValue: finalMaturity,
    yearlyBreakdown,
  };
}
