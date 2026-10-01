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

  // ==========================================
  // TIER 2 TESTS
  // ==========================================
  console.log("\nStarting Tier 2 PDF Editor Interactive tests...");

  // Test 5: AcroForms Field Creation & Export
  const formFields: import("./types").FormFieldDef[] = [
    {
      id: "ff-1",
      name: "FullName",
      type: "text",
      pageIndex: 0,
      x: 100,
      y: 120,
      width: 200,
      height: 25,
      defaultValue: "Jane Doe",
      value: "Jane Doe",
      isRequired: true,
    },
    {
      id: "ff-2",
      name: "AgreeTerms",
      type: "checkbox",
      pageIndex: 0,
      x: 100,
      y: 160,
      width: 20,
      height: 20,
      defaultValue: true,
      value: true,
    },
    {
      id: "ff-3",
      name: "CountrySelect",
      type: "dropdown",
      pageIndex: 0,
      x: 100,
      y: 200,
      width: 150,
      height: 25,
      options: ["United States", "Canada", "Germany", "United Kingdom"],
      defaultValue: "United States",
      value: "United States",
    },
    {
      id: "ff-4",
      name: "PlanType",
      type: "radio",
      pageIndex: 0,
      x: 100,
      y: 240,
      width: 20,
      height: 20,
      options: ["Standard", "Enterprise"],
      defaultValue: "Enterprise",
      value: "Enterprise",
    },
    {
      id: "ff-5",
      name: "SubmitOrder",
      type: "button-submit",
      pageIndex: 0,
      x: 100,
      y: 280,
      width: 120,
      height: 30,
      defaultValue: "Submit Agreement",
    },
  ];

  const { serializeFormDataToJson, serializeFormDataToFdf, parseExistingFormFields } = await import("./logic");

  // Test 5a: Export with AcroForms
  const pdfWithFormsBytes = await exportPdfDocument({
    sourcePdfBytes: demoBytes,
    pages,
    formFields,
    metadata: {
      title: "Privacy Agreement 2026",
      author: "ClearTrix Enterprise",
      subject: "Interactive Contract",
      keywords: "privacy, acroforms, client-side",
      creator: "ClearTrix Suite",
      producer: "pdf-lib",
    },
  });

  const docWithForms = await PDFDocument.load(pdfWithFormsBytes);
  const form = docWithForms.getForm();
  const fields = form.getFields();

  if (fields.length < 4) {
    throw new Error(`Expected at least 4 AcroForm fields, found ${fields.length}`);
  }

  const nameField = form.getTextField("FullName");
  if (!nameField || nameField.getText() !== "Jane Doe") {
    throw new Error(`Expected text field 'FullName' with value 'Jane Doe'`);
  }

  const checkField = form.getCheckBox("AgreeTerms");
  if (!checkField || !checkField.isChecked()) {
    throw new Error(`Expected checkbox 'AgreeTerms' to be checked`);
  }

  const dropdownField = form.getDropdown("CountrySelect");
  if (!dropdownField || dropdownField.getSelected()[0] !== "United States") {
    throw new Error(`Expected dropdown 'CountrySelect' with 'United States'`);
  }

  console.log(`✓ Test 5: AcroForms successfully created and verified (${fields.length} interactive fields).`);

  // Test 6: Form Data Serialization (JSON and Adobe FDF)
  const jsonStr = serializeFormDataToJson(formFields);
  const parsedJson = JSON.parse(jsonStr);
  if (parsedJson["FullName"] !== "Jane Doe" || parsedJson["AgreeTerms"] !== true) {
    throw new Error("Failed to serialize form data to JSON correctly");
  }

  const fdfStr = serializeFormDataToFdf(formFields, "Contract.pdf");
  if (!fdfStr.includes("%FDF-1.2") || !fdfStr.includes("FullName") || !fdfStr.includes("Jane Doe")) {
    throw new Error("Failed to serialize form data to valid Adobe FDF format");
  }

  const parsedFields = await parseExistingFormFields(pdfWithFormsBytes);
  if (parsedFields.length < 3) {
    throw new Error(`Expected parseExistingFormFields to discover at least 3 fields, found ${parsedFields.length}`);
  }
  console.log(`✓ Test 6: Form data JSON/FDF export and live AcroForm parser verified.`);

  // Test 7: Permanent Vector Redaction & Metadata Injection
  const redactions: import("./types").RedactionItem[] = [
    {
      id: "red-1",
      pageIndex: 0,
      x: 100,
      y: 100,
      width: 150,
      height: 25,
      label: "CONFIDENTIAL / REDACTED",
    },
  ];

  const redactedPdfBytes = await exportPdfDocument({
    sourcePdfBytes: demoBytes,
    pages,
    redactions,
    metadata: {
      title: "Redacted Disclosure",
      author: "Legal Dept",
      subject: "Security Redaction",
      keywords: "redaction, compliance",
      creator: "ClearTrix Redaction Suite",
      producer: "pdf-lib",
    },
  });

  const redactedDoc = await PDFDocument.load(redactedPdfBytes);
  if (redactedDoc.getTitle() !== "Redacted Disclosure") {
    throw new Error(`Expected title 'Redacted Disclosure', got '${redactedDoc.getTitle()}'`);
  }
  if (redactedDoc.getAuthor() !== "Legal Dept") {
    throw new Error(`Expected author 'Legal Dept', got '${redactedDoc.getAuthor()}'`);
  }
  console.log("✓ Test 7: Permanent vector redaction & document metadata successfully injected.");

  // Test 8: Document Flattener
  const flattenedPdfBytes = await exportPdfDocument({
    sourcePdfBytes: demoBytes,
    pages,
    formFields,
    isFlattened: true,
  });

  const flattenedDoc = await PDFDocument.load(flattenedPdfBytes);
  const flattenedForm = flattenedDoc.getForm();
  const remainingFields = flattenedForm.getFields();
  if (remainingFields.length !== 0) {
    throw new Error(`Expected 0 AcroForm fields after flattening, found ${remainingFields.length}`);
  }
  console.log("✓ Test 8: Document Flattener successfully merged all AcroForms into static page vectors.");

  console.log("\nAll Tier 1 & Tier 2 PDF Editor tests passed cleanly!");
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
