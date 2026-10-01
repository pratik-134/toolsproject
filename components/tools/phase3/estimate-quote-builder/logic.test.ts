import {
  calculateQuoteItemTotal,
  calculateQuoteTotals,
  validateQuote,
  DEFAULT_QUOTE,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Item total calculation
  const itemTotal = calculateQuoteItemTotal(16, 150);
  if (itemTotal !== 2400) {
    throw new Error(`Expected item total 2400, got ${itemTotal}`);
  }

  // Test 2: Quote totals with discount & tax
  const totals = calculateQuoteTotals(
    [
      { id: "1", service: "A", description: "", quantity: 10, unit: "hours", rate: 100 },
      { id: "2", service: "B", description: "", quantity: 1, unit: "fixed", rate: 500 },
    ],
    10, // 10% tax
    20  // 20% discount
  );
  // Subtotal = 1000 + 500 = 1500
  // Discount = 1500 * 0.20 = 300
  // Taxable = 1200
  // Tax = 120
  // Total = 1320
  if (totals.subtotal !== 1500) {
    throw new Error(`Expected subtotal 1500, got ${totals.subtotal}`);
  }
  if (totals.discountAmount !== 300) {
    throw new Error(`Expected discount 300, got ${totals.discountAmount}`);
  }
  if (totals.taxAmount !== 120) {
    throw new Error(`Expected tax 120, got ${totals.taxAmount}`);
  }
  if (totals.grandTotal !== 1320) {
    throw new Error(`Expected grandTotal 1320, got ${totals.grandTotal}`);
  }

  // Test 3: Validation on DEFAULT_QUOTE
  const val = validateQuote(DEFAULT_QUOTE);
  if (!val.valid) {
    throw new Error(`Default quote validation failed: ${val.errors.join(", ")}`);
  }

  // Test 4: Validation on incomplete quote
  const invalidVal = validateQuote({ quoteNumber: "" });
  if (invalidVal.valid) {
    throw new Error("Expected validation failure for empty quote");
  }

  return true;
}
