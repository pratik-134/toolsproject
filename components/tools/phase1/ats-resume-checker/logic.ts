/**
 * Pure Client-Side ATS Resume Compatibility & Scoring Engine
 * Analyzes resume text against Applicant Tracking System (ATS) parsing rules:
 * - Section header recognition
 * - Contact information hygiene
 * - Power action verb strength
 * - Quantifiable metrics & business impact
 * - Word count, readability, and buzzword density
 * Zero external libraries, 100% deterministic mathematical evaluation.
 */

export interface ATSScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  status: "good" | "warning" | "critical";
}

export interface ATSRecommendation {
  type: "critical" | "warning" | "success";
  title: string;
  description: string;
}

export interface ATSScoreReport {
  overallScore: number; // 0-100
  rating: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  wordCount: number;
  readingTimeMinutes: number;
  categories: {
    contact: ATSScoreCategory;
    sections: ATSScoreCategory;
    impact: ATSScoreCategory;
    verbs: ATSScoreCategory;
    formatting: ATSScoreCategory;
  };
  detectedSections: string[];
  missingSections: string[];
  powerVerbsCount: number;
  weakVerbsCount: number;
  metricsCount: number;
  foundMetrics: string[];
  foundVerbs: string[];
  recommendations: ATSRecommendation[];
}

/* =========================================================================
   1. Lexicons: Action Verbs, Weak Phrases, Core Sections
   ========================================================================= */

const POWER_ACTION_VERBS = new Set([
  "accelerated", "achieved", "acquired", "administered", "advised", "advocated", "aligned",
  "analyzed", "architected", "audited", "automated", "boosted", "budgeted", "built", "centralized",
  "championed", "coached", "collaborated", "commissioned", "consolidated", "constructed",
  "coordinated", "crafted", "created", "decreased", "delivered", "deployed", "designed",
  "developed", "devised", "directed", "doubled", "drafted", "drove", "eliminated", "enabled",
  "engineered", "enhanced", "established", "evaluated", "exceeded", "executed", "expanded",
  "expedited", "facilitated", "forecasted", "formulated", "founded", "generated", "governed",
  "guided", "halved", "headed", "identified", "implemented", "improved", "increased", "initiated",
  "innovated", "inspected", "installed", "instituted", "integrated", "introduced", "invented",
  "launched", "led", "leveraged", "managed", "maximized", "mentored", "migrated", "minimized",
  "modernized", "negotiated", "optimized", "orchestrated", "organized", "originated", "outperformed",
  "overhauled", "oversaw", "pioneered", "planned", "produced", "programmed", "promoted", "published",
  "reduced", "refined", "refactored", "remodeled", "reorganized", "resolved", "restructured",
  "revamped", "scaled", "secured", "simplified", "slashed", "spearheaded", "standardized",
  "steered", "streamlined", "strengthened", "supervised", "surpassed", "synthesized", "trained",
  "transformed", "transitioned", "upgraded", "validated", "yielded"
]);

const WEAK_PASSIVE_PHRASES = [
  "responsible for", "duties included", "helped to", "assisted with", "worked on",
  "handled", "participated in", "served as", "was tasked with", "familiar with",
  "experienced in", "team player", "hard worker", "go-getter", "detail oriented",
  "synergy", "think outside the box", "results driven", "self-motivated"
];

const STANDARD_SECTIONS = [
  { name: "Experience", regex: /\b(?:work\s+experience|professional\s+experience|employment\s+history|experience)\b/i },
  { name: "Education", regex: /\b(?:education|academic\s+background|degrees|certifications?)\b/i },
  { name: "Skills", regex: /\b(?:technical\s+skills|core\s+competencies|skills|tools\s+&\s+technologies)\b/i },
  { name: "Summary", regex: /\b(?:professional\s+summary|executive\s+summary|summary|profile|about\s+me)\b/i },
  { name: "Projects", regex: /\b(?:projects|personal\s+projects|selected\s+work|portfolio)\b/i },
];

/* =========================================================================
   2. Pure Analysis Engine
   ========================================================================= */

export function analyzeResumeText(rawText: string): ATSScoreReport {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  if (wordCount < 10) {
    return {
      overallScore: 0,
      rating: "Poor",
      wordCount,
      readingTimeMinutes: 1,
      categories: {
        contact: { name: "Contact Info", score: 0, maxScore: 15, feedback: "Resume text too short.", status: "critical" },
        sections: { name: "Standard Headings", score: 0, maxScore: 25, feedback: "No sections detected.", status: "critical" },
        impact: { name: "Measurable Impact", score: 0, maxScore: 25, feedback: "No metrics detected.", status: "critical" },
        verbs: { name: "Action Verbs", score: 0, maxScore: 20, feedback: "No action verbs detected.", status: "critical" },
        formatting: { name: "Length & Hygiene", score: 0, maxScore: 15, feedback: "Insufficient content.", status: "critical" },
      },
      detectedSections: [],
      missingSections: STANDARD_SECTIONS.map((s) => s.name),
      powerVerbsCount: 0,
      weakVerbsCount: 0,
      metricsCount: 0,
      foundMetrics: [],
      foundVerbs: [],
      recommendations: [
        {
          type: "critical",
          title: "Incomplete Content",
          description: "Paste a complete resume or upload a document to get an ATS diagnostic score.",
        },
      ],
    };
  }

  // 1. Contact Information Evaluation (Max 15 pts)
  let contactScore = 0;
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLink = /(?:linkedin\.com\/in\/|github\.com\/|https?:\/\/|www\.)[^\s]+/i.test(text);

  if (hasEmail) contactScore += 5;
  if (hasPhone) contactScore += 5;
  if (hasLink) contactScore += 5;

  const contactCategory: ATSScoreCategory = {
    name: "Contact Information",
    score: contactScore,
    maxScore: 15,
    status: contactScore === 15 ? "good" : contactScore >= 10 ? "warning" : "critical",
    feedback:
      contactScore === 15
        ? "Complete contact header with verified email, phone, and professional link."
        : `Missing ${!hasEmail ? "email address, " : ""}${!hasPhone ? "phone number, " : ""}${!hasLink ? "LinkedIn or portfolio URL" : ""}.`,
  };

  // 2. Standard Sections Evaluation (Max 25 pts)
  const detectedSections: string[] = [];
  const missingSections: string[] = [];

  for (const s of STANDARD_SECTIONS) {
    if (s.regex.test(text)) {
      detectedSections.push(s.name);
    } else {
      missingSections.push(s.name);
    }
  }

  let sectionsScore = 0;
  if (detectedSections.includes("Experience")) sectionsScore += 10;
  if (detectedSections.includes("Education")) sectionsScore += 5;
  if (detectedSections.includes("Skills")) sectionsScore += 5;
  if (detectedSections.includes("Summary") || detectedSections.includes("Projects")) sectionsScore += 5;

  const sectionsCategory: ATSScoreCategory = {
    name: "Standard Section Headings",
    score: sectionsScore,
    maxScore: 25,
    status: sectionsScore >= 20 ? "good" : sectionsScore >= 15 ? "warning" : "critical",
    feedback:
      missingSections.length === 0
        ? "All major standard ATS headings found (Experience, Education, Skills, Summary/Projects)."
        : `Missing recommended ATS headings: ${missingSections.join(", ")}.`,
  };

  // 3. Measurable Impact & Metrics Evaluation (Max 25 pts)
  // Search for $, %, multiples (3x), or numbers >= 2 digits
  const metricRegex = /\b(?:\$\d+(?:,\d+)*(?:\.\d+)?[kKmMbB]?|\d+(?:\.\d+)?%|\d+x|\d{2,}(?:,\d{3})*)\b/g;
  const metricsMatches = text.match(metricRegex) || [];
  const foundMetrics = Array.from(new Set(metricsMatches)).slice(0, 10);
  const metricsCount = metricsMatches.length;

  let impactScore = Math.min(25, metricsCount * 5); // 5 metrics = max 25 pts
  const impactCategory: ATSScoreCategory = {
    name: "Measurable Impact & Metrics",
    score: impactScore,
    maxScore: 25,
    status: impactScore >= 20 ? "good" : impactScore >= 10 ? "warning" : "critical",
    feedback:
      metricsCount >= 4
        ? `Strong quantifiable impact with ${metricsCount} metrics (percentages, revenue, efficiency gains).`
        : `Found only ${metricsCount} quantifiable numbers. Add specific metrics (e.g. "Increased revenue by 32%").`,
  };

  // 4. Action Verbs vs Passive Phrases Evaluation (Max 20 pts)
  const foundVerbsSet = new Set<string>();
  for (const w of words) {
    const clean = w.toLowerCase().replace(/[^a-z]/g, "");
    if (POWER_ACTION_VERBS.has(clean)) {
      foundVerbsSet.add(clean);
    }
  }

  let weakVerbsCount = 0;
  for (const phrase of WEAK_PASSIVE_PHRASES) {
    if (lower.includes(phrase)) {
      weakVerbsCount++;
    }
  }

  const foundVerbs = Array.from(foundVerbsSet).slice(0, 12);
  const powerVerbsCount = foundVerbsSet.size;

  let verbsScore = Math.min(20, Math.max(0, powerVerbsCount * 3 - weakVerbsCount * 2));
  const verbsCategory: ATSScoreCategory = {
    name: "Power Action Verbs",
    score: verbsScore,
    maxScore: 20,
    status: verbsScore >= 15 ? "good" : verbsScore >= 8 ? "warning" : "critical",
    feedback:
      powerVerbsCount >= 6 && weakVerbsCount === 0
        ? `Excellent active voice with ${powerVerbsCount} strong action verbs.`
        : `Identified ${powerVerbsCount} power verbs and ${weakVerbsCount} weak passive phrases.`,
  };

  // 5. Length & Formatting Hygiene (Max 15 pts)
  let formattingScore = 15;
  let formattingFeedback = "Optimal length for ATS parser compliance.";

  if (wordCount < 300) {
    formattingScore -= 7;
    formattingFeedback = `Resume is too brief (${wordCount} words). Aim for 400-800 words for a 1-page resume.`;
  } else if (wordCount > 1200) {
    formattingScore -= 5;
    formattingFeedback = `Resume is quite lengthy (${wordCount} words). Ensure experience remains concise.`;
  }

  if (weakVerbsCount > 3) {
    formattingScore = Math.max(0, formattingScore - 3);
  }

  const formattingCategory: ATSScoreCategory = {
    name: "Length & Formatting Hygiene",
    score: Math.max(0, formattingScore),
    maxScore: 15,
    status: formattingScore >= 12 ? "good" : formattingScore >= 8 ? "warning" : "critical",
    feedback: formattingFeedback,
  };

  // Total Score Calculation
  const totalScore = contactCategory.score + sectionsCategory.score + impactCategory.score + verbsCategory.score + formattingCategory.score;
  const overallScore = Math.min(100, Math.max(0, totalScore));

  let rating: ATSScoreReport["rating"] = "Poor";
  if (overallScore >= 85) rating = "Excellent";
  else if (overallScore >= 70) rating = "Good";
  else if (overallScore >= 50) rating = "Needs Improvement";

  // Build Actionable Recommendations
  const recommendations: ATSRecommendation[] = [];

  if (!hasEmail || !hasPhone) {
    recommendations.push({
      type: "critical",
      title: "Missing Contact Essentials",
      description: "Recruiters and automated ATS parsers require an email address and direct phone number at the top of the document.",
    });
  }

  if (!hasLink) {
    recommendations.push({
      type: "warning",
      title: "Add Professional Link",
      description: "Include your LinkedIn profile, GitHub profile, or personal portfolio URL to increase recruiter engagement.",
    });
  }

  if (metricsCount < 3) {
    recommendations.push({
      type: "critical",
      title: "Quantify Your Achievements",
      description: "Bullet points without numbers look like job duties. Use metrics: 'Reduced server latency by 45%', 'Managed a $250k budget', or 'Grew user base by 3x'.",
    });
  }

  if (missingSections.length > 0) {
    recommendations.push({
      type: "warning",
      title: `Add Missing Standard Sections: ${missingSections.join(", ")}`,
      description: "ATS scanners look for standard headings like 'Work Experience', 'Education', and 'Skills' to categorize your qualifications.",
    });
  }

  if (powerVerbsCount < 5) {
    recommendations.push({
      type: "warning",
      title: "Strengthen Bullet Points with Power Verbs",
      description: "Begin each experience bullet point with an assertive action verb such as 'Spearheaded', 'Engineered', 'Optimized', or 'Orchestrated'.",
    });
  }

  if (weakVerbsCount > 0) {
    recommendations.push({
      type: "warning",
      title: "Eliminate Passive Phrases & Buzzwords",
      description: "Replace passive phrases like 'Responsible for' and generic clichés like 'team player' with tangible outcomes.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      title: "ATS Optimized & Interview Ready",
      description: "Your resume strictly adheres to high-performing ATS criteria with clear sections, quantified outcomes, and active power verbs.",
    });
  }

  return {
    overallScore,
    rating,
    wordCount,
    readingTimeMinutes,
    categories: {
      contact: contactCategory,
      sections: sectionsCategory,
      impact: impactCategory,
      verbs: verbsCategory,
      formatting: formattingCategory,
    },
    detectedSections,
    missingSections,
    powerVerbsCount,
    weakVerbsCount,
    metricsCount,
    foundMetrics,
    foundVerbs,
    recommendations,
  };
}
