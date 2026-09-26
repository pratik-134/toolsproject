import {
  ResumeData,
  PersonalInfo,
  Section,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  LanguageItem,
  AwardItem,
  VolunteerItem,
  InterestItem,
  ReferenceItem,
  CustomItem,
} from "../schema";
import { TextBlock } from "./parse-resume-text";
import { ParsedResumeResult, ParsedSectionPreview, ParsedConfidence } from "./types";

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// Regex helpers
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{1,4}[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i;
const URL_REGEX = /https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.(?:dev|io|me|com|org|net|co|app)(?:\/[^\s]*)?/i;

const DATE_RANGE_REGEX = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*(?:-|–|—|to)\s*(?:Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4})/i;
const SINGLE_DATE_REGEX = /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:19|20)\d{2}\b/i;

const DEGREE_REGEX = /\b(?:Bachelor(?:'s)?(?:\s+(?:of|in)\s+[A-Za-z\s]+)?|Master(?:'s)?(?:\s+(?:of|in)\s+[A-Za-z\s]+)?|Doctor(?:ate)?(?:\s+(?:of|in)\s+[A-Za-z\s]+)?|Ph\.?D\.?|M\.?B\.?A\.?|B\.?Tech|M\.?Tech|B\.?Sc?\.?|M\.?Sc?\.?|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Associate(?:'s)?(?:\s+(?:of|in)\s+[A-Za-z\s]+)?|A\.?S\.?|A\.?A\.?|Diploma|High School)\b/i;
const INSTITUTION_REGEX = /(?:University|College|Institute|School|Academy|Polytechnic)[^,\n]*/i;
const GPA_REGEX = /(?:GPA|Grade|CGPA)[:\s]+([0-4]\.\d{1,2}(?:\s*\/\s*4(?:\.0)?)?|[0-9]{1,2}(?:\.[0-9])?%?)/i;

/**
 * Parses Personal Information from text lines.
 */
function parsePersonalInfo(headerLines: string[], summaryText: string): { info: PersonalInfo; confidence: ParsedConfidence; reason: string } {
  let fullName = "";
  let title = "";
  let email = "";
  let phone = "";
  let location = "";
  let website = "";
  let linkedin = "";
  let github = "";

  const remainingLines: string[] = [];

  for (const line of headerLines) {
    if (!line) continue;

    // Extract email
    if (!email) {
      const emailMatch = line.match(EMAIL_REGEX);
      if (emailMatch && emailMatch[0]) {
        email = emailMatch[0];
      }
    }

    // Extract phone
    if (!phone) {
      const phoneMatch = line.match(PHONE_REGEX);
      if (phoneMatch && phoneMatch[0]) {
        phone = phoneMatch[0].trim();
      }
    }

    // Extract LinkedIn
    if (!linkedin) {
      const linkedInMatch = line.match(LINKEDIN_REGEX);
      if (linkedInMatch && linkedInMatch[0]) {
        linkedin = linkedInMatch[0];
      }
    }

    // Extract GitHub
    if (!github) {
      const githubMatch = line.match(GITHUB_REGEX);
      if (githubMatch && githubMatch[0]) {
        github = githubMatch[0];
      }
    }

    // Extract website (if not linkedin/github and not email)
    if (!website && !line.includes("@")) {
      const urlMatch = line.match(URL_REGEX);
      if (urlMatch && urlMatch[0] && !urlMatch[0].includes("linkedin.com") && !urlMatch[0].includes("github.com")) {
        let rawUrl = urlMatch[0];
        if (!/^https?:\/\//i.test(rawUrl)) {
          rawUrl = `https://${rawUrl}`;
        }
        try {
          new URL(rawUrl);
          website = rawUrl;
        } catch {
          // Invalid URL, ignore
        }
      }
    }

    // Extract location (City, State / Country pattern)
    if (!location) {
      const locMatch = line.match(/(?:[A-Z][a-zA-Z\s.-]+),\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s]+)(?:,\s*[A-Z][a-zA-Z\s]+)?/);
      if (locMatch && locMatch[0] && !locMatch[0].includes("@") && locMatch[0].length < 40) {
        location = locMatch[0].trim();
      }
    }

    // Identify candidate name (usually 1st or 2nd non-contact line)
    const isContactLine = EMAIL_REGEX.test(line) || PHONE_REGEX.test(line) || URL_REGEX.test(line);
    if (!isContactLine) {
      const cleanLine = line.replace(/[^a-zA-Z\s.-]/g, "").trim();
      const words = cleanLine.split(/\s+/).filter(Boolean);

      if (!fullName && words.length >= 2 && words.length <= 4 && cleanLine.length <= 35 && !/resume|curriculum|vitae|contact/i.test(cleanLine)) {
        fullName = cleanLine;
      } else if (fullName && !title && words.length >= 1 && words.length <= 5 && line.length <= 45 && !/summary|profile|phone|email/i.test(line)) {
        title = line;
      } else {
        remainingLines.push(line);
      }
    }
  }

  // Summary from either dedicated summary section or remaining lines
  const finalSummary = summaryText.trim() || remainingLines.slice(0, 3).join(" ").trim();

  // Confidence check
  let confidence: ParsedConfidence = "low";
  let reason = "Missing core contact details.";
  if (fullName && (email || phone)) {
    confidence = "high";
    reason = "Full name and primary contact details successfully recognized.";
  } else if (fullName || email) {
    confidence = "medium";
    reason = "Found name or email, but some contact info may need review.";
  }

  // Validate website URL for Zod schema
  let validWebsite = "";
  if (website) {
    const formatted = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    try {
      new URL(formatted);
      validWebsite = formatted;
    } catch {
      validWebsite = "";
    }
  }

  return {
    info: {
      fullName: fullName || "Imported Candidate",
      title: title || "",
      email: email || "",
      phone: phone || "",
      location: location || "",
      website: validWebsite,
      linkedin: linkedin || "",
      github: github || "",
      summary: finalSummary,
      photo: { url: "", shape: "circle", size: 96, visible: true },
    },
    confidence,
    reason,
  };
}

/**
 * Parses Work Experience block into ExperienceItem[]
 */
function parseExperienceItems(lines: string[]): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  let currentItem: Partial<ExperienceItem> | null = null;
  const itemLines: string[] = [];

  const finalizeItem = () => {
    if (!currentItem) return;
    const highlights: string[] = [];
    const descLines: string[] = [];

    for (const l of itemLines) {
      if (l.startsWith("•") || l.startsWith("-") || l.startsWith("*")) {
        highlights.push(l.replace(/^[•\-*]\s*/, "").trim());
      } else {
        descLines.push(l);
      }
    }

    items.push({
      id: generateId("exp"),
      type: "experience",
      position: currentItem.position || "Untitled Position",
      company: currentItem.company || "Company",
      location: currentItem.location || "",
      startDate: currentItem.startDate || "",
      endDate: currentItem.endDate || "",
      current: Boolean(currentItem.current),
      description: descLines.join(" ").trim(),
      highlights: highlights.length > 0 ? highlights : descLines,
    });

    itemLines.length = 0;
    currentItem = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const dateMatch = line.match(DATE_RANGE_REGEX);

    if (dateMatch && dateMatch[0]) {
      finalizeItem();

      const dateStr = dateMatch[0];
      const isCurrent = /present|current|now/i.test(dateStr);
      const parts = dateStr.split(/\s*(?:-|–|—|to)\s*/i);
      const startDate = parts[0] ? parts[0].trim() : "";
      const endDate = parts[1] ? parts[1].trim() : "";

      // Remaining line text without the date
      const textWithoutDate = line.replace(dateStr, "").trim().replace(/^[-–—|,]\s*|[-–—|,]\s*$/g, "");

      // Look at previous line or current line for Position / Company
      let pos = "";
      let comp = "";

      if (textWithoutDate) {
        if (textWithoutDate.includes(" at ")) {
          const splitParts = textWithoutDate.split(" at ");
          pos = splitParts[0]?.trim() || "";
          comp = splitParts[1]?.trim() || "";
        } else if (textWithoutDate.includes(" | ")) {
          const splitParts = textWithoutDate.split(" | ");
          pos = splitParts[0]?.trim() || "";
          comp = splitParts[1]?.trim() || "";
        } else if (textWithoutDate.includes(" - ")) {
          const splitParts = textWithoutDate.split(" - ");
          pos = splitParts[0]?.trim() || "";
          comp = splitParts[1]?.trim() || "";
        } else {
          pos = textWithoutDate;
        }
      }

      // If position/company not both found, check previous line
      const prev = i > 0 ? lines[i - 1] : undefined;
      if ((!pos || !comp) && prev && !DATE_RANGE_REGEX.test(prev) && !prev.startsWith("•")) {
        if (prev.includes(" at ")) {
          const splitParts = prev.split(" at ");
          pos = splitParts[0]?.trim() || pos;
          comp = splitParts[1]?.trim() || comp;
        } else if (prev.includes(" | ")) {
          const splitParts = prev.split(" | ");
          pos = splitParts[0]?.trim() || pos;
          comp = splitParts[1]?.trim() || comp;
        } else if (!pos) {
          pos = prev;
        } else if (!comp) {
          comp = prev;
        }
      }

      currentItem = {
        position: pos || "Role / Position",
        company: comp || "Organization",
        startDate: startDate,
        endDate: isCurrent ? "Present" : endDate,
        current: isCurrent,
      };
    } else if (currentItem) {
      itemLines.push(line);
    } else if (i === 0 || !items.length) {
      // Line before first date match might be company / position
      itemLines.push(line);
    }
  }

  finalizeItem();
  return items;
}

/**
 * Parses Education block into EducationItem[]
 */
function parseEducationItems(lines: string[]): EducationItem[] {
  const items: EducationItem[] = [];
  let currentItem: Partial<EducationItem> | null = null;

  const finalize = () => {
    if (currentItem && (currentItem.degree || currentItem.institution)) {
      items.push({
        id: generateId("edu"),
        type: "education",
        degree: currentItem.degree || "Degree",
        fieldOfStudy: currentItem.fieldOfStudy || "",
        institution: currentItem.institution || "University",
        location: currentItem.location || "",
        startDate: currentItem.startDate || "",
        endDate: currentItem.endDate || "",
        current: Boolean(currentItem.current),
        gpa: currentItem.gpa || "",
        honors: currentItem.honors || "",
        description: currentItem.description || "",
      });
    }
    currentItem = null;
  };

  for (const line of lines) {
    const degreeMatch = line.match(DEGREE_REGEX);
    const instMatch = line.match(INSTITUTION_REGEX);
    const dateRangeMatch = line.match(DATE_RANGE_REGEX);
    const singleDateMatch = line.match(SINGLE_DATE_REGEX);
    const gpaMatch = line.match(GPA_REGEX);

    if (degreeMatch || instMatch) {
      // Only finalize if this line represents a NEW educational program
      const isNewProgram = Boolean(
        (degreeMatch && currentItem?.degree) || (instMatch && currentItem?.institution)
      );
      if (isNewProgram) {
        finalize();
      }
      if (!currentItem) currentItem = {};

      if (degreeMatch && degreeMatch[0]) {
        const fullMatched = degreeMatch[0].trim();
        if (/\s+in\s+/i.test(fullMatched)) {
          const splitDegree = fullMatched.split(/\s+in\s+/i);
          currentItem.degree = splitDegree[0]?.trim() || fullMatched;
          if (splitDegree[1] && !currentItem.fieldOfStudy) {
            currentItem.fieldOfStudy = splitDegree[1].trim();
          }
        } else {
          currentItem.degree = fullMatched;
          const rawField = line.replace(fullMatched, "").replace(/^[,\s-]+|[,\s-]+$/g, "");
          const cleanField = rawField.replace(/^(?:in|of|major in)\s+/i, "").trim();
          if (cleanField && !currentItem.fieldOfStudy) {
            currentItem.fieldOfStudy = cleanField;
          }
        }
      }
      if (instMatch && instMatch[0]) {
        currentItem.institution = instMatch[0].trim();
      }
    }

    if (currentItem) {
      if (gpaMatch && gpaMatch[1]) {
        currentItem.gpa = gpaMatch[1].trim();
      }
      if (dateRangeMatch && dateRangeMatch[0]) {
        const parts = dateRangeMatch[0].split(/\s*(?:-|–|—|to)\s*/i);
        const start = parts[0]?.trim() || "";
        const end = parts[1]?.trim() || "";
        currentItem.startDate = start;
        currentItem.endDate = end;
        currentItem.current = /present|current|now/i.test(end);
      } else if (singleDateMatch && singleDateMatch[0] && !currentItem.endDate) {
        currentItem.endDate = singleDateMatch[0].trim();
      }
    }
  }

  finalize();
  return items;
}

/**
 * Parses Skills block into SkillItem[]
 */
function parseSkillItems(lines: string[]): SkillItem[] {
  const skills: SkillItem[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    let category = "";
    let content = line;

    // Check for category prefix e.g. "Languages: Python, Go" or "Tools & Frameworks - React, Node"
    const categoryMatch = line.match(/^([^:\-–]{2,25})[:\-–]\s*(.+)$/);
    if (categoryMatch && categoryMatch[1] && categoryMatch[2]) {
      category = categoryMatch[1].trim();
      content = categoryMatch[2].trim();
    }

    // Split by comma, bullet, pipe, or forward slash
    const parts = content.split(/[,•|/·\t]/).map((p) => p.trim()).filter((p) => p.length >= 2 && p.length <= 40);

    for (const part of parts) {
      const lower = part.toLowerCase();
      if (!seen.has(lower) && !/skills|competencies|proficiencies/i.test(part)) {
        seen.add(lower);
        skills.push({
          id: generateId("skill"),
          type: "skills",
          name: part,
          level: "none",
          rating: 0,
          category,
        });
      }
    }
  }

  return skills;
}

/**
 * Parses Projects block into ProjectItem[]
 */
function parseProjectItems(lines: string[]): ProjectItem[] {
  const items: ProjectItem[] = [];
  let current: Partial<ProjectItem> | null = null;
  const descLines: string[] = [];

  const finalize = () => {
    if (current && current.title) {
      items.push({
        id: generateId("proj"),
        type: "projects",
        title: current.title,
        subtitle: current.subtitle || "",
        link: current.link || "",
        startDate: current.startDate || "",
        endDate: current.endDate || "",
        description: descLines.join(" ").trim(),
        technologies: current.technologies || [],
      });
    }
    descLines.length = 0;
    current = null;
  };

  for (const line of lines) {
    const urlMatch = line.match(URL_REGEX);
    const dateMatch = line.match(DATE_RANGE_REGEX) || line.match(SINGLE_DATE_REGEX);

    // Case 1: Project with inline colon/dash e.g. "Project Title: Description..."
    const inlineMatch = line.match(/^([^:\-–]{3,50})[:\-–]\s*(.+)$/);
    if (inlineMatch && inlineMatch[1] && inlineMatch[2]) {
      finalize();
      current = { title: inlineMatch[1].trim() };
      descLines.push(inlineMatch[2].trim());
      finalize();
      continue;
    }

    // Case 2: Multi-line project starting with title line
    if (line.length <= 50 && !line.startsWith("•") && !line.startsWith("-") && !dateMatch && !urlMatch) {
      finalize();
      current = { title: line };
    } else if (current) {
      if (urlMatch && !current.link) {
        current.link = urlMatch[0];
      }
      if (dateMatch && !current.endDate) {
        current.endDate = dateMatch[0];
      }
      descLines.push(line.replace(/^[•\-*]\s*/, ""));
    } else {
      finalize();
      current = { title: line.slice(0, 45) };
      if (line.length > 45) {
        descLines.push(line.slice(45).trim());
      }
    }
  }

  finalize();
  return items;
}

/**
 * Main mapping entry point: converts semantic TextBlocks into structured ResumeData and previews.
 */
export function mapBlocksToResumeData(blocks: TextBlock[], rawText: string): ParsedResumeResult {
  // Extract personal info block and summary
  const personalInfoBlock = blocks.find((b) => b.type === "personalInfo");
  const summaryBlock = blocks.find((b) => b.type === "summary");

  const summaryText = summaryBlock ? summaryBlock.lines.join(" ") : "";
  const { info: personalInfo, confidence: personalInfoConfidence, reason: pReason } = parsePersonalInfo(
    personalInfoBlock ? personalInfoBlock.lines : [],
    summaryText
  );

  const sectionPreviews: ParsedSectionPreview[] = [];
  const unsortedLines: string[] = [];

  for (const block of blocks) {
    if (block.type === "personalInfo" || block.type === "summary") {
      continue;
    }

    if (block.type === "experience") {
      const items = parseExperienceItems(block.lines);
      const isHigh = items.length > 0 && items.some((i) => i.position && i.company && i.startDate);
      sectionPreviews.push({
        id: generateId("sec-exp"),
        type: "experience",
        title: block.title,
        items,
        confidence: isHigh ? "high" : items.length > 0 ? "medium" : "low",
        confidenceReason: isHigh
          ? `Detected ${items.length} job roles with dates and descriptions.`
          : `Detected ${items.length} entries. Please verify position names and dates.`,
        included: items.length > 0,
      });
    } else if (block.type === "education") {
      const items = parseEducationItems(block.lines);
      const isHigh = items.length > 0 && items.some((i) => i.degree || i.institution);
      sectionPreviews.push({
        id: generateId("sec-edu"),
        type: "education",
        title: block.title,
        items,
        confidence: isHigh ? "high" : items.length > 0 ? "medium" : "low",
        confidenceReason: isHigh
          ? `Detected ${items.length} academic credential(s).`
          : `Detected ${items.length} entries. Please check school or degree fields.`,
        included: items.length > 0,
      });
    } else if (block.type === "skills") {
      const items = parseSkillItems(block.lines);
      sectionPreviews.push({
        id: generateId("sec-sk"),
        type: "skills",
        title: block.title,
        items,
        confidence: items.length >= 3 ? "high" : items.length > 0 ? "medium" : "low",
        confidenceReason: `Extracted ${items.length} skills and proficiencies.`,
        included: items.length > 0,
      });
    } else if (block.type === "projects") {
      const items = parseProjectItems(block.lines);
      sectionPreviews.push({
        id: generateId("sec-proj"),
        type: "projects",
        title: block.title,
        items,
        confidence: items.length > 0 ? "high" : "medium",
        confidenceReason: `Extracted ${items.length} project portfolio item(s).`,
        included: items.length > 0,
      });
    } else if (block.type === "certifications") {
      const items: CertificationItem[] = block.lines
        .filter((l) => l.length >= 3 && !l.startsWith("•"))
        .map((name) => ({
          id: generateId("cert"),
          type: "certifications",
          name: name.replace(/^[•\-*]\s*/, ""),
          issuer: "",
          issueDate: "",
          expiryDate: "",
          credentialId: "",
          credentialUrl: "",
        }));
      sectionPreviews.push({
        id: generateId("sec-cert"),
        type: "certifications",
        title: block.title,
        items,
        confidence: items.length > 0 ? "medium" : "low",
        confidenceReason: `Identified ${items.length} certification listing(s).`,
        included: items.length > 0,
      });
    } else if (block.type === "languages") {
      const items: LanguageItem[] = block.lines
        .map((l) => {
          const parts = l.replace(/^[•\-*]\s*/, "").split(/[:\-–]/);
          return parts[0]?.trim() || "";
        })
        .filter(Boolean)
        .map((lang) => ({
          id: generateId("lang"),
          type: "languages",
          language: lang,
          fluency: "Fluent",
        }));
      sectionPreviews.push({
        id: generateId("sec-lang"),
        type: "languages",
        title: block.title,
        items,
        confidence: items.length > 0 ? "high" : "low",
        confidenceReason: `Found ${items.length} spoken language(s).`,
        included: items.length > 0,
      });
    } else {
      // Capture into unsorted lines
      unsortedLines.push(`[${block.title}]`, ...block.lines);
    }
  }

  // If there are unsorted lines, create an Unsorted Notes Custom Section
  if (unsortedLines.length > 0) {
    const customItems: CustomItem[] = [
      {
        id: generateId("unsorted"),
        type: "custom",
        title: "Imported Content",
        subtitle: "Review & Relocate",
        date: "",
        description: unsortedLines.join("\n"),
        fields: {},
      },
    ];
    sectionPreviews.push({
      id: generateId("sec-unsorted"),
      type: "custom",
      title: "Unsorted Notes / Review Required",
      items: customItems,
      confidence: "low",
      confidenceReason: "Content from unstructured or non-standard headers preserved here so no data is lost.",
      included: true,
    });
  }

  return {
    personalInfo,
    personalInfoConfidence,
    sections: sectionPreviews,
    rawText,
    suggestedTitle: personalInfo.fullName ? `${personalInfo.fullName} Resume` : "Imported Resume",
  };
}
