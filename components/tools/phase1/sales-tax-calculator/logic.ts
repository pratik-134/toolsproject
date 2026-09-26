/**
 * Sales Tax, VAT & GST Calculator Logic
 * Pure client-side calculations for tax-inclusive and tax-exclusive pricing.
 */

export interface SalesTaxInput {
  amount: number;
  rate: number; // e.g. 20 for 20%
  calculationType: "add-tax" | "reverse-tax"; // add-tax = exclusive, reverse-tax = inclusive
}

export interface SalesTaxResult {
  netAmount: number; // Price without tax
  taxAmount: number; // Tax component
  grossAmount: number; // Price including tax
  taxRate: number;
  calculationType: "add-tax" | "reverse-tax";
}

export function calculateSalesTax(input: SalesTaxInput): SalesTaxResult {
  const { amount, rate, calculationType } = input;

  if (amount < 0 || rate < 0) {
    throw new Error("Amount and tax rate cannot be negative");
  }

  let netAmount = 0;
  let taxAmount = 0;
  let grossAmount = 0;

  if (calculationType === "add-tax") {
    netAmount = amount;
    taxAmount = (netAmount * rate) / 100;
    grossAmount = netAmount + taxAmount;
  } else {
    // Reverse tax / VAT inclusive
    grossAmount = amount;
    netAmount = grossAmount / (1 + rate / 100);
    taxAmount = grossAmount - netAmount;
  }

  return {
    netAmount: Number(netAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    grossAmount: Number(grossAmount.toFixed(2)),
    taxRate: Number(rate.toFixed(2)),
    calculationType,
  };
}
