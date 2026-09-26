import { extractTextFromPdf } from "./extract-pdf";
import { extractTextFromDocx } from "./extract-docx";
import { normalizeExtractedText, segmentResumeText } from "./parse-resume-text";
import { mapBlocksToResumeData } from "./map-to-schema";
import { ParsedResumeResult, ExtractionResult } from "./types";

export * from "./types";
export { normalizeExtractedText, segmentResumeText } from "./parse-resume-text";
export { mapBlocksToResumeData } from "./map-to-schema";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates the uploaded file and extracts its structured resume data.
 * Entirely client-side and memory-only.
 */
export async function parseResumeFile(
  file: File,
  onProgress?: (status: string, percentage: number) => void
): Promise<ParsedResumeResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File exceeds the 10MB limit. Please upload a smaller PDF or DOCX file.");
  }

  // Validate extension and type
  const lowerName = file.name.toLowerCase();
  const isPdf = lowerName.endsWith(".pdf") || file.type === "application/pdf";
  const isDocx =
    lowerName.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (!isPdf && !isDocx) {
    throw new Error(
      "Unsupported file format. Please upload an existing resume in .PDF or .DOCX format."
    );
  }

  // 1. Text extraction
  onProgress?.("Reading document...", 25);
  let extraction: ExtractionResult;
  if (isPdf) {
    extraction = await extractTextFromPdf(file);
  } else {
    extraction = await extractTextFromDocx(file);
  }

  // 2. Normalization
  onProgress?.("Cleaning & normalizing text...", 55);
  const normalizedLines = normalizeExtractedText(extraction.text);

  if (normalizedLines.length === 0) {
    throw new Error("Could not extract any readable text lines from the uploaded document.");
  }

  // 3. Segmentation
  onProgress?.("Detecting resume sections...", 75);
  const textBlocks = segmentResumeText(normalizedLines);

  // 4. Schema Mapping & Confidence Scoring
  onProgress?.("Mapping details into resume template...", 90);
  const result = mapBlocksToResumeData(textBlocks, extraction.text);

  // Use file name without extension for suggested title if default
  const baseName = file.name.replace(/\.[^/.]+$/, "").trim();
  if (baseName && (!result.suggestedTitle || result.suggestedTitle === "Imported Resume")) {
    result.suggestedTitle = baseName;
  }

  onProgress?.("Complete!", 100);
  return result;
}
