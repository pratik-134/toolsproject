import { calculateGeometry } from "./logic";

export function runTests(): boolean {
  // Test Circle r = 10 -> Area = 100 * pi ~ 314.1593, Perimeter = 20 * pi ~ 62.8319
  const circle = calculateGeometry("circle", { radius: 10 });
  const areaMetric = circle.metrics.find((m) => m.label === "Area");
  if (!areaMetric || Math.abs(areaMetric.value - 314.1593) > 0.01) {
    throw new Error(`Circle area mismatch, got ${areaMetric?.value}`);
  }

  // Test Rectangle 4x5 -> Area = 20, Perimeter = 18, Diagonal = sqrt(41) ~ 6.4031
  const rect = calculateGeometry("rectangle", { width: 4, height: 5 });
  const rectArea = rect.metrics.find((m) => m.label === "Area");
  const rectPerim = rect.metrics.find((m) => m.label === "Perimeter");
  if (rectArea?.value !== 20 || rectPerim?.value !== 18) {
    throw new Error(`Rectangle metric mismatch`);
  }

  // Test Sphere r = 3 -> Volume = 4/3 * pi * 27 = 36 * pi ~ 113.0973
  const sphere = calculateGeometry("sphere", { radius: 3 });
  const sphereVol = sphere.metrics.find((m) => m.label === "Volume");
  if (!sphereVol || Math.abs(sphereVol.value - 113.0973) > 0.01) {
    throw new Error(`Sphere volume mismatch, got ${sphereVol?.value}`);
  }

  // Test Cylinder r = 3, h = 10 -> Volume = 90 * pi ~ 282.7433
  const cyl = calculateGeometry("cylinder", { radius: 3, height: 10 });
  const cylVol = cyl.metrics.find((m) => m.label === "Volume");
  if (!cylVol || Math.abs(cylVol.value - 282.7433) > 0.01) {
    throw new Error(`Cylinder volume mismatch, got ${cylVol?.value}`);
  }

  return true;
}
