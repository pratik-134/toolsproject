/**
 * Unit Tests for Direct HTML Editor Logic
 */

import {
  bundleHtmlDocument,
  extractTagsCount,
  validateHtmlMarkup,
  HTML_TEMPLATES,
} from "./logic";

export async function runDirectHtmlEditorTests() {
  // Test 1: bundleHtmlDocument standard synthesis
  const html = "<div class=\"box\">Hello</div>";
  const css = ".box { color: red; }";
  const js = "console.log('test');";
  const bundled = bundleHtmlDocument(html, css, js, "My App");

  if (!bundled.includes("<!DOCTYPE html>")) {
    throw new Error("bundleHtmlDocument missing <!DOCTYPE html>");
  }
  if (!bundled.includes("<title>My App</title>")) {
    throw new Error("bundleHtmlDocument missing custom title");
  }
  if (!bundled.includes(".box { color: red; }")) {
    throw new Error("bundleHtmlDocument missing css payload");
  }
  if (!bundled.includes("console.log('test');")) {
    throw new Error("bundleHtmlDocument missing js payload");
  }

  // Test 2: bundleHtmlDocument full document injection
  const fullDoc = `<!DOCTYPE html><html><head><title>Full</title></head><body><p>Text</p></body></html>`;
  const fullBundled = bundleHtmlDocument(fullDoc, "body { margin: 0; }", "alert(1);");
  if (!fullBundled.includes("<style>\nbody { margin: 0; }\n</style>")) {
    throw new Error("bundleHtmlDocument failed to inject style in full document");
  }
  if (!fullBundled.includes("<script>\nalert(1);\n</script>")) {
    throw new Error("bundleHtmlDocument failed to inject script in full document");
  }

  // Test 3: extractTagsCount
  const snippet = `<div><span>One</span><span>Two</span><button>Click</button></div>`;
  const counts = extractTagsCount(snippet);
  if (counts.div !== 1) throw new Error("extractTagsCount div mismatch");
  if (counts.span !== 2) throw new Error("extractTagsCount span mismatch");
  if (counts.button !== 1) throw new Error("extractTagsCount button mismatch");

  // Test 4: validateHtmlMarkup
  const validHtml = `<div><span>Hello</span><button>Go</button></div>`;
  const validResult = validateHtmlMarkup(validHtml);
  if (!validResult.valid || validResult.warnings.length > 0) {
    throw new Error("validateHtmlMarkup should pass for matching tags");
  }

  const brokenHtml = `<div><span>Hello</div>`;
  const brokenResult = validateHtmlMarkup(brokenHtml);
  if (brokenResult.valid || brokenResult.warnings.length === 0) {
    throw new Error("validateHtmlMarkup should detect mismatched span tag");
  }

  // Test 5: Presets exist
  if (!HTML_TEMPLATES.landing || !HTML_TEMPLATES.counter || !HTML_TEMPLATES.animation) {
    throw new Error("Expected presets missing from HTML_TEMPLATES");
  }

  return true;
}
