import {
  minifySvg,
  validateSvg,
  roundCoordinates,
  formatBytes,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Validation
  const emptyVal = validateSvg("");
  if (emptyVal.valid) throw new Error("Empty SVG should fail validation");

  const invalidVal = validateSvg("<div>Not an svg</div>");
  if (invalidVal.valid) throw new Error("Non-SVG should fail validation");

  const validVal = validateSvg("<svg viewBox='0 0 100 100'><circle cx='50' cy='50' r='40'/></svg>");
  if (!validVal.valid) throw new Error("Valid SVG should pass validation");

  // Test 2: Rounding coordinates
  const rounded = roundCoordinates("M 10.123456 20.987654 L 30.55555 40.11111", 2);
  if (!rounded.includes("10.12") || !rounded.includes("20.99")) {
    throw new Error(`roundCoordinates failed to round correctly: ${rounded}`);
  }

  // Test 3: Remove comments & DOCTYPE
  const rawSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Created with Inkscape -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100">
  <metadata>
    <rdf:RDF>Test</rdf:RDF>
  </metadata>
  <g id="emptyGroup">
  </g>
  <path d="M 12.3456 23.4567 L 45.6789 56.7891" inkscape:connector-curvature="0" class="" />
</svg>`;

  const result = minifySvg(rawSvg, {
    removeComments: true,
    removeDoctype: true,
    removeMetadata: true,
    removeUnusedNamespaces: true,
    removeEmptyTags: true,
    removeEmptyAttrs: true,
    roundNumbers: true,
    precision: 2,
    collapseWhitespace: true,
  });

  if (result.minifiedSvg.includes("<?xml")) throw new Error("Minified SVG still contains XML declaration");
  if (result.minifiedSvg.includes("<!DOCTYPE")) throw new Error("Minified SVG still contains DOCTYPE");
  if (result.minifiedSvg.includes("Created with Inkscape")) throw new Error("Minified SVG still contains comments");
  if (result.minifiedSvg.includes("<metadata>")) throw new Error("Minified SVG still contains metadata");
  if (result.minifiedSvg.includes("xmlns:inkscape")) throw new Error("Minified SVG still contains Inkscape namespace");
  if (result.minifiedSvg.includes("emptyGroup")) throw new Error("Minified SVG still contains empty group");
  if (result.minifiedSvg.includes('class=""')) throw new Error("Minified SVG still contains empty attributes");
  if (result.savingsBytes <= 0) throw new Error("Expected positive bytes savings for verbose SVG");

  // Test 4: Format bytes
  if (formatBytes(500) !== "500 B") throw new Error("formatBytes failed on bytes");
  if (formatBytes(2048) !== "2.0 KB") throw new Error("formatBytes failed on KB");

  return true;
}
