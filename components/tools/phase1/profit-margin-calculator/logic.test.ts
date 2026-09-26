import { calculateProfitMargin } from "./logic";

export function runTests(): boolean {
  // Test: Cost $40, Selling Price $100, OpEx $25
  // Gross Profit = $60
  // Gross Margin = 60 / 100 = 60%
  // Markup = 60 / 40 = 150%
  // Net Profit = 60 - 25 = $35
  // Net Margin = 35 / 100 = 35%
  const res = calculateProfitMargin({
    cost: 40,
    revenue: 100,
    operatingExpenses: 25,
  });

  if (res.grossProfit !== 60) throw new Error(`Expected gross profit 60, got ${res.grossProfit}`);
  if (res.grossMarginPercent !== 60) {
    throw new Error(`Expected gross margin 60%, got ${res.grossMarginPercent}`);
  }
  if (res.markupPercent !== 150) {
    throw new Error(`Expected markup 150%, got ${res.markupPercent}`);
  }
  if (res.netProfit !== 35) throw new Error(`Expected net profit 35, got ${res.netProfit}`);
  if (res.netMarginPercent !== 35) {
    throw new Error(`Expected net margin 35%, got ${res.netMarginPercent}`);
  }

  return true;
}
