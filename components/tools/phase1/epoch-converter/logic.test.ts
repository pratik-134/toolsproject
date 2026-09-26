import { epochToDate, dateToEpoch, getRelativeTimeString } from "./logic";

export function runTests(): boolean {
  // Test 1: Epoch seconds conversion (1700000000 = Nov 14, 2023 22:13:20 UTC)
  const res1 = epochToDate(1700000000);
  if (res1.epochSeconds !== 1700000000 || res1.isoString !== "2023-11-14T22:13:20.000Z") {
    throw new Error(`Test 1 failed: ${res1.isoString}`);
  }

  // Test 2: Epoch milliseconds conversion
  const res2 = epochToDate(1700000000000);
  if (res2.epochSeconds !== 1700000000 || res2.epochMilliseconds !== 1700000000000) {
    throw new Error(`Test 2 failed: ${res2.epochSeconds}`);
  }

  // Test 3: Date to Epoch conversion
  const res3 = dateToEpoch("2026-09-24T12:00:00.000Z");
  if (res3.epochSeconds !== 1790251200) {
    throw new Error(`Test 3 failed: ${res3.epochSeconds}`);
  }

  // Test 4: Relative time string
  const pastDate = new Date(Date.now() - 3600 * 1000); // 1 hour ago
  const rel = getRelativeTimeString(pastDate);
  if (!rel.includes("hour ago")) {
    throw new Error(`Test 4 relative failed: ${rel}`);
  }

  return true;
}
