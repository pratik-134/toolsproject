import { calculateMetricBmi, calculateImperialBmi, getBmiCategory } from "./logic";

export function runTests(): boolean {
  // Test 1: Standard metric: 70 kg, 175 cm -> BMI ~ 22.9 (Normal weight)
  const res1 = calculateMetricBmi(70, 175);
  if (res1.bmi !== 22.9) {
    throw new Error(`Metric BMI expected 22.9, got ${res1.bmi}`);
  }
  if (res1.category.category !== "Normal Weight") {
    throw new Error(`Category mismatch: ${res1.category.category}`);
  }
  if (res1.healthyWeightMin !== 56.7 || res1.healthyWeightMax !== 76.3) {
    throw new Error(`Healthy weight range mismatch: ${res1.healthyWeightMin} - ${res1.healthyWeightMax}`);
  }

  // Test 2: Standard imperial: 160 lbs, 5 ft 10 in (70 inches) -> BMI ~ 23.0
  const res2 = calculateImperialBmi(160, 5, 10);
  if (res2.bmi !== 23.0) {
    throw new Error(`Imperial BMI expected 23.0, got ${res2.bmi}`);
  }
  if (res2.category.category !== "Normal Weight") {
    throw new Error(`Imperial category mismatch: ${res2.category.category}`);
  }

  // Test 3: Overweight metric: 85 kg, 170 cm -> BMI ~ 29.4
  const res3 = calculateMetricBmi(85, 170);
  if (res3.bmi !== 29.4) {
    throw new Error(`Expected 29.4, got ${res3.bmi}`);
  }
  if (!res3.category.category.includes("Overweight")) {
    throw new Error(`Expected Overweight category, got: ${res3.category.category}`);
  }

  return true;
}
