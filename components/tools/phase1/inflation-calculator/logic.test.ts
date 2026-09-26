import { calculateInflation } from "./logic";

export function runTests(): boolean {
  // 1. $100 at 3% for 10 years
  // 100 * (1.03)^10 = 134.3916 -> 134.39
  // purchasing power: 100 / (1.03)^10 = 74.409 -> 74.41
  const res = calculateInflation({
    initialAmount: 100,
    annualRate: 3,
    years: 10,
  });

  if (Math.abs(res.futureEquivalentCost - 134.39) > 0.05) {
    throw new Error(`Future equivalent cost mismatch: got ${res.futureEquivalentCost}`);
  }
  if (Math.abs(res.purchasingPower - 74.41) > 0.05) {
    throw new Error(`Purchasing power mismatch: got ${res.purchasingPower}`);
  }
  if (res.yearlyBreakdown.length !== 10) {
    throw new Error(`Expected 10 years in breakdown, got ${res.yearlyBreakdown.length}`);
  }

  // 2. 0 years
  const resZero = calculateInflation({
    initialAmount: 500,
    annualRate: 4,
    years: 0,
  });
  if (resZero.futureEquivalentCost !== 500 || resZero.purchasingPower !== 500) {
    throw new Error(`Zero years test failed: ${JSON.stringify(resZero)}`);
  }

  return true;
}
