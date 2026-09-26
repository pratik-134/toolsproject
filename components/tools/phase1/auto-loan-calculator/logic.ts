/**
 * Auto Loan & Vehicle Finance Calculator Logic
 * Pure client-side calculations for automotive financing.
 */

export interface AutoLoanInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue?: number;
  amountOwedOnTradeIn?: number;
  salesTaxRate?: number; // e.g. 7%
  fees?: number; // e.g. doc/title fees
  interestRateAnnual: number; // e.g. 5.5%
  loanTermMonths: number; // e.g. 60 months
}

export interface AutoLoanResult {
  monthlyPayment: number;
  totalFinanced: number;
  totalInterest: number;
  totalCost: number; // total payments + down payment + net trade-in
  salesTaxAmount: number;
  netTradeIn: number;
}

export function calculateAutoLoan(input: AutoLoanInput): AutoLoanResult {
  const {
    vehiclePrice,
    downPayment,
    tradeInValue = 0,
    amountOwedOnTradeIn = 0,
    salesTaxRate = 0,
    fees = 0,
    interestRateAnnual,
    loanTermMonths,
  } = input;

  if (vehiclePrice < 0 || interestRateAnnual < 0 || loanTermMonths <= 0) {
    throw new Error("Vehicle price and interest rate must be non-negative, and term must be positive");
  }

  // Net trade-in equity
  const netTradeIn = tradeInValue - amountOwedOnTradeIn;

  // Sales tax is typically applied to (Price - Trade-in) in many jurisdictions, or full price
  const taxableAmount = Math.max(0, vehiclePrice - Math.max(0, tradeInValue));
  const salesTaxAmount = (taxableAmount * Math.max(0, salesTaxRate)) / 100;

  // Total Financed Loan Amount
  const totalFinanced = Math.max(
    0,
    vehiclePrice + salesTaxAmount + fees - downPayment - netTradeIn
  );

  let monthlyPayment = 0;
  let totalInterest = 0;

  if (totalFinanced > 0) {
    if (interestRateAnnual === 0) {
      monthlyPayment = totalFinanced / loanTermMonths;
      totalInterest = 0;
    } else {
      const monthlyRate = interestRateAnnual / 100 / 12;
      monthlyPayment =
        (totalFinanced *
          (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
      totalInterest = monthlyPayment * loanTermMonths - totalFinanced;
    }
  }

  const totalCost = monthlyPayment * loanTermMonths + downPayment + Math.max(0, netTradeIn);

  return {
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    totalFinanced: Number(totalFinanced.toFixed(2)),
    totalInterest: Number(Math.max(0, totalInterest).toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    salesTaxAmount: Number(salesTaxAmount.toFixed(2)),
    netTradeIn: Number(netTradeIn.toFixed(2)),
  };
}
