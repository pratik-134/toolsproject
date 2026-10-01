import {
  calculateLineTotal,
  calculateInvoiceTotals,
  formatCurrency,
  validateInvoice,
  DEFAULT_INVOICE,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Line total
  const line = calculateLineTotal(3, 150.5);
  if (line !== 451.5) {
    throw new Error(`Expected line total 451.5, got ${line}`);
  }

  // Test 2: Invoice totals with discount & tax
  // 100 * 2 = 200. Discount 10% = 20. Taxable = 180. Tax 10% = 18. Total = 198.
  const totals = calculateInvoiceTotals(
    [{ id: "1", description: "Test", quantity: 2, rate: 100 }],
    10,
    10
  );
  if (totals.subtotal !== 200) {
    throw new Error(`Expected subtotal 200, got ${totals.subtotal}`);
  }
  if (totals.discountAmount !== 20) {
    throw new Error(`Expected discount 20, got ${totals.discountAmount}`);
  }
  if (totals.taxableAmount !== 180) {
    throw new Error(`Expected taxable 180, got ${totals.taxableAmount}`);
  }
  if (totals.taxAmount !== 18) {
    throw new Error(`Expected tax 18, got ${totals.taxAmount}`);
  }
  if (totals.total !== 198) {
    throw new Error(`Expected total 198, got ${totals.total}`);
  }

  // Test 3: Currency formatter
  const formatted = formatCurrency(1250.5, "$");
  if (formatted !== "$1,250.50") {
    throw new Error(`Expected $1,250.50, got ${formatted}`);
  }

  // Test 4: Default invoice validation
  const validation = validateInvoice(DEFAULT_INVOICE);
  if (!validation.valid) {
    throw new Error(`Default invoice failed validation: ${validation.errors.join(", ")}`);
  }

  // Test 5: Invalid invoice check
  const badValidation = validateInvoice({ invoiceNumber: "" });
  if (badValidation.valid || badValidation.errors.length === 0) {
    throw new Error("Expected validation errors for empty invoice");
  }

  return true;
}
