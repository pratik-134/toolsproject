import { SectionType } from "../schema";

export interface TextBlock {
  type: SectionType | "personalInfo" | "summary" | "unknown";
  title: string;
  lines: string[];
}

interface SectionRule {
  type: SectionType | "summary";
  title: string;
  regex: RegExp;
}

const SECTION_RULES: SectionRule[] = [
  {
    type: "summary",
    title: "Professional Summary",
    regex: /^(?:professional\s+summary|executive\s+summary|summary\s+of\s+qualifications|career\s+summary|personal\s+summary|summary|profile|professional\s+profile|personal\s+profile|career\s+profile|about\s+me|overview|career\s+objective|objective):?$/i,
  },
  {
    type: "experience",
    title: "Work Experience",
    regex: /^(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history|career\s+history|relevant\s+experience|professional\s+background|work\s+background|experience):?$/i,
  },
  {
    type: "education",
    title: "Education",
    regex: /^(?:education\s+&\s+credentials|education\s+and\s+credentials|academic\s+background|academic\s+qualifications|academic\s+history|qualifications|degrees\s+&\s+education|degrees|education):?$/i,
  },
  {
    type: "skills",
    title: "Skills & Proficiencies",
    regex: /^(?:skills\s+(?:&|and)\s+proficiencies|technical\s+skills|core\s+competencies|key\s+skills|skills\s+(?:&|and)\s+abilities|professional\s+skills|technical\s+proficiencies|core\s+proficiencies|proficiencies|competencies|technologies|tools\s+(?:&|and)\s+technologies|tools|areas\s+of\s+expertise|expertise|programming\s+languages|skills):?$/i,
  },
  {
    type: "projects",
    title: "Projects",
    regex: /^(?:core\s+projects|key\s+projects|selected\s+projects|technical\s+projects|personal\s+projects|featured\s+projects|project\s+experience|notable\s+projects|portfolio|projects):?$/i,
  },
  {
    type: "certifications",
    title: "Certifications",
    regex: /^(?:certifications\s+(?:&|and)\s+credentials|credentials\s+(?:&|and)\s+certifications|certifications\s+(?:&|and)\s+licenses|licenses\s+(?:&|and)\s+certifications|certifications|licenses|credentials|accreditations):?$/i,
  },
  {
    type: "languages",
    title: "Languages",
    regex: /^(?:languages\s+spoken|language\s+proficiencies|language\s+skills|languages):?$/i,
  },
  {
    type: "awards",
    title: "Awards & Honors",
    regex: /^(?:awards\s+&\s+honors|honors\s+&\s+awards|awards|honors|achievements|recognitions|accolades):?$/i,
  },
  {
    type: "publications",
    title: "Publications",
    regex: /^(?:selected\s+publications|research\s+publications|publications|papers|articles):?$/i,
  },
  {
    type: "volunteer",
    title: "Volunteering",
    regex: /^(?:volunteer\s+experience|community\s+involvement|volunteer\s+work|volunteering):?$/i,
  },
  {
    type: "interests",
    title: "Interests & Hobbies",
    regex: /^(?:interests\s+&\s+hobbies|hobbies\s+&\s+interests|personal\s+interests|hobbies|interests|activities):?$/i,
  },
  {
    type: "references",
    title: "References",
    regex: /^(?:professional\s+references|references):?$/i,
  },
];

/**
 * Normalizes raw extracted text from PDF or DOCX:
 * - Unifies Unicode bullets, quotation marks, and dashes
 * - Removes footer noise like "Page 1 of 2"
 * - Trims excessive whitespace
 */
export function normalizeExtractedText(raw: string): string[] {
  const cleaned = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u25B6]/g, "•")
    .replace(/\t/g, " ");

  const lines = cleaned.split("\n").map((l) => l.trim());

  // Filter out page footers like "Page 1 of 2" or empty runs
  return lines.filter((line) => {
    if (!line) return false;
    if (/^page\s+\d+\s*(?:of|\/)\s*\d+$/i.test(line)) return false;
    return true;
  });
}

function matchSectionHeader(line: string): { type: SectionType | "summary"; title: string } | null {
  // Check length constraint — headers are rarely over 45 chars
  if (line.length > 45) return null;

  // Don't treat bullet points or sentences as headers
  if (line.startsWith("•") || line.startsWith("-") || line.endsWith(".")) return null;
  // Don't treat date lines as headers
  if (/\b(?:19|20)\d{2}\b/.test(line) && /[-–to]/i.test(line)) return null;

  const normalized = line.replace(/^[\s#*_-]+|[\s#*_-]+$/g, "").trim();

  for (const rule of SECTION_RULES) {
    if (rule.regex.test(normalized)) {
      return { type: rule.type, title: rule.title };
    }
  }

  return null;
}

function isLikelyCustomHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 45) return false;
  if (/^[•\-*|]/.test(trimmed)) return false;
  if (/@|https?:\/\/|www\./i.test(trimmed)) return false;
  if (/\b\d{4}\b/.test(trimmed)) return false;

  // ALL CAPS words e.g. "SPECIAL CLEARANCE DETAILS"
  const isAllCaps = /^[A-Z0-9\s&/()–-]+$/.test(trimmed) && /[A-Z]{2,}/.test(trimmed) && trimmed.split(/\s+/).length <= 6;
  // Capitalized Title ending with colon e.g. "Clearance Details:"
  const isHeaderEndingColon = /^[A-Z][a-zA-Z0-9\s&/()–-]+:$/.test(trimmed) && trimmed.split(/\s+/).length <= 6;

  return isAllCaps || isHeaderEndingColon;
}

/**
 * Segments normalized resume lines into semantic blocks based on detected section headers.
 */
export function segmentResumeText(lines: string[]): TextBlock[] {
  const blocks: TextBlock[] = [];
  let currentBlock: TextBlock = {
    type: "personalInfo",
    title: "Personal Information",
    lines: [],
  };

  for (const line of lines) {
    if (!line) continue;
    const headerMatch = matchSectionHeader(line);

    if (headerMatch) {
      // If previous block has lines, push it
      if (currentBlock.lines.length > 0) {
        blocks.push(currentBlock);
      }

      currentBlock = {
        type: headerMatch.type,
        title: headerMatch.title,
        lines: [],
      };
    } else if (isLikelyCustomHeader(line) && currentBlock.lines.length >= 2) {
      if (currentBlock.lines.length > 0) {
        blocks.push(currentBlock);
      }

      currentBlock = {
        type: "custom",
        title: line.replace(/:$/, "").trim(),
        lines: [],
      };
    } else {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock.lines.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks;
}
