import {
  extractKeywords,
  calculateMatchAnalysis,
  COMMON_STOPWORDS,
  ACTION_VERBS,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Stopwords filtering & token extraction
  const sample = "We are seeking a senior software engineer with deep experience in React and Node.js";
  const extracted = extractKeywords(sample);

  if (extracted.words.includes("the") || extracted.words.includes("and") || extracted.words.includes("with")) {
    throw new Error("extractKeywords failed to filter stopwords");
  }
  if (!extracted.words.includes("react") || !extracted.words.includes("node.js") || !extracted.words.includes("senior")) {
    throw new Error(`Missing expected tokens: ${extracted.words.join(", ")}`);
  }

  // Test 2: Bigram phrases extraction
  if (!extracted.phrases.includes("software engineer")) {
    throw new Error(`Expected phrase 'software engineer' not found in: ${extracted.phrases.join(", ")}`);
  }

  // Test 3: Empty input handling
  if (calculateMatchAnalysis("", "Software engineer") !== null) {
    throw new Error("Expected null analysis for empty resume");
  }
  if (calculateMatchAnalysis("Software engineer", "   ") !== null) {
    throw new Error("Expected null analysis for empty job description");
  }

  // Test 4: 100% Match Scenario
  const job = "TypeScript React PostgreSQL Next.js";
  const perfectResume = "Expert in TypeScript, React, Next.js, and PostgreSQL database architecture";
  const perfectAnalysis = calculateMatchAnalysis(perfectResume, job);

  if (!perfectAnalysis || perfectAnalysis.matchScore !== 100) {
    throw new Error(`Expected 100% match score, got ${perfectAnalysis?.matchScore}`);
  }
  if (perfectAnalysis.missingKeywords.length !== 0) {
    throw new Error(`Expected 0 missing keywords, got: ${perfectAnalysis.missingKeywords.join(", ")}`);
  }

  // Test 5: 0% Match Scenario
  const zeroResume = "Baker pastry chef confectionery bread baking";
  const zeroAnalysis = calculateMatchAnalysis(zeroResume, job);

  if (!zeroAnalysis || zeroAnalysis.matchScore !== 0) {
    throw new Error(`Expected 0% match score, got ${zeroAnalysis?.matchScore}`);
  }
  if (zeroAnalysis.matchedKeywords.length !== 0) {
    throw new Error(`Expected 0 matched keywords, got: ${zeroAnalysis.matchedKeywords.join(", ")}`);
  }

  // Test 6: Partial match and action verbs
  const jobDesc = "We need an engineer to architect microservices and deploy cloud infrastructure.";
  const candidateResume = "Software engineer who will architect resilient systems.";
  const partialAnalysis = calculateMatchAnalysis(candidateResume, jobDesc);

  if (!partialAnalysis) {
    throw new Error("Expected valid analysis for partial match");
  }
  if (!partialAnalysis.matchedVerbs.includes("architect")) {
    throw new Error("Expected 'architect' to be in matchedVerbs");
  }
  if (!partialAnalysis.missingVerbs.includes("deploy")) {
    throw new Error("Expected 'deploy' to be in missingVerbs");
  }

  return true;
}
