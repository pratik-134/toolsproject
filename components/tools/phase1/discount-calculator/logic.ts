/**
 * Discount & Savings Calculator Logic
 * Pure client-side calculations for single/stacked discounts and sales taxes.
 */

export interface DiscountInput {
  originalPrice: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  extraDiscountType?: "percentage" | "fixed";
  extraDiscountValue?: number;
  taxRate?: number; // e.g. 8.25 for 8.25%
}

export interface DiscountResult {
  originalPrice: number;
  firstDiscountAmount: number;
  priceAfterFirstDiscount: number;
  extraDiscountAmount: number;
  subtotal: number;
  totalDiscountAmount: number;
  effectiveDiscountPercentage: number;
  taxAmount: number;
  finalPrice: number;
}

export function calculateDiscount(input: DiscountInput): DiscountResult {
  const {
    originalPrice,
    discountType,
    discountValue,
    extraDiscountType,
    extraDiscountValue = 0,
    taxRate = 0,
  } = input;

  if (originalPrice < 0 || discountValue < 0) {
    throw new Error("Values cannot be negative");
  }

  // First Discount
  let firstDiscountAmount = 0;
  if (discountType === "percentage") {
    firstDiscountAmount = (originalPrice * Math.min(100, Math.max(0, discountValue))) / 100;
  } else {
    firstDiscountAmount = Math.min(originalPrice, discountValue);
  }

  const priceAfterFirstDiscount = Math.max(0, originalPrice - firstDiscountAmount);

  // Extra / Stacked Discount
  let extraDiscountAmount = 0;
  if (extraDiscountValue > 0) {
    if (extraDiscountType === "percentage") {
      extraDiscountAmount =
        (priceAfterFirstDiscount * Math.min(100, Math.max(0, extraDiscountValue))) / 100;
    } else {
      extraDiscountAmount = Math.min(priceAfterFirstDiscount, extraDiscountValue);
    }
  }

  const subtotal = Math.max(0, priceAfterFirstDiscount - extraDiscountAmount);
  const totalDiscountAmount = firstDiscountAmount + extraDiscountAmount;

  const effectiveDiscountPercentage =
    originalPrice > 0 ? (totalDiscountAmount / originalPrice) * 100 : 0;

  // Sales Tax
  const taxAmount = (subtotal * Math.max(0, taxRate)) / 100;
  const finalPrice = subtotal + taxAmount;

  return {
    originalPrice: Number(originalPrice.toFixed(2)),
    firstDiscountAmount: Number(firstDiscountAmount.toFixed(2)),
    priceAfterFirstDiscount: Number(priceAfterFirstDiscount.toFixed(2)),
    extraDiscountAmount: Number(extraDiscountAmount.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscountAmount: Number(totalDiscountAmount.toFixed(2)),
    effectiveDiscountPercentage: Number(effectiveDiscountPercentage.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
  };
}
