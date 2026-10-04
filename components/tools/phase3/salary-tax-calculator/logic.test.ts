import {
  calculateTaxes,
  STANDARD_DEDUCTION_SINGLE_2026,
  SS_WAGE_CAP_2026,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Exact $120,000 calculation with $0 state tax and $0 pre-tax deductions
  const res120k = calculateTaxes({
    grossSalary: 120000,
    stateRate: 0,
    preTax401k: 0,
    healthHsa: 0,
  });

  // Verify FICA
  // Social Security: 120,000 * 0.062 = 7,440
  if (Math.abs(res120k.socialSecurity - 7440) > 0.01) {
    throw new Error(`Expected SS tax 7440, got ${res120k.socialSecurity}`);
  }
  // Medicare: 120,000 * 0.0145 = 1,740
  if (Math.abs(res120k.medicare - 1740) > 0.01) {
    throw new Error(`Expected Medicare tax 1740, got ${res120k.medicare}`);
  }
  if (Math.abs(res120k.ficaTotal - 9180) > 0.01) {
    throw new Error(`Expected FICA total 9180, got ${res120k.ficaTotal}`);
  }

  // Verify Federal Tax
  // Taxable: 120,000 - 15,000 (std deduction) = 105,000
  // Brackets: 1192.5 + 4386 + 12072.5 + 396 = 18,047
  if (Math.abs(res120k.federalTax - 18047) > 0.01) {
    throw new Error(`Expected Federal tax 18047, got ${res120k.federalTax}`);
  }

  // Net annual: 120,000 - (18047 + 9180) = 92,773
  if (Math.abs(res120k.netAnnual - 92773) > 0.01) {
    throw new Error(`Expected Net annual 92773, got ${res120k.netAnnual}`);
  }

  // Test 2: Social Security wage cap ($176,100) and Additional Medicare Tax (> $200k)
  const res250k = calculateTaxes({
    grossSalary: 250000,
    stateRate: 0,
  });

  const expectedMaxSs = SS_WAGE_CAP_2026 * 0.062; // 10,918.20
  if (Math.abs(res250k.socialSecurity - expectedMaxSs) > 0.01) {
    throw new Error(`Expected capped SS tax ${expectedMaxSs}, got ${res250k.socialSecurity}`);
  }

  // Medicare for 250k: 250000 * 0.0145 + (250000 - 200000) * 0.009 = 3625 + 450 = 4075
  if (Math.abs(res250k.medicare - 4075) > 0.01) {
    throw new Error(`Expected Medicare 4075, got ${res250k.medicare}`);
  }

  // Test 3: Pre-tax 401(k) deduction reducing taxable federal income
  const resWith401k = calculateTaxes({
    grossSalary: 120000,
    stateRate: 0,
    preTax401k: 20000,
  });
  // AGI = 100,000. Taxable = 85,000.
  // Federal tax on 85,000 = 1192.5 + 4386 + (85000 - 48475) * 0.22 = 5578.5 + 8035.5 = 13,614
  if (Math.abs(resWith401k.federalTax - 13614) > 0.01) {
    throw new Error(`Expected Federal tax with 401k 13614, got ${resWith401k.federalTax}`);
  }

  // Test 4: Boundaries - zero and negative income
  const resZero = calculateTaxes({ grossSalary: 0, stateRate: 0.05 });
  if (resZero.netAnnual !== 0 || resZero.totalTaxes !== 0 || resZero.effectiveTaxRate !== 0) {
    throw new Error("Zero income should yield 0 taxes and net");
  }

  const resNegative = calculateTaxes({ grossSalary: -50000, stateRate: 0.05 });
  if (resNegative.gross !== 0 || resNegative.netAnnual !== 0) {
    throw new Error("Negative gross salary should clamp to 0");
  }

  return true;
}
