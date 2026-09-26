/**
 * Unit Tests for HTML to PDF Logic
 */

import {
  validateHtmlString,
  injectPrintStyles,
  extractDocumentTitle,
  sanitizeHtmlForPrint,
  TEMPLATES,
} from "./logic";

export async function runHtmlToPdfTests() {
  // Test 1: validateHtmlString
  const emptyCheck = validateHtmlString("");
  if (emptyCheck.valid) {
    throw new Error("validateHtmlString should fail for empty string");
  }

  const validCheck = validateHtmlString("<html><body><h1>Hello</h1></body></html>");
  if (!validCheck.valid) {
    throw new Error("validateHtmlString should succeed for valid html");
  }

  // Test 2: injectPrintStyles with </head>
  const sampleWithHead = `<!DOCTYPE html><html><head><title>Test Doc</title></head><body><h1>Content</h1></body></html>`;
  const styledWithHead = injectPrintStyles(sampleWithHead, {
    pageSize: "A4",
    margin: "narrow",
  });

  if (!styledWithHead.includes("id=\"mindkit-print-styles\"")) {
    throw new Error("injectPrintStyles failed to inject style tag into head");
  }
  if (!styledWithHead.includes("size: A4")) {
    throw new Error("injectPrintStyles failed to set A4 size");
  }
  if (!styledWithHead.includes("margin: 10mm")) {
    throw new Error("injectPrintStyles failed to set narrow 10mm margin");
  }

  // Test 3: injectPrintStyles without </head>
  const snippet = `<div>Just a snippet</div>`;
  const styledSnippet = injectPrintStyles(snippet, {
    pageSize: "Letter",
    margin: "wide",
  });
  if (!styledSnippet.includes("size: Letter") || !styledSnippet.includes("margin: 30mm")) {
    throw new Error("injectPrintStyles failed on headless html fragment");
  }

  // Test 4: extractDocumentTitle
  const title1 = extractDocumentTitle(`<html><head><title>My Special Invoice #123</title></head></html>`);
  if (title1 !== "My Special Invoice #123") {
    throw new Error(`extractDocumentTitle returned unexpected: "${title1}"`);
  }

  const titleFallback = extractDocumentTitle(`<div>No title tag here</div>`);
  if (titleFallback !== "Document") {
    throw new Error(`extractDocumentTitle fallback failed: "${titleFallback}"`);
  }

  // Test 5: sanitizeHtmlForPrint
  const dirty = `<div>Safe Content<script>alert('xss')</script><button onclick="bad()" onload="bad2()">Click</button></div>`;
  const cleaned = sanitizeHtmlForPrint(dirty);
  if (cleaned.includes("<script") || cleaned.includes("onload=")) {
    throw new Error("sanitizeHtmlForPrint failed to strip script elements");
  }
  if (!cleaned.includes("Safe Content")) {
    throw new Error("sanitizeHtmlForPrint stripped legitimate content");
  }

  // Test 6: Templates presence & validity
  if (!TEMPLATES.invoice || !TEMPLATES.certificate || !TEMPLATES.report) {
    throw new Error("Expected preset templates missing from TEMPLATES object");
  }

  return true;
}
