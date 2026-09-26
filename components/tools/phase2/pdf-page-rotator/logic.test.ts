import {
  createSamplePdfForRotation,
  getPageRotations,
  rotatePdf,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: Sample PDF has 3 pages at 0 degrees
  const sample = await createSamplePdfForRotation(3);
  const initialRotations = await getPageRotations(sample);

  if (initialRotations.length !== 3) {
    throw new Error(`Expected 3 pages, got ${initialRotations.length}`);
  }
  if (initialRotations[0]?.currentAngle !== 0) {
    throw new Error(`Expected initial rotation 0, got ${initialRotations[0]?.currentAngle}`);
  }

  // Test 2: Rotate page 0 by 90 degrees clockwise
  const rotatedOnePage = await rotatePdf(sample, 90, [0]);
  const rotationsAfterOne = await getPageRotations(rotatedOnePage);

  if (rotationsAfterOne[0]?.currentAngle !== 90) {
    throw new Error(`Expected page 0 to have 90 deg, got ${rotationsAfterOne[0]?.currentAngle}`);
  }
  if (rotationsAfterOne[1]?.currentAngle !== 0) {
    throw new Error(`Expected page 1 to remain 0 deg, got ${rotationsAfterOne[1]?.currentAngle}`);
  }

  // Test 3: Rotate all pages by 180 degrees
  const rotatedAll = await rotatePdf(sample, 180);
  const rotationsAll = await getPageRotations(rotatedAll);

  for (let i = 0; i < 3; i++) {
    if (rotationsAll[i]?.currentAngle !== 180) {
      throw new Error(`Expected page ${i} to have 180 deg, got ${rotationsAll[i]?.currentAngle}`);
    }
  }

  // Test 4: Rotating 90 again on page 0 yields 270 (180 + 90)
  const rotatedAgain = await rotatePdf(rotatedAll, 90, [0]);
  const rotationsAgain = await getPageRotations(rotatedAgain);
  if (rotationsAgain[0]?.currentAngle !== 270) {
    throw new Error(`Expected page 0 to have 270 deg, got ${rotationsAgain[0]?.currentAngle}`);
  }

  return true;
}
