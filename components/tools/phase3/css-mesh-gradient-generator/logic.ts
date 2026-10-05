/**
 * CSS Mesh Gradient Studio & Generator — Pure Domain Logic
 * 100% In-Browser Parametric Mesh Gradient Calculations & CSS/SVG Generators
 * Zero External Network Calls, Zero Server Uploads (Cleartrix Invariant #1)
 */

export interface MeshPoint {
  id: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  color: string; // hex
  radius: number; // 20 to 150 percentage
}

export interface MeshPreset {
  id: string;
  name: string;
  backgroundColor: string;
  points: MeshPoint[];
}

export const DEFAULT_MESH_PRESETS: MeshPreset[] = [
  {
    id: "aurora",
    name: "Northern Aurora",
    backgroundColor: "#030712",
    points: [
      { id: "p1", x: 20, y: 30, color: "#10b981", radius: 70 },
      { id: "p2", x: 80, y: 25, color: "#06b6d4", radius: 65 },
      { id: "p3", x: 45, y: 75, color: "#8b5cf6", radius: 80 },
      { id: "p4", x: 85, y: 80, color: "#3b82f6", radius: 60 },
    ],
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    backgroundColor: "#1c1917",
    points: [
      { id: "p1", x: 25, y: 25, color: "#f97316", radius: 75 },
      { id: "p2", x: 75, y: 35, color: "#ec4899", radius: 70 },
      { id: "p3", x: 30, y: 80, color: "#ef4444", radius: 80 },
      { id: "p4", x: 80, y: 75, color: "#eab308", radius: 65 },
    ],
  },
  {
    id: "cosmic-cyber",
    name: "Cosmic Cyberpunk",
    backgroundColor: "#09090b",
    points: [
      { id: "p1", x: 15, y: 20, color: "#d946ef", radius: 80 },
      { id: "p2", x: 85, y: 30, color: "#3b82f6", radius: 75 },
      { id: "p3", x: 50, y: 70, color: "#06b6d4", radius: 70 },
      { id: "p4", x: 90, y: 85, color: "#a855f7", radius: 65 },
    ],
  },
  {
    id: "spring-pastel",
    name: "Spring Pastel",
    backgroundColor: "#f8fafc",
    points: [
      { id: "p1", x: 20, y: 25, color: "#67e8f9", radius: 75 },
      { id: "p2", x: 80, y: 30, color: "#f472b6", radius: 70 },
      { id: "p3", x: 35, y: 75, color: "#fde047", radius: 65 },
      { id: "p4", x: 75, y: 80, color: "#a7f3d0", radius: 75 },
    ],
  },
];

/**
 * Generates valid pure CSS background rule with layered radial gradients
 */
export function generateMeshCss(
  backgroundColor: string,
  points: MeshPoint[],
  blurPx: number = 0
): string {
  if (points.length === 0) {
    return `background-color: ${backgroundColor};`;
  }

  const radialLayers = points.map(
    (p) => `radial-gradient(at ${Math.round(p.x)}% ${Math.round(p.y)}%, ${p.color} 0px, transparent ${Math.round(p.radius)}%)`
  );

  let css = `background-color: ${backgroundColor};\nbackground-image: \n  ${radialLayers.join(",\n  ")};`;
  if (blurPx > 0) {
    css += `\nfilter: blur(${blurPx}px);`;
  }
  return css;
}

/**
 * Generates Tailwind CSS arbitrary background property value
 */
export function generateTailwindClass(
  backgroundColor: string,
  points: MeshPoint[]
): string {
  if (points.length === 0) return `bg-[${backgroundColor}]`;
  const radials = points.map(
    (p) => `radial-gradient(at_${Math.round(p.x)}%_${Math.round(p.y)}%,_${p.color}_0px,_transparent_${Math.round(p.radius)}%)`
  );
  return `bg-[${backgroundColor}] bg-[${radials.join(",")}]`;
}

/**
 * Generates standalone scalable vector SVG with filter blur for wallpapers and graphics
 */
export function generateMeshSvg(
  backgroundColor: string,
  points: MeshPoint[],
  width: number = 1920,
  height: number = 1080,
  blurStdDev: number = 60
): string {
  const circles = points
    .map((p, i) => {
      const cx = (p.x / 100) * width;
      const cy = (p.y / 100) * height;
      const r = (p.radius / 100) * Math.max(width, height) * 0.6;
      return `<circle cx="${Math.round(cx)}" cy="${Math.round(cy)}" r="${Math.round(r)}" fill="${p.color}" filter="url(#blurFilter)" />`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${blurStdDev}" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="${backgroundColor}" />
  <g>
    ${circles}
  </g>
</svg>`;
}

/**
 * Randomizes point positions and colors with a complementary or harmonious palette
 */
export function randomizeMeshPoints(currentPoints: MeshPoint[]): MeshPoint[] {
  const vibrantHues = [
    "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4",
    "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  ];

  return currentPoints.map((p, i) => {
    const randomColor = vibrantHues[Math.floor(Math.random() * vibrantHues.length)] || "#3b82f6";
    return {
      ...p,
      x: 10 + Math.floor(Math.random() * 80),
      y: 10 + Math.floor(Math.random() * 80),
      color: randomColor,
      radius: 50 + Math.floor(Math.random() * 45),
    };
  });
}
