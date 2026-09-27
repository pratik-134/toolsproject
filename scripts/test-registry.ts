import { getAllTools } from "../lib/registry/tools";
import { CATEGORIES, getCategoryColor } from "../lib/registry/categories";
import { CATEGORY_COLORS } from "../lib/design-tokens";
import { getCategoryTheme } from "../lib/category-theme";

console.log("=== CLEARTRIX PLATFORM REGISTRY & DESIGN SYSTEM VERIFICATION ===");

// 1. Verify Category Design Token Mappings
console.log("Verifying category color mappings...");
for (const [catId, cat] of Object.entries(CATEGORIES)) {
  if (!cat.colorKey) {
    throw new Error(`Category "${catId}" is missing required colorKey!`);
  }
  if (!CATEGORY_COLORS[cat.colorKey]) {
    throw new Error(`Category "${catId}" has invalid colorKey: "${cat.colorKey}"`);
  }

  const token = getCategoryColor(catId);
  if (!token || !token.primary || !token.tint || !token.border) {
    throw new Error(`Category "${catId}" getCategoryColor failed to return valid tokens.`);
  }

  const theme = getCategoryTheme(catId);
  if (!theme || !theme.primary || !theme.tintBg || !theme.tintBorder || !theme.text) {
    throw new Error(`Category "${catId}" getCategoryTheme failed to return valid theme.`);
  }

  console.log(`Category [${catId}] -> ${cat.colorKey} (${token.primary}) ✅ VALID`);
}

// 2. Verify Tools
const tools = getAllTools();
console.log(`Found ${tools.length} registered tools in platform registry.`);

const seenSlugs = new Set<string>();

for (const tool of tools) {
  // Check unique slug
  if (seenSlugs.has(tool.slug)) {
    throw new Error(`Duplicate tool slug detected: ${tool.slug}`);
  }
  seenSlugs.add(tool.slug);

  // Check valid category
  if (!CATEGORIES[tool.category]) {
    throw new Error(`Tool "${tool.slug}" references invalid category: "${tool.category}"`);
  }

  // Check phase
  if (![1, 2, 3, 4, 5].includes(tool.phase)) {
    throw new Error(`Tool "${tool.slug}" has invalid phase: ${tool.phase}`);
  }

  // Check SEO fields
  if (!tool.seo.title || !tool.seo.description || !tool.seo.h1 || !tool.seo.intro) {
    throw new Error(`Tool "${tool.slug}" is missing required SEO fields.`);
  }

  // Check at least 3 FAQs
  if (!tool.seo.faq || tool.seo.faq.length < 3) {
    throw new Error(`Tool "${tool.slug}" must have at least 3 FAQ items for SEO compliance (found ${tool.seo.faq?.length || 0}).`);
  }

  // Check related slugs exist
  for (const relSlug of tool.related) {
    const target = tools.find((t) => t.slug === relSlug);
    if (!target) {
      throw new Error(`Tool "${tool.slug}" references non-existent related tool slug: "${relSlug}"`);
    }
  }

  console.log(`Tool [${tool.slug}]... ✅ VALID (${tool.category}, Phase ${tool.phase}, Status: ${tool.status})`);
}

console.log("===============================================");
console.log(`🎉 ALL ${tools.length} REGISTERED TOOLS & 11 CATEGORY COLOR MAPPINGS PASSED INTEGRITY CHECKS!`);
