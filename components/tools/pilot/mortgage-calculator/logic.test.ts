import { calculateMortgage } from "./logic";

export function runTests(): boolean {
  // Test 1: Standard 30-year mortgage at 6.5% interest on $400,000 home with $80,000 (20%) down
  // Loan amount: $320,000
  // Monthly P&I is roughly $2,022.62
  const res = calculateMortgage({
    homePrice: 400000,
    downPayment: 80000,
    loanTermYears: 30,
    interestRateAnnual: 6.5,
    propertyTaxAnnual: 4800, // $400/mo
    homeInsuranceAnnual: 1200, // $100/mo
    hoaMonthly: 50,
  });

  if (res.loanAmount !== 320000) throw new Error(`Expected loan amount 320000, got ${res.loanAmount}`);
  // Check within 2 dollar margin
  if (Math.abs(res.monthlyPrincipalAndInterest - 2022.62) > 2) {
    throw new Error(`Monthly payment mismatch: ${res.monthlyPrincipalAndInterest}`);
  }
  if (res.monthlyPropertyTax !== 400) throw new Error("Property tax monthly calculation failed");
  if (res.monthlyInsurance !== 100) throw new Error("Insurance monthly calculation failed");
  if (res.totalMonthlyPayment < 2570 || res.totalMonthlyPayment > 2575) {
    throw new Error(`Total monthly payment mismatch: ${res.totalMonthlyPayment}`);
  }

  // Test 2: Zero down payment
  const resZeroDown = calculateMortgage({
    homePrice: 200000,
    downPayment: 0,
    loanTermYears: 15,
    interestRateAnnual: 5.0,
  });
  if (resZeroDown.loanAmount !== 200000) throw new Error("Zero down loan amount failed");

  return true;
}
