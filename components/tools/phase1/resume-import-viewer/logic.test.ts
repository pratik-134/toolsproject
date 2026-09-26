import { inspectResumeData } from "./logic";
import { ParsedResumeResult } from "@/lib/import/types";
import { personalInfoSchema } from "@/lib/schema";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`[resume-import-viewer] Assertion failed: ${msg}`);
}

export function runTests(): boolean {
  // 1. Test Complete Parsed Resume Data
  const completeMock: ParsedResumeResult = {
    personalInfo: personalInfoSchema.parse({
      fullName: "Marcus Vance",
      email: "marcus.vance@example.com",
      phone: "+1 (555) 345-6789",
      location: "Seattle, WA",
      website: "https://marcusvance.dev",
    }),
    personalInfoConfidence: "high",
    suggestedTitle: "Marcus Vance - Resume",
    rawText: "Marcus Vance...",
    sections: [
      {
        id: "sec-1",
        type: "experience",
        title: "Work Experience",
        confidence: "high",
        confidenceReason: "Header recognized",
        included: true,
        items: [
          { company: "TechCorp", position: "Lead Architect", startDate: "2020", endDate: "Present" },
          { company: "DevWorks", position: "Senior Dev", startDate: "2016", endDate: "2020" },
        ],
      },
      {
        id: "sec-2",
        type: "education",
        title: "Education",
        confidence: "high",
        confidenceReason: "Header recognized",
        included: true,
        items: [
          { school: "University of Washington", degree: "B.S. Computer Science" },
        ],
      },
      {
        id: "sec-3",
        type: "skills",
        title: "Technical Skills",
        confidence: "high",
        confidenceReason: "Header recognized",
        included: true,
        items: [{ name: "TypeScript" }, { name: "React" }, { name: "Docker" }],
      },
    ],
  };

  const report = inspectResumeData(completeMock);
  assert(report.isValid === true, "Expected report.isValid to be true");
  assert(report.fullName === "Marcus Vance", `Expected Marcus Vance, got ${report.fullName}`);
  assert(report.totalExperienceItems === 2, `Expected 2 experience items, got ${report.totalExperienceItems}`);
  assert(report.totalEducationItems === 1, `Expected 1 education item, got ${report.totalEducationItems}`);
  assert(report.totalSkillItems === 3, `Expected 3 skill items, got ${report.totalSkillItems}`);
  assert(report.overallExtractionQuality === "high", "Expected high quality extraction");
  assert(report.diagnosticNotes.length === 0, "Expected 0 diagnostic notes for complete resume");

  // 2. Test Incomplete / Sparse Parsed Resume
  const sparseMock: ParsedResumeResult = {
    personalInfo: personalInfoSchema.parse({
      fullName: "Anonymous",
    }),
    personalInfoConfidence: "low",
    suggestedTitle: "Draft",
    rawText: "Random notes...",
    sections: [],
    unsortedText: "A large chunk of unmapped text content that could not be parsed into sections.",
  };

  const sparseReport = inspectResumeData(sparseMock);
  assert(sparseReport.totalSections === 0, "Expected 0 sections");
  assert(sparseReport.overallExtractionQuality === "low", "Expected low quality extraction");
  assert(sparseReport.diagnosticNotes.length >= 3, "Expected multiple diagnostic warnings");

  return true;
}
