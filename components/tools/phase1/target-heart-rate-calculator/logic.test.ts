import { calculateHeartRateZones, calculateMaxHeartRate } from "./logic";

export function runTests(): boolean {
  // Test 1: Age 30 Tanaka formula (208 - 0.7*30 = 187 bpm)
  const tanakaMhr = calculateMaxHeartRate(30, "tanaka");
  if (tanakaMhr !== 187) {
    throw new Error(`Expected Tanaka MHR 187, got ${tanakaMhr}`);
  }

  // Test 2: Age 30 Fox formula (220 - 30 = 190 bpm)
  const foxMhr = calculateMaxHeartRate(30, "fox");
  if (foxMhr !== 190) {
    throw new Error(`Expected Fox MHR 190, got ${foxMhr}`);
  }

  // Test 3: Zones calculation with Karvonen (HRR)
  const karvonenRes = calculateHeartRateZones({
    age: 30,
    restingHeartRate: 60,
    formula: "karvonen",
  });

  if (karvonenRes.zones.length !== 5) {
    throw new Error(`Expected 5 zones, got ${karvonenRes.zones.length}`);
  }

  // Zone 1 min bpm should be 60 + (187 - 60)*0.5 = 60 + 63.5 = 124 bpm
  const z0 = karvonenRes.zones[0]!;
  if (z0.minBpm < 120 || z0.minBpm > 126) {
    throw new Error(`Unexpected Zone 1 min BPM: ${z0.minBpm}`);
  }

  // Verify zones are monotonically strictly increasing
  for (let i = 0; i < karvonenRes.zones.length - 1; i++) {
    const cur = karvonenRes.zones[i]!;
    const nxt = karvonenRes.zones[i + 1]!;
    if (cur.minBpm >= nxt.minBpm || cur.maxBpm >= nxt.maxBpm) {
      throw new Error(`Zone ${cur.zone} bounds not strictly less than Zone ${nxt.zone}`);
    }
  }

  // Test 4: Age out of bounds throws
  let threw = false;
  try {
    calculateHeartRateZones({ age: 150 });
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("Age 150 should throw an error");

  return true;
}
