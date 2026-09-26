/**
 * Pure Universal Unit Conversion Engine
 * Zero dependencies, client-side execution.
 */

export type UnitCategory = "length" | "mass" | "temperature" | "data" | "area" | "speed";

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
}

export const UNIT_CATEGORIES: Record<UnitCategory, { name: string; baseUnit: string; units: Record<string, UnitDefinition> }> = {
  length: {
    name: "Length & Distance",
    baseUnit: "m",
    units: {
      m: { id: "m", name: "Meter", symbol: "m", toBase: (v) => v, fromBase: (b) => b },
      km: { id: "km", name: "Kilometer", symbol: "km", toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      cm: { id: "cm", name: "Centimeter", symbol: "cm", toBase: (v) => v / 100, fromBase: (b) => b * 100 },
      mm: { id: "mm", name: "Millimeter", symbol: "mm", toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      mi: { id: "mi", name: "Mile", symbol: "mi", toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
      yd: { id: "yd", name: "Yard", symbol: "yd", toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      ft: { id: "ft", name: "Foot", symbol: "ft", toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      in: { id: "in", name: "Inch", symbol: "in", toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
    },
  },
  mass: {
    name: "Weight & Mass",
    baseUnit: "kg",
    units: {
      kg: { id: "kg", name: "Kilogram", symbol: "kg", toBase: (v) => v, fromBase: (b) => b },
      g: { id: "g", name: "Gram", symbol: "g", toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
      mg: { id: "mg", name: "Milligram", symbol: "mg", toBase: (v) => v / 1e6, fromBase: (b) => b * 1e6 },
      lb: { id: "lb", name: "Pound", symbol: "lb", toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
      oz: { id: "oz", name: "Ounce", symbol: "oz", toBase: (v) => v * 0.028349523, fromBase: (b) => b / 0.028349523 },
      t: { id: "t", name: "Metric Ton", symbol: "t", toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
    },
  },
  temperature: {
    name: "Temperature",
    baseUnit: "C",
    units: {
      C: { id: "C", name: "Celsius", symbol: "°C", toBase: (v) => v, fromBase: (b) => b },
      F: { id: "F", name: "Fahrenheit", symbol: "°F", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
      K: { id: "K", name: "Kelvin", symbol: "K", toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
    },
  },
  data: {
    name: "Digital Data Storage",
    baseUnit: "B",
    units: {
      B: { id: "B", name: "Byte", symbol: "B", toBase: (v) => v, fromBase: (b) => b },
      KB: { id: "KB", name: "Kilobyte (Decimal)", symbol: "KB", toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      MB: { id: "MB", name: "Megabyte (Decimal)", symbol: "MB", toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      GB: { id: "GB", name: "Gigabyte (Decimal)", symbol: "GB", toBase: (v) => v * 1e9, fromBase: (b) => b / 1e9 },
      TB: { id: "TB", name: "Terabyte (Decimal)", symbol: "TB", toBase: (v) => v * 1e12, fromBase: (b) => b / 1e12 },
      KiB: { id: "KiB", name: "Kibibyte (Binary)", symbol: "KiB", toBase: (v) => v * 1024, fromBase: (b) => b / 1024 },
      MiB: { id: "MiB", name: "Mebibyte (Binary)", symbol: "MiB", toBase: (v) => v * 1048576, fromBase: (b) => b / 1048576 },
      GiB: { id: "GiB", name: "Gibibyte (Binary)", symbol: "GiB", toBase: (v) => v * 1073741824, fromBase: (b) => b / 1073741824 },
    },
  },
  area: {
    name: "Area",
    baseUnit: "m2",
    units: {
      m2: { id: "m2", name: "Square Meter", symbol: "m²", toBase: (v) => v, fromBase: (b) => b },
      km2: { id: "km2", name: "Square Kilometer", symbol: "km²", toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      ft2: { id: "ft2", name: "Square Foot", symbol: "ft²", toBase: (v) => v * 0.09290304, fromBase: (b) => b / 0.09290304 },
      ac: { id: "ac", name: "Acre", symbol: "ac", toBase: (v) => v * 4046.8564224, fromBase: (b) => b / 4046.8564224 },
      ha: { id: "ha", name: "Hectare", symbol: "ha", toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
    },
  },
  speed: {
    name: "Speed & Velocity",
    baseUnit: "mps",
    units: {
      mps: { id: "mps", name: "Meter per second", symbol: "m/s", toBase: (v) => v, fromBase: (b) => b },
      kmh: { id: "kmh", name: "Kilometer per hour", symbol: "km/h", toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      mph: { id: "mph", name: "Miles per hour", symbol: "mph", toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      knot: { id: "knot", name: "Knot", symbol: "kn", toBase: (v) => v * 0.514444, fromBase: (b) => b / 0.514444 },
    },
  },
};

export function convertUnit(
  val: number,
  category: UnitCategory,
  fromUnit: string,
  toUnit: string
): number {
  if (isNaN(val)) return 0;
  if (fromUnit === toUnit) return val;

  const cat = UNIT_CATEGORIES[category];
  if (!cat) return val;

  const fromDef = cat.units[fromUnit];
  const toDef = cat.units[toUnit];
  if (!fromDef || !toDef) return val;

  const base = fromDef.toBase(val);
  const result = toDef.fromBase(base);

  // Round smartly to 6 decimal places max
  return Math.round((result + Number.EPSILON) * 1e6) / 1e6;
}

export function getAllConversionsForCategory(
  val: number,
  category: UnitCategory,
  fromUnit: string
): Array<{ id: string; name: string; symbol: string; value: number }> {
  const cat = UNIT_CATEGORIES[category];
  if (!cat) return [];

  return Object.values(cat.units).map((u) => ({
    id: u.id,
    name: u.name,
    symbol: u.symbol,
    value: convertUnit(val, category, fromUnit, u.id),
  }));
}
