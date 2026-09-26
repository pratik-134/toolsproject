import { calculateTransferTime, calculateDataVolume, toBytes, toBitsPerSecond } from "./logic";

export function runTests(): boolean {
  // Test conversion
  if (toBytes(1, "GB") !== 1024 * 1024 * 1024) throw new Error("1 GB to bytes mismatch");
  if (toBitsPerSecond(100, "Mbps") !== 100 * 1000 * 1000) throw new Error("100 Mbps mismatch");

  // Test: 1 GB over 100 Mbps (no overhead)
  // 1 GB = 1024 * 1024 * 1024 bytes = 8,589,934,592 bits
  // Speed = 100,000,000 bits/sec
  // Time = 85.899 seconds ~ 1m 26s
  const res1 = calculateTransferTime(1, "GB", 100, "Mbps", 0);
  if (Math.abs(res1.totalSeconds - 85.899) > 0.1) {
    throw new Error(`Expected ~85.9s, got ${res1.totalSeconds}`);
  }
  if (res1.minutes !== 1 || res1.seconds !== 26) {
    throw new Error(`Expected 1m 26s, got ${res1.formatted}`);
  }

  // Test data volume: 100 Mbps connection running for 1 hour
  // 100,000,000 * 3600 bits = 360,000,000,000 bits = 45,000,000,000 bytes ~ 41.91 GB
  const vol = calculateDataVolume(100, "Mbps", 1);
  if (Math.abs(vol.gigabytes - 41.91) > 0.2) {
    throw new Error(`Expected ~41.91 GB, got ${vol.gigabytes}`);
  }

  return true;
}
