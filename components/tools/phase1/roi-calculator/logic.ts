export interface RoiInput {
  initialInvestment: number;
  finalValue: number;
  investmentYears: number; // e.g. 3.5 years
}

export interface RoiResult {
  netProfit: number;
  totalRoiPercent: number;
  annualizedRoiPercent: number; // CAGR
  simpleAnnualReturnPercent: number;
  multiplier: number;
  isProfit: boolean;
}

export function calculateRoi(input: RoiInput): RoiResult {
  const initial = Math.max(0, input.initialInvestment);
  const finalVal = Math.max(0, input.finalValue);
  const years = Math.max(0.01, input.investmentYears);

  if (initial <= 0) {
    return {
      netProfit: 0,
      totalRoiPercent: 0,
      annualizedRoiPercent: 0,
      simpleAnnualReturnPercent: 0,
      multiplier: 1,
      isProfit: true,
    };
  }

  const netProfit = finalVal - initial;
  const totalRoiPercent = (netProfit / initial) * 100;
  const simpleAnnualReturn = totalRoiPercent / years;

  // Annualized ROI / CAGR: (Final / Initial)^(1 / years) - 1
  let annualizedRoi = 0;
  if (finalVal > 0) {
    annualizedRoi = (Math.pow(finalVal / initial, 1 / years) - 1) * 100;
  } else {
    annualizedRoi = -100;
  }

  const multiplier = finalVal / initial;

  return {
    netProfit: Math.round(netProfit * 100) / 100,
    totalRoiPercent: Math.round(totalRoiPercent * 100) / 100,
    annualizedRoiPercent: Math.round(annualizedRoi * 100) / 100,
    simpleAnnualReturnPercent: Math.round(simpleAnnualReturn * 100) / 100,
    multiplier: Math.round(multiplier * 100) / 100,
    isProfit: netProfit >= 0,
  };
}
