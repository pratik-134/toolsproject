import { calculateAutoLoan } from "./logic";

export function runTests(): boolean {
  // Test 1: $30,000 car, $5,000 down, 60 months, 5% interest, 0 tax/fees
  // Financed: 25,000. Monthly rate: 0.05 / 12 = 0.0041667.
  // Monthly payment: 25,000 * (0.0041667 * 1.0041667^60) / (1.0041667^60 - 1) = ~471.78
  const res1 = calculateAutoLoan({
    vehiclePrice: 30000,
    downPayment: 5000,
    interestRateAnnual: 5,
    loanTermMonths: 60,
  });

  if (res1.totalFinanced !== 25000) {
    throw new Error(`Test 1 financed failed: ${res1.totalFinanced}`);
  }
  if (res1.monthlyPayment < 470 || res1.monthlyPayment > 473) {
    throw new Error(`Test 1 monthly payment failed: ${res1.monthlyPayment}`);
  }

  // Test 2: 0% APR promotional financing
  const res2 = calculateAutoLoan({
    vehiclePrice: 24000,
    downPayment: 0,
    interestRateAnnual: 0,
    loanTermMonths: 48,
  });

  if (res2.monthlyPayment !== 500 || res2.totalInterest !== 0) {
    throw new Error(`Test 2 zero interest failed: ${res2.monthlyPayment}`);
  }

  return true;
}
