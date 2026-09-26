import {
  normalizeAngle,
  calculateRotatedDimensions,
  getExifTransform,
  combineTransforms,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Angle normalization
  if (normalizeAngle(0) !== 0) throw new Error("normalizeAngle(0) failed");
  if (normalizeAngle(90) !== 90) throw new Error("normalizeAngle(90) failed");
  if (normalizeAngle(360) !== 0) throw new Error("normalizeAngle(360) failed");
  if (normalizeAngle(-90) !== 270) throw new Error("normalizeAngle(-90) failed");
  if (normalizeAngle(450) !== 90) throw new Error("normalizeAngle(450) failed");

  // Test 2: Dimension calculations
  const dim0 = calculateRotatedDimensions(800, 600, 0);
  if (dim0.width !== 800 || dim0.height !== 600) throw new Error("0 deg rotation dimension error");

  const dim90 = calculateRotatedDimensions(800, 600, 90);
  if (dim90.width !== 600 || dim90.height !== 800) throw new Error("90 deg rotation dimension error");

  const dim180 = calculateRotatedDimensions(800, 600, 180);
  if (dim180.width !== 800 || dim180.height !== 600) throw new Error("180 deg rotation dimension error");

  const dim270 = calculateRotatedDimensions(800, 600, 270);
  if (dim270.width !== 600 || dim270.height !== 800) throw new Error("270 deg rotation dimension error");

  const dim45 = calculateRotatedDimensions(100, 100, 45);
  // Diagonal of 100x100 is sqrt(2)*100 ≈ 141.42 -> 141
  if (dim45.width < 140 || dim45.width > 143) throw new Error("45 deg rotation dimension error");

  // Test 3: EXIF orientation mappings
  const exif1 = getExifTransform(1);
  if (exif1.rotation !== 0 || exif1.flipH || exif1.flipV) throw new Error("EXIF 1 failed");

  const exif3 = getExifTransform(3);
  if (exif3.rotation !== 180) throw new Error("EXIF 3 failed");

  const exif6 = getExifTransform(6);
  if (exif6.rotation !== 90) throw new Error("EXIF 6 failed");

  const exif8 = getExifTransform(8);
  if (exif8.rotation !== 270) throw new Error("EXIF 8 failed");

  // Test 4: Combine transforms
  const combined = combineTransforms({ rotation: 90, flipH: false, flipV: false }, { rotation: 90, flipH: true });
  if (combined.rotation !== 180 || !combined.flipH) throw new Error("combineTransforms failed");

  return true;
}
