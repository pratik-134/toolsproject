export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// 2026 IRS Federal Tax Brackets for Single Filers
export const FEDERAL_BRACKETS_SINGLE_2026: TaxBracket[] = [
  { min: 0, max: 11925, rate: 0.1 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

export const STANDARD_DEDUCTION_SINGLE_2026 = 15000;
export const SS_WAGE_CAP_2026 = 176100;

export const STATE_TAX_PRESETS: Record<string, { name: string; rate: number }> = {
  NONE: { name: "No State Tax (TX, FL, WA, NV, TN)", rate: 0.0 },
  CA: { name: "California (Avg ~8.0%)", rate: 0.08 },
  NY: { name: "New York (Avg ~6.5%)", rate: 0.065 },
  IL: { name: "Illinois (Flat 4.95%)", rate: 0.0495 },
  PA: { name: "Pennsylvania (Flat 3.07%)", rate: 0.0307 },
  MA: { name: "Massachusetts (Flat 5.0%)", rate: 0.05 },
  CUSTOM: { name: "Custom State Rate", rate: 0.05 },
};

export interface SalaryTaxParams {
  grossSalary: number;
  stateRate: number; // e.g. 0.05 for 5%
  preTax401k?: number;
  healthHsa?: number;
}

export interface SalaryTaxResult {
  gross: number;
  preTaxTotal: number;
  federalTax: number;
  socialSecurity: number;
  medicare: number;
  ficaTotal: number;
  stateTax: number;
  totalTaxes: number;
  netAnnual: number;
  effectiveTaxRate: number;
  monthlyNet: number;
  biweeklyNet: number;
  semiMonthlyNet: number;
  weeklyNet: number;
  hourlyEquivalent: number;
}

export function calculateTaxes({
  grossSalary,
  stateRate,
  preTax401k = 0,
  healthHsa = 0,
}: SalaryTaxParams): SalaryTaxResult {
  const gross = Math.max(0, grossSalary);
  const preTaxTotal = Math.min(gross, Math.max(0, preTax401k) + Math.max(0, healthHsa));

  // FICA Taxes (Social Security 6.2% up to wage cap, Medicare 1.45% + 0.9% above $200k)
  const ssTaxable = Math.min(gross, SS_WAGE_CAP_2026);
  const socialSecurity = ssTaxable * 0.062;
  const medicare = gross * 0.0145 + (gross > 200000 ? (gross - 200000) * 0.009 : 0);
  const ficaTotal = socialSecurity + medicare;

  // Federal Income Tax
  const agi = Math.max(0, gross - preTaxTotal);
  const federalTaxable = Math.max(0, agi - STANDARD_DEDUCTION_SINGLE_2026);

  let federalTax = 0;
  for (const b of FEDERAL_BRACKETS_SINGLE_2026) {
    if (federalTaxable > b.min) {
      const taxableInBracket = Math.min(federalTaxable, b.max) - b.min;
      federalTax += taxableInBracket * b.rate;
    }
  }

  // State Tax Estimate
  const effectiveStateRate = Math.max(0, stateRate);
  const stateTax = Math.max(0, (gross - preTaxTotal) * effectiveStateRate);

  // Total Taxes & Net
  const totalTaxes = federalTax + ficaTotal + stateTax;
  const netAnnual = Math.max(0, gross - totalTaxes - preTaxTotal);
  const effectiveTaxRate = gross > 0 ? (totalTaxes / gross) * 100 : 0;

  return {
    gross,
    preTaxTotal,
    federalTax,
    socialSecurity,
    medicare,
    ficaTotal,
    stateTax,
    totalTaxes,
    netAnnual,
    effectiveTaxRate,
    monthlyNet: netAnnual / 12,
    biweeklyNet: netAnnual / 26,
    semiMonthlyNet: netAnnual / 24,
    weeklyNet: netAnnual / 52,
    hourlyEquivalent: gross / 2080,
  };
}
