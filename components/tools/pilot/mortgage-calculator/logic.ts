export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  loanTermYears: number;
  interestRateAnnual: number;
  propertyTaxAnnual?: number;
  homeInsuranceAnnual?: number;
  hoaMonthly?: number;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  totalMonthlyPayment: number;
  totalInterestPaid: number;
  totalLoanCost: number;
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const homePrice = Math.max(0, input.homePrice || 0);
  const downPayment = Math.min(homePrice, Math.max(0, input.downPayment || 0));
  const loanAmount = Math.max(0, homePrice - downPayment);
  const loanTermYears = Math.max(1, input.loanTermYears || 30);
  const annualRate = Math.max(0, input.interestRateAnnual || 0);

  const numberOfPayments = loanTermYears * 12;
  const monthlyRate = annualRate / 100 / 12;

  let monthlyPrincipalAndInterest = 0;

  if (loanAmount === 0) {
    monthlyPrincipalAndInterest = 0;
  } else if (monthlyRate === 0) {
    monthlyPrincipalAndInterest = loanAmount / numberOfPayments;
  } else {
    monthlyPrincipalAndInterest =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const monthlyPropertyTax = (input.propertyTaxAnnual || 0) / 12;
  const monthlyInsurance = (input.homeInsuranceAnnual || 0) / 12;
  const monthlyHoa = input.hoaMonthly || 0;

  const totalMonthlyPayment =
    monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyHoa;

  const totalRepaidPrincipalAndInterest = monthlyPrincipalAndInterest * numberOfPayments;
  const totalInterestPaid = Math.max(0, totalRepaidPrincipalAndInterest - loanAmount);
  const totalLoanCost =
    totalRepaidPrincipalAndInterest +
    (monthlyPropertyTax + monthlyInsurance + monthlyHoa) * numberOfPayments;

  return {
    loanAmount: Math.round(loanAmount),
    monthlyPrincipalAndInterest: Math.round(monthlyPrincipalAndInterest * 100) / 100,
    monthlyPropertyTax: Math.round(monthlyPropertyTax * 100) / 100,
    monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
    monthlyHoa: Math.round(monthlyHoa * 100) / 100,
    totalMonthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
    totalInterestPaid: Math.round(totalInterestPaid),
    totalLoanCost: Math.round(totalLoanCost),
  };
}
