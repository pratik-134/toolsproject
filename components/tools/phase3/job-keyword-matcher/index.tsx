"use client";

import React, { useState, useMemo } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { Button } from "@/components/ui/button";
import {
  FileCheck2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Briefcase,
  FileText,
  Search,
} from "lucide-react";

const SAMPLE_JOB_DESCRIPTION = `Senior Full-Stack Software Engineer (Remote)
We are seeking an experienced Senior Software Engineer to design, architect, and scale our core SaaS platform.

Responsibilities:
• Architect resilient microservices using TypeScript, Node.js, Next.js, and PostgreSQL.
• Implement scalable GraphQL and REST APIs with comprehensive unit and integration testing (Jest, Cypress).
• Partner with Product Managers and designers in an Agile / Scrum lifecycle to deliver high-impact user experiences.
• Drive cloud infrastructure and CI/CD pipelines across AWS, Docker, and Kubernetes.
• Optimize application performance, reducing latency and maintaining 99.99% uptime.

Required Qualifications:
• 5+ years of production experience in TypeScript, React, and Node.js.
• Deep understanding of SQL databases (PostgreSQL), data modeling, and caching with Redis.
• Proven track record with CI/CD deployment pipelines, Docker containerization, and AWS services.
• Strong communication skills, cross-functional collaboration, and technical leadership.`;

const COMMON_STOPWORDS = new Set([
  "the", "and", "or", "to", "in", "a", "an", "is", "for", "with", "of", "on", "at", "by", "from",
  "as", "be", "this", "that", "it", "are", "was", "were", "will", "our", "you", "your", "we", "they",
  "their", "have", "has", "had", "been", "using", "into", "across", "must", "can", "able", "who", "all",
  "years", "experience", "seeking", "experienced", "responsibilities", "qualifications", "required",
  "strong", "plus", "proven", "deep", "work", "working", "team", "role", "help",
]);

const ACTION_VERBS = [
  "architect", "architected", "lead", "led", "spearhead", "spearheaded", "design", "designed",
  "implement", "implemented", "engineer", "engineered", "optimize", "optimized", "scale", "scaled",
  "orchestrate", "orchestrated", "deploy", "deployed", "deliver", "delivered", "automate", "automated",
  "streamline", "streamlined", "accelerate", "accelerated", "mentor", "mentored", "collaborate", "collaborated"
];

function extractKeywords(text: string): { words: string[]; phrases: string[] } {
  const clean = text.toLowerCase().replace(/[^a-z0-9+#.-]/g, " ");
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2 && !COMMON_STOPWORDS.has(t));

  // Bigrams (phrases like "ci/cd", "system design", "cross-functional")
  const rawWords = clean.split(/\s+/).filter(Boolean);
  const phrases: string[] = [];
  for (let i = 0; i < rawWords.length - 1; i++) {
    const w1 = rawWords[i];
    const w2 = rawWords[i + 1];
    if (w1 && w2 && !COMMON_STOPWORDS.has(w1) && !COMMON_STOPWORDS.has(w2)) {
      phrases.push(`${w1} ${w2}`);
    }
  }

  return { words: Array.from(new Set(tokens)), phrases: Array.from(new Set(phrases)) };
}

export default function JobKeywordMatcherTool() {
  const { resumeData } = useResumeStore();
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>(SAMPLE_JOB_DESCRIPTION);
  const [filterType, setFilterType] = useState<"all" | "missing" | "matched" | "verbs">("all");
  const [copiedReport, setCopiedReport] = useState(false);

  // Generate resume text from active resume data if available
  const handleLoadActiveResume = () => {
    const parts: string[] = [];
    if (resumeData.personalInfo.fullName) parts.push(resumeData.personalInfo.fullName);
    if (resumeData.personalInfo.title) parts.push(resumeData.personalInfo.title);
    if (resumeData.personalInfo.summary) parts.push(resumeData.personalInfo.summary);

    resumeData.sections.forEach((sec) => {
      parts.push(sec.title);
      sec.items.forEach((item: any) => {
        if (item.title) parts.push(String(item.title));
        if (item.subtitle) parts.push(String(item.subtitle));
        if (item.company) parts.push(String(item.company));
        if (item.position) parts.push(String(item.position));
        if (item.name) parts.push(String(item.name));
        if (item.description) parts.push(String(item.description));
        if (Array.isArray(item.highlights)) {
          parts.push(item.highlights.join(" "));
        }
      });
    });

    const combined = parts.filter(Boolean).join("\n\n");
    if (combined.trim()) {
      setResumeText(combined);
    } else {
      setResumeText(
        "Alex Rivera\nStaff Software Engineer\nExperienced in TypeScript, React, Next.js, and Node.js.\nArchitected microservices with PostgreSQL, Docker, and Redis.\nDelivered SaaS products leading engineering teams in Agile sprints."
      );
    }
  };

  // Perform Match Analysis
  const analysis = useMemo(() => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      return null;
    }

    const job = extractKeywords(jobDescription);
    const resumeLower = resumeText.toLowerCase();

    // Check matched vs missing keywords
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

    // Check action verbs
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
  }, [resumeText, jobDescription]);

  const handleCopyReport = async () => {
    if (!analysis) return;
    const report = [
      `=== CLEARTRIX ATS JOB KEYWORD GAP REPORT ===`,
      `Overall ATS Keyword Match Score: ${analysis.matchScore}%`,
      `Matched Keywords (${analysis.matchedKeywords.length}): ${analysis.matchedKeywords.join(", ")}`,
      `Missing Target Keywords (${analysis.missingKeywords.length}): ${analysis.missingKeywords.join(", ")}`,
      `Missing Power Verbs: ${analysis.missingVerbs.join(", ") || "None"}`,
      `\nRecommendation: Incorporate the missing keywords directly into your work experience bullet points.`,
    ].join("\n\n");

    await navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-6 font-body text-slate-900 dark:text-slate-100">
      {/* Header Info & Privacy Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-xs text-blue-900 dark:text-blue-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>100% In-Browser ATS Parsing:</strong> Compare your resume against any job description to find missing keywords and raise your ATS screening score.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadActiveResume}
            className="h-7 text-xs px-2.5 rounded-md border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100/60"
          >
            <FileText className="h-3 w-3 mr-1" /> Load Active Resume
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setJobDescription(SAMPLE_JOB_DESCRIPTION);
              handleLoadActiveResume();
            }}
            className="h-7 text-xs px-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Two Pane Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Resume Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Your Resume Text</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {resumeText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here (or click 'Load Active Resume' above)..."
            rows={10}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-y leading-relaxed"
          />
        </div>

        {/* Right: Job Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Target Job Description</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description from LinkedIn, Indeed, or company careers page..."
            rows={10}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-y leading-relaxed"
          />
        </div>
      </div>

      {/* Analysis Results */}
      {analysis ? (
        <div className="space-y-6 pt-2">
          {/* Match Score Gauge Banner */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black font-headings shadow-sm ${
                  analysis.matchScore >= 80
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-800"
                    : analysis.matchScore >= 50
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-800"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-2 border-rose-300 dark:border-rose-800"
                }`}
              >
                {analysis.matchScore}%
              </div>
              <div>
                <h3 className="font-headings text-lg font-bold text-slate-900 dark:text-white">
                  {analysis.matchScore >= 80
                    ? "High ATS Keyword Alignment"
                    : analysis.matchScore >= 50
                    ? "Moderate Alignment — Good Potential"
                    : "Significant Keyword Gaps Detected"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {analysis.matchedKeywords.length} of {analysis.totalJobKeywords} keywords found in your resume text.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyReport}
              className="gap-1.5 text-xs font-semibold rounded-lg px-3.5 h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200"
            >
              {copiedReport ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              <span>{copiedReport ? "Report Copied" : "Copy Gap Report"}</span>
            </Button>
          </div>

          {/* Keyword Category Pills Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "all", label: `All Keywords (${analysis.totalJobKeywords})` },
              { id: "missing", label: `Missing (${analysis.missingKeywords.length})` },
              { id: "matched", label: `Matched (${analysis.matchedKeywords.length})` },
              { id: "verbs", label: `Power Verbs (${analysis.missingVerbs.length} missing)` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterType === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Keyword Badges Grid */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
            {/* Missing Keywords Box */}
            {(filterType === "all" || filterType === "missing") && analysis.missingKeywords.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Missing Keywords ({analysis.missingKeywords.length})</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Keywords Box */}
            {(filterType === "all" || filterType === "matched") && analysis.matchedKeywords.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Matched Keywords ({analysis.matchedKeywords.length})</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Verbs Box */}
            {(filterType === "all" || filterType === "verbs") && analysis.missingVerbs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Recommended Action Verbs to Incorporate</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingVerbs.map((verb) => (
                    <span
                      key={verb}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60"
                    >
                      {verb}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="h-8 w-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Paste both your resume and job description above
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ClearTrix will scan both texts in local browser memory and pinpoint the exact missing skills to boost your ATS match score.
          </p>
        </div>
      )}
    </div>
  );
}
