export const COMMON_STOPWORDS = new Set([
  "the", "and", "or", "to", "in", "a", "an", "is", "for", "with", "of", "on", "at", "by", "from",
  "as", "be", "this", "that", "it", "are", "was", "were", "will", "our", "you", "your", "we", "they",
  "their", "have", "has", "had", "been", "using", "into", "across", "must", "can", "able", "who", "all",
  "years", "experience", "seeking", "experienced", "responsibilities", "qualifications", "required",
  "strong", "plus", "proven", "deep", "work", "working", "team", "role", "help",
]);

export const ACTION_VERBS = [
  "architect", "architected", "lead", "led", "spearhead", "spearheaded", "design", "designed",
  "implement", "implemented", "engineer", "engineered", "optimize", "optimized", "scale", "scaled",
  "orchestrate", "orchestrated", "deploy", "deployed", "deliver", "delivered", "automate", "automated",
  "streamline", "streamlined", "accelerate", "accelerated", "mentor", "mentored", "collaborate", "collaborated",
];

export interface KeywordExtraction {
  words: string[];
  phrases: string[];
}

export function extractKeywords(text: string): KeywordExtraction {
  const clean = text.toLowerCase().replace(/[^a-z0-9+#.-]/g, " ");
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2 && !COMMON_STOPWORDS.has(t));

  const rawWords = clean.split(/\s+/).filter(Boolean);
  const phrases: string[] = [];
  for (let i = 0; i < rawWords.length - 1; i++) {
    const w1 = rawWords[i];
    const w2 = rawWords[i + 1];
    if (w1 && w2 && !COMMON_STOPWORDS.has(w1) && !COMMON_STOPWORDS.has(w2)) {
      phrases.push(`${w1} ${w2}`);
    }
  }

  return {
    words: Array.from(new Set(tokens)),
    phrases: Array.from(new Set(phrases)),
  };
}

export interface MatchAnalysis {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedVerbs: string[];
  missingVerbs: string[];
  totalJobKeywords: number;
}

export function calculateMatchAnalysis(
  resumeText: string,
  jobDescription: string
): MatchAnalysis | null {
  if (!resumeText.trim() || !jobDescription.trim()) {
    return null;
  }

  const job = extractKeywords(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  job.words.forEach((w) => {
    if (resumeLower.includes(w)) {
      matchedKeywords.push(w);
    } else {
      missingKeywords.push(w);
    }
  });

  const total = matchedKeywords.length + missingKeywords.length;
  const matchScore = total > 0 ? Math.round((matchedKeywords.length / total) * 100) : 0;

  const jobVerbs = ACTION_VERBS.filter((v) => jobDescription.toLowerCase().includes(v));
  const matchedVerbs = jobVerbs.filter((v) => resumeLower.includes(v));
  const missingVerbs = jobVerbs.filter((v) => !resumeLower.includes(v));

  return {
    matchScore,
    matchedKeywords,
    missingKeywords,
    matchedVerbs,
    missingVerbs,
    totalJobKeywords: total,
  };
}
