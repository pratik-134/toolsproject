import { generateQrSvg } from "./logic";

export function runTests(): boolean {
  // Test 1: Empty text error
  const empty = generateQrSvg({ text: "" });
  if (empty.success) throw new Error("Empty text should fail");

  // Test 2: Standard URL QR generation
  const res = generateQrSvg({ text: "https://cleartrix.com", size: 300 });
  if (!res.success || !res.svgString || !res.svgString.includes("<svg") || !res.svgString.includes("path")) {
    throw new Error("Standard QR SVG generation failed");
  }

  return true;
}
