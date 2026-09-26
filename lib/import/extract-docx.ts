import mammoth from "mammoth";
import { ExtractionResult } from "./types";

export async function extractTextFromDocx(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value || "";

    if (!text.trim() || text.trim().length < 20) {
      throw new Error(
        "No readable text found in this DOCX file. It may be empty or contain non-text media."
      );
    }

    return {
      text,
      fileType: "docx",
      fileName: file.name,
      fileSize: file.size,
    };
  } catch (err: any) {
    throw new Error(
      err?.message || "Failed to extract text from DOCX file. Please check that the file is not corrupted."
    );
  }
}
