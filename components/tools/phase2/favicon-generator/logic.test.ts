import {
  generateWebManifest,
  generateFaviconHtmlTags,
  buildIcoFile,
  FAVICON_SPECS,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Specs definition
  if (FAVICON_SPECS.length !== 6) {
    throw new Error(`Expected 6 favicon specs, got ${FAVICON_SPECS.length}`);
  }
  const spec16 = FAVICON_SPECS.find((s) => s.width === 16);
  if (!spec16 || spec16.filename !== "favicon-16x16.png") {
    throw new Error("Missing 16x16 favicon spec");
  }

  // Test 2: Web Manifest JSON generation
  const manifestRaw = generateWebManifest({
    name: "Cleartrix App",
    shortName: "Cleartrix",
    themeColor: "#6366f1",
    backgroundColor: "#ffffff",
  });

  const parsed = JSON.parse(manifestRaw);
  if (parsed.name !== "Cleartrix App" || parsed.short_name !== "Cleartrix") {
    throw new Error("Web manifest properties mismatch");
  }
  if (parsed.theme_color !== "#6366f1") {
    throw new Error("Theme color was not preserved in web manifest");
  }
  if (!Array.isArray(parsed.icons) || parsed.icons.length < 2) {
    throw new Error("Missing icons array in web manifest");
  }

  // Test 3: HTML tags snippet
  const htmlTags = generateFaviconHtmlTags("#10b981");
  if (!htmlTags.includes("favicon-32x32.png")) {
    throw new Error("HTML snippet missing favicon-32x32.png");
  }
  if (!htmlTags.includes("apple-touch-icon.png")) {
    throw new Error("HTML snippet missing apple-touch-icon.png");
  }
  if (!htmlTags.includes('content="#10b981"')) {
    throw new Error("HTML snippet missing configured theme color meta tag");
  }

  // Test 4: Build ICO file binary
  // Mock two tiny 1-pixel PNG payloads (PNG magic number: 0x89 0x50 0x4E 0x47)
  const dummyPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const icoBuffer = buildIcoFile([
    { width: 16, height: 16, data: dummyPng },
    { width: 32, height: 32, data: dummyPng },
  ]);

  const view = new DataView(icoBuffer.buffer);
  // Reserved must be 0
  if (view.getUint16(0, true) !== 0) throw new Error("ICO header reserved != 0");
  // Type must be 1
  if (view.getUint16(2, true) !== 1) throw new Error("ICO header type != 1");
  // Image count must be 2
  if (view.getUint16(4, true) !== 2) throw new Error("ICO image count != 2");

  // Check first directory entry
  if (view.getUint8(6) !== 16) throw new Error("ICO first entry width != 16");
  if (view.getUint8(7) !== 16) throw new Error("ICO first entry height != 16");

  return true;
}
