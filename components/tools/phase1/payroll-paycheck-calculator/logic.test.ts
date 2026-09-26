import { calculatePayroll } from "./logic";

export function runTests(): boolean {
  // Test 1: $75,000 annual salary, bi-weekly, single
  const res = calculatePayroll({
    payType: "salary",
    annualSalary: 75000,
    payFrequency: "bi-weekly",
    filingStatus: "single",
    stateTaxRatePercent: 5,
    k401ContributionPercent: 5,
    healthInsurancePerPeriod: 100,
  });

  if (res.periodsPerYear !== 26) {
    throw new Error(`Expected 26 pay periods, got ${res.periodsPerYear}`);
  }
  if (Math.abs(res.grossPayPerPeriod - 2884.62) > 1) {
    throw new Error(`Expected ~$2884.62 gross per period, got ${res.grossPayPerPeriod}`);
  }
  if (res.netPayPerPeriod <= 0 || res.netPayPerPeriod >= res.grossPayPerPeriod) {
    throw new Error(`Invalid net pay per period: ${res.netPayPerPeriod}`);
  }
  if (res.totalFicaAnnual <= 0) {
    throw new Error("FICA taxes should be greater than zero");
  }
  if (res.federalTaxAnnual <= 0) {
    throw new Error("Federal tax should be greater than zero");
  }
  if (res.stateTaxAnnual <= 0) {
    throw new Error("State tax should be greater than zero");
  }
  if (res.takeHomePercentage < 50 || res.takeHomePercentage > 95) {
    throw new Error(`Unexpected take home percentage: ${res.takeHomePercentage}%`);
  }

  // Test 2: Hourly worker, $30/hr, 40 hours/week, weekly frequency
  const hourlyRes = calculatePayroll({
    payType: "hourly",
    hourlyRate: 30,
    hoursPerWeek: 40,
    payFrequency: "weekly",
    filingStatus: "single",
    stateTaxRatePercent: 4,
    k401ContributionPercent: 0,
    healthInsurancePerPeriod: 0,
  });

  if (hourlyRes.grossPayAnnual !== 62400) {
    throw new Error(`Expected gross annual $62,400, got ${hourlyRes.grossPayAnnual}`);
  }
  if (hourlyRes.grossPayPerPeriod !== 1200) {
    throw new Error(`Expected weekly gross $1,200, got ${hourlyRes.grossPayPerPeriod}`);
  }
  if (hourlyRes.netPayAnnual <= 0 || hourlyRes.netPayAnnual > 62400) {
    throw new Error(`Invalid hourly net annual: ${hourlyRes.netPayAnnual}`);
  }

  // Test 3: Zero income edge case
  const zeroRes = calculatePayroll({
    payType: "salary",
    annualSalary: 0,
    payFrequency: "bi-weekly",
    filingStatus: "single",
  });

  if (zeroRes.grossPayAnnual !== 0 || zeroRes.netPayAnnual !== 0) {
    throw new Error("Zero income should result in zero net pay");
  }
  if (zeroRes.totalTaxesAnnual !== 0) {
    throw new Error("Zero income should have zero taxes");
  }

  return true;
}
