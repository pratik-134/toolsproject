/**
 * Aspect Ratio & Resolution Calculator Logic
 * Pure client-side calculations using Greatest Common Divisor (GCD).
 */

export interface RatioResult {
  ratioX: number;
  ratioY: number;
  ratioString: string;
  decimalRatio: number;
  totalPixels: number;
  megapixels: number;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function calculateRatioFromDimensions(width: number, height: number): RatioResult {
  if (width <= 0 || height <= 0) {
    throw new Error("Width and height must be positive numbers");
  }

  const divisor = gcd(width, height);
  const ratioX = Math.round(width / divisor);
  const ratioY = Math.round(height / divisor);
  const decimalRatio = Number((width / height).toFixed(3));
  const totalPixels = width * height;
  const megapixels = Number((totalPixels / 1_000_000).toFixed(2));

  return {
    ratioX,
    ratioY,
    ratioString: `${ratioX}:${ratioY}`,
    decimalRatio,
    totalPixels,
    megapixels,
  };
}

export function calculateDimension(
  ratioX: number,
  ratioY: number,
  knownDimension: "width" | "height",
  value: number
): number {
  if (ratioX <= 0 || ratioY <= 0 || value <= 0) {
    throw new Error("Values must be positive");
  }

  if (knownDimension === "width") {
    return Math.round((value * ratioY) / ratioX);
  } else {
    return Math.round((value * ratioX) / ratioY);
  }
}
