import { processCode, formatHtml, minifyHtml, formatCss, minifyCss, formatJs, minifyJs } from "./logic";

export function runTests(): boolean {
  // Test 1: HTML Beautifier (preserves nested structure, text, and void tags)
  const rawHtml = "<div><h1>Title</h1><p>Description</p><img src=\"test.jpg\" alt=\"Demo\" /><br></div>";
  const formattedHtml = formatHtml(rawHtml, 2);
  if (!formattedHtml.includes("<div>") || !formattedHtml.includes("<h1>") || !formattedHtml.includes("Title") || !formattedHtml.includes("</h1>") || !formattedHtml.includes("<p>") || !formattedHtml.includes("Description") || !formattedHtml.includes("</p>")) {
    throw new Error(`HTML formatting failed:\n${formattedHtml}`);
  }

  // Test 2: HTML Raw tags preservation (<pre> and <script>)
  const preHtml = "<div><pre>  const x = 1;\n  const y = 2;  </pre></div>";
  const formattedPre = formatHtml(preHtml, 2);
  if (!formattedPre.includes("const x = 1;\n  const y = 2;")) {
    throw new Error(`HTML <pre> block was damaged:\n${formattedPre}`);
  }

  // Test 3: HTML Minifier
  const minifiedHtml = minifyHtml("<div> \n  <p> Hello   World </p>\n </div>");
  if (!minifiedHtml.includes("<p> Hello World </p>")) {
    throw new Error(`HTML minify failed: ${minifiedHtml}`);
  }

  // Test 4: CSS Beautifier (with colors, media query, and nesting)
  const rawCss = "@media (max-width: 600px) { .btn{color:red;padding:10px;} }";
  const formattedCss = formatCss(rawCss, 2);
  if (!formattedCss.includes("@media (max-width: 600px) {") || !formattedCss.includes(".btn {") || !formattedCss.includes("color: red;") || !formattedCss.includes("padding: 10px;")) {
    throw new Error(`CSS formatting failed:\n${formattedCss}`);
  }

  // Test 5: CSS Minifier
  const minifiedCss = minifyCss(".btn {\n  color: red;\n  padding: 10px;\n}");
  if (minifiedCss !== ".btn{color:red;padding:10px}") {
    throw new Error(`CSS minify failed: ${minifiedCss}`);
  }

  // Test 6: JavaScript / JSON Beautifier
  const rawJson = '{"name":"mindkit","version":"1.0","tools":[1,2,3]}';
  const formattedJson = formatJs(rawJson, 2);
  if (!formattedJson.includes('"name": "mindkit"') || !formattedJson.includes('"tools": [\n    1,\n    2,\n    3\n  ]')) {
    throw new Error(`JSON formatting failed:\n${formattedJson}`);
  }

  // Test 7: JavaScript Code Formatting (functions, blocks, comments, strings)
  const rawJs = "function test(){const a='hello';if(a){console.log(a);}}";
  const formattedJs = formatJs(rawJs, 2);
  if (!formattedJs.includes("function test() {") || !formattedJs.includes("const a='hello';") || !formattedJs.includes("if(a) {") || !formattedJs.includes("console.log(a);")) {
    throw new Error(`JS formatting failed:\n${formattedJs}`);
  }

  // Test 8: processCode entry
  const res = processCode(rawHtml, "beautify", { language: "html", indentSize: 2 });
  if (res.formattedBytes <= res.originalBytes) {
    throw new Error("Beautified bytes should exceed compressed raw HTML");
  }

  return true;
}
