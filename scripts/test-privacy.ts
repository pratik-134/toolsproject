import * as fs from "fs";
import * as path from "path";

console.log("=== QWERTYGEN PRIVACY ENFORCEMENT SCANNER ===");

const TOOLS_DIR = path.resolve(__dirname, "../components/tools");

const DISALLOWED_PATTERNS = [
  /\bfetch\s*\(/g,
  /\bXMLHttpRequest\b/g,
  /\bsendBeacon\s*\(/g,
  /\baxios\b/g,
  /\b\$\.ajax\b/g,
];

// Tools whose explicit domain is transpiling code snippets (e.g. cURL syntax generator outputting sample client code)
const CODE_TRANSPILER_TOOLS = ["curl-to-code-converter"];

let totalScanned = 0;
let violationsFound = 0;

function scanDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      if (CODE_TRANSPILER_TOOLS.some((t) => fullPath.includes(t))) {
        continue;
      }
      totalScanned++;
      const content = fs.readFileSync(fullPath, "utf-8");

      for (const pattern of DISALLOWED_PATTERNS) {
        if (pattern.test(content)) {
          console.error(`❌ PRIVACY VIOLATION in ${path.relative(process.cwd(), fullPath)}: matched disallowed network pattern ${pattern}`);
          violationsFound++;
        }
      }
    }
  }
}

scanDirectory(TOOLS_DIR);

console.log(`Scanned ${totalScanned} tool source files for network leaks.`);

if (violationsFound > 0) {
  console.error(`===============================================`);
  console.error(`🚨 FAILED: Found ${violationsFound} network leakage violations in client tools.`);
  process.exit(1);
} else {
  console.log("===============================================");
  console.log("🎉 PRIVACY ENFORCED: Zero network requests found across all client tool source files!");
}
