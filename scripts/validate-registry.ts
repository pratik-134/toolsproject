import { TOOLS } from "../lib/registry/tools";
import { CATEGORIES } from "../lib/registry/categories";
import { CONVERTER_PRESETS } from "../lib/registry/converter-presets";

console.log("=== Qwertygen Strict Registry Validator ===\n");

let errorsCount = 0;

function reportError(msg: string) {
  console.error(`❌ REGISTRY ERROR: ${msg}`);
  errorsCount++;
}

// 1. Unique Slugs Check
const slugSet = new Set<string>();
TOOLS.forEach((tool) => {
  if (slugSet.has(tool.slug)) {
    reportError(`Duplicate slug found: "${tool.slug}"`);
  }
  slugSet.add(tool.slug);
});

// 2. Valid Category Check & Category Route Alignment
const validCategoryIds = new Set(Object.keys(CATEGORIES));
TOOLS.forEach((tool) => {
  if (!validCategoryIds.has(tool.category)) {
    reportError(`Tool "${tool.slug}" has invalid category "${tool.category}"`);
  }
});

// 3. Reserved Route Collisions Check
const reservedRoutes = new Set(["tools", "editor", "dashboard", "privacy", "terms", "brand", "api", "sitemap.xml", "robots.txt"]);
TOOLS.forEach((tool) => {
  if (reservedRoutes.has(tool.slug)) {
    reportError(`Tool slug "${tool.slug}" collides with reserved application route.`);
  }
});

// 4. SEO Titles <= 60 chars and Unique Check
const titleMap = new Map<string, string>();
TOOLS.forEach((tool) => {
  const title = tool.seo.title;
  if (title.length > 60) {
    reportError(`Tool "${tool.slug}" title exceeds 60 chars (${title.length} chars): "${title}"`);
  }
  if (titleMap.has(title)) {
    reportError(`Duplicate SEO title in "${tool.slug}" and "${titleMap.get(title)}": "${title}"`);
  } else {
    titleMap.set(title, tool.slug);
  }
});

// 5. SEO Descriptions <= 155 chars and Unique Check
const descMap = new Map<string, string>();
TOOLS.forEach((tool) => {
  const desc = tool.seo.description;
  if (desc.length > 155) {
    reportError(`Tool "${tool.slug}" description exceeds 155 chars (${desc.length} chars): "${desc}"`);
  }
  if (descMap.has(desc)) {
    reportError(`Duplicate SEO description in "${tool.slug}" and "${descMap.get(desc)}": "${desc}"`);
  } else {
    descMap.set(desc, tool.slug);
  }
});

// 6. Converter Presets & SEO Content Matching
Object.keys(CONVERTER_PRESETS).forEach((slug) => {
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) {
    reportError(`Converter preset "${slug}" has no corresponding tool in tools.ts`);
  }
});

// 7. No Redirect Destination Collisions
const liveToolUrls = new Set(TOOLS.map((t) => `/tools/${t.category}/${t.slug}`));
const validHubUrls = new Set([...Object.keys(CATEGORIES).map((c) => `/tools/${c}`), "/tools"]);
// Check that live tools don't collide with redirect sources
const redirects = [
  { source: '/tools/document-pdf/pdf-to-image', destination: '/tools/document-pdf/pdf-to-jpg' },
  { source: '/tools/calculators/chmod-calculator', destination: '/tools/developer/chmod-calculator' },
  { source: '/tools/calculators/base-converter', destination: '/tools/developer/base-converter' },
  { source: '/tools/calculators/roman-numeral-converter', destination: '/tools/utilities/roman-numeral-converter' },
  { source: '/tools/document-pdf/pdf-protect', destination: '/tools/document-pdf/pdf-encryptor' },
  { source: '/tools/document-pdf/pdf-unlock', destination: '/tools/document-pdf/pdf-decryptor' },
  { source: '/tools/document-pdf/markdown-note-maker', destination: '/tools/document-pdf/direct-markdown-editor' },
];

redirects.forEach((r) => {
  if (liveToolUrls.has(r.source)) {
    reportError(`Redirect source "${r.source}" collides with an active live tool URL!`);
  }
  if (!liveToolUrls.has(r.destination) && !validHubUrls.has(r.destination)) {
    reportError(`Redirect destination "${r.destination}" is not a valid live tool or hub URL!`);
  }
});

// 8. Category Tool Count Synchronization
Object.keys(CATEGORIES).forEach((catId) => {
  const catDef = CATEGORIES[catId as keyof typeof CATEGORIES];
  const actualCount = TOOLS.filter((t) => t.category === catId).length;
  if (catDef.expectedToolCount !== actualCount) {
    reportError(`Category "${catId}" expectedToolCount (${catDef.expectedToolCount}) does not match actual live tools count (${actualCount})!`);
  }
});

if (errorsCount > 0) {
  console.error(`\n💥 Registry validation FAILED with ${errorsCount} error(s).`);
  process.exit(1);
} else {
  console.log(`✅ All ${TOOLS.length} tools passed registry validation cleanly with 0 errors.\n`);
}
