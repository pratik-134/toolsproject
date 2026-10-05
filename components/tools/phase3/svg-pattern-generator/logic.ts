/**
 * Vector SVG Wave & Pattern Studio — Pure Domain Logic
 * 100% In-Browser Parametric SVG Mathematics (Zero Network Uploads)
 * Compliant with Cleartrix Invariant #1
 */

export type PatternType =
  | "waves"
  | "layered-waves"
  | "blobs"
  | "grid-dots"
  | "mesh-gradient";

export interface PatternPalette {
  id: string;
  name: string;
  colors: string[];
}

export const PATTERN_PALETTES: PatternPalette[] = [
  {
    id: "midnight-indigo",
    name: "Midnight Indigo",
    colors: ["#312e81", "#4f46e5", "#38bdf8"],
  },
  {
    id: "sunset-horizon",
    name: "Sunset Horizon",
    colors: ["#991b1b", "#ea580c", "#facc15"],
  },
  {
    id: "emerald-sea",
    name: "Emerald Sea",
    colors: ["#064e3b", "#059669", "#34d399"],
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    colors: ["#701a75", "#c026d3", "#38bdf8"],
  },
  {
    id: "minimal-slate",
    name: "Minimalist Slate",
    colors: ["#0f172a", "#334155", "#64748b"],
  },
  {
    id: "coral-blush",
    name: "Coral Blush",
    colors: ["#881337", "#f43f5e", "#fda4af"],
  },
];

export interface PatternOptions {
  type: PatternType;
  width: number;
  height: number;
  points: number; // 2 to 10
  variance: number; // 0 to 100
  seed: number;
  colors: string[];
  backgroundColor: string; // or "transparent"
  invert: boolean;
  layers: number; // 1 to 4
}

/**
 * Deterministic Pseudo-Random Number Generator (PRNG) based on numeric seed.
 */
export function createPrng(seed: number) {
  let s = Math.abs(Math.floor(seed)) % 2147483647;
  if (s <= 0) s = 123456789;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates smooth SVG path data for a single wave using cubic Bezier curve points.
 */
export function generateWavePath(
  width: number,
  height: number,
  pointsCount: number,
  variancePct: number,
  baseHeightRatio: number,
  rng: () => number,
  invert: boolean
): string {
  const stepX = width / pointsCount;
  const baseY = height * baseHeightRatio;
  const maxDeltaY = (height * 0.45 * (variancePct / 100));

  const coords: { x: number; y: number }[] = [];
  coords.push({ x: 0, y: baseY + (rng() * 2 - 1) * maxDeltaY });

  for (let i = 1; i < pointsCount; i++) {
    const x = i * stepX;
    const y = baseY + (rng() * 2 - 1) * maxDeltaY;
    coords.push({ x, y });
  }
  coords.push({ x: width, y: baseY + (rng() * 2 - 1) * maxDeltaY });

  // Build cubic Bezier curve string
  let path = `M 0,${coords[0]?.y.toFixed(1)} `;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i]!;
    const p1 = coords[i + 1]!;
    const cx1 = p0.x + (p1.x - p0.x) / 2;
    const cy1 = p0.y;
    const cx2 = p0.x + (p1.x - p0.x) / 2;
    const cy2 = p1.y;
    path += `C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} `;
  }

  // Close the path to form a fillable solid shape
  if (!invert) {
    path += `L ${width},${height} L 0,${height} Z`;
  } else {
    path += `L ${width},0 L 0,0 Z`;
  }

  return path;
}

/**
 * Generates smooth organic Blob SVG path using polar coordinates.
 */
export function generateBlobPath(
  centerX: number,
  centerY: number,
  radius: number,
  pointsCount: number,
  variancePct: number,
  rng: () => number
): string {
  const angleStep = (Math.PI * 2) / pointsCount;
  const maxOffset = radius * (variancePct / 100) * 0.5;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < pointsCount; i++) {
    const angle = i * angleStep;
    const dist = radius + (rng() * 2 - 1) * maxOffset;
    points.push({
      x: centerX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist,
    });
  }

  if (points.length < 3) return "";

  // Spline close loop
  let path = `M ${points[0]?.x.toFixed(1)},${points[0]?.y.toFixed(1)} `;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const p0 = points[i]!;
    const p1 = points[(i + 1) % n]!;
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    path += `Q ${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)} `;
  }

  path += "Z";
  return path;
}

/**
 * Main Generator: produces standalone valid SVG string for any pattern configuration.
 */
export function generatePatternSvg(options: PatternOptions): string {
  const {
    type,
    width,
    height,
    points,
    variance,
    seed,
    colors,
    backgroundColor,
    invert,
    layers,
  } = options;

  const rng = createPrng(seed);
  const color1 = colors[0] ?? "#4f46e5";
  const color2 = colors[1] ?? "#38bdf8";
  const color3 = colors[2] ?? "#06b6d4";

  // Background rect
  const bgElement =
    backgroundColor && backgroundColor !== "transparent"
      ? `<rect width="${width}" height="${height}" fill="${backgroundColor}" />`
      : "";

  let defs = `
    <defs>
      <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="50%" stop-color="${color2}" />
        <stop offset="100%" stop-color="${color3}" />
      </linearGradient>
    </defs>
  `;

  let content = "";

  if (type === "waves") {
    const pathD = generateWavePath(width, height, points, variance, 0.5, rng, invert);
    content = `<path d="${pathD}" fill="url(#primaryGrad)" />`;
  } else if (type === "layered-waves") {
    const layerCount = Math.max(1, Math.min(4, layers));
    const opacities = [0.35, 0.6, 0.85, 1];
    let layeredPaths = "";

    for (let l = 0; l < layerCount; l++) {
      const baseRatio = 0.35 + (l / layerCount) * 0.35;
      const pathD = generateWavePath(width, height, points, variance, baseRatio, rng, invert);
      const color = colors[l % colors.length] ?? color1;
      const opacity = opacities[l] ?? 0.8;
      layeredPaths += `<path d="${pathD}" fill="${color}" fill-opacity="${opacity}" />`;
    }
    content = layeredPaths;
  } else if (type === "blobs") {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    const blobD = generateBlobPath(centerX, centerY, radius, Math.max(4, points), variance, rng);
    content = `<path d="${blobD}" fill="url(#primaryGrad)" />`;
  } else if (type === "grid-dots") {
    const spacing = 32;
    let dots = "";
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        const dotRadius = (variance / 100) * 1.5 + 1.5;
        dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotRadius.toFixed(1)}" fill="${color2}" fill-opacity="0.45" />`;
      }
    }
    content = dots;
  } else if (type === "mesh-gradient") {
    defs = `
      <defs>
        <radialGradient id="mesh1" cx="20%" cy="30%" r="60%">
          <stop offset="0%" stop-color="${color1}" stop-opacity="0.9" />
          <stop offset="100%" stop-color="${color1}" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="mesh2" cx="80%" cy="20%" r="55%">
          <stop offset="0%" stop-color="${color2}" stop-opacity="0.8" />
          <stop offset="100%" stop-color="${color2}" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="mesh3" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stop-color="${color3}" stop-opacity="0.85" />
          <stop offset="100%" stop-color="${color3}" stop-opacity="0" />
        </radialGradient>
        <filter id="meshBlur">
          <feGaussianBlur stdDeviation="60" />
        </filter>
      </defs>
    `;
    content = `
      <g filter="url(#meshBlur)">
        <rect width="${width}" height="${height}" fill="url(#mesh1)" />
        <rect width="${width}" height="${height}" fill="url(#mesh2)" />
        <rect width="${width}" height="${height}" fill="url(#mesh3)" />
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${defs}
  ${bgElement}
  ${content}
</svg>`;
}

/**
 * Converts SVG markup into a clean CSS Data URI format: background-image: url("...")
 */
export function svgToCssDataUri(svg: string): string {
  const cleaned = svg
    .replace(/\n/g, "")
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/&/g, "%26");
  return `background-image: url("data:image/svg+xml,${cleaned}");`;
}
