/**
 * Pure Client-Side Resume Import Inspector Logic
 * Validates, audits, and analyzes structured resume data parsed from PDF & DOCX files.
 * Zero external libraries, 100% deterministic data transformation.
 */

import { ParsedResumeResult, ParsedSectionPreview } from "@/lib/import/types";
import { PersonalInfo } from "@/lib/schema";

export interface ResumeSectionSummary {
  id: string;
  type: string;
  title: string;
  itemCount: number;
  confidence: "high" | "medium" | "low";
  confidenceReason: string;
}

export interface ResumeInspectionReport {
  isValid: boolean;
  fullName: string;
  email: string;
  phone: string;
  totalSections: number;
  totalExperienceItems: number;
  totalEducationItems: number;
  totalSkillItems: number;
  sectionSummaries: ResumeSectionSummary[];
  overallExtractionQuality: "high" | "medium" | "low";
  diagnosticNotes: string[];
}

/**
 * Inspects parsed resume data and returns comprehensive diagnostics.
 */
export function inspectResumeData(parsed: ParsedResumeResult): ResumeInspectionReport {
  const pInfo = parsed.personalInfo || ({} as PersonalInfo);
  const sections = parsed.sections || [];

  const fullName = pInfo.fullName || "Unnamed Candidate";
  const email = pInfo.email || "";
  const phone = pInfo.phone || "";

  let totalExperienceItems = 0;
  let totalEducationItems = 0;
  let totalSkillItems = 0;

  const sectionSummaries: ResumeSectionSummary[] = [];
  const diagnosticNotes: string[] = [];

  for (const s of sections) {
    const itemCount = Array.isArray(s.items) ? s.items.length : 0;

    if (s.type === "experience") {
      totalExperienceItems += itemCount;
    } else if (s.type === "education") {
      totalEducationItems += itemCount;
    } else if (s.type === "skills") {
      totalSkillItems += itemCount;
    }

    sectionSummaries.push({
      id: s.id,
      type: s.type,
      title: s.title,
      itemCount,
      confidence: s.confidence,
      confidenceReason: s.confidenceReason || "Direct section heading match",
    });
  }

  // Diagnostics
  if (!email) {
    diagnosticNotes.push("No email address recognized in contact block.");
  }
  if (!phone) {
    diagnosticNotes.push("No phone number detected in document.");
  }
  if (totalExperienceItems === 0) {
    diagnosticNotes.push("No work experience timeline positions extracted.");
  }
  if (totalEducationItems === 0) {
    diagnosticNotes.push("No academic degrees or education institutions extracted.");
  }
  if (totalSkillItems === 0) {
    diagnosticNotes.push("No technical or core competencies extracted.");
  }
  if (parsed.unsortedText && parsed.unsortedText.length > 300) {
    diagnosticNotes.push("Unassigned text found that could not be mapped to standard sections.");
  }

  // Determine overall quality
  let highCount = 0;
  let lowCount = 0;
  for (const s of sections) {
    if (s.confidence === "high") highCount++;
    if (s.confidence === "low") lowCount++;
  }

  let overallExtractionQuality: "high" | "medium" | "low" = "medium";
  if (sections.length > 0 && highCount >= sections.length * 0.7 && email) {
    overallExtractionQuality = "high";
  } else if (lowCount > sections.length * 0.5 || !email) {
    overallExtractionQuality = "low";
  }

  const isValid = Boolean(fullName && (email || phone || sections.length > 0));

  return {
    isValid,
    fullName,
    email,
    phone,
    totalSections: sections.length,
    totalExperienceItems,
    totalEducationItems,
    totalSkillItems,
    sectionSummaries,
    overallExtractionQuality,
    diagnosticNotes,
  };
}
