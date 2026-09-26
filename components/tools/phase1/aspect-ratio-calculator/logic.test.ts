import { gcd, calculateRatioFromDimensions, calculateDimension } from "./logic";

export function runTests(): boolean {
  // Test 1: GCD
  if (gcd(1920, 1080) !== 120) {
    throw new Error(`Test 1 GCD failed: ${gcd(1920, 1080)}`);
  }

  // Test 2: 1920x1080 -> 16:9
  const res1 = calculateRatioFromDimensions(1920, 1080);
  if (res1.ratioX !== 16 || res1.ratioY !== 9 || res1.ratioString !== "16:9") {
    throw new Error(`Test 2 ratio failed: ${res1.ratioString}`);
  }
  if (res1.decimalRatio !== 1.778) {
    throw new Error(`Test 2 decimal failed: ${res1.decimalRatio}`);
  }

  // Test 3: Calculate Height from 16:9 and Width 3840
  const height = calculateDimension(16, 9, "width", 3840);
  if (height !== 2160) {
    throw new Error(`Test 3 height failed: ${height}`);
  }

  // Test 4: Calculate Width from 16:9 and Height 720
  const width = calculateDimension(16, 9, "height", 720);
  if (width !== 1280) {
    throw new Error(`Test 4 width failed: ${width}`);
  }

  return true;
}
