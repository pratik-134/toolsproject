/**
 * Passport Photo Generator & Biometric Studio - Pure Business Logic
 * Compliant with ICAO Doc 9303, US Dept of State, and International Visa standards.
 */

export interface PassportPreset {
  id: string;
  country: string;
  code: string;
  flag?: string;
  document: string;
  widthMm: number;
  heightMm: number;
  widthInches: number;
  heightInches: number;
  dpi: number;
  targetWidthPx: number;
  targetHeightPx: number;
  bgColor: string;
  headRatioMin: number; // minimum head percentage (crown to chin)
  headRatioMax: number; // maximum head percentage
  notes: string;
}

export const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: "us-passport",
    country: "United States",
    code: "US",
    flag: "US",
    document: "Passport, Visa & Green Card",
    widthMm: 51,
    heightMm: 51,
    widthInches: 2,
    heightInches: 2,
    dpi: 300,
    targetWidthPx: 600,
    targetHeightPx: 600,
    bgColor: "#FFFFFF",
    headRatioMin: 0.50,
    headRatioMax: 0.69,
    notes: "2x2 inches (51x51mm). Pure white or off-white background. Head 1 to 1-3/8 inches.",
  },
  {
    id: "in-passport",
    country: "India",
    code: "IN",
    flag: "IN",
    document: "Standard Passport",
    widthMm: 35,
    heightMm: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    dpi: 300,
    targetWidthPx: 413,
    targetHeightPx: 531,
    bgColor: "#FFFFFF",
    headRatioMin: 0.70,
    headRatioMax: 0.80,
    notes: "35x45mm. Plain light background (white preferred). 70-80% face coverage.",
  },
  {
    id: "in-visa",
    country: "India",
    code: "IN",
    flag: "IN",
    document: "Visa / OCI Card",
    widthMm: 51,
    heightMm: 51,
    widthInches: 2,
    heightInches: 2,
    dpi: 300,
    targetWidthPx: 600,
    targetHeightPx: 600,
    bgColor: "#FFFFFF",
    headRatioMin: 0.60,
    headRatioMax: 0.70,
    notes: "51x51mm (2x2 inches). White background, full frontal face view.",
  },
  {
    id: "in-pan",
    country: "India",
    code: "IN",
    flag: "IN",
    document: "PAN Card / Stamp Size",
    widthMm: 25,
    heightMm: 35,
    widthInches: 0.98,
    heightInches: 1.38,
    dpi: 300,
    targetWidthPx: 295,
    targetHeightPx: 413,
    bgColor: "#FFFFFF",
    headRatioMin: 0.65,
    headRatioMax: 0.75,
    notes: "25x35mm stamp size. Clean white or light background.",
  },
  {
    id: "uk-passport",
    country: "United Kingdom",
    code: "GB",
    flag: "GB",
    document: "Standard Passport & Visa",
    widthMm: 35,
    heightMm: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    dpi: 300,
    targetWidthPx: 413,
    targetHeightPx: 531,
    bgColor: "#F1F5F9",
    headRatioMin: 0.65,
    headRatioMax: 0.75,
    notes: "35x45mm. Light grey or plain cream background. Head between 29mm and 34mm.",
  },
  {
    id: "eu-schengen",
    country: "Schengen / EU",
    code: "EU",
    flag: "EU",
    document: "Schengen Visa & EU Passport",
    widthMm: 35,
    heightMm: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    dpi: 300,
    targetWidthPx: 413,
    targetHeightPx: 531,
    bgColor: "#F8FAFC",
    headRatioMin: 0.70,
    headRatioMax: 0.80,
    notes: "35x45mm. Light grey or neutral background. Face 32-36mm (70-80%).",
  },
  {
    id: "ca-passport",
    country: "Canada",
    code: "CA",
    flag: "CA",
    document: "Canadian Passport & PR Card",
    widthMm: 50,
    heightMm: 70,
    widthInches: 1.97,
    heightInches: 2.76,
    dpi: 300,
    targetWidthPx: 591,
    targetHeightPx: 827,
    bgColor: "#FFFFFF",
    headRatioMin: 0.50,
    headRatioMax: 0.65,
    notes: "50x70mm. Plain white or light-coloured background. Head 31mm to 36mm.",
  },
  {
    id: "au-passport",
    country: "Australia",
    code: "AU",
    flag: "AU",
    document: "Passport & Identity",
    widthMm: 35,
    heightMm: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    dpi: 300,
    targetWidthPx: 413,
    targetHeightPx: 531,
    bgColor: "#FFFFFF",
    headRatioMin: 0.70,
    headRatioMax: 0.80,
    notes: "35x45mm. Plain white or light grey background. Head height 32-36mm.",
  },
  {
    id: "cn-passport",
    country: "China",
    code: "CN",
    flag: "CN",
    document: "Passport & Entry Visa",
    widthMm: 33,
    heightMm: 48,
    widthInches: 1.30,
    heightInches: 1.89,
    dpi: 300,
    targetWidthPx: 390,
    targetHeightPx: 567,
    bgColor: "#FFFFFF",
    headRatioMin: 0.60,
    headRatioMax: 0.70,
    notes: "33x48mm. White background, head width 15-22mm, head height 28-33mm.",
  },
  {
    id: "jp-passport",
    country: "Japan",
    code: "JP",
    flag: "JP",
    document: "Passport & Residence Card",
    widthMm: 35,
    heightMm: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    dpi: 300,
    targetWidthPx: 413,
    targetHeightPx: 531,
    bgColor: "#FFFFFF",
    headRatioMin: 0.70,
    headRatioMax: 0.80,
    notes: "35x45mm. Plain light background with no patterns or shadows.",
  },
  {
    id: "ae-visa",
    country: "UAE / Dubai",
    code: "AE",
    flag: "AE",
    document: "Tourist & Resident Visa",
    widthMm: 40,
    heightMm: 50,
    widthInches: 1.57,
    heightInches: 1.97,
    dpi: 300,
    targetWidthPx: 472,
    targetHeightPx: 591,
    bgColor: "#FFFFFF",
    headRatioMin: 0.70,
    headRatioMax: 0.80,
    notes: "40x50mm. Plain white background, clear neutral facial expression.",
  },
  {
    id: "sg-passport",
    country: "Singapore",
    code: "SG",
    flag: "SG",
    document: "Passport & Identity Card",
    widthMm: 35,
    heightMm: 45,
    widthInches: 1.38,
    heightInches: 1.77,
    dpi: 300,
    targetWidthPx: 413,
    targetHeightPx: 531,
    bgColor: "#FFFFFF",
    headRatioMin: 0.70,
    headRatioMax: 0.80,
    notes: "35x45mm. Plain white background, sharp focus, 70-80% face height.",
  },
];

export interface PrintPaperFormat {
  id: string;
  name: string;
  widthInches: number;
  heightInches: number;
  widthMm: number;
  heightMm: number;
  dpi: number;
  targetWidthPx: number;
  targetHeightPx: number;
  pdfWidthPt: number;
  pdfHeightPt: number;
}

export const PRINT_PAPERS: PrintPaperFormat[] = [
  {
    id: "single",
    name: "Single Photo (Exact Cut Size)",
    widthInches: 0,
    heightInches: 0,
    widthMm: 0,
    heightMm: 0,
    dpi: 300,
    targetWidthPx: 0,
    targetHeightPx: 0,
    pdfWidthPt: 0,
    pdfHeightPt: 0,
  },
  {
    id: "4x6",
    name: "4 x 6 in (10 x 15 cm) Photo Paper",
    widthInches: 6,
    heightInches: 4,
    widthMm: 152.4,
    heightMm: 101.6,
    dpi: 300,
    targetWidthPx: 1800,
    targetHeightPx: 1200,
    pdfWidthPt: 432,
    pdfHeightPt: 288,
  },
  {
    id: "5x7",
    name: "5 x 7 in (13 x 18 cm) Photo Paper",
    widthInches: 7,
    heightInches: 5,
    widthMm: 177.8,
    heightMm: 127,
    dpi: 300,
    targetWidthPx: 2100,
    targetHeightPx: 1500,
    pdfWidthPt: 504,
    pdfHeightPt: 360,
  },
  {
    id: "a4",
    name: "A4 Paper (210 x 297 mm)",
    widthInches: 8.27,
    heightInches: 11.69,
    widthMm: 210,
    heightMm: 297,
    dpi: 300,
    targetWidthPx: 2480,
    targetHeightPx: 3508,
    pdfWidthPt: 595.28,
    pdfHeightPt: 841.89,
  },
  {
    id: "letter",
    name: "US Letter (8.5 x 11 in)",
    widthInches: 8.5,
    heightInches: 11.0,
    widthMm: 215.9,
    heightMm: 279.4,
    dpi: 300,
    targetWidthPx: 2550,
    targetHeightPx: 3300,
    pdfWidthPt: 612,
    pdfHeightPt: 792,
  },
];

export interface NameOverlayConfig {
  enabled: boolean;
  name: string;
  date: string;
}

export const DEFAULT_NAME_OVERLAY: NameOverlayConfig = {
  enabled: false,
  name: "",
  date: "",
};

/**
 * Draws official government admit card / exam / visa Name & Date strip at bottom of photo.
 */
export function drawNameOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: NameOverlayConfig
) {
  if (!config.enabled) return;
  const trimmedName = (config.name || "").trim().toUpperCase();
  const trimmedDate = (config.date || "").trim();
  if (!trimmedName && !trimmedDate) return;

  ctx.save();

  // White bottom strip (~16% of height, minimum 28px)
  const stripHeight = Math.max(28, Math.round(height * 0.16));
  const stripY = height - stripHeight;

  // Solid white background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, stripY, width, stripHeight);

  // Top border line for crisp separation
  ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
  ctx.lineWidth = Math.max(1, Math.round(height / 300));
  ctx.beginPath();
  ctx.moveTo(0, stripY);
  ctx.lineTo(width, stripY);
  ctx.stroke();

  // Text styling
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const centerX = width / 2;

  if (trimmedName && trimmedDate) {
    // Two lines: Name on top, Date below
    const nameFontSize = Math.max(10, Math.round(stripHeight * 0.36));
    const dateFontSize = Math.max(8, Math.round(stripHeight * 0.28));

    ctx.font = `bold ${nameFontSize}px Arial, sans-serif`;
    ctx.fillText(trimmedName, centerX, stripY + stripHeight * 0.33);

    ctx.font = `600 ${dateFontSize}px Arial, sans-serif`;
    ctx.fillText(trimmedDate, centerX, stripY + stripHeight * 0.74);
  } else if (trimmedName) {
    // Single line: Name only
    const nameFontSize = Math.max(11, Math.round(stripHeight * 0.48));
    ctx.font = `bold ${nameFontSize}px Arial, sans-serif`;
    ctx.fillText(trimmedName, centerX, stripY + stripHeight / 2);
  } else if (trimmedDate) {
    // Single line: Date only
    const dateFontSize = Math.max(11, Math.round(stripHeight * 0.48));
    ctx.font = `bold ${dateFontSize}px Arial, sans-serif`;
    ctx.fillText(trimmedDate, centerX, stripY + stripHeight / 2);
  }

  ctx.restore();
}

export interface PhotoTransform {
  zoom: number; // 0.5 to 3.0 (default 1.0)
  panX: number; // offset in px
  panY: number; // offset in px
  rotation: number; // -45 to +45 in degrees
  flipH: boolean; // horizontal flip (mirror)
  brightness: number; // -50 to +50
  contrast: number; // -50 to +50
  saturation: number; // -50 to +50
  bgColor: string; // "#FFFFFF", "#F1F5F9", etc.
}

export const DEFAULT_TRANSFORM: PhotoTransform = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
  rotation: 0,
  flipH: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  bgColor: "#FFFFFF",
};

/**
 * Calculates how many passport photos fit on a standard print paper sheet.
 */
export interface SheetLayout {
  cols: number;
  rows: number;
  totalCapacity: number;
  photosToRender: number;
  totalPhotos: number; // alias for photosToRender
  cellWidthPx: number;
  cellHeightPx: number;
  offsetX: number;
  offsetY: number;
  gapPx: number;
}

export function computePrintSheetLayout(
  paper: PrintPaperFormat,
  preset: PassportPreset,
  requestedCount?: number,
  customSpacingMm?: number
): SheetLayout {
  if (paper.id === "single") {
    return {
      cols: 1,
      rows: 1,
      totalCapacity: 1,
      photosToRender: 1,
      totalPhotos: 1,
      cellWidthPx: preset.targetWidthPx,
      cellHeightPx: preset.targetHeightPx,
      offsetX: 0,
      offsetY: 0,
      gapPx: 0,
    };
  }

  const paperW = paper.targetWidthPx;
  const paperH = paper.targetHeightPx;
  const photoW = preset.targetWidthPx;
  const photoH = preset.targetHeightPx;

  let cols: number;
  let rows: number;
  let gapPx: number;

  if (customSpacingMm !== undefined && customSpacingMm >= 0) {
    const desiredGapPx = Math.round((customSpacingMm / 25.4) * 300);
    gapPx = desiredGapPx;
    if (gapPx === 0) {
      cols = Math.max(1, Math.floor(paperW / photoW));
      rows = Math.max(1, Math.floor(paperH / photoH));
    } else {
      cols = Math.max(1, Math.floor((paperW + gapPx) / (photoW + gapPx)));
      rows = Math.max(1, Math.floor((paperH + gapPx) / (photoH + gapPx)));
    }
  } else {
    // Default auto spacing (maximizes grid capacity while maintaining equal margins)
    cols = Math.max(1, Math.floor(paperW / photoW));
    rows = Math.max(1, Math.floor(paperH / photoH));
    const remainingW = paperW - cols * photoW;
    const remainingH = paperH - rows * photoH;
    gapPx = Math.min(
      cols > 1 ? Math.floor(remainingW / (cols - 1)) : 0,
      rows > 1 ? Math.floor(remainingH / (rows - 1)) : 0,
      16
    );
  }

  const totalCapacity = cols * rows;
  const totalGridW = cols * photoW + (cols - 1) * Math.max(0, gapPx);
  const totalGridH = rows * photoH + (rows - 1) * Math.max(0, gapPx);
  const offsetX = Math.max(0, Math.round((paperW - totalGridW) / 2));
  const offsetY = Math.max(0, Math.round((paperH - totalGridH) / 2));

  const photosToRender = requestedCount
    ? Math.min(Math.max(1, requestedCount), totalCapacity)
    : totalCapacity;

  return {
    cols,
    rows,
    totalCapacity,
    photosToRender,
    totalPhotos: photosToRender,
    cellWidthPx: photoW,
    cellHeightPx: photoH,
    offsetX,
    offsetY,
    gapPx: Math.max(0, gapPx),
  };
}

/**
 * Converts millimeter measurements to pixels at a given DPI.
 */
export function mmToPixels(mm: number, dpi: number = 300): number {
  return Math.round((mm / 25.4) * dpi);
}

/**
 * Converts inches measurements to pixels at a given DPI.
 */
export function inchesToPixels(inches: number, dpi: number = 300): number {
  return Math.round(inches * dpi);
}

/**
 * Draws the biometric head alignment guide overlay on an interactive canvas.
 */
export function drawBiometricGuide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  preset: PassportPreset
) {
  ctx.save();

  const centerX = width / 2;
  const centerY = height / 2;

  // Head oval guide dimensions based on preset ratio
  const avgHeadRatio = (preset.headRatioMin + preset.headRatioMax) / 2;
  const headHeight = height * avgHeadRatio;
  const headWidth = headHeight * 0.72; // typical human head aspect ratio
  const headTopY = height * 0.12; // top of crown margin
  const headCenterY = headTopY + headHeight / 2;

  // 1. Center vertical symmetry line (dashed)
  ctx.beginPath();
  ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.stroke();

  // 2. Eye line level (typically 55-60% from bottom / 42-45% from top of head)
  const eyeLineY = headTopY + headHeight * 0.45;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.moveTo(centerX - headWidth * 0.7, eyeLineY);
  ctx.lineTo(centerX + headWidth * 0.7, eyeLineY);
  ctx.stroke();

  // 3. Chin guideline
  const chinY = headTopY + headHeight;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.moveTo(centerX - headWidth * 0.5, chinY);
  ctx.lineTo(centerX + headWidth * 0.5, chinY);
  ctx.stroke();

  // 4. Biometric Oval Head Guide
  ctx.beginPath();
  ctx.ellipse(centerX, headCenterY, headWidth / 2, headHeight / 2, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(59, 130, 246, 0.75)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.stroke();

  // 5. Crown & Chin guide tags
  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
  ctx.fillText("EYE LEVEL", centerX + headWidth * 0.72, eyeLineY + 3);

  ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
  ctx.fillText("CHIN BASE", centerX + headWidth * 0.52, chinY + 3);

  ctx.restore();
}

/**
 * Draws cut marks / crop corners around a photo cell on a print sheet.
 */
export function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  markLength: number = 16
) {
  ctx.save();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.85)"; // slate-400
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(x - markLength, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y - markLength);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(x + width + markLength, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y - markLength);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(x - markLength, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + height + markLength);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(x + width + markLength, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width, y + height + markLength);
  ctx.stroke();

  ctx.restore();
}
