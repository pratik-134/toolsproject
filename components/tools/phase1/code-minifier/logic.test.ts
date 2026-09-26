import { minifyCode } from "./logic";

export function runTests(): boolean {
  // Test JSON
  const jsonInput = '{\n  "name": "Mindkit",\n  "active": true,\n  "count": 42\n}';
  const jsonResult = minifyCode(jsonInput, "json");
  if (jsonResult.code !== '{"name":"Mindkit","active":true,"count":42}') {
    throw new Error(`JSON minification failed: ${jsonResult.code}`);
  }
  if (jsonResult.bytesSaved <= 0 || jsonResult.savingsPercent <= 0) {
    throw new Error(`JSON savings calc failed: ${JSON.stringify(jsonResult)}`);
  }

  // Test CSS
  const cssInput = `
    /* Main body styles */
    body {
      margin: 0px;
      padding: 10px;
      color: #333333;
    }
    .header > h1 {
      font-size: 24px;
    }
  `;
  const cssResult = minifyCode(cssInput, "css");
  if (cssResult.code.includes("/* Main body styles */")) {
    throw new Error(`CSS comments were not removed: ${cssResult.code}`);
  }
  if (!cssResult.code.includes("body{margin:0px;padding:10px;color:#333333}.header>h1{font-size:24px}")) {
    throw new Error(`CSS minification output unexpected: ${cssResult.code}`);
  }

  // Test HTML
  const htmlInput = `
    <!DOCTYPE html>
    <!-- Page Header Comment -->
    <html>
      <head>
        <title> Test Page </title>
      </head>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  `;
  const htmlResult = minifyCode(htmlInput, "html");
  if (htmlResult.code.includes("<!-- Page Header Comment -->")) {
    throw new Error(`HTML comments were not removed: ${htmlResult.code}`);
  }
  if (!htmlResult.code.includes("<html><head><title> Test Page </title></head><body><h1>Hello World</h1></body></html>")) {
    throw new Error(`HTML minification unexpected: ${htmlResult.code}`);
  }

  // Test JS
  const jsInput = `
    // Configuration variable
    const x = 10;
    const y = 20;
    console.log("debug", x + y);
    /* Calculate sum */
    function sum(a, b) {
      return a + b;
    }
  `;
  const jsResult = minifyCode(jsInput, "js", { removeComments: true, collapseWhitespace: true, removeConsole: true });
  if (jsResult.code.includes("console.log")) {
    throw new Error(`JS console.log was not stripped: ${jsResult.code}`);
  }
  if (jsResult.code.includes("// Configuration")) {
    throw new Error(`JS comments were not removed: ${jsResult.code}`);
  }

  return true;
}
