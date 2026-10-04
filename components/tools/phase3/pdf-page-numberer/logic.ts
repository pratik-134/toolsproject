export type Position =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "top-right"
  | "top-left";

export type NumberFormat = "Page {n} of {total}" | "{n} / {total}" | "{n}" | "- {n} -";

export function formatPageNumber(
  format: string,
  pageNum: number,
  totalPages: number
): string {
  return format
    .replace("{n}", pageNum.toString())
    .replace("{total}", totalPages.toString());
}

export function calculateNumberPosition(
  position: Position,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  fontSize: number,
  margin: number
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  switch (position) {
    case "bottom-center":
      x = (pageWidth - textWidth) / 2;
      y = margin;
      break;
    case "bottom-right":
      x = pageWidth - textWidth - margin;
      y = margin;
      break;
    case "bottom-left":
      x = margin;
      y = margin;
      break;
    case "top-center":
      x = (pageWidth - textWidth) / 2;
      y = pageHeight - margin - fontSize;
      break;
    case "top-right":
      x = pageWidth - textWidth - margin;
      y = pageHeight - margin - fontSize;
      break;
    case "top-left":
      x = margin;
      y = pageHeight - margin - fontSize;
      break;
  }

  return { x, y };
}

export function hexToRgb(colorHex: string): { r: number; g: number; b: number } {
  let r = 0,
    g = 0,
    b = 0;
  if (colorHex.startsWith("#") && colorHex.length === 7) {
    r = parseInt(colorHex.slice(1, 3), 16) / 255;
    g = parseInt(colorHex.slice(3, 5), 16) / 255;
    b = parseInt(colorHex.slice(5, 7), 16) / 255;
  }
  return { r, g, b };
}
