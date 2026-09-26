import { calculateBreakEven } from "./logic";

export function runTests(): boolean {
  // Test: Fixed $10,000/mo, Variable $30/unit, Selling Price $80/unit
  // Contribution margin = 80 - 30 = $50/unit
  // Margin ratio = 50 / 80 = 62.5%
  // Break-even units = 10,000 / 50 = 200 units
  // Break-even revenue = 200 * 80 = $16,000
  const res = calculateBreakEven({
    fixedCosts: 10000,
    variableCostPerUnit: 30,
    pricePerUnit: 80,
    targetProfit: 5000,
  });

  if (!res.isValid) throw new Error("Should be valid");
  if (res.contributionMargin !== 50) {
    throw new Error(`Expected contribution margin 50, got ${res.contributionMargin}`);
  }
  if (res.contributionMarginRatio !== 62.5) {
    throw new Error(`Expected ratio 62.5%, got ${res.contributionMarginRatio}`);
  }
  if (res.breakEvenUnits !== 200) {
    throw new Error(`Expected 200 units, got ${res.breakEvenUnits}`);
  }
  if (res.breakEvenRevenue !== 16000) {
    throw new Error(`Expected revenue $16,000, got ${res.breakEvenRevenue}`);
  }
  // Target profit 5000 -> (10000 + 5000) / 50 = 300 units
  if (res.targetProfitUnits !== 300) {
    throw new Error(`Expected target units 300, got ${res.targetProfitUnits}`);
  }

  // Test price <= variable
  const invalid = calculateBreakEven({
    fixedCosts: 5000,
    variableCostPerUnit: 50,
    pricePerUnit: 40,
  });
  if (invalid.isValid) throw new Error("Price <= variable must be invalid");

  return true;
}
