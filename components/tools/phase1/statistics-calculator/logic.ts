export interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  sampleVariance: number;
  populationVariance: number;
  sampleStdDev: number;
  populationStdDev: number;
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  sortedNumbers: number[];
}

export function parseNumbersInput(input: string): number[] {
  if (!input || !input.trim()) return [];
  // Split by commas, semicolons, whitespace, or newlines
  const tokens = input.split(/[\s,;]+/);
  const nums: number[] = [];
  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed !== "" && !isNaN(Number(trimmed))) {
      nums.push(Number(trimmed));
    }
  }
  return nums;
}

export function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0] ?? 0;

  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  const valLower = sorted[lower] ?? 0;
  const valUpper = sorted[upper] ?? 0;

  return valLower + weight * (valUpper - valLower);
}

export function calculateStatistics(numbers: number[]): StatisticsResult | null {
  if (!numbers || numbers.length === 0) {
    return null;
  }

  const count = numbers.length;
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / count;

  // Min, Max, Range
  const min = sorted[0] ?? 0;
  const max = sorted[count - 1] ?? 0;
  const range = max - min;

  // Median
  const median = calculatePercentile(sorted, 0.5);

  // Modes
  const freqMap = new Map<number, number>();
  let maxFreq = 0;
  for (const n of numbers) {
    const freq = (freqMap.get(n) ?? 0) + 1;
    freqMap.set(n, freq);
    if (freq > maxFreq) {
      maxFreq = freq;
    }
  }

  const modes: number[] = [];
  if (maxFreq > 1) {
    freqMap.forEach((freq, val) => {
      if (freq === maxFreq) {
        modes.push(val);
      }
    });
    modes.sort((a, b) => a - b);
  }

  // Variance and Standard Deviation
  let sumSquaredDiffs = 0;
  for (const n of numbers) {
    const diff = n - mean;
    sumSquaredDiffs += diff * diff;
  }

  const populationVariance = sumSquaredDiffs / count;
  const populationStdDev = Math.sqrt(populationVariance);

  const sampleVariance = count > 1 ? sumSquaredDiffs / (count - 1) : 0;
  const sampleStdDev = count > 1 ? Math.sqrt(sampleVariance) : 0;

  // Quartiles and IQR
  const q1 = calculatePercentile(sorted, 0.25);
  const q2 = median;
  const q3 = calculatePercentile(sorted, 0.75);
  const iqr = q3 - q1;

  return {
    count,
    sum: Math.round(sum * 10000) / 10000,
    mean: Math.round(mean * 10000) / 10000,
    median: Math.round(median * 10000) / 10000,
    modes,
    min,
    max,
    range: Math.round(range * 10000) / 10000,
    sampleVariance: Math.round(sampleVariance * 10000) / 10000,
    populationVariance: Math.round(populationVariance * 10000) / 10000,
    sampleStdDev: Math.round(sampleStdDev * 10000) / 10000,
    populationStdDev: Math.round(populationStdDev * 10000) / 10000,
    q1: Math.round(q1 * 10000) / 10000,
    q2: Math.round(q2 * 10000) / 10000,
    q3: Math.round(q3 * 10000) / 10000,
    iqr: Math.round(iqr * 10000) / 10000,
    sortedNumbers: sorted,
  };
}
