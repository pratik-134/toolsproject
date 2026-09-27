const fs = require('fs');
const path = require('path');

const forbiddenTerms = [
  'mindkit',
  'resumebuilderlab',
  'curviv',
  'curiv'
];

const targetDirs = ['app', 'components', 'lib', 'scripts'];
const results = [];

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'scan-branding.js' || file === 'rebrand-to-cleartrix.js') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      search(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const term of forbiddenTerms) {
          if (line.toLowerCase().includes(term.toLowerCase())) {
            results.push({
              file: path.relative(path.join(__dirname, '..'), fullPath),
              line: idx + 1,
              term,
              snippet: line.trim()
            });
            break;
          }
        }
      });
    }
  }
}

targetDirs.forEach(d => {
  const p = path.join(__dirname, '..', d);
  if (fs.existsSync(p)) search(p);
});

// Also scan root directory files
const rootFiles = fs.readdirSync(path.join(__dirname, '..'));
for (const file of rootFiles) {
  if (['scan-branding.js', 'rebrand-to-cleartrix.js', 'package-lock.json'].includes(file)) continue;
  const fullPath = path.join(__dirname, '..', file);
  if (fs.statSync(fullPath).isFile() && /\.(ts|tsx|js|json|md|html|css|yml|env.*)$/.test(file)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      for (const term of forbiddenTerms) {
        if (line.toLowerCase().includes(term.toLowerCase())) {
          results.push({
            file,
            line: idx + 1,
            term,
            snippet: line.trim()
          });
          break;
        }
      }
    });
  }
}

if (results.length > 0) {
  console.error(`🚨 Found ${results.length} legacy branding occurrences:`);
  results.forEach(r => {
    console.error(`${r.file}:${r.line} [${r.term}] -> ${r.snippet}`);
  });
  process.exit(1);
} else {
  console.log('✅ ZERO legacy branding found across app/, components/, lib/, scripts/! All rebranded to Cleartrix.');
  process.exit(0);
}
