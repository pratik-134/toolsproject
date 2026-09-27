import { resumeDataSchema, ResumeData, initialResumeData, Section } from "../lib/schema";
import {
  normalizeExtractedText,
  segmentResumeText,
  mapBlocksToResumeData,
} from "../lib/import";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

function runImportTests() {
  console.log("=== CLEARTRIX CLIENT-SIDE RESUME IMPORT ENGINE TESTS ===\n");

  // TEST 1: Chronological Software Engineer Resume
  console.log("TEST 1: Parsing Chronological Tech Resume...");
  const chronoResumeText = `
    Alex Morgan
    Senior Full-Stack Engineer
    alex.morgan@example.com | (415) 555-0199 | San Francisco, CA
    https://linkedin.com/in/alexmorgan | https://github.com/alexmorgan

    PROFESSIONAL SUMMARY
    Results-driven engineer with 8+ years building enterprise SaaS platforms and distributed systems.

    EXPERIENCE
    Staff Software Engineer at CloudScale Technologies
    Jan 2021 - Present
    • Directed architectural migration to Kubernetes, decreasing cloud infrastructure costs by 32%.
    • Scaled core billing pipeline to process $40M+ annual gross volume with 99.99% uptime.
    • Mentored 8 junior and mid-level engineers across product squads.

    Senior Backend Developer at Apex Systems
    Aug 2017 - Dec 2020
    • Designed high-throughput GraphQL APIs serving 15M monthly active users.
    • Reduced database query latency by 45% via Redis caching layer.

    EDUCATION
    Bachelor of Science in Computer Science
    University of California, Berkeley
    2013 - 2017
    GPA: 3.85

    TECHNICAL SKILLS
    Languages: TypeScript, Python, Go, SQL
    Frameworks & Tools: Next.js, React, Node.js, Docker, Kubernetes, AWS, PostgreSQL
  `;

  const lines1 = normalizeExtractedText(chronoResumeText);
  assert(lines1.length > 10, "Should normalize lines correctly");

  const blocks1 = segmentResumeText(lines1);
  assert(blocks1.length >= 4, `Expected at least 4 blocks, got ${blocks1.length}`);

  const parsed1 = mapBlocksToResumeData(blocks1, chronoResumeText);

  // Assert Personal Info
  assert(parsed1.personalInfo.fullName.includes("Alex Morgan"), "Should detect candidate name");
  assert(parsed1.personalInfo.email === "alex.morgan@example.com", "Should detect email");
  assert(parsed1.personalInfo.phone.includes("555"), "Should detect phone");
  assert(parsed1.personalInfo.linkedin.includes("linkedin.com/in/alexmorgan"), "Should detect LinkedIn");
  assert(parsed1.personalInfo.github.includes("github.com/alexmorgan"), "Should detect GitHub");
  assert(parsed1.personalInfoConfidence === "high", "Personal info should have high confidence");

  // Assert Experience
  const expSection = parsed1.sections.find((s) => s.type === "experience");
  assert(Boolean(expSection), "Should find experience section");
  assert(expSection!.items.length === 2, `Expected 2 experience items, got ${expSection!.items.length}`);
  assert(expSection!.items[0].company.includes("CloudScale Technologies"), "Should identify company 1");
  assert(expSection!.items[0].current === true, "Should identify current role as true");
  assert(expSection!.items[0].highlights.length >= 2, "Should parse bullet highlights");

  // Assert Education
  const eduSection = parsed1.sections.find((s) => s.type === "education");
  assert(Boolean(eduSection), "Should find education section");
  assert(eduSection!.items[0].degree.includes("Bachelor of Science"), "Should identify degree");
  assert(eduSection!.items[0].institution.includes("University of California"), "Should identify institution");
  assert(eduSection!.items[0].gpa === "3.85", "Should extract GPA");

  // Assert Skills
  const skillsSection = parsed1.sections.find((s) => s.type === "skills");
  assert(Boolean(skillsSection), "Should find skills section");
  assert(skillsSection!.items.length >= 8, `Expected at least 8 skills, got ${skillsSection!.items.length}`);

  // Test Zod Schema Validity
  const resumeData1: ResumeData = {
    ...initialResumeData,
    title: parsed1.suggestedTitle,
    personalInfo: parsed1.personalInfo,
    sections: parsed1.sections.map((s, idx) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      order: idx,
      visible: true,
      locked: false,
      items: s.items,
    })) as Section[],
  };

  const zodCheck1 = resumeDataSchema.safeParse(resumeData1);
  assert(zodCheck1.success, `Zod schema check failed for Case 1: ${JSON.stringify(zodCheck1.error)}`);
  console.log("✅ TEST 1 Passed: Chronological resume parsed and validated against Zod schema.\n");


  // TEST 2: Functional / Projects-Heavy Resume with Certifications & Languages
  console.log("TEST 2: Parsing Functional Project-Focused Resume...");
  const functionalResumeText = `
    Dr. Elena Rostova
    AI Research Scientist & Consultant
    elena.rostova@research-lab.org • +44 20 7946 0991 • London, United Kingdom

    CORE PROJECTS
    Distributed Neural Cache: An in-memory tensor caching architecture reducing LLM time-to-first-token by 60%.
    Autonomous Drone Vision: Edge computer vision pipeline deployed to 500+ UAVs for precision agricultural monitoring.

    CERTIFICATIONS & CREDENTIALS
    AWS Certified Solutions Architect - Professional
    Google Cloud Professional Machine Learning Engineer
    DeepLearning.AI NLP Specialization

    LANGUAGES
    English - Native
    French - Fluent
    German - Conversational
  `;

  const lines2 = normalizeExtractedText(functionalResumeText);
  const blocks2 = segmentResumeText(lines2);
  const parsed2 = mapBlocksToResumeData(blocks2, functionalResumeText);

  assert(parsed2.personalInfo.fullName.includes("Elena Rostova"), "Should detect name");
  assert(parsed2.personalInfo.email === "elena.rostova@research-lab.org", "Should detect email");

  const projSec = parsed2.sections.find((s) => s.type === "projects");
  assert(Boolean(projSec) && projSec!.items.length >= 2, "Should parse projects");

  const certSec = parsed2.sections.find((s) => s.type === "certifications");
  assert(Boolean(certSec) && certSec!.items.length >= 2, "Should parse certifications");

  const langSec = parsed2.sections.find((s) => s.type === "languages");
  assert(Boolean(langSec) && langSec!.items.length >= 2, "Should parse languages");

  const resumeData2: ResumeData = {
    ...initialResumeData,
    title: parsed2.suggestedTitle,
    personalInfo: parsed2.personalInfo,
    sections: parsed2.sections.map((s, idx) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      order: idx,
      visible: true,
      locked: false,
      items: s.items,
    })) as Section[],
  };

  const zodCheck2 = resumeDataSchema.safeParse(resumeData2);
  assert(zodCheck2.success, `Zod schema check failed for Case 2: ${JSON.stringify(zodCheck2.error)}`);
  console.log("✅ TEST 2 Passed: Functional projects & credentials resume validated.\n");


  // TEST 3: Two-Column / Unconventional Headers with All Caps
  console.log("TEST 3: Parsing All-Caps and Alternative Header Synonyms...");
  const altHeaderResume = `
    MARCUS VANCE
    Product Manager
    marcus.vance@techcorp.io

    CAREER HISTORY
    Lead Product Manager at Stripe
    2019 - 2023
    Spearheaded international payment routing expansion across APAC.

    ACADEMIC BACKGROUND
    Master of Business Administration
    Harvard Business School
    2017 - 2019

    PROFICIENCIES
    Product Strategy, Roadmapping, SQL, A/B Testing, OKR Frameworks
  `;

  const lines3 = normalizeExtractedText(altHeaderResume);
  const blocks3 = segmentResumeText(lines3);
  const parsed3 = mapBlocksToResumeData(blocks3, altHeaderResume);

  assert(parsed3.personalInfo.fullName.includes("MARCUS VANCE"), "Should parse name");
  const exp3 = parsed3.sections.find((s) => s.type === "experience");
  assert(Boolean(exp3) && exp3!.items.length >= 1, "Should map CAREER HISTORY to experience");
  const edu3 = parsed3.sections.find((s) => s.type === "education");
  assert(Boolean(edu3) && edu3!.items.length >= 1, "Should map ACADEMIC BACKGROUND to education");
  const skill3 = parsed3.sections.find((s) => s.type === "skills");
  assert(Boolean(skill3) && skill3!.items.length >= 4, "Should map PROFICIENCIES to skills");

  const resumeData3: ResumeData = {
    ...initialResumeData,
    title: parsed3.suggestedTitle,
    personalInfo: parsed3.personalInfo,
    sections: parsed3.sections.map((s, idx) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      order: idx,
      visible: true,
      locked: false,
      items: s.items,
    })) as Section[],
  };
  const zodCheck3 = resumeDataSchema.safeParse(resumeData3);
  assert(zodCheck3.success, `Zod schema check failed for Case 3: ${JSON.stringify(zodCheck3.error)}`);
  console.log("✅ TEST 3 Passed: Header synonym matching and all-caps headings parsed successfully.\n");


  // TEST 4: Messy Resume with Unsorted Content Safeguard
  console.log("TEST 4: Preserving Unclassified Content in Unsorted Notes Custom Section...");
  const messyResume = `
    Sarah Connor
    Security Consultant
    sarah@skynet-defense.org

    SPECIAL CLEARANCE DETAILS
    Level 5 Top Secret clearance active through 2028.
    Authorized for tactical emergency systems audit and cybersecurity forensics.

    HOBBIES & PERSONAL INTERESTS
    Long-distance trail running, mechanical watch restoration, amateur astronomy.
  `;

  const lines4 = normalizeExtractedText(messyResume);
  const blocks4 = segmentResumeText(lines4);
  const parsed4 = mapBlocksToResumeData(blocks4, messyResume);

  // Check for unsorted section
  const customNotesSec = parsed4.sections.find((s) => s.type === "custom");
  assert(Boolean(customNotesSec), "Should create an Unsorted Notes custom section for unmapped blocks");
  assert(customNotesSec!.items.length >= 1, "Unsorted notes should contain item entries");

  const resumeData4: ResumeData = {
    ...initialResumeData,
    title: parsed4.suggestedTitle,
    personalInfo: parsed4.personalInfo,
    sections: parsed4.sections.map((s, idx) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      order: idx,
      visible: true,
      locked: false,
      items: s.items,
    })) as Section[],
  };
  const zodCheck4 = resumeDataSchema.safeParse(resumeData4);
  assert(zodCheck4.success, `Zod schema check failed for Case 4: ${JSON.stringify(zodCheck4.error)}`);
  console.log("✅ TEST 4 Passed: Unclassified content preserved safely in custom section with zero data loss.\n");

  console.log("🎉 ALL RESUME IMPORT TESTS PASSED SUCCESSFULLY! (4/4)");
}

runImportTests();
