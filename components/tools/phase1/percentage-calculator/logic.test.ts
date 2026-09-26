import {
  calculatePercentOf,
  calculateWhatPercent,
  calculatePercentChange,
  calculateTotalFromPercent,
} from "./logic";

export function runTests(): boolean {
  // Test 1: What is 15% of 240? -> 36
  const t1 = calculatePercentOf(15, 240);
  if (t1.result !== 36) throw new Error(`calculatePercentOf failed: ${t1.result}`);

  // Test 2: 45 is what percent of 180? -> 25%
  const t2 = calculateWhatPercent(45, 180);
  if (t2.percent !== 25) throw new Error(`calculateWhatPercent failed: ${t2.percent}`);

  // Test 3: Increase from 50 to 75 -> 50% increase
  const t3 = calculatePercentChange(50, 75);
  if (t3.percentChange !== 50 || !t3.isIncrease) {
    throw new Error(`calculatePercentChange failed: ${JSON.stringify(t3)}`);
  }

  // Test 4: Decrease from 100 to 80 -> 20% decrease
  const t4 = calculatePercentChange(100, 80);
  if (t4.percentChange !== 20 || t4.isIncrease) {
    throw new Error(`calculatePercentChange decrease failed: ${JSON.stringify(t4)}`);
  }

  // Test 5: 30 is 20% of what number? -> 150
  const t5 = calculateTotalFromPercent(30, 20);
  if (t5.total !== 150) throw new Error(`calculateTotalFromPercent failed: ${t5.total}`);

  return true;
}
