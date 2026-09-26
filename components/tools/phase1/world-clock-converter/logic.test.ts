import { convertWorldTimes, POPULAR_CITIES, formatTimeInZone } from "./logic";

export function runTests(): boolean {
  // Test format in UTC
  const testDate = new Date(Date.UTC(2026, 8, 25, 12, 0, 0)); // Sep 25, 2026 12:00 UTC
  const formattedUtc = formatTimeInZone(testDate, "UTC");
  if (!formattedUtc.time24.includes("12:00")) {
    throw new Error(`Expected 12:00 UTC, got ${formattedUtc.time24}`);
  }

  // Test convert from UTC 12:00
  const results = convertWorldTimes("2026-09-25", "12:00", "UTC");
  if (results.length !== POPULAR_CITIES.length) {
    throw new Error(`Expected ${POPULAR_CITIES.length} cities, got ${results.length}`);
  }

  const tokyo = results.find((r) => r.city.id === "tokyo");
  if (!tokyo) throw new Error("Tokyo not found");
  // UTC 12:00 + 9h -> 21:00 (9:00 PM)
  if (tokyo.hoursDifference !== 9) {
    throw new Error(`Expected +9h difference for Tokyo, got ${tokyo.hoursDifference}`);
  }

  const ny = results.find((r) => r.city.id === "newyork");
  if (!ny) throw new Error("New York not found");
  if (ny.hoursDifference !== -5) {
    throw new Error(`Expected -5h difference for New York, got ${ny.hoursDifference}`);
  }

  return true;
}
