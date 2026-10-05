/**
 * Unit Test Suite for Vector SVG Wave & Pattern Studio
 * Deterministic test vectors executed via npm run test:tools
 */

import {
  createPrng,
  generateWavePath,
  generateBlobPath,
  generatePatternSvg,
  svgToCssDataUri,
  PATTERN_PALETTES,
} from "./logic";

export function runTests(): boolean {
  // Test 1: PRNG determinism
  const rng1 = createPrng(42);
  const rng2 = createPrng(42);
  const val1 = [rng1(), rng1(), rng1()];
  const val2 = [rng2(), rng2(), rng2()];
  if (val1[0] !== val2[0] || val1[1] !== val2[1] || val1[2] !== val2[2]) {
    throw new Error(`PRNG not deterministic for identical seeds`);
  }

  // Test 2: Wave Path generation
  const wavePath = generateWavePath(1440, 400, 5, 50, 0.5, rng1, false);
  if (!wavePath.startsWith("M 0,") || !wavePath.endsWith("Z") || !wavePath.includes("C ")) {
    throw new Error(`Wave path generation produced malformed Bezier path: ${wavePath.slice(0, 50)}`);
  }

  // Test 3: Blob Path generation
  const blobPath = generateBlobPath(400, 400, 150, 6, 40, rng2);
  if (!blobPath.startsWith("M ") || !blobPath.endsWith("Z") || !blobPath.includes("Q ")) {
    throw new Error(`Blob path generation produced malformed Spline path: ${blobPath.slice(0, 50)}`);
  }

  // Test 4: All Pattern Types SVG output
  const types = ["waves", "layered-waves", "blobs", "grid-dots", "mesh-gradient"] as const;
  for (const type of types) {
    const svg = generatePatternSvg({
      type,
      width: 1440,
      height: 400,
      points: 5,
      variance: 45,
      seed: 99,
      colors: PATTERN_PALETTES[0]?.colors ?? ["#312e81", "#4f46e5", "#38bdf8"],
      backgroundColor: "#ffffff",
      invert: false,
      layers: 3,
    });

    if (!svg.startsWith("<svg") || !svg.includes("viewBox=\"0 0 1440 400\"") || !svg.endsWith("</svg>")) {
      throw new Error(`Pattern SVG generation failed for type "${type}"`);
    }
  }

  // Test 5: CSS Data URI generator
  const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect fill="#ff0000" /></svg>`;
  const dataUri = svgToCssDataUri(sampleSvg);
  if (!dataUri.startsWith("background-image: url(\"data:image/svg+xml,") || !dataUri.includes("%23ff0000")) {
    throw new Error(`CSS Data URI converter failed: ${dataUri}`);
  }

  return true;
}
