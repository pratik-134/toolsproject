import { convertUnit, getAllConversionsForCategory } from "./logic";

export function runTests(): boolean {
  // Test 1: Length: 100 meters to feet (~328.08399)
  const ft = convertUnit(100, "length", "m", "ft");
  if (ft < 328 || ft > 328.1) {
    throw new Error(`Length conversion failed: 100m -> ${ft}ft`);
  }

  // Test 2: Temperature: 100 C to F (212 F)
  const f = convertUnit(100, "temperature", "C", "F");
  if (f !== 212) {
    throw new Error(`Temperature conversion failed: 100C -> ${f}F`);
  }

  // Test 3: Data: 1 GB to MB (1000 MB decimal)
  const mb = convertUnit(1, "data", "GB", "MB");
  if (mb !== 1000) {
    throw new Error(`Data conversion failed: 1GB -> ${mb}MB`);
  }

  // Test 4: Mass: 1 kg to lb (~2.20462)
  const lb = convertUnit(1, "mass", "kg", "lb");
  if (lb < 2.2 || lb > 2.21) {
    throw new Error(`Mass conversion failed: 1kg -> ${lb}lb`);
  }

  // Test 5: All conversions count
  const allLength = getAllConversionsForCategory(10, "length", "m");
  if (allLength.length !== 8) {
    throw new Error(`Expected 8 units for length, got ${allLength.length}`);
  }

  return true;
}
