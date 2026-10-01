/**
 * Chart & Graph Visualizer — Pure Domain Logic
 * 100% In-Browser HTML Canvas Charting (Zero Network Uploads)
 */

export type ChartType = "bar" | "line" | "pie";

export interface DataPoint {
  label: string;
  value: number;
}

export interface ChartPalette {
  name: string;
  colors: string[];
}

export const CHART_PALETTES: ChartPalette[] = [
  {
    name: "Modern Indigo",
    colors: ["#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"],
  },
  {
    name: "Emerald Nature",
    colors: ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#047857"],
  },
  {
    name: "Sunset Vibrant",
    colors: ["#f97316", "#fb923c", "#f43f5e", "#e11d48", "#be123c", "#fda4af"],
  },
  {
    name: "Cyber Purple",
    colors: ["#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#6366f1"],
  },
];

export const DEFAULT_CHART_DATA: DataPoint[] = [
  { label: "Jan", value: 420 },
  { label: "Feb", value: 680 },
  { label: "Mar", value: 950 },
  { label: "Apr", value: 810 },
  { label: "May", value: 1240 },
  { label: "Jun", value: 1560 },
];

/**
 * Parses raw CSV string (label,value or label\tvalue) into DataPoint[]
 */
export function parseCsvToDataPoints(csv: string): DataPoint[] {
  if (!csv?.trim()) return [];
  const lines = csv.trim().split(/\r?\n/);
  const points: DataPoint[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // split on comma or tab or semicolon
    const parts = trimmed.split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ""));
    if (parts.length >= 2 && parts[0] !== undefined && parts[1] !== undefined) {
      const label = parts[0];
      const val = parseFloat(parts[1].replace(/[^0-9.-]/g, ""));
      if (!isNaN(val)) {
        points.push({ label, value: val });
      }
    }
  }

  return points;
}

/**
 * Calculates statistical min, max and nice rounded upper bound for axis
 */
export function calculateAxisBounds(data: DataPoint[]): { min: number; max: number; niceMax: number } {
  if (!data || data.length === 0) {
    return { min: 0, max: 100, niceMax: 100 };
  }

  const values = data.map((d) => d.value);
  const min = Math.min(0, ...values);
  const max = Math.max(...values);

  // Calculate nice round ceiling (e.g. 1560 -> 1600 or 2000)
  const magnitude = Math.pow(10, Math.floor(Math.log10(max || 1)));
  const niceMax = Math.ceil(max / magnitude) * magnitude;

  return { min, max, niceMax: Math.max(10, niceMax) };
}

/**
 * Calculates pie slice angles in radians
 */
export function calculatePieAngles(data: DataPoint[]): { label: string; value: number; startAngle: number; endAngle: number; percent: number }[] {
  const total = data.reduce((acc, d) => acc + Math.max(0, d.value), 0);
  if (total === 0) return [];

  let currentAngle = -Math.PI / 2; // start from 12 o'clock

  return data.map((d) => {
    const sliceVal = Math.max(0, d.value);
    const fraction = sliceVal / total;
    const angleDelta = fraction * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleDelta;
    currentAngle = endAngle;

    return {
      label: d.label,
      value: sliceVal,
      startAngle,
      endAngle,
      percent: Math.round(fraction * 1000) / 10,
    };
  });
}
