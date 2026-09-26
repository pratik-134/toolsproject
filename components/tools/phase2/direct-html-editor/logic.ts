/**
 * Direct HTML Editor — In-Browser Pure Logic
 * Standalone bundle compilation, tag extraction, syntax verification, and template presets.
 */

export interface HtmlEditorState {
  html: string;
  css: string;
  js: string;
  title: string;
}

export const HTML_TEMPLATES: Record<
  string,
  { name: string; html: string; css: string; js: string; title: string }
> = {
  landing: {
    name: "Modern Hero Card",
    title: "Product Landing Card",
    html: `<div class="card">
  <div class="badge">Privacy First</div>
  <h1>Mindkit Document Engine</h1>
  <p>Run all your document conversions, vector graphics synthesis, and text formatting in local browser memory.</p>
  <div class="actions">
    <button id="cta-btn" class="btn primary">Get Started</button>
    <button id="learn-btn" class="btn secondary">Learn More</button>
  </div>
  <div id="output" class="status-msg">Click a button to inspect interactive execution!</div>
</div>`,
    css: `body {
  margin: 0;
  padding: 40px 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}
.card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 36px;
  border-radius: 20px;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
.badge {
  display: inline-block;
  background: #3b82f6;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 16px;
}
h1 {
  font-size: 26px;
  margin: 0 0 12px 0;
  font-weight: 800;
  line-height: 1.2;
}
p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 24px 0;
}
.actions {
  display: flex;
  gap: 12px;
}
.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.btn.primary {
  background: #3b82f6;
  color: #fff;
}
.btn.primary:hover {
  background: #2563eb;
}
.btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}
.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}
.status-msg {
  margin-top: 20px;
  font-size: 12px;
  color: #38bdf8;
  font-family: monospace;
}`,
    js: `document.getElementById('cta-btn').addEventListener('click', () => {
  document.getElementById('output').textContent = 'Started! Event handled locally inside sandboxed iframe.';
});

document.getElementById('learn-btn').addEventListener('click', () => {
  document.getElementById('output').textContent = 'Mindkit runs with zero cloud uploads and total privacy.';
});`,
  },

  counter: {
    name: "Interactive Counter",
    title: "Interactive State Counter",
    html: `<div class="counter-box">
  <h2>Interactive Counter</h2>
  <div id="count-display" class="count">0</div>
  <div class="btn-group">
    <button id="dec-btn" class="c-btn">- Decrement</button>
    <button id="rst-btn" class="c-btn neutral">Reset</button>
    <button id="inc-btn" class="c-btn primary">+ Increment</button>
  </div>
</div>`,
    css: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  margin: 0;
}
.counter-box {
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  text-align: center;
  min-width: 300px;
}
h2 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 20px;
}
.count {
  font-size: 54px;
  font-weight: 900;
  color: #2563eb;
  margin: 20px 0;
  font-family: monospace;
}
.btn-group {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.c-btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f1f5f9;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}
.c-btn.primary {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.c-btn.neutral {
  background: #fff;
}`,
    js: `let count = 0;
const display = document.getElementById('count-display');
document.getElementById('inc-btn').onclick = () => { count++; display.textContent = count; };
document.getElementById('dec-btn').onclick = () => { count--; display.textContent = count; };
document.getElementById('rst-btn').onclick = () => { count = 0; display.textContent = count; };`,
  },

  animation: {
    name: "CSS Pulse Animation",
    title: "Pulse & Glow Showcase",
    html: `<div class="container">
  <div class="orb">
    <div class="ring"></div>
    <div class="core"></div>
  </div>
  <p class="label">Pure CSS Orbital Resonance</p>
</div>`,
    css: `body {
  margin: 0;
  background: #09090b;
  color: #fafafa;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  font-family: sans-serif;
}
.container {
  text-align: center;
}
.orb {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 24px auto;
}
.core {
  position: absolute;
  inset: 20px;
  background: radial-gradient(circle, #38bdf8, #2563eb);
  border-radius: 50%;
  box-shadow: 0 0 30px #38bdf8;
  animation: pulse 2s infinite ease-in-out;
}
.ring {
  position: absolute;
  inset: 0;
  border: 2px dashed #0284c7;
  border-radius: 50%;
  animation: spin 8s linear infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.label {
  font-size: 13px;
  letter-spacing: 2px;
  color: #94a3b8;
  text-transform: uppercase;
}`,
    js: `// Pure CSS demo with optional runtime telemetry
console.log('Orbital CSS animation initialized.');`,
  },
};

/**
 * Synthesize HTML, CSS, and JS into a single-file portable HTML bundle
 */
export function bundleHtmlDocument(
  html: string,
  css: string,
  js: string,
  title: string = "Mindkit Web Sandbox"
): string {
  // If the user already provided a full <!DOCTYPE html> document in the HTML pane, inject CSS/JS into it
  const isFullDoc = /<!doctype\s+html>/i.test(html) || /<html\b/i.test(html);

  if (isFullDoc) {
    let bundled = html;
    if (css.trim()) {
      const styleBlock = `<style>\n${css}\n</style>`;
      if (bundled.includes("</head>")) {
        bundled = bundled.replace("</head>", `${styleBlock}\n</head>`);
      } else {
        bundled = `${styleBlock}\n${bundled}`;
      }
    }
    if (js.trim()) {
      const scriptBlock = `<script>\n${js}\n</script>`;
      if (bundled.includes("</body>")) {
        bundled = bundled.replace("</body>", `${scriptBlock}\n</body>`);
      } else {
        bundled = `${bundled}\n${scriptBlock}`;
      }
    }
    return bundled;
  }

  // Standard synthesis
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title || "Mindkit Web Sandbox"}</title>
  <style>
${css}
  </style>
</head>
<body>
${html}

  <script>
${js}
  </script>
</body>
</html>`;
}

/**
 * Extract HTML element frequency count for analytics
 */
export function extractTagsCount(html: string): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!html) return counts;

  const tagMatches = html.match(/<([a-z1-6]+)(?:\s+[^>]*)?>/gi);
  if (!tagMatches) return counts;

  for (const match of tagMatches) {
    const tagName = match.replace(/^<([a-z1-6]+).*/i, "$1").toLowerCase();
    counts[tagName] = (counts[tagName] || 0) + 1;
  }

  return counts;
}

/**
 * Validate HTML markup for unclosed tags or syntax edge-cases
 */
export function validateHtmlMarkup(html: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!html.trim()) {
    warnings.push("HTML content is empty.");
    return { valid: false, warnings };
  }

  // Check matching simple tags: div, p, span, button, h1-h6
  const simpleTags = ["div", "span", "button", "section", "article", "header", "footer"];
  for (const tag of simpleTags) {
    const opens = (html.match(new RegExp(`<${tag}(\\s+[^>]*)?>`, "gi")) || []).length;
    const closes = (html.match(new RegExp(`</${tag}>`, "gi")) || []).length;
    if (opens !== closes) {
      warnings.push(`Mismatch in <${tag}> tags: found ${opens} opening and ${closes} closing.`);
    }
  }

  return { valid: warnings.length === 0, warnings };
}
