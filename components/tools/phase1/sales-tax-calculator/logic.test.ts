import { calculateSalesTax } from "./logic";

export function runTests(): boolean {
  // Test 1: Add Tax ($100 at 20% VAT)
  const res1 = calculateSalesTax({
    amount: 100,
    rate: 20,
    calculationType: "add-tax",
  });
  if (res1.netAmount !== 100 || res1.taxAmount !== 20 || res1.grossAmount !== 120) {
    throw new Error(`Test 1 add-tax failed: gross=${res1.grossAmount}`);
  }

  // Test 2: Reverse Tax ($120 inclusive at 20% VAT -> $100 net, $20 tax)
  const res2 = calculateSalesTax({
    amount: 120,
    rate: 20,
    calculationType: "reverse-tax",
  });
  if (res2.netAmount !== 100 || res2.taxAmount !== 20 || res2.grossAmount !== 120) {
    throw new Error(`Test 2 reverse-tax failed: net=${res2.netAmount}`);
  }

  // Test 3: Fractional tax rate ($50 at 8.25%)
  const res3 = calculateSalesTax({
    amount: 50,
    rate: 8.25,
    calculationType: "add-tax",
  });
  if (res3.taxAmount !== 4.13 || res3.grossAmount !== 54.13) {
    throw new Error(`Test 3 fractional failed: tax=${res3.taxAmount}, gross=${res3.grossAmount}`);
  }

  return true;
}
