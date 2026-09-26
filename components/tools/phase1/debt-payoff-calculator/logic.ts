export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // annual APR %
  minPayment: number;
}

export interface StrategyResult {
  strategyName: "Snowball" | "Avalanche";
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
}

export interface DebtPayoffComparison {
  snowball: StrategyResult;
  avalanche: StrategyResult;
  interestSavedByAvalanche: number;
  monthsDifference: number;
}

function simulatePayoff(
  debts: DebtItem[],
  extraMonthly: number,
  strategy: "Snowball" | "Avalanche"
): StrategyResult {
  if (debts.length === 0) {
    return {
      strategyName: strategy,
      monthsToPayoff: 0,
      totalInterestPaid: 0,
      totalAmountPaid: 0,
    };
  }

  // Clone debts
  let activeDebts = debts.map((d) => ({
    ...d,
    currentBalance: Math.max(0, d.balance),
    monthlyRate: Math.max(0, d.interestRate) / 100 / 12,
  }));

  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const MAX_MONTHS = 600; // 50 years safety cap

  while (month < MAX_MONTHS) {
    // Filter out debts that are completely paid off
    activeDebts = activeDebts.filter((d) => d.currentBalance > 0.01);
    if (activeDebts.length === 0) break;

    month++;

    // 1. Accrue interest on all active debts
    for (const d of activeDebts) {
      const interest = d.currentBalance * d.monthlyRate;
      d.currentBalance += interest;
      totalInterest += interest;
    }

    // 2. Pay minimums on all active debts
    let availableExtra = Math.max(0, extraMonthly);
    for (const d of activeDebts) {
      const payment = Math.min(d.currentBalance, d.minPayment);
      d.currentBalance -= payment;
      totalPaid += payment;
      // If min payment was higher than balance, leftover rolls into extra
      if (d.minPayment > payment) {
        availableExtra += d.minPayment - payment;
      }
    }

    // 3. Apply extra payment according to strategy
    // Snowball sorts by smallest balance; Avalanche sorts by highest APR
    if (strategy === "Snowball") {
      activeDebts.sort((a, b) => a.currentBalance - b.currentBalance);
    } else {
      activeDebts.sort((a, b) => b.interestRate - a.interestRate);
    }

    for (const d of activeDebts) {
      if (availableExtra <= 0) break;
      if (d.currentBalance > 0) {
        const extraPay = Math.min(d.currentBalance, availableExtra);
        d.currentBalance -= extraPay;
        totalPaid += extraPay;
        availableExtra -= extraPay;
      }
    }
  }

  return {
    strategyName: strategy,
    monthsToPayoff: month,
    totalInterestPaid: Math.round(totalInterest),
    totalAmountPaid: Math.round(totalPaid),
  };
}

export function calculateDebtPayoff(
  debts: DebtItem[],
  extraMonthlyPayment: number
): DebtPayoffComparison {
  const snowball = simulatePayoff(debts, extraMonthlyPayment, "Snowball");
  const avalanche = simulatePayoff(debts, extraMonthlyPayment, "Avalanche");

  const interestSaved = Math.max(0, snowball.totalInterestPaid - avalanche.totalInterestPaid);
  const monthsDiff = Math.abs(snowball.monthsToPayoff - avalanche.monthsToPayoff);

  return {
    snowball,
    avalanche,
    interestSavedByAvalanche: interestSaved,
    monthsDifference: monthsDiff,
  };
}
