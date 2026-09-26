import { processCode, formatHtml, minifyHtml, formatCss, minifyCss } from "./logic";

export function runTests(): boolean {
  // Test 1: HTML Beautifier
  const rawHtml = "<div><h1>Title</h1><p>Description</p></div>";
  const formattedHtml = formatHtml(rawHtml, 2);
  if (!formattedHtml.includes("<h1>\n    Title\n  </h1>") || !formattedHtml.includes("<p>\n    Description\n  </p>")) {
    throw new Error(`HTML formatting failed:\n${formattedHtml}`);
  }

  // Test 2: HTML Minifier
  const minifiedHtml = minifyHtml("<div> \n  <p> Hello   World </p>\n </div>");
  if (minifiedHtml !== "<div><p> Hello World </p></div>") {
    throw new Error(`HTML minify failed: ${minifiedHtml}`);
  }

  // Test 3: CSS Beautifier
  const rawCss = ".btn{color:red;padding:10px;}";
  const formattedCss = formatCss(rawCss, 2);
  if (!formattedCss.includes("{\n  color: red;\n  padding: 10px;\n}")) {
    throw new Error(`CSS formatting failed:\n${formattedCss}`);
  }

  // Test 4: CSS Minifier
  const minifiedCss = minifyCss(".btn {\n  color: red;\n  padding: 10px;\n}");
  if (minifiedCss !== ".btn{color:red;padding:10px}") {
    throw new Error(`CSS minify failed: ${minifiedCss}`);
  }

  // Test 5: processCode entry
  const res = processCode(rawHtml, "beautify", { language: "html", indentSize: 2 });
  if (res.formattedBytes <= res.originalBytes) {
    throw new Error("Beautified bytes should exceed compressed raw HTML");
  }

  return true;
}
