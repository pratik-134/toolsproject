import { PersonalInfo, Section, SectionType, ResumeData } from "../schema";

export type ParsedConfidence = "high" | "medium" | "low";

export interface ExtractionResult {
  text: string;
  fileType: "pdf" | "docx";
  fileName: string;
  fileSize: number;
  pageCount?: number;
}

export interface ParsedSectionPreview {
  id: string;
  type: SectionType;
  title: string;
  items: any[];
  confidence: ParsedConfidence;
  confidenceReason: string;
  included: boolean;
}

export interface ParsedResumeResult {
  personalInfo: PersonalInfo;
  personalInfoConfidence: ParsedConfidence;
  sections: ParsedSectionPreview[];
  rawText: string;
  unsortedText?: string;
  suggestedTitle: string;
}
