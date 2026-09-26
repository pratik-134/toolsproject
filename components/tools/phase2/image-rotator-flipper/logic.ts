/**
 * Image Rotator & Flipper — Pure TypeScript Domain Logic
 * 100% In-Browser Canvas Transformation & Orientation Solver
 */

export interface TransformState {
  rotation: number; // In degrees (-180 to 360)
  flipH: boolean;
  flipV: boolean;
}

export interface ExifTransformation {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

/**
 * Normalizes an angle to [0, 360) range
 */
export function normalizeAngle(degrees: number): number {
  const mod = degrees % 360;
  return mod < 0 ? mod + 360 : mod;
}

/**
 * Calculates new bounding box dimensions when rotating by an arbitrary angle in degrees
 */
export function calculateRotatedDimensions(
  width: number,
  height: number,
  degrees: number
): { width: number; height: number } {
  const norm = normalizeAngle(degrees);

  // Exact 90 or 270 degree rotations
  if (norm === 90 || norm === 270) {
    return { width: height, height: width };
  }

  // Exact 0 or 180 degree rotations
  if (norm === 0 || norm === 180) {
    return { width, height };
  }

  const rad = (norm * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  const newWidth = Math.round(width * cos + height * sin);
  const newHeight = Math.round(width * sin + height * cos);

  return { width: newWidth, height: newHeight };
}

/**
 * Maps standard EXIF orientation tags (1-8) to rotation and flip operations
 */
export function getExifTransform(orientation: number): ExifTransformation {
  switch (orientation) {
    case 2:
      return { rotation: 0, flipH: true, flipV: false };
    case 3:
      return { rotation: 180, flipH: false, flipV: false };
    case 4:
      return { rotation: 180, flipH: true, flipV: false };
    case 5:
      return { rotation: 90, flipH: true, flipV: false };
    case 6:
      return { rotation: 90, flipH: false, flipV: false };
    case 7:
      return { rotation: 270, flipH: true, flipV: false };
    case 8:
      return { rotation: 270, flipH: false, flipV: false };
    case 1:
    default:
      return { rotation: 0, flipH: false, flipV: false };
  }
}

/**
 * Combines two transform states into one
 */
export function combineTransforms(
  current: TransformState,
  delta: Partial<TransformState>
): TransformState {
  return {
    rotation: normalizeAngle((current.rotation ?? 0) + (delta.rotation ?? 0)),
    flipH: delta.flipH !== undefined ? delta.flipH : current.flipH,
    flipV: delta.flipV !== undefined ? delta.flipV : current.flipV,
  };
}
