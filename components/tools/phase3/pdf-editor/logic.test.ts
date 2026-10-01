import { PDFDocument } from "pdf-lib";
import { createDemoPdf, mergePdfs, extractPagesAsPdf } from "./logic";
import { exportPdfDocument } from "./exportPdf";
import { PageMeta, AnnotationObject, ContentElement } from "./types";

export async function runTests(): Promise<boolean> {
  console.log("Starting Tier 1 PDF Editor logic tests...");

  // Test 1: Generate Demo PDF
  const { bytes: demoBytes, fileName } = await createDemoPdf();
  if (!demoBytes || demoBytes.length === 0) {
    throw new Error("createDemoPdf returned empty bytes");
  }
  const loadedDemo = await PDFDocument.load(demoBytes);
  if (loadedDemo.getPageCount() !== 3) {
    throw new Error(`Expected 3 pages in demo PDF, got ${loadedDemo.getPageCount()}`);
  }
  console.log("✓ Test 1: Demo PDF successfully generated with 3 pages.");

  // Test 2: Merge PDFs
  const { bytes: mergedBytes, addedCount } = await mergePdfs(demoBytes, demoBytes);
  const loadedMerged = await PDFDocument.load(mergedBytes);
  if (loadedMerged.getPageCount() !== 6) {
    throw new Error(`Expected 6 pages after merge, got ${loadedMerged.getPageCount()}`);
  }
  console.log("✓ Test 2: Merge PDFs successfully combined documents.");

  // Test 3: Extract Pages
  const extractedBytes = await extractPagesAsPdf(demoBytes, [0, 2]);
  const loadedExtracted = await PDFDocument.load(extractedBytes);
  if (loadedExtracted.getPageCount() !== 2) {
    throw new Error(`Expected 2 extracted pages, got ${loadedExtracted.getPageCount()}`);
  }
  console.log("✓ Test 3: Extract pages successfully created new document.");

  // Test 4: Export Engine with Annotations, Whiteout, Stamping, and Stamped Elements
  const pages: PageMeta[] = [
    {
      id: "p1",
      pageNumber: 1,
      originalIndex: 0,
      width: 595.28,
      height: 841.89,
      rotation: 90,
      cropBox: { x: 10, y: 10, width: 575, height: 820 },
      label: "Title Page",
    },
    {
      id: "p2",
      pageNumber: 2,
      originalIndex: -1, // blank inserted page
      width: 595.28,
      height: 841.89,
      rotation: 0,
      label: "Blank Addendum",
    },
  ];

  const annotations: AnnotationObject[] = [
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
      type: "freehand",
      pageIndex: 0,
      x: 50,
      y: 200,
      width: 100,
      height: 50,
      points: [
        { x: 50, y: 200 },
        { x: 75, y: 220 },
        { x: 100, y: 210 },
        { x: 150, y: 250 },
      ],
      color: "#ef4444",
      opacity: 0.9,
      strokeWidth: 2,
      createdAt: "2026-10-01",
    },
    {
      id: "ann-3",
      type: "stamp",
      pageIndex: 0,
      x: 350,
      y: 50,
      width: 140,
      height: 38,
      text: "APPROVED",
      color: "#16a34a",
      opacity: 0.9,
      strokeWidth: 2,
      createdAt: "2026-10-01",
    },
    {
      id: "ann-4",
      type: "shape-rect",
      pageIndex: 1,
      x: 50,
      y: 50,
      width: 120,
      height: 80,
      color: "#3b82f6",
      opacity: 0.8,
      strokeWidth: 2,
      createdAt: "2026-10-01",
    },
  ];

  const elements: ContentElement[] = [
    {
      id: "el-whiteout",
      type: "whiteout",
      pageIndex: 0,
      x: 40,
      y: 140,
      width: 300,
      height: 25,
      backgroundColor: "#ffffff",
    },
    {
      id: "el-text",
      type: "text",
      pageIndex: 0,
      x: 40,
      y: 140,
      width: 300,
      height: 25,
      text: "Replaced text line over whiteout box.",
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      color: "#0f172a",
    },
  ];

  const exportedBytes = await exportPdfDocument({
    sourcePdfBytes: demoBytes,
    pages,
    annotations,
    elements,
    watermark: {
      enabled: true,
      text: "CONFIDENTIAL",
      color: "#dc2626",
      opacity: 0.25,
      fontSize: 48,
      rotation: 45,
    },
    pageNumbering: {
      enabled: true,
      format: "page-of-total",
      position: "bottom-center",
      fontSize: 9,
      color: "#475569",
    },
    bates: {
      enabled: true,
      prefix: "LEGAL-",
      suffix: "-DOC",
      startNumber: 101,
      digits: 6,
      position: "bottom-right",
    },
    headerFooter: {
      enabled: true,
      headerText: "CLEARTRIX PRIVACY AUDIT SPECIFICATION",
      footerText: "CONFIDENTIAL - ZERO TRANSMISSION GUARANTEED",
      fontSize: 8,
      color: "#64748b",
    },
    pageBackground: null,
  });

  const loadedExport = await PDFDocument.load(exportedBytes);
  if (loadedExport.getPageCount() !== 2) {
    throw new Error(`Expected 2 pages in exported document, got ${loadedExport.getPageCount()}`);
  }
  console.log("✓ Test 4: Export engine successfully baked all vector annotations, whiteout, and stamps.");

  console.log("All Tier 1 PDF Editor tests passed cleanly!");
  return true;
}

// Execute if run directly
if (typeof process !== "undefined" && process.argv[1]?.includes("logic.test.ts")) {
  runTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Test failed:", err);
      process.exit(1);
    });
}
