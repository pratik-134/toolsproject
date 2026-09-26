export interface ProfitMarginInput {
  cost: number;              // Cost of goods sold (COGS)
  revenue: number;           // Selling price / revenue
  operatingExpenses?: number;// Rent, software, marketing, etc.
}

export interface ProfitMarginResult {
  grossProfit: number;
  grossMarginPercent: number; // (Gross Profit / Revenue) * 100
  markupPercent: number;      // (Gross Profit / Cost) * 100
  netProfit: number;
  netMarginPercent: number;   // (Net Profit / Revenue) * 100
}

export function calculateProfitMargin(input: ProfitMarginInput): ProfitMarginResult {
  const cost = Math.max(0, input.cost);
  const revenue = Math.max(0, input.revenue);
  const opex = Math.max(0, input.operatingExpenses ?? 0);

  const grossProfit = revenue - cost;
  const grossMarginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const markupPercent = cost > 0 ? (grossProfit / cost) * 100 : 0;

  const netProfit = grossProfit - opex;
  const netMarginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return {
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossMarginPercent: Math.round(grossMarginPercent * 100) / 100,
    markupPercent: Math.round(markupPercent * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    netMarginPercent: Math.round(netMarginPercent * 100) / 100,
  };
}
