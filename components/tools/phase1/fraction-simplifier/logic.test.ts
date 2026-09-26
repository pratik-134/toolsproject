import { calculateGcd, calculateLcm, simplifyFraction, calculateFractionArithmetic } from "./logic";

export function runTests(): boolean {
  // Test GCD and LCM
  if (calculateGcd(24, 36) !== 12) throw new Error("GCD(24,36) must be 12");
  if (calculateLcm(4, 6) !== 12) throw new Error("LCM(4,6) must be 12");

  // Test simplify 24/36 -> 2/3
  const s1 = simplifyFraction(24, 36);
  if (s1.simplifiedNum !== 2 || s1.simplifiedDen !== 3 || s1.gcd !== 12) {
    throw new Error(`simplifyFraction(24, 36) failed: ${JSON.stringify(s1)}`);
  }
  if (s1.percentage !== 66.6667) {
    throw new Error(`Expected ~66.6667%, got ${s1.percentage}`);
  }

  // Test improper fraction 14/4 -> 7/2 = 3 1/2
  const s2 = simplifyFraction(14, 4);
  if (s2.simplifiedNum !== 7 || s2.simplifiedDen !== 2) {
    throw new Error(`simplifyFraction(14, 4) failed: ${JSON.stringify(s2)}`);
  }
  if (!s2.mixedNumber || s2.mixedNumber.whole !== 3 || s2.mixedNumber.num !== 1 || s2.mixedNumber.den !== 2) {
    throw new Error(`Mixed number failed: ${JSON.stringify(s2.mixedNumber)}`);
  }

  // Test zero denominator
  try {
    simplifyFraction(5, 0);
    throw new Error("Zero denominator should have thrown");
  } catch (err: any) {
    if (!err.message.includes("zero")) throw err;
  }

  // Test arithmetic 1/4 + 1/6 = 3/12 + 2/12 = 5/12
  const addRes = calculateFractionArithmetic("+", 1, 4, 1, 6);
  if (addRes.result.simplifiedNum !== 5 || addRes.result.simplifiedDen !== 12) {
    throw new Error(`1/4 + 1/6 expected 5/12, got ${addRes.result.simplifiedNum}/${addRes.result.simplifiedDen}`);
  }

  // Test multiplication 2/3 * 3/4 = 6/12 = 1/2
  const mulRes = calculateFractionArithmetic("*", 2, 3, 3, 4);
  if (mulRes.result.simplifiedNum !== 1 || mulRes.result.simplifiedDen !== 2) {
    throw new Error(`2/3 * 3/4 expected 1/2, got ${mulRes.result.simplifiedNum}/${mulRes.result.simplifiedDen}`);
  }

  // Test division 1/2 / 3/4 = 1/2 * 4/3 = 4/6 = 2/3
  const divRes = calculateFractionArithmetic("/", 1, 2, 3, 4);
  if (divRes.result.simplifiedNum !== 2 || divRes.result.simplifiedDen !== 3) {
    throw new Error(`1/2 / 3/4 expected 2/3, got ${divRes.result.simplifiedNum}/${divRes.result.simplifiedDen}`);
  }

  return true;
}
