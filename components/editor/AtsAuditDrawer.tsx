"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  ArrowRight,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

const STRONG_VERBS = [
  "spearheaded",
  "engineered",
  "orchestrated",
  "architected",
  "accelerated",
  "optimized",
  "delivered",
  "streamlined",
  "championed",
  "implemented",
  "pioneered",
  "mentored",
  "transformed",
  "automated",
];

export const AtsAuditDrawer: React.FC = () => {
  const { resumeData, isAtsAuditOpen, setAtsAuditOpen, setActiveSectionId } = useResumeStore();

  if (!isAtsAuditOpen) return null;

  const { personalInfo, sections } = resumeData;

  // Run ATS Quality Audit Checks
  const checks: {
    id: string;
    title: string;
    description: string;
    passed: boolean;
    recommendation: string;
    targetSectionId?: string;
  }[] = [];

  // Check 1: Contact Information
  const hasEmail = Boolean(personalInfo.email?.trim());
  const hasPhone = Boolean(personalInfo.phone?.trim());
  const hasLocation = Boolean(personalInfo.location?.trim());
  const contactPassed = hasEmail && hasPhone && hasLocation;
  checks.push({
    id: "contact",
    title: "Essential Contact Information",
    description: "Recruiters and automated parsers require email, phone, and geographic location.",
    passed: contactPassed,
    recommendation: contactPassed
      ? "All essential contact fields are complete."
      : "Ensure email, phone number, and location (city/state) are populated.",
  });

  // Check 2: Professional Summary
  const summaryLength = personalInfo.summary?.trim().split(/\s+/).length || 0;
  const summaryPassed = summaryLength >= 25 && summaryLength <= 120;
  checks.push({
    id: "summary",
    title: "Executive Summary Calibration",
    description: "Optimal professional summaries are between 25 and 100 words in length.",
    passed: summaryPassed,
    recommendation:
      summaryLength === 0
        ? "Add a 2-3 sentence executive summary highlighting your unique value proposition."
        : summaryLength < 25
        ? "Your summary is slightly brief. Expand with your core specializations and top accomplishments."
        : summaryLength > 120
        ? "Your summary is lengthy. Condense to under 100 words for recruiter skimmability."
        : "Summary length is ideal for ATS parsers and hiring managers.",
  });

  // Check 3: Work Experience
  const expSection = sections.find((s) => s.type === "experience");
  const expItems = expSection?.items || [];
  const expPassed = expItems.length >= 1;
  checks.push({
    id: "experience",
    title: "Work Experience Section",
    description: "Chronological work history is the single most weighted ATS parsing category.",
    passed: expPassed,
    recommendation: expPassed
      ? `${expItems.length} employment ${expItems.length === 1 ? "entry" : "entries"} documented.`
      : "Add at least one professional work experience entry.",
    targetSectionId: expSection?.id,
  });

  // Check 4: Measurable Achievements / Quantified Metrics
  let metricsCount = 0;
  let totalBullets = 0;
  expItems.forEach((item: any) => {
    (item.highlights || []).forEach((h: string) => {
      totalBullets++;
      if (/\d+[%$kKmMbB]?|\$\d+/.test(h)) {
        metricsCount++;
      }
    });
  });
  const metricsPassed = metricsCount >= 2;
  checks.push({
    id: "metrics",
    title: "Quantifiable Impact & Metrics",
    description: "Resumes with numbers, percentages, and dollar figures rank in the top 10% of candidates.",
    passed: metricsPassed,
    recommendation: metricsPassed
      ? `Identified ${metricsCount} bullet points containing measurable achievements.`
      : "Quantify your achievements with numbers (e.g., 'reduced latency by 35%', 'managed $500k budget').",
    targetSectionId: expSection?.id,
  });

  // Check 5: Action Verbs
  let strongVerbsFound = 0;
  expItems.forEach((item: any) => {
    (item.highlights || []).forEach((h: string) => {
      const lower = h.toLowerCase();
      STRONG_VERBS.forEach((v) => {
        if (lower.includes(v)) strongVerbsFound++;
      });
    });
  });
  const verbsPassed = strongVerbsFound >= 2;
  checks.push({
    id: "verbs",
    title: "Power Action Verbs",
    description: "Strong verbs like 'Spearheaded', 'Engineered', and 'Architected' signal initiative.",
    passed: verbsPassed,
    recommendation: verbsPassed
      ? `Found ${strongVerbsFound} strong action verbs across your highlights.`
      : "Begin bullet points with dynamic past-tense action verbs instead of passive phrases.",
    targetSectionId: expSection?.id,
  });

  // Check 6: Core Skills
  const skillsSection = sections.find((s) => s.type === "skills");
  const skillsCount = skillsSection?.items?.length || 0;
  const skillsPassed = skillsCount >= 5;
  checks.push({
    id: "skills",
    title: "Key Skills & Core Competencies",
    description: "Applicant Tracking Systems scan for 5+ core skills to match job descriptions.",
    passed: skillsPassed,
    recommendation: skillsPassed
      ? `${skillsCount} skills listed.`
      : "Add at least 5 relevant technical or domain skills to pass ATS keyword thresholds.",
    targetSectionId: skillsSection?.id,
  });

  // Check 7: Education
  const eduSection = sections.find((s) => s.type === "education");
  const eduPassed = (eduSection?.items?.length || 0) >= 1;
  checks.push({
    id: "education",
    title: "Education Credentials",
    description: "Academic background or certifications validate foundational qualifications.",
    passed: eduPassed,
    recommendation: eduPassed ? "Education history present." : "Add your degree, university, or boot camp.",
    targetSectionId: eduSection?.id,
  });

  // Calculate ATS Score
  const passedCount = checks.filter((c) => c.passed).length;
  const atsScore = Math.round((passedCount / checks.length) * 100);

  const grade =
    atsScore >= 90 ? "A+ (Excellent)" : atsScore >= 75 ? "B+ (Strong)" : atsScore >= 50 ? "C (Fair)" : "Needs Attention";

  const gradeColor =
    atsScore >= 80 ? "text-blue-600" : atsScore >= 50 ? "text-amber-600" : "text-slate-600";

  const handleJump = (sectionId?: string) => {
    if (sectionId) {
      setActiveSectionId(sectionId);
      const el = document.getElementById(`editor-section-${sectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setAtsAuditOpen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150 no-print select-none">
      <div className="w-full max-w-md h-full bg-white text-slate-900 border-l border-slate-200 p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-slate-900">ATS & Quality Audit</h3>
                <p className="text-xs text-slate-500">Real-time parser compatibility scan</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAtsAuditOpen(false)}
              className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Score Badge Banner */}
          <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Overall ATS Score</span>
              <span className={`text-3xl font-extrabold tracking-tight ${gradeColor}`}>
                {atsScore}%
              </span>
              <span className="text-xs text-slate-600 block mt-0.5 font-medium">{grade}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-700 font-semibold font-mono block">
                {passedCount} of {checks.length} checks passed
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">100% Client-Side Engine</span>
            </div>
          </div>

          {/* Audit Checklist */}
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Audit Breakdown
            </h4>

            <div className="space-y-2">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className={`p-3.5 rounded-lg border text-xs transition-all ${
                    check.passed
                      ? "border-slate-200 bg-white shadow-2xs"
                      : "border-amber-200 bg-amber-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {check.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-900 text-xs">{check.title}</span>
                    </div>

                    {check.targetSectionId && !check.passed && (
                      <button
                        onClick={() => handleJump(check.targetSectionId)}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 shrink-0 font-medium"
                      >
                        <span>Fix</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{check.description}</p>
                  <p
                    className={`text-xs mt-1.5 font-medium ${
                      check.passed ? "text-blue-700" : "text-amber-800"
                    }`}
                  >
                    • {check.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
          <span className="text-slate-400 text-xs">Updated live on every edit</span>
          <Button
            size="sm"
            onClick={() => setAtsAuditOpen(false)}
            className="h-8 px-4 text-xs bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:bg-blue-800 shadow-xs transition-colors"
          >
            Close Audit
          </Button>
        </div>
      </div>
    </div>
  );
};
