/**
 * Unit Tests for CSS Mesh Gradient Studio & Generator
 * Tests deterministic CSS generation, SVG markup integrity, and point randomizers
 */

import {
  generateMeshCss,
  generateTailwindClass,
  generateMeshSvg,
  randomizeMeshPoints,
  DEFAULT_MESH_PRESETS,
  MeshPoint,
} from "./logic";

export function runMeshGradientTests(): boolean {
  console.log("Testing [css-mesh-gradient-generator] logic...");

  const samplePoints: MeshPoint[] = [
    { id: "1", x: 20, y: 30, color: "#10b981", radius: 70 },
    { id: "2", x: 80, y: 25, color: "#06b6d4", radius: 65 },
  ];

  // 1. Test CSS generation
  const css = generateMeshCss("#030712", samplePoints, 20);
  if (!css.includes("background-color: #030712;") || !css.includes("radial-gradient(at 20% 30%")) {
    throw new Error(`generateMeshCss output unexpected: ${css}`);
  }
  if (!css.includes("filter: blur(20px);")) {
    throw new Error(`generateMeshCss should include blur filter when blurPx > 0`);
  }

  // 2. Test Tailwind Arbitrary Class generation
  const tw = generateTailwindClass("#030712", samplePoints);
  if (!tw.includes("bg-[#030712]") || !tw.includes("radial-gradient(at_20%_30%")) {
    throw new Error(`generateTailwindClass output unexpected: ${tw}`);
  }

  // 3. Test SVG generation
  const svg = generateMeshSvg("#030712", samplePoints, 1920, 1080, 60);
  if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) {
    throw new Error(`generateMeshSvg must produce valid root SVG tag`);
  }
  if (!svg.includes("feGaussianBlur stdDeviation=\"60\"")) {
    throw new Error(`generateMeshSvg missing feGaussianBlur tag with correct blur`);
  }
  if (!svg.includes('fill="#10b981"')) {
    throw new Error(`generateMeshSvg missing point circle fills`);
  }

  // 4. Test Presets structure
  if (DEFAULT_MESH_PRESETS.length < 3) {
    throw new Error(`DEFAULT_MESH_PRESETS should have at least 3 curated presets`);
  }
  for (const preset of DEFAULT_MESH_PRESETS) {
    if (!preset.id || !preset.name || !preset.backgroundColor || preset.points.length < 2) {
      throw new Error(`Preset ${preset.name} has invalid structure`);
    }
  }

  // 5. Test Randomizer
  const randomized = randomizeMeshPoints(samplePoints);
  if (randomized.length !== samplePoints.length) {
    throw new Error(`randomizeMeshPoints should preserve point count`);
  }
  for (const p of randomized) {
    if (p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100) {
      throw new Error(`randomizeMeshPoints point coordinates out of bounds: (${p.x}, ${p.y})`);
    }
  }

  console.log("✅ [css-mesh-gradient-generator] unit tests passed!");
  return true;
}
