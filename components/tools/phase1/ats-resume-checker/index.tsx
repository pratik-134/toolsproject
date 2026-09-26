"use client";

import React, { useState } from "react";
import { analyzeResumeText, ATSScoreReport } from "./logic";
import {
  FileCheck,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Zap,
  BarChart3,
  Award,
} from "lucide-react";
import Link from "next/link";

interface PresetSample {
  title: string;
  expectedScore: string;
  role: string;
  text: string;
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    title: "Senior Cloud Engineer",
    expectedScore: "94/100",
    role: "Senior Engineering",
    text: `Alex Morgan
alex.morgan@example.com | (555) 234-5678 | linkedin.com/in/alexmorgan | San Francisco, CA

Professional Summary
Results-oriented Senior Software Engineer with 8+ years of experience architecting distributed cloud systems. Proven track record of improving system performance by 40% and leading high-performing engineering teams.

Work Experience
Senior Software Engineer | TechScale Inc. | 2021 - Present
- Architected and deployed microservices architecture handling 150M daily API requests with 99.99% uptime.
- Spearheaded migration to Kubernetes, decreasing cloud infrastructure costs by $120,000 annually.
- Optimized database query indexes, accelerating search response times by 3x across 12 services.
- Mentored 6 junior engineers and established automated CI/CD deployment pipelines.

Software Engineer | CloudBase Systems | 2017 - 2021
- Engineered high-throughput payment processing pipeline processing over $45M in transactions.
- Automated unit and integration testing suite, reducing production defect rate by 65%.
- Collaborated with product management to deliver 14 core features ahead of schedule.

Education
Bachelor of Science in Computer Science | University of California, Berkeley | 2017

Technical Skills
Languages: TypeScript, Go, Python, SQL, C++
Frameworks & Tools: React, Next.js, Node.js, Docker, Kubernetes, AWS, PostgreSQL, Redis`,
  },
  {
    title: "Marketing Growth Lead",
    expectedScore: "82/100",
    role: "Digital Marketing",
    text: `Sarah Jenkins
sarah.jenkins@marketing.io | (555) 890-1234 | linkedin.com/in/sarahjenkins | New York, NY

Professional Summary
Performance marketing specialist with 5 years of experience driving user acquisition and brand awareness. Managed multimillion-dollar ad budgets with an average 3.8x ROAS.

Work Experience
Growth Marketing Manager | Apex Brands | 2022 - Present
- Spearheaded digital acquisition campaigns across Meta and Google Ads, generating $3.2M in annual recurring revenue.
- Increased organic search traffic by 85% through technical SEO restructuring and content strategy.
- Implemented automated email nurturing flows that boosted conversion rates by 28%.
- Supervised a team of 4 content creators and media buyers.

Marketing Associate | Nova Media | 2020 - 2022
- Executed influencer marketing partnerships with 50+ key creators, driving 120,000 new site visits.
- Optimized landing page sales funnels, elevating sign-up completion by 19%.

Education
Bachelor of Arts in Communications | New York University | 2020

Core Skills
Paid Acquisition, SEO Optimization, Google Analytics, SQL, HubSpot, Meta Ads Manager, A/B Testing`,
  },
  {
    title: "Unformatted Draft",
    expectedScore: "42/100",
    role: "Draft",
    text: `John Doe
Looking for a job in web development.

Experience
Worked at local company.
Responsible for helping with tasks and was a great team player.
Assisted with website bug fixes and participated in meetings.
Worked hard every day and handled daily client requests.`,
  },
];

export default function ATSResumeCheckerTool() {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [resumeText, setResumeText] = useState(PRESET_SAMPLES[0]?.text ?? "");
  const [report, setReport] = useState<ATSScoreReport>(() =>
    analyzeResumeText(PRESET_SAMPLES[0]?.text ?? "")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = (textToAnalyze: string) => {
    setErrorMsg(null);
    const rep = analyzeResumeText(textToAnalyze);
    setReport(rep);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setResumeText(val);
    handleAnalyze(val);
  };

  const handleLoadPreset = (preset: PresetSample) => {
    setResumeText(preset.text);
    handleAnalyze(preset.text);
    setActiveTab("paste");
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStatus("Processing document...");

    try {
      if (file.name.endsWith(".txt")) {
        const text = await file.text();
        setResumeText(text);
        handleAnalyze(text);
        setActiveTab("paste");
      } else {
        const { parseResumeFile } = await import("@/lib/import");
        const parsed = await parseResumeFile(file, (status) => {
          setLoadingStatus(status);
        });
        setResumeText(parsed.rawText);
        handleAnalyze(parsed.rawText);
        setActiveTab("paste");
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to parse document. Please upload a valid PDF or DOCX file."
      );
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500";
    if (score >= 60) return "text-amber-500 border-amber-500";
    return "text-rose-500 border-rose-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileCheck className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              ATS Resume Checker & Score Analyzer
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            Audit your resume against Applicant Tracking System (ATS) parsing rules with an
            instant 0-100 compatibility score. 100% private, zero uploads.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full w-fit">
          <ShieldCheck className="h-4 w-4" />
          <span>Local In-Memory Audit</span>
        </div>
      </div>

      {/* Preset Quick-Test Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Sample Resumes to Test
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_SAMPLES.map((p) => (
            <button
              key={p.title}
              onClick={() => handleLoadPreset(p)}
              className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 bg-white dark:bg-slate-900 transition-all text-xs group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate">
                  {p.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {p.expectedScore}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {p.role} benchmark template
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Mode Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("paste")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "paste"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <FileText className="h-4 w-4" />
          Paste Resume Text
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "upload"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload PDF or DOCX File
        </button>
      </div>

      {/* Input Workspace */}
      {activeTab === "paste" ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-1">
            <span>Edit or paste your resume content below:</span>
            <span>
              {report.wordCount} words • ~{report.readingTimeMinutes} min read
            </span>
          </div>
          <textarea
            value={resumeText}
            onChange={handleTextChange}
            rows={10}
            placeholder="Paste your full resume text here (Contact info, Summary, Experience, Education, Skills)..."
            className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl p-10 text-center transition-colors bg-slate-50 dark:bg-slate-900/50"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Drag & drop your resume PDF or DOCX file
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Parsed 100% locally in browser memory. No data is uploaded to any server.
              </p>
            </div>
            <label className="cursor-pointer mt-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-xl transition-colors">
              Choose File
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
            </label>

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium mt-3">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>{loadingStatus}</span>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-500 font-medium mt-2">{errorMsg}</p>
            )}
          </div>
        </div>
      )}

      {/* ATS Score Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Big Overall Score Gauge */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall ATS Compatibility
          </div>

          <div
            className={`w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center ${getScoreColor(
              report.overallScore
            )}`}
          >
            <span className="text-4xl font-extrabold tracking-tight">
              {report.overallScore}
            </span>
            <span className="text-xs font-semibold uppercase text-slate-400">/ 100</span>
          </div>

          <div className="space-y-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getScoreBg(
                report.overallScore
              )}`}
            >
              {report.rating}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
              {report.overallScore >= 80
                ? "Excellent ATS optimization. Highly likely to pass automated parsing filters."
                : report.overallScore >= 60
                ? "Good baseline, but missing key quantifiable metrics or standard headings."
                : "High risk of automated rejection. Requires formatting and content fixes."}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-left text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-500 block text-[11px]">Power Verbs</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {report.powerVerbsCount}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-500 block text-[11px]">Metrics Found</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {report.metricsCount}
              </span>
            </div>
          </div>

          {/* CTA to Builder */}
          <Link
            href="/editor"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl shadow-sm transition-colors mt-2"
          >
            <Sparkles className="h-4 w-4" />
            Fix & Edit in Resume Builder
          </Link>
        </div>

        {/* Right Column (2 cols): Category Breakdown & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Progress Bars */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Category Breakdown
            </h3>

            <div className="space-y-3">
              {Object.values(report.categories).map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {cat.name}
                    </span>
                    <span className="font-bold font-mono text-slate-600 dark:text-slate-300">
                      {cat.score} / {cat.maxScore} pts
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        cat.status === "good"
                          ? "bg-emerald-500"
                          : cat.status === "warning"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {cat.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations Checklist */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Actionable Fixes & Strengths
            </h3>

            <div className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                    rec.type === "critical"
                      ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200"
                      : rec.type === "warning"
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200"
                      : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  {rec.type === "critical" && (
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  {rec.type === "warning" && (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  {rec.type === "success" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-0.5">
                    <div className="font-bold">{rec.title}</div>
                    <p className="opacity-90 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detected Signals Tag Clouds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Power Verbs Identified */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Detected Power Action Verbs
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {report.foundVerbs.length} verbs
            </span>
          </div>
          {report.foundVerbs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {report.foundVerbs.map((v) => (
                <span
                  key={v}
                  className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-mono capitalize"
                >
                  {v}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No strong action verbs found. Start bullet points with words like
              &quot;Architected&quot;, &quot;Spearheaded&quot;, or &quot;Optimized&quot;.
            </p>
          )}
        </div>

        {/* Quantifiable Metrics Identified */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-emerald-500" />
              Detected Quantifiable Metrics
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {report.foundMetrics.length} metrics
            </span>
          </div>
          {report.foundMetrics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {report.foundMetrics.map((m, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-bold"
                >
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No quantifiable numbers detected. Add percentages (e.g. +35%), revenue ($500k),
              or multipliers (3x).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
