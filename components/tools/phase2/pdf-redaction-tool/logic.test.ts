/**
 * Unit Tests for PDF Redaction Tool Logic
 */

import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  applyPdfRedactions,
  validateRedactionBounds,
  REDACTION_PRESETS,
  RedactionBox,
} from "./logic";

export async function runPdfRedactionTests() {
  // Test 1: Presets validity
  if (!REDACTION_PRESETS.ssn_box || !REDACTION_PRESETS.signature_block) {
    throw new Error("Missing expected redaction presets");
  }

  // Test 2: validateRedactionBounds
  const bounds = validateRedactionBounds(
    { id: "1", pageIndex: 0, x: -20, y: 900, width: 800, height: 100 },
    595,
    842
  );
  if (bounds.adjustedBox.x < 0 || bounds.adjustedBox.x + bounds.adjustedBox.width > 595) {
    throw new Error("validateRedactionBounds failed to clamp within page width");
  }

  // Test 3: applyPdfRedactions
  // Create a minimal PDF in memory
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText("Confidential SSN: 000-12-3456", { x: 50, y: 700, font, size: 14 });
  page.drawText("Authorized Signature: John Doe", { x: 50, y: 150, font, size: 14 });
  const rawBytes = await doc.save();

  const redactions: RedactionBox[] = [
    {
      id: "box-1",
      pageIndex: 0,
      x: 45,
      y: 690,
      width: 250,
      height: 30,
      color: "black",
      label: "[REDACTED SSN]",
    },
    {
      id: "box-2",
      pageIndex: 0,
      x: 45,
      y: 140,
      width: 260,
      height: 40,
      color: "white",
      label: "[REMOVED]",
    },
  ];

  const redactedPdfBytes = await applyPdfRedactions(rawBytes, redactions);

  // Check PDF magic header %PDF-
  if (
    redactedPdfBytes[0] !== 0x25 ||
    redactedPdfBytes[1] !== 0x50 ||
    redactedPdfBytes[2] !== 0x44 ||
    redactedPdfBytes[3] !== 0x46
  ) {
    throw new Error("Redacted output does not have %PDF- header");
  }

  if (redactedPdfBytes.length < rawBytes.length) {
    throw new Error("Redacted PDF unexpectedly smaller than original base document");
  }

  return true;
}
