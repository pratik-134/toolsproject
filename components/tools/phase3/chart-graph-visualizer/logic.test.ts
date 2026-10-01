import {
  parseCsvToDataPoints,
  calculateAxisBounds,
  calculatePieAngles,
  DEFAULT_CHART_DATA,
} from "./logic";

export function runTests(): boolean {
  // Test 1: CSV parser
  const csv = "Product A, 120\nProduct B, 340\nProduct C, 210";
  const parsed = parseCsvToDataPoints(csv);
  if (parsed.length !== 3 || parsed[0]?.label !== "Product A" || parsed[0]?.value !== 120) {
    throw new Error(`CSV parser failed: got ${JSON.stringify(parsed)}`);
  }

  // Test 2: Axis bounds
  const bounds = calculateAxisBounds([{ label: "A", value: 1450 }]);
  if (bounds.niceMax < 1450) {
    throw new Error(`Expected niceMax >= 1450, got ${bounds.niceMax}`);
  }

  // Test 3: Pie angles
  const slices = calculatePieAngles([
    { label: "X", value: 50 },
    { label: "Y", value: 50 },
  ]);
  if (slices.length !== 2 || slices[0]?.percent !== 50 || slices[1]?.percent !== 50) {
    throw new Error(`Expected two 50% slices, got ${JSON.stringify(slices)}`);
  }

  // Test 4: Default data
  if (DEFAULT_CHART_DATA.length !== 6) {
    throw new Error("Expected 6 default data points");
  }

  return true;
}
