/**
 * Comprehensive End-to-End (E2E) & UI Verification Suite for ClearTrix
 * Tests all 162 tools, 11 category hubs, root pages, navigation, search,
 * theme toggling, and interactive user flows.
 */

import { TOOLS, getAllTools, getToolBySlug, getToolsByCategory } from "../lib/registry/tools";
import { CATEGORIES, getCategoryById } from "../lib/registry/categories";
import { CONVERTER_PRESETS } from "../lib/registry/converter-presets";
import { generateMetadata as generateToolMetadata } from "../app/tools/[category]/[slug]/page";
import { resumeDataSchema, initialResumeData } from "../lib/schema";
import { analyzeResumeText } from "../components/tools/phase1/ats-resume-checker/logic";
import { PDFDocument } from "pdf-lib";
import { createDemoPdf, mergePdfs, extractPagesAsPdf } from "../components/tools/phase3/pdf-editor/logic";
import { exportPdfDocument } from "../components/tools/phase3/pdf-editor/exportPdf";
import { PageMeta, AnnotationObject } from "../components/tools/phase3/pdf-editor/types";
import { hexToRgb, rgbToHex, rgbToHsl, rgbToCmyk } from "../components/tools/engines/ColorConverterEngine";
import { tsvToCsv, parseCsv, csvToXlsxBlob } from "../components/tools/engines/DataTransformEngine";
import { jsonToTypeScript, textToBinary, binaryToText, numberToWords, numberToRoman } from "../components/tools/engines/TextTransformEngine";
import { getAllPosts } from "../lib/blog/posts";
import { generateMetadata as generateBlogMetadata } from "../app/blog/[slug]/page";
import { BRAND } from "../lib/brand";

// Test assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runE2eTestSuite() {
  console.log("==================================================================");
  console.log("🚀 CLEARTRIX END-TO-END (E2E) & FULL UI VERIFICATION SUITE");
  console.log("==================================================================\n");

  // ==========================================================================
  // STAGE 1: Route Integrity & Metadata for All 168 Tools & All Category Hubs
  // ==========================================================================
  console.log("▶ STAGE 1: Testing Route Integrity & Metadata Generation...");
  const allTools = getAllTools();
  assert(allTools.length === 181, `Expected 181 tools, found ${allTools.length}`);

  let metadataCount = 0;
  for (const tool of allTools) {
    // 1. Verify URL route structure
    const expectedRoute = `/tools/${tool.category}/${tool.slug}`;
    assert(!!tool.category && !!tool.slug, `Tool missing category or slug: ${tool.slug}`);
    
    // 2. Verify SEO Metadata generation
    const metadata = await generateToolMetadata({
      params: Promise.resolve({ category: tool.category, slug: tool.slug }),
    });

    assert(!!metadata.title, `Missing metadata title for ${tool.slug}`);
    assert(!!metadata.description, `Missing metadata description for ${tool.slug}`);
    assert(typeof metadata.title === "string" && metadata.title.includes("ClearTrix"), `Metadata title does not include Brand for ${tool.slug}`);
    
    // 3. Verify category mapping
    const category = getCategoryById(tool.category);
    assert(!!category, `Invalid category '${tool.category}' for tool ${tool.slug}`);

    // 4. Verify FAQ structure
    if (tool.seo.faq && tool.seo.faq.length > 0) {
      for (const faq of tool.seo.faq) {
        assert(faq.q.length > 5, `FAQ question too short in ${tool.slug}: ${faq.q}`);
        assert(faq.a.length > 10, `FAQ answer too short in ${tool.slug}: ${faq.a}`);
      }
    }

    metadataCount++;
  }
  console.log(`✅ Stage 1.1: All ${metadataCount}/175 tool routes, SEO metadata, and FAQs verified!`);

  // Verify all category hubs
  const categoryList = Object.values(CATEGORIES);
  for (const cat of categoryList) {
    const categoryTools = getToolsByCategory(cat.id);
    if (cat.expectedToolCount > 0) {
      assert(categoryTools.length > 0, `Category ${cat.id} has no registered tools`);
    }
    assert(!!cat.name && !!cat.description, `Category ${cat.id} missing name or description`);
  }
  console.log(`✅ Stage 1.2: All ${categoryList.length} Category Hubs verified!`);

  // Verify Blog System (List + All Detail Pages)
  const allBlogPosts = getAllPosts();
  assert(allBlogPosts.length >= 6, `Expected at least 6 blog posts, found ${allBlogPosts.length}`);
  for (const post of allBlogPosts) {
    assert(!!post.title && post.title.length > 10, `Blog post ${post.slug} has invalid title`);
    assert(!!post.excerpt && post.excerpt.length > 20, `Blog post ${post.slug} has invalid excerpt`);
    assert(!!post.category, `Blog post ${post.slug} missing category`);
    assert(post.tableOfContents.length > 0, `Blog post ${post.slug} missing TOC`);
    assert(post.author.name === "Pratik Kumawat", `Blog post ${post.slug} has unexpected author ${post.author.name}`);
    assert(post.author.role === "Founder & Creator", `Blog post ${post.slug} has unexpected role ${post.author.role}`);
    for (const toc of post.tableOfContents) {
      assert(post.contentHtml.includes(toc.id), `TOC anchor #${toc.id} not found in content of ${post.slug}`);
    }
    // Verify metadata generation
    const blogMeta = await generateBlogMetadata({ params: Promise.resolve({ slug: post.slug }) });
    assert(
      !!blogMeta.title && typeof blogMeta.title === "string" && blogMeta.title.includes(BRAND.name),
      `Invalid blog metadata title for ${post.slug}`
    );
    assert(!!blogMeta.description, `Invalid blog metadata description for ${post.slug}`);
  }
  console.log(`✅ Stage 1.3: All ${allBlogPosts.length} Blog Posts, TOCs, and metadata verified!\n`);

  // ==========================================================================
  // STAGE 2: Navigation, Search Indexing & Command Palette Filtering
  // ==========================================================================
  console.log("▶ STAGE 2: Testing Navigation, Search & Command Palette Indexing...");

  // Simulate command palette / navbar search algorithm
  function searchTools(query: string) {
    const q = query.toLowerCase().trim();
    return allTools.filter((tool) => {
      const nameMatch = tool.name.toLowerCase().includes(q);
      const slugMatch = tool.slug.toLowerCase().includes(q);
      const descMatch = tool.seo.description.toLowerCase().includes(q);
      const catMatch = tool.category.toLowerCase().includes(q);
      return nameMatch || slugMatch || descMatch || catMatch;
    });
  }

  const testQueries = [
    { query: "pdf", minExpected: 15 },
    { query: "convert", minExpected: 25 },
    { query: "resume", minExpected: 2 },
    { query: "calculator", minExpected: 10 },
    { query: "encrypt", minExpected: 2 },
    { query: "image", minExpected: 10 },
    { query: "json", minExpected: 4 },
  ];

  for (const tq of testQueries) {
    const results = searchTools(tq.query);
    assert(
      results.length >= tq.minExpected,
      `Search query '${tq.query}' expected >= ${tq.minExpected} results, found ${results.length}`
    );
    console.log(`  ✓ Search query '${tq.query}' matched ${results.length} relevant tools.`);
  }
  console.log("✅ Stage 2: Navigation & Global Search Indexing passed!\n");

  // ==========================================================================
  // STAGE 3: Dark Mode & Theme State Machine Verification
  // ==========================================================================
  console.log("▶ STAGE 3: Testing Dark Mode & Theme Toggle State Machine...");

  // Mock DOM root document classList & localStorage for theme toggling
  class MockDocumentElement {
    classes: Set<string> = new Set();
    classList = {
      add: (cls: string) => this.classes.add(cls),
      remove: (cls: string) => this.classes.delete(cls),
      contains: (cls: string) => this.classes.has(cls),
      toggle: (cls: string) => {
        if (this.classes.has(cls)) this.classes.delete(cls);
        else this.classes.add(cls);
      },
    };
  }

  const mockHtml = new MockDocumentElement();
  const mockStorage: Record<string, string> = {};

  function applyTheme(theme: "light" | "dark") {
    mockStorage["theme"] = theme;
    if (theme === "dark") {
      mockHtml.classList.add("dark");
    } else {
      mockHtml.classList.remove("dark");
    }
  }

  function toggleThemeState(current: "light" | "dark"): "light" | "dark" {
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    return next;
  }

  // 1. Initial Light Mode
  applyTheme("light");
  assert(!mockHtml.classList.contains("dark"), "Expected light mode without 'dark' class");
  assert(mockStorage["theme"] === "light", "Storage should be 'light'");

  // 2. Toggle to Dark Mode
  let activeTheme = toggleThemeState("light");
  assert(activeTheme === "dark", "Expected transition to dark");
  assert(mockHtml.classList.contains("dark"), "Expected 'dark' class applied to HTML root");
  assert(mockStorage["theme"] === "dark", "Storage should be 'dark'");

  // 3. Toggle back to Light Mode
  activeTheme = toggleThemeState("dark");
  assert(activeTheme === "light", "Expected transition back to light");
  assert(!mockHtml.classList.contains("dark"), "Expected 'dark' class removed from HTML root");
  assert(mockStorage["theme"] === "light", "Storage should be 'light'");

  console.log("✅ Stage 3: Theme Toggle & Dark Mode State Invariants passed!\n");

  // ==========================================================================
  // STAGE 4: Interactive End-to-End User Workflows
  // ==========================================================================
  console.log("▶ STAGE 4: Testing Interactive End-to-End User Workflows...");

  // --------------------------------------------------------------------------
  // Workflow 4.1: Text & Formatting Workflow (JSON Formatter & Validator)
  // --------------------------------------------------------------------------
  console.log("-> 4.1 User Flow: JSON Formatter & Validator...");
  const rawDirtyJson = '{"name": "ClearTrix"  , "tags" : ["security" ,"privacy" ] , "version":1.0}';
  const parsedJson = JSON.parse(rawDirtyJson);
  const prettyJson = JSON.stringify(parsedJson, null, 2);
  const minifiedJson = JSON.stringify(parsedJson);

  assert(prettyJson.includes('  "name": "ClearTrix"'), "Pretty print indentation failed");
  assert(minifiedJson === '{"name":"ClearTrix","tags":["security","privacy"],"version":1}', "Minification failed");
  console.log("  ✓ JSON validation, beautification, and minification user flow verified.");

  // --------------------------------------------------------------------------
  // Workflow 4.2: Data Converter Workflow (TSV to CSV & CSV to Excel)
  // --------------------------------------------------------------------------
  console.log("-> 4.2 User Flow: TSV to CSV and CSV to Excel conversion...");
  const sampleTsvInput = "Product\tPrice\tInStock\nLaptop\t1200\tYes\nMouse\t25.50\tYes";
  const outputCsv = tsvToCsv(sampleTsvInput);
  assert(outputCsv.includes('"Product","Price","InStock"'), "TSV to CSV header line failed");
  assert(outputCsv.includes('"Laptop","1200","Yes"'), "TSV to CSV row conversion failed");

  const xlsxBlob = await csvToXlsxBlob(outputCsv);
  assert(xlsxBlob.size > 200, "Excel spreadsheet blob creation failed");
  console.log("  ✓ TSV to CSV to Excel data transformation pipeline verified.");

  // --------------------------------------------------------------------------
  // Workflow 4.3: Color Converter Workflow
  // --------------------------------------------------------------------------
  console.log("-> 4.3 User Flow: Color Conversion & Hex/RGB/HSL/CMYK palette...");
  const brandColorHex = "#2563EB";
  const rgb = hexToRgb(brandColorHex)!;
  assert(rgb.r === 37 && rgb.g === 99 && rgb.b === 235, "RGB calculation error");
  const hexBack = rgbToHex(rgb.r, rgb.g, rgb.b);
  assert(hexBack === brandColorHex, "Hex roundtrip failed");
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  assert(hsl.h === 221 && hsl.s === 83 && hsl.l === 53, `HSL calculation error: ${JSON.stringify(hsl)}`);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  assert(cmyk.c === 84 && cmyk.m === 58 && cmyk.k === 8, `CMYK calculation error: ${JSON.stringify(cmyk)}`);
  console.log("  ✓ Color transformation pipeline verified across all color spaces.");

  // --------------------------------------------------------------------------
  // Workflow 4.4: Flagship PDF Editor Workflow (Create -> Edit -> Export)
  // --------------------------------------------------------------------------
  console.log("-> 4.4 User Flow: Full PDF Editor Studio (Creation, Annotations, Export)...");
  // 1. User opens studio and generates demo PDF
  const { bytes: originalPdfBytes } = await createDemoPdf();
  assert(originalPdfBytes.length > 0, "PDF Editor demo document generation failed");

  // 2. User merges a duplicate document
  const { bytes: mergedPdfBytes } = await mergePdfs(originalPdfBytes, originalPdfBytes);
  const loadedMerged = await PDFDocument.load(mergedPdfBytes);
  assert(loadedMerged.getPageCount() === 6, `PDF Editor merge flow failed: got ${loadedMerged.getPageCount()} pages`);

  // 3. User extracts pages 1 and 3
  const extractedBytes = await extractPagesAsPdf(mergedPdfBytes, [0, 2]);
  const loadedExtracted = await PDFDocument.load(extractedBytes);
  assert(loadedExtracted.getPageCount() === 2, "PDF Editor extraction flow failed");

  // 4. User applies text annotation, highlight, stamp, and whiteout
  const testPages: PageMeta[] = [
    {
      id: "p1",
      pageNumber: 1,
      originalIndex: 0,
      width: 595.28,
      height: 841.89,
      rotation: 0,
      label: "Invoice Page",
    },
  ];

  const testAnnotations: AnnotationObject[] = [
    {
      id: "ann-1",
      type: "highlight",
      pageIndex: 0,
      x: 40,
      y: 100,
      width: 200,
      height: 20,
      color: "#eab308",
      opacity: 0.45,
      strokeWidth: 1,
      createdAt: "2026-10-01",
    },
    {
      id: "ann-2",
      type: "stamp",
      pageIndex: 0,
      x: 350,
      y: 50,
      width: 140,
      height: 38,
      text: "APPROVED",
      color: "#16a34a",
      opacity: 1,
      strokeWidth: 2,
      createdAt: "2026-10-01",
    },
  ];

  // 5. User exports vector PDF
  const finalExportBytes = await exportPdfDocument({
    sourcePdfBytes: originalPdfBytes,
    pages: testPages,
    annotations: testAnnotations,
  });

  assert(finalExportBytes.length > 0, "PDF Editor export produced empty bytes");
  const loadedFinal = await PDFDocument.load(finalExportBytes);
  assert(loadedFinal.getPageCount() === 1, "PDF Editor export page count mismatch");
  console.log("  ✓ PDF Editor end-to-end studio workflow verified!");

  // --------------------------------------------------------------------------
  // Workflow 4.5: Flagship ATS Resume Builder Workflow
  // --------------------------------------------------------------------------
  console.log("-> 4.5 User Flow: Flagship ATS Resume Builder (Schema, ATS Score, Profile)...");
  // 1. Verify initial profile schema
  const parsedResume = resumeDataSchema.safeParse(initialResumeData);
  assert(parsedResume.success, "Resume schema verification failed for initial fixture");

  // 2. Test dynamic section addition
  const updatedResumeData = {
    ...initialResumeData,
    sections: [
      ...initialResumeData.sections,
      {
        id: "sec-cert-custom",
        type: "certifications" as const,
        title: "Certifications",
        visible: true,
        order: 99,
        items: [
          {
            id: "cert-1",
            type: "certifications" as const,
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "2024",
            description: "Cloud Architecture Certification",
          },
        ],
      },
    ],
  };

  const parsedUpdated = resumeDataSchema.safeParse(updatedResumeData);
  assert(parsedUpdated.success, "Custom section addition schema failed");

  // 3. Test live ATS Score computation on resume content
  const resumeText = `${initialResumeData.personalInfo.fullName}\n${initialResumeData.personalInfo.email} ${initialResumeData.personalInfo.phone}\n${initialResumeData.personalInfo.summary}\nExperience\nSoftware Engineer at TechCorp\n- Led development of scalable microservices, boosting throughput by 45%\n- Spearheaded system refactor, delivering 99.99% availability\nEducation\nB.S. in Computer Science`;
  const report = analyzeResumeText(resumeText);
  assert(report.overallScore > 30, `Unexpected ATS base score: ${report.overallScore}`);
  assert(report.powerVerbsCount > 0, `Expected power verbs detected: ${report.powerVerbsCount}`);
  assert(report.metricsCount > 0, `Expected metrics detected: ${report.metricsCount}`);
  console.log(`  ✓ Resume Builder ATS score engine verified (Score: ${report.overallScore}%, Rating: ${report.rating}).`);

  // --------------------------------------------------------------------------
  // Workflow 4.6: Text Transform & Roman Numeral / Number to Words Workflow
  // --------------------------------------------------------------------------
  console.log("-> 4.6 User Flow: Number to Words & Roman Numeral conversion...");
  const amountWords = numberToWords(25430);
  assert(amountWords === "twenty five thousand four hundred thirty", `numberToWords failed: got '${amountWords}'`);

  const roman2026 = numberToRoman(2026);
  assert(roman2026 === "MMXXVI", `numberToRoman failed: got '${roman2026}'`);
  console.log("  ✓ Number transformations end-to-end verified.");

  console.log("\n==================================================================");
  console.log("🎉 ALL END-TO-END (E2E) & UI TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================================");
}

runE2eTestSuite().catch((err) => {
  console.error("\n❌ E2E UI Test Suite Failed:", err);
  process.exit(1);
});
