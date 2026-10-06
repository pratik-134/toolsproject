import assert from "node:assert";
import { detectInputType } from "../lib/detect-input-type";

console.log("=== RUNNING SMART INPUT AUTO-DETECTOR TEST SUITE ===");

// 1. JSON
const jsonObj = detectInputType('{"user": "alice", "active": true, "roles": ["admin"]}');
assert.strictEqual(jsonObj?.type, "json");
assert.strictEqual(jsonObj?.suggestedTools[0]?.toolSlug, "json-formatter");
console.log("✓ JSON Object detection passed");

const jsonArr = detectInputType('[1, 2, 3, {"name": "item"}]');
assert.strictEqual(jsonArr?.type, "json");
assert.strictEqual(jsonArr?.label, "JSON Array");
console.log("✓ JSON Array detection passed");

// 2. JWT Token
const sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const jwt = detectInputType(sampleJwt);
assert.strictEqual(jwt?.type, "jwt");
assert.strictEqual(jwt?.suggestedTools[0]?.toolSlug, "jwt-decoder");
console.log("✓ JWT Token detection passed");

// 3. Colors
const hexColor = detectInputType("#3b82f6");
assert.strictEqual(hexColor?.type, "color");
assert.strictEqual(hexColor?.suggestedTools[0]?.toolSlug, "color-converter");

const rgbColor = detectInputType("rgb(255, 99, 71)");
assert.strictEqual(rgbColor?.type, "color");

const hslColor = detectInputType("hsl(120, 100%, 50%)");
assert.strictEqual(hslColor?.type, "color");
console.log("✓ Color (HEX, RGB, HSL) detection passed");

// 4. Unix Timestamp
const timestampSec = detectInputType("1735689600"); // 2025-01-01
assert.strictEqual(timestampSec?.type, "timestamp");
assert.strictEqual(timestampSec?.suggestedTools[0]?.toolSlug, "date-calculator");

const timestampMs = detectInputType("1735689600000");
assert.strictEqual(timestampMs?.type, "timestamp");
console.log("✓ Unix Timestamp detection passed");

// 5. Cron Expression
const cronExp = detectInputType("*/15 * * * *");
assert.strictEqual(cronExp?.type, "cron");
assert.strictEqual(cronExp?.suggestedTools[0]?.toolSlug, "cron-expression-builder");
console.log("✓ Cron Expression detection passed");

// 6. SQL
const sqlQuery = detectInputType("SELECT id, username, email FROM users WHERE active = 1 ORDER BY created_at DESC;");
assert.strictEqual(sqlQuery?.type, "sql");
assert.strictEqual(sqlQuery?.suggestedTools[0]?.toolSlug, "sql-formatter");
console.log("✓ SQL Query detection passed");

// 7. Regex
const regex = detectInputType("/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/i");
assert.strictEqual(regex?.type, "regex");
assert.strictEqual(regex?.suggestedTools[0]?.toolSlug, "regex-tester");
console.log("✓ Regex Pattern detection passed");

// 8. HTML
const html = detectInputType('<div class="hero-card"><h1>Welcome to Qwertygen</h1><p>Privacy First</p></div>');
assert.strictEqual(html?.type, "html");
assert.strictEqual(html?.suggestedTools[0]?.toolSlug, "direct-html-editor");
console.log("✓ HTML Markup detection passed");

// 9. Markdown
const md = detectInputType("## Master Services Agreement\n\n- Terms and conditions\n- Privacy guarantee\n\n```typescript\nconst a = 1;\n```");
assert.strictEqual(md?.type, "markdown");
assert.strictEqual(md?.suggestedTools[0]?.toolSlug, "direct-markdown-editor");
console.log("✓ Markdown Document detection passed");

// 10. IP Address
const ip = detectInputType("192.168.1.0/24");
assert.strictEqual(ip?.type, "ip");
assert.strictEqual(ip?.suggestedTools[0]?.toolSlug, "ip-subnet-calculator");
console.log("✓ IP / CIDR detection passed");

// 11. cURL
const curlCmd = detectInputType('curl -X POST https://api.example.com/v1/auth -H "Content-Type: application/json" -d \'{"key":"val"}\'');
assert.strictEqual(curlCmd?.type, "curl");
assert.strictEqual(curlCmd?.suggestedTools[0]?.toolSlug, "curl-to-code-converter");
console.log("✓ cURL Command detection passed");

// 12. Plain text / fallback
const plain = detectInputType("just some random text search");
assert.strictEqual(plain, null);
console.log("✓ Plain text fallback passed (returns null for standard search)");

console.log("🎉 ALL 12 DETECTOR TEST SUITES PASSED CLEANLY!");
