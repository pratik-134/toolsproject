import { TOOLS } from "../lib/registry/tools";
import { CATEGORIES } from "../lib/registry/categories";
import { CONVERTER_PRESETS } from "../lib/registry/converter-presets";
import { CONVERTER_CONTENT_REGISTRY } from "../lib/content/converters/index";

const RESERVED_ROUTES = new Set(["editor", "dashboard", "privacy", "terms", "tools", "brand", "resumes", "api"]);

function validateRegistry() {
  console.log("🔍 Validating ClearTrix Tool Registry & Converter Assets...\n");
  const errors: string[] = [];
  const slugs = new Set<string>();

  for (const tool of TOOLS) {
    // 1. Unique slug check
    if (slugs.has(tool.slug)) {
      errors.push(`[Duplicate Slug]: "${tool.slug}" is defined multiple times.`);
    }
    slugs.add(tool.slug);

    // 2. Reserved route collision check
    if (RESERVED_ROUTES.has(tool.slug)) {
      errors.push(`[Reserved Route Collision]: "${tool.slug}" conflicts with a core app route.`);
    }

    // 3. Category validity check
    if (!CATEGORIES[tool.category]) {
      errors.push(`[Invalid Category]: Tool "${tool.slug}" references unknown category "${tool.category}".`);
    }

    // 4. SEO Constraints
    if (tool.seo.title.length > 80) {
      errors.push(`[SEO Title Too Long]: "${tool.slug}" title is ${tool.seo.title.length} chars (max 80).`);
    }

    if (tool.seo.description.length > 180) {
      errors.push(`[SEO Description Too Long]: "${tool.slug}" description is ${tool.seo.description.length} chars (max 180).`);
    }

    if (!tool.seo.faq || tool.seo.faq.length < 3 || tool.seo.faq.length > 8) {
      errors.push(`[FAQ Count Warning]: "${tool.slug}" has ${tool.seo.faq?.length || 0} FAQs (expected 4-6).`);
    }
  }

  // 5. Validate Converter Presets & Content Integration
  for (const [presetSlug, preset] of Object.entries(CONVERTER_PRESETS)) {
    if (!slugs.has(presetSlug)) {
      errors.push(`[Missing Registry Entry]: Preset "${presetSlug}" is not registered in TOOLS array.`);
    }

    const content = CONVERTER_CONTENT_REGISTRY[presetSlug];
    if (!content) {
      errors.push(`[Missing Content Definition]: Preset "${presetSlug}" lacks a typed content file in CONVERTER_CONTENT_REGISTRY.`);
    } else {
      if (content.seoTitle.length > 70) {
        errors.push(`[Content Title Too Long]: "${presetSlug}" content title exceeds 70 chars.`);
      }
      if (content.metaDescription.length > 170) {
        errors.push(`[Content Description Too Long]: "${presetSlug}" content description exceeds 170 chars.`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`❌ Registry Validation Failed with ${errors.length} error(s):\n`);
    errors.forEach((err, i) => console.error(`${i + 1}. ${err}`));
    process.exit(1);
  } else {
    console.log(`✅ Registry Validation Passed! All ${TOOLS.length} tools and converter presets are valid.`);
  }
}

validateRegistry();
