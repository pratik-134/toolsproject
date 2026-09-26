import { calculateDiscount } from "./logic";

export function runTests(): boolean {
  // Test 1: Simple 20% discount on $100
  const res1 = calculateDiscount({
    originalPrice: 100,
    discountType: "percentage",
    discountValue: 20,
  });

  if (res1.finalPrice !== 80 || res1.totalDiscountAmount !== 20) {
    throw new Error(`Test 1 failed: finalPrice=${res1.finalPrice}`);
  }

  // Test 2: Stacked discount ($100 with 20% off + extra 10% off + 5% sales tax)
  // 100 - 20 = 80. 80 - 10% = 72. 72 + 5% tax ($3.60) = 75.60
  const res2 = calculateDiscount({
    originalPrice: 100,
    discountType: "percentage",
    discountValue: 20,
    extraDiscountType: "percentage",
    extraDiscountValue: 10,
    taxRate: 5,
  });

  if (res2.subtotal !== 72 || res2.taxAmount !== 3.6 || res2.finalPrice !== 75.6) {
    throw new Error(
      `Test 2 failed: subtotal=${res2.subtotal}, tax=${res2.taxAmount}, final=${res2.finalPrice}`
    );
  }

  // Test 3: Fixed dollar off discount
  const res3 = calculateDiscount({
    originalPrice: 50,
    discountType: "fixed",
    discountValue: 15,
  });

  if (res3.finalPrice !== 35 || res3.effectiveDiscountPercentage !== 30) {
    throw new Error(`Test 3 failed: ${res3.finalPrice}`);
  }

  return true;
}
