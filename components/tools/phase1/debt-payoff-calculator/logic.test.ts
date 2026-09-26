import { calculateDebtPayoff, DebtItem } from "./logic";

export function runTests(): boolean {
  const sampleDebts: DebtItem[] = [
    { id: "1", name: "Credit Card A", balance: 2500, interestRate: 24.99, minPayment: 75 },
    { id: "2", name: "Medical Bill", balance: 1200, interestRate: 0, minPayment: 50 },
    { id: "3", name: "Auto Loan", balance: 8500, interestRate: 6.5, minPayment: 210 },
  ];

  const res = calculateDebtPayoff(sampleDebts, 200);

  // Avalanche should always pay equal or less interest than snowball
  if (res.avalanche.totalInterestPaid > res.snowball.totalInterestPaid) {
    throw new Error(
      `Avalanche interest ($${res.avalanche.totalInterestPaid}) cannot exceed Snowball ($${res.snowball.totalInterestPaid})`
    );
  }

  if (res.snowball.monthsToPayoff <= 0 || res.avalanche.monthsToPayoff <= 0) {
    throw new Error("Months to payoff must be positive");
  }

  if (res.snowball.totalAmountPaid <= 0 || res.avalanche.totalAmountPaid <= 0) {
    throw new Error("Total amount paid must be positive");
  }

  return true;
}
