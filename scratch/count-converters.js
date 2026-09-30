const fs = require('fs');

const content = fs.readFileSync('./lib/registry/tools.ts', 'utf8');

// Parse all tool definitions with name, category, slug, description
const tools = [];
const blocks = content.split('{\n    slug:');

for (let i = 1; i < blocks.length; i++) {
  const block = 'slug:' + blocks[i];
  const slugMatch = block.match(/slug:\s*"([^"]+)"/);
  const nameMatch = block.match(/name:\s*"([^"]+)"/);
  const categoryMatch = block.match(/category:\s*"([^"]+)"/);
  const descMatch = block.match(/description:\s*"([^"]+)"/);

  if (slugMatch && nameMatch && categoryMatch) {
    tools.push({
      slug: slugMatch[1],
      name: nameMatch[1],
      category: categoryMatch[1],
      description: descMatch ? descMatch[1] : ""
    });
  }
}

const converters = tools.filter(t => {
  const text = (t.slug + " " + t.name + " " + t.description).toLowerCase();
  return (
    text.includes("converter") ||
    text.includes("convert") ||
    text.includes("transcode") ||
    text.includes("to-") ||
    text.includes("to pdf") ||
    text.includes("to word") ||
    text.includes("to json") ||
    text.includes("to csv")
  );
});

console.log(`TOTAL_REGISTERED_TOOLS: ${tools.length}`);
console.log(`TOTAL_CONVERTERS: ${converters.length}`);

const byCat = {};
converters.forEach(c => {
  if (!byCat[c.category]) byCat[c.category] = [];
  byCat[c.category].push(c);
});

console.log("\n--- CONVERTERS BY CATEGORY ---");
for (const [cat, list] of Object.entries(byCat)) {
  console.log(`\n📂 ${cat.toUpperCase()} (${list.length} converters):`);
  list.forEach((t, i) => console.log(`   ${i + 1}. ${t.name} (${t.slug})`));
}
