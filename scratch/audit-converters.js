const fs = require('fs');
const content = fs.readFileSync('./lib/registry/tools.ts', 'utf8');

const toolRegex = /slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"/g;
let m;
const trueConverters = [];

while ((m = toolRegex.exec(content)) !== null) {
  const slug = m[1];
  const name = m[2];
  const category = m[3];
  
  // Exclude false positives
  if (slug === 'photo-filter-studio' || slug === 'chmod-calculator' || slug === 'aspect-ratio-calculator' || slug === 'world-clock-converter' || slug === 'auto-loan-calculator' || slug === 'resume-import-viewer') {
    continue;
  }
  
  if (slug.includes('converter') || slug.includes('to-') || name.toLowerCase().includes('convert') || slug.includes('encoder')) {
    trueConverters.push({ slug, name, category });
  }
}

console.log(`True Existing Converters Count: ${trueConverters.length}`);
console.table(trueConverters);
