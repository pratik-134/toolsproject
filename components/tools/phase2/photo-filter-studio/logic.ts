/**
 * Photo Filter Studio & Color Balancer — Pure TypeScript Domain Logic
 * 100% In-Browser Canvas Image Filtering (Zero Server Transmission)
 */

export interface FilterAdjustments {
  brightness: number; // 0 - 200%, default 100
  contrast: number;   // 0 - 200%, default 100
  saturation: number; // 0 - 200%, default 100
  hueRotate: number;  // 0 - 360 deg, default 0
  sepia: number;      // 0 - 100%, default 0
  grayscale: number;  // 0 - 100%, default 0
  invert: number;     // 0 - 100%, default 0
  blur: number;       // 0 - 20 px, default 0
}

export const DEFAULT_FILTER_ADJUSTMENTS: FilterAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hueRotate: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  blur: 0,
};

export interface FilterPreset {
  id: string;
  name: string;
  adjustments: Partial<FilterAdjustments>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "original",
    name: "Original",
    adjustments: { ...DEFAULT_FILTER_ADJUSTMENTS },
  },
  {
    id: "vivid",
    name: "Vivid Pop",
    adjustments: { brightness: 105, contrast: 125, saturation: 140 },
  },
  {
    id: "noir",
    name: "Dramatic Noir",
    adjustments: { grayscale: 100, contrast: 155, brightness: 92 },
  },
  {
    id: "vintage",
    name: "Vintage Sepia",
    adjustments: { sepia: 70, contrast: 110, saturation: 80, brightness: 96 },
  },
  {
    id: "warm",
    name: "Golden Hour",
    adjustments: { hueRotate: 18, saturation: 130, contrast: 112, brightness: 104 },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Glow",
    adjustments: { hueRotate: 195, contrast: 135, saturation: 145 },
  },
  {
    id: "matte",
    name: "Matte Film",
    adjustments: { contrast: 88, brightness: 112, saturation: 82 },
  },
  {
    id: "invert",
    name: "Negative Invert",
    adjustments: { invert: 100, contrast: 110 },
  },
];

/**
 * Compile adjustments into standard CSS/Canvas filter string
 */
export function buildCssFilterString(adj: FilterAdjustments): string {
  const parts: string[] = [];

  if (adj.brightness !== 100) parts.push(`brightness(${adj.brightness}%)`);
  if (adj.contrast !== 100) parts.push(`contrast(${adj.contrast}%)`);
  if (adj.saturation !== 100) parts.push(`saturate(${adj.saturation}%)`);
  if (adj.hueRotate !== 0) parts.push(`hue-rotate(${adj.hueRotate}deg)`);
  if (adj.sepia > 0) parts.push(`sepia(${adj.sepia}%)`);
  if (adj.grayscale > 0) parts.push(`grayscale(${adj.grayscale}%)`);
  if (adj.invert > 0) parts.push(`invert(${adj.invert}%)`);
  if (adj.blur > 0) parts.push(`blur(${adj.blur}px)`);

  return parts.length > 0 ? parts.join(" ") : "none";
}

/**
 * Apply preset adjustments onto existing state
 */
export function applyPreset(presetId: string): FilterAdjustments {
  const preset = FILTER_PRESETS.find((p) => p.id === presetId);
  if (!preset) return { ...DEFAULT_FILTER_ADJUSTMENTS };

  return {
    ...DEFAULT_FILTER_ADJUSTMENTS,
    ...preset.adjustments,
  };
}

/**
 * Validate and clamp numerical adjustments to safe ranges
 */
export function clampAdjustments(adj: Partial<FilterAdjustments>): FilterAdjustments {
  const clamp = (val: number | undefined, min: number, max: number, fallback: number) => {
    if (val === undefined || isNaN(val)) return fallback;
    return Math.max(min, Math.min(max, val));
  };

  return {
    brightness: clamp(adj.brightness, 0, 200, 100),
    contrast: clamp(adj.contrast, 0, 200, 100),
    saturation: clamp(adj.saturation, 0, 200, 100),
    hueRotate: clamp(adj.hueRotate, 0, 360, 0),
    sepia: clamp(adj.sepia, 0, 100, 0),
    grayscale: clamp(adj.grayscale, 0, 100, 0),
    invert: clamp(adj.invert, 0, 100, 0),
    blur: clamp(adj.blur, 0, 20, 0),
  };
}
