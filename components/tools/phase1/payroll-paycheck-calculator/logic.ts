export type PayFrequency = "weekly" | "bi-weekly" | "semi-monthly" | "monthly";
export type FilingStatus = "single" | "married";
export type PayType = "salary" | "hourly";

export interface PayrollInput {
  payType: PayType;
  annualSalary?: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
  payFrequency: PayFrequency;
  filingStatus: FilingStatus;
  stateTaxRatePercent?: number; // e.g. 5%
  k401ContributionPercent?: number; // pre-tax % of gross
  healthInsurancePerPeriod?: number; // pre-tax $ per paycheck
  otherDeductionsPerPeriod?: number; // post-tax $ per paycheck
}

export interface PayrollBreakdownItem {
  label: string;
  amountPerPeriod: number;
  amountAnnual: number;
  percentageOfGross: number;
  category: "income" | "tax" | "pre-tax" | "post-tax" | "net";
}

export interface PayrollResult {
  periodsPerYear: number;
  grossPayPerPeriod: number;
  grossPayAnnual: number;
  federalTaxPerPeriod: number;
  federalTaxAnnual: number;
  socialSecurityPerPeriod: number;
  socialSecurityAnnual: number;
  medicarePerPeriod: number;
  medicareAnnual: number;
  totalFicaPerPeriod: number;
  totalFicaAnnual: number;
  stateTaxPerPeriod: number;
  stateTaxAnnual: number;
  preTaxDeductionsPerPeriod: number;
  preTaxDeductionsAnnual: number;
  postTaxDeductionsPerPeriod: number;
  postTaxDeductionsAnnual: number;
  totalTaxesPerPeriod: number;
  totalTaxesAnnual: number;
  netPayPerPeriod: number;
  netPayAnnual: number;
  takeHomePercentage: number;
  effectiveTaxRate: number;
  breakdown: PayrollBreakdownItem[];
}

// 2024 / standard IRS tax brackets
const FEDERAL_BRACKETS_2024 = {
  single: [
    { limit: 11600, rate: 0.1 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
  married: [
    { limit: 23200, rate: 0.1 },
    { limit: 94300, rate: 0.12 },
    { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 },
    { limit: 487450, rate: 0.32 },
    { limit: 731200, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
};

const STANDARD_DEDUCTION_2024 = {
  single: 14600,
  married: 29200,
};

const SOCIAL_SECURITY_WAGE_CAP_2024 = 168600;
const SOCIAL_SECURITY_RATE = 0.062; // 6.2%
const MEDICARE_BASE_RATE = 0.0145; // 1.45%
const ADDITIONAL_MEDICARE_THRESHOLD = {
  single: 200000,
  married: 250000,
};
const ADDITIONAL_MEDICARE_RATE = 0.009; // 0.9%

export const PAY_FREQUENCIES: Record<PayFrequency, { label: string; periods: number }> = {
  weekly: { label: "Weekly (52x)", periods: 52 },
  "bi-weekly": { label: "Bi-Weekly (26x)", periods: 26 },
  "semi-monthly": { label: "Semi-Monthly (24x)", periods: 24 },
  monthly: { label: "Monthly (12x)", periods: 12 },
};

export function estimateAnnualFederalTax(
  taxableAnnualIncome: number,
  status: FilingStatus
): number {
  if (taxableAnnualIncome <= 0) return 0;

  const brackets = FEDERAL_BRACKETS_2024[status];
  let tax = 0;
  let previousLimit = 0;

  for (const b of brackets) {
    if (taxableAnnualIncome > previousLimit) {
      const taxableInBracket = Math.min(taxableAnnualIncome - previousLimit, b.limit - previousLimit);
      tax += taxableInBracket * b.rate;
      previousLimit = b.limit;
    } else {
      break;
    }
  }

  return Math.round(tax * 100) / 100;
}

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const periods = PAY_FREQUENCIES[input.payFrequency]?.periods || 26;

  // 1. Gross Annual Income
  let grossAnnual = 0;
  if (input.payType === "hourly") {
    const hourly = Math.max(0, input.hourlyRate || 0);
    const hours = Math.max(0, input.hoursPerWeek || 40);
    grossAnnual = hourly * hours * 52;
  } else {
    grossAnnual = Math.max(0, input.annualSalary || 0);
  }

  const grossPerPeriod = periods > 0 ? grossAnnual / periods : 0;

  // 2. Pre-Tax Deductions
  const k401Rate = Math.min(100, Math.max(0, input.k401ContributionPercent || 0)) / 100;
  const k401Annual = grossAnnual * k401Rate;
  const healthInsurancePerPeriod = Math.max(0, input.healthInsurancePerPeriod || 0);
  const healthInsuranceAnnual = healthInsurancePerPeriod * periods;
  const preTaxAnnual = k401Annual + healthInsuranceAnnual;
  const preTaxPerPeriod = periods > 0 ? preTaxAnnual / periods : 0;

  // 3. FICA Taxes
  // Health insurance (Section 125 cafeteria plan) is exempt from FICA; 401(k) is subject to FICA.
  const ficaTaxableAnnual = Math.max(0, grossAnnual - healthInsuranceAnnual);
  
  // Social Security (capped at $168,600)
  const ssTaxableAnnual = Math.min(ficaTaxableAnnual, SOCIAL_SECURITY_WAGE_CAP_2024);
  const socialSecurityAnnual = Math.round(ssTaxableAnnual * SOCIAL_SECURITY_RATE * 100) / 100;
  const socialSecurityPerPeriod = periods > 0 ? socialSecurityAnnual / periods : 0;

  // Medicare (no cap, +0.9% above threshold)
  const addlThreshold = ADDITIONAL_MEDICARE_THRESHOLD[input.filingStatus];
  let medicareAnnual = ficaTaxableAnnual * MEDICARE_BASE_RATE;
  if (ficaTaxableAnnual > addlThreshold) {
    medicareAnnual += (ficaTaxableAnnual - addlThreshold) * ADDITIONAL_MEDICARE_RATE;
  }
  medicareAnnual = Math.round(medicareAnnual * 100) / 100;
  const medicarePerPeriod = periods > 0 ? medicareAnnual / periods : 0;

  const totalFicaAnnual = socialSecurityAnnual + medicareAnnual;
  const totalFicaPerPeriod = periods > 0 ? totalFicaAnnual / periods : 0;

  // 4. Federal Income Tax
  // Taxable federal income = Gross - Pre-tax deductions - Standard deduction
  const standardDeduction = STANDARD_DEDUCTION_2024[input.filingStatus] || 14600;
  const fedTaxableAnnual = Math.max(0, grossAnnual - preTaxAnnual - standardDeduction);
  const federalTaxAnnual = estimateAnnualFederalTax(fedTaxableAnnual, input.filingStatus);
  const federalTaxPerPeriod = periods > 0 ? federalTaxAnnual / periods : 0;

  // 5. State Tax
  const stateRate = Math.min(100, Math.max(0, input.stateTaxRatePercent ?? 5)) / 100;
  // Estimate state taxable after standard deduction approximation
  const stateTaxableAnnual = Math.max(0, grossAnnual - preTaxAnnual);
  const stateTaxAnnual = Math.round(stateTaxableAnnual * stateRate * 100) / 100;
  const stateTaxPerPeriod = periods > 0 ? stateTaxAnnual / periods : 0;

  // 6. Post-Tax Deductions
  const postTaxPerPeriod = Math.max(0, input.otherDeductionsPerPeriod || 0);
  const postTaxAnnual = postTaxPerPeriod * periods;

  // 7. Totals & Net Pay
  const totalTaxesAnnual = federalTaxAnnual + totalFicaAnnual + stateTaxAnnual;
  const totalTaxesPerPeriod = periods > 0 ? totalTaxesAnnual / periods : 0;

  const netAnnual = Math.max(0, grossAnnual - totalTaxesAnnual - preTaxAnnual - postTaxAnnual);
  const netPerPeriod = periods > 0 ? netAnnual / periods : 0;

  const takeHomePercentage = grossAnnual > 0 ? Math.round((netAnnual / grossAnnual) * 1000) / 10 : 0;
  const effectiveTaxRate = grossAnnual > 0 ? Math.round((totalTaxesAnnual / grossAnnual) * 1000) / 10 : 0;

  const round = (num: number) => Math.round(num * 100) / 100;

  const breakdown: PayrollBreakdownItem[] = [
    {
      label: "Net Take-Home Pay",
      amountPerPeriod: round(netPerPeriod),
      amountAnnual: round(netAnnual),
      percentageOfGross: grossAnnual > 0 ? Math.round((netAnnual / grossAnnual) * 100) : 0,
      category: "net",
    },
    {
      label: "Federal Income Tax",
      amountPerPeriod: round(federalTaxPerPeriod),
      amountAnnual: round(federalTaxAnnual),
      percentageOfGross: grossAnnual > 0 ? Math.round((federalTaxAnnual / grossAnnual) * 100) : 0,
      category: "tax",
    },
    {
      label: "FICA (Social Security & Medicare)",
      amountPerPeriod: round(totalFicaPerPeriod),
      amountAnnual: round(totalFicaAnnual),
      percentageOfGross: grossAnnual > 0 ? Math.round((totalFicaAnnual / grossAnnual) * 100) : 0,
      category: "tax",
    },
    {
      label: "State Income Tax",
      amountPerPeriod: round(stateTaxPerPeriod),
      amountAnnual: round(stateTaxAnnual),
      percentageOfGross: grossAnnual > 0 ? Math.round((stateTaxAnnual / grossAnnual) * 100) : 0,
      category: "tax",
    },
    {
      label: "Pre-Tax Deductions (401k, Health)",
      amountPerPeriod: round(preTaxPerPeriod),
      amountAnnual: round(preTaxAnnual),
      percentageOfGross: grossAnnual > 0 ? Math.round((preTaxAnnual / grossAnnual) * 100) : 0,
      category: "pre-tax",
    },
  ];

  if (postTaxAnnual > 0) {
    breakdown.push({
      label: "Post-Tax Deductions",
      amountPerPeriod: round(postTaxPerPeriod),
      amountAnnual: round(postTaxAnnual),
      percentageOfGross: grossAnnual > 0 ? Math.round((postTaxAnnual / grossAnnual) * 100) : 0,
      category: "post-tax",
    });
  }

  return {
    periodsPerYear: periods,
    grossPayPerPeriod: round(grossPerPeriod),
    grossPayAnnual: round(grossAnnual),
    federalTaxPerPeriod: round(federalTaxPerPeriod),
    federalTaxAnnual: round(federalTaxAnnual),
    socialSecurityPerPeriod: round(socialSecurityPerPeriod),
    socialSecurityAnnual: round(socialSecurityAnnual),
    medicarePerPeriod: round(medicarePerPeriod),
    medicareAnnual: round(medicareAnnual),
    totalFicaPerPeriod: round(totalFicaPerPeriod),
    totalFicaAnnual: round(totalFicaAnnual),
    stateTaxPerPeriod: round(stateTaxPerPeriod),
    stateTaxAnnual: round(stateTaxAnnual),
    preTaxDeductionsPerPeriod: round(preTaxPerPeriod),
    preTaxDeductionsAnnual: round(preTaxAnnual),
    postTaxDeductionsPerPeriod: round(postTaxPerPeriod),
    postTaxDeductionsAnnual: round(postTaxAnnual),
    totalTaxesPerPeriod: round(totalTaxesPerPeriod),
    totalTaxesAnnual: round(totalTaxesAnnual),
    netPayPerPeriod: round(netPerPeriod),
    netPayAnnual: round(netAnnual),
    takeHomePercentage,
    effectiveTaxRate,
    breakdown,
  };
}
