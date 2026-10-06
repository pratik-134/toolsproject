/**
 * Interactive CSS Box-Shadow & Glassmorphism Studio — Pure Domain Logic
 * 100% In-Browser Multi-Layer Ambient & Elevation Shadow Generator
 * Zero External Network Calls, Zero Server Uploads (Qwertygen Invariant #1)
 */

export interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string; // rgba or hex
  inset: boolean;
}

export interface GlassmorphismOptions {
  blurPx: number;
  opacity: number;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
}

/**
 * Builds standard CSS box-shadow string
 */
export function buildBoxShadowCss(layers: ShadowLayer[]): string {
  if (layers.length === 0) return "none";
  return layers
    .map(
      (l) => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`
    )
    .join(", ");
}

/**
 * Generates elevation presets (Material / Modern UI elevations 1-5)
 */
export function getElevationPreset(level: 1 | 2 | 3 | 4 | 5): ShadowLayer[] {
  switch (level) {
    case 1:
      return [
        { id: "e1_1", x: 0, y: 1, blur: 3, spread: 0, color: "rgba(0, 0, 0, 0.1)", inset: false },
        { id: "e1_2", x: 0, y: 1, blur: 2, spread: -1, color: "rgba(0, 0, 0, 0.1)", inset: false },
      ];
    case 2:
      return [
        { id: "e2_1", x: 0, y: 4, blur: 6, spread: -1, color: "rgba(0, 0, 0, 0.1)", inset: false },
        { id: "e2_2", x: 0, y: 2, blur: 4, spread: -2, color: "rgba(0, 0, 0, 0.1)", inset: false },
      ];
    case 3:
      return [
        { id: "e3_1", x: 0, y: 10, blur: 15, spread: -3, color: "rgba(0, 0, 0, 0.1)", inset: false },
        { id: "e3_2", x: 0, y: 4, blur: 6, spread: -4, color: "rgba(0, 0, 0, 0.1)", inset: false },
      ];
    case 4:
      return [
        { id: "e4_1", x: 0, y: 20, blur: 25, spread: -5, color: "rgba(0, 0, 0, 0.1)", inset: false },
        { id: "e4_2", x: 0, y: 8, blur: 10, spread: -6, color: "rgba(0, 0, 0, 0.1)", inset: false },
      ];
    case 5:
    default:
      return [
        { id: "e5_1", x: 0, y: 25, blur: 50, spread: -12, color: "rgba(0, 0, 0, 0.25)", inset: false },
        { id: "e5_2", x: 0, y: 12, blur: 24, spread: -8, color: "rgba(0, 0, 0, 0.15)", inset: false },
      ];
  }
}
