const fs = require('fs');
const path = require('path');

const searchTerms = [
  'Resume Builder Lab',
  'resumebuilderlab',
  'ResumeBuilderLab',
  'Curviv',
  'curviv',
  'Curiv',
  'curiv'
];

const targetDirs = ['app', 'components', 'lib'];
const results = [];

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      search(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const term of searchTerms) {
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

console.log(`Found ${results.length} occurrences in app/, components/, lib/:`);
results.forEach(r => {
  console.log(`${r.file}:${r.line} [${r.term}] -> ${r.snippet}`);
});
