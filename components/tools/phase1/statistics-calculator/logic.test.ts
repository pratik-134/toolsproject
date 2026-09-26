import { parseNumbersInput, calculateStatistics } from "./logic";

export function runTests(): boolean {
  // Test parsing
  const parsed = parseNumbersInput("10, 20; 30 \n 40\t50");
  if (parsed.length !== 5 || parsed[0] !== 10 || parsed[4] !== 50) {
    throw new Error(`parseNumbersInput failed, got: ${JSON.stringify(parsed)}`);
  }

  // Test empty
  const emptyRes = calculateStatistics([]);
  if (emptyRes !== null) {
    throw new Error("calculateStatistics with empty array must return null");
  }

  // Test single number
  const singleRes = calculateStatistics([42]);
  if (!singleRes || singleRes.count !== 1 || singleRes.mean !== 42 || singleRes.sampleVariance !== 0) {
    throw new Error("calculateStatistics single element failed");
  }

  // Test known dataset: [2, 4, 4, 4, 5, 5, 7, 9]
  // Sum = 40, Mean = 5, Median = 4.5, Mode = [4], Min = 2, Max = 9, Range = 7
  // Population Variance: ((4+1+1+1+0+0+4+16)/8) = 27/8 = 3.375
  // Sample Variance: 27/7 = 3.8571...
  const stats = calculateStatistics([2, 4, 4, 4, 5, 5, 7, 9]);
  if (!stats) throw new Error("Stats should not be null");

  if (stats.count !== 8) throw new Error(`Expected count 8, got ${stats.count}`);
  if (stats.sum !== 40) throw new Error(`Expected sum 40, got ${stats.sum}`);
  if (stats.mean !== 5) throw new Error(`Expected mean 5, got ${stats.mean}`);
  if (stats.median !== 4.5) throw new Error(`Expected median 4.5, got ${stats.median}`);
  if (stats.modes.length !== 1 || stats.modes[0] !== 4) {
    throw new Error(`Expected mode [4], got ${JSON.stringify(stats.modes)}`);
  }
  if (stats.min !== 2 || stats.max !== 9 || stats.range !== 7) {
    throw new Error(`Min/Max/Range mismatch`);
  }
  if (stats.populationVariance !== 4) {
    throw new Error(`Expected population variance 4, got ${stats.populationVariance}`);
  }

  return true;
}
