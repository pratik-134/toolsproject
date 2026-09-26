import { calculateRoi } from "./logic";

export function runTests(): boolean {
  // Test: Initial $10,000, Final $15,000 over 3 years
  // Net profit = 5,000, Total ROI = 50%
  // CAGR = (1.5)^(1/3) - 1 ~ 14.47%
  const res = calculateRoi({
    initialInvestment: 10000,
    finalValue: 15000,
    investmentYears: 3,
  });

  if (res.netProfit !== 5000) throw new Error(`Expected net profit 5000, got ${res.netProfit}`);
  if (res.totalRoiPercent !== 50) throw new Error(`Expected total ROI 50%, got ${res.totalRoiPercent}`);
  if (Math.abs(res.annualizedRoiPercent - 14.47) > 0.1) {
    throw new Error(`Expected CAGR ~14.47%, got ${res.annualizedRoiPercent}`);
  }
  if (res.multiplier !== 1.5) throw new Error(`Expected multiplier 1.5, got ${res.multiplier}`);
  if (!res.isProfit) throw new Error("Should be profitable");

  // Test loss: Initial $10,000, Final $8,000
  const lossRes = calculateRoi({
    initialInvestment: 10000,
    finalValue: 8000,
    investmentYears: 2,
  });

  if (lossRes.netProfit !== -2000) throw new Error(`Expected net loss -2000, got ${lossRes.netProfit}`);
  if (lossRes.totalRoiPercent !== -20) throw new Error(`Expected total ROI -20%, got ${lossRes.totalRoiPercent}`);
  if (lossRes.isProfit) throw new Error("Should not be profitable");

  return true;
}
