import { evaluateExpression } from "./logic";

export function runTests(): boolean {
  // Test 1: Arithmetic with order of operations
  const res1 = evaluateExpression("2 + 3 * 4");
  if (res1 !== 14) {
    throw new Error(`Test 1 failed: ${res1}`);
  }

  // Test 2: Parentheses & exponents
  const res2 = evaluateExpression("(2 + 3) ^ 2");
  if (res2 !== 25) {
    throw new Error(`Test 2 failed: ${res2}`);
  }

  // Test 3: Trigonometry (sin(90) in degrees = 1)
  const res3 = evaluateExpression("sin(90)", "deg");
  if (Math.abs(res3 - 1) > 1e-9) {
    throw new Error(`Test 3 sin(90) failed: ${res3}`);
  }

  // Test 4: Factorial (5! = 120)
  const res4 = evaluateExpression("5!");
  if (res4 !== 120) {
    throw new Error(`Test 4 5! failed: ${res4}`);
  }

  // Test 5: Square root and logs
  const res5 = evaluateExpression("sqrt(144) + log(100)");
  if (res5 !== 14) {
    throw new Error(`Test 5 failed: ${res5}`);
  }

  return true;
}
