import {
  buildDocxDocument,
  DOCX_TEMPLATES,
} from "./logic";

export async function runTests(): Promise<boolean> {
  // Test 1: Templates exist
  if (Object.keys(DOCX_TEMPLATES).length < 2) {
    throw new Error("Expected at least 2 default DOCX templates");
  }

  // Test 2: Build DOCX document binary buffer
  const sampleConfig = {
    title: "Engineering Plan",
    subtitle: "Architecture Roadmap",
    author: "DeepMind Engineer",
    accentColorHex: "2563EB",
    blocks: [
      { id: "1", type: "heading1" as const, content: "Scope & Objectives" },
      { id: "2", type: "paragraph" as const, content: "This is a detailed paragraph in the document." },
      { id: "3", type: "bullet" as const, content: "First requirement bullet point." },
      { id: "4", type: "callout" as const, content: "Important reminder callout." },
    ],
  };

  const docxBytes = await buildDocxDocument(sampleConfig);

  // Validate non-empty binary
  if (!docxBytes || docxBytes.length === 0) {
    throw new Error("Generated DOCX buffer is empty");
  }

  // Validate PK zip magic bytes (OOXML DOCX is a zip archive: 0x50, 0x4B, 0x03, 0x04)
  if (
    docxBytes[0] !== 0x50 ||
    docxBytes[1] !== 0x4b ||
    docxBytes[2] !== 0x03 ||
    docxBytes[3] !== 0x04
  ) {
    throw new Error("Generated DOCX is missing valid PK zip magic bytes");
  }

  // Minimum size for valid DOCX container is typically > 2KB
  if (docxBytes.length < 1500) {
    throw new Error(`Generated DOCX file too small: ${docxBytes.length} bytes`);
  }

  return true;
}
