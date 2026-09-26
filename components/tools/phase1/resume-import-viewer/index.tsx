"use client";

import React, { useState } from "react";
import { inspectResumeData, ResumeInspectionReport } from "./logic";
import type { ParsedResumeResult } from "@/lib/import";
import { personalInfoSchema } from "@/lib/schema";
import {
  FileSearch,
  Upload,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Code2,
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface PresetSample {
  name: string;
  role: string;
  data: ParsedResumeResult;
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    name: "Elena Rostova",
    role: "Staff Infrastructure Engineer",
    data: {
      personalInfo: personalInfoSchema.parse({
        fullName: "Elena Rostova",
        email: "elena.rostova@cloudscale.io",
        phone: "+1 (415) 890-4321",
        location: "Seattle, WA",
        website: "https://rostova.dev",
      }),
      personalInfoConfidence: "high",
      suggestedTitle: "Elena Rostova - Staff Infrastructure Engineer",
      rawText: "Elena Rostova | elena.rostova@cloudscale.io | (415) 890-4321...",
      sections: [
        {
          id: "exp-1",
          type: "experience",
          title: "Professional Experience",
          confidence: "high",
          confidenceReason: "Section header matched",
          included: true,
          items: [
            {
              company: "CloudScale Systems",
              position: "Staff Infrastructure Engineer",
              location: "Seattle, WA",
              startDate: "2021",
              endDate: "Present",
              description:
                "• Architected multi-region Kubernetes platform serving 250M daily requests with 99.999% reliability.\n• Reduced annual cloud spend by $340,000 through automated spot instance scheduling.\n• Mentored 8 platform engineers on distributed systems observability and chaos engineering.",
            },
            {
              company: "DataMesh Corp",
              position: "Senior DevOps Engineer",
              location: "San Francisco, CA",
              startDate: "2018",
              endDate: "2021",
              description:
                "• Designed automated GitOps deployment pipeline using ArgoCD and Terraform.\n• Migrated 60 legacy microservices from monolithic EC2 instances to containerized ECS.",
            },
          ],
        },
        {
          id: "edu-1",
          type: "education",
          title: "Education",
          confidence: "high",
          confidenceReason: "Section header matched",
          included: true,
          items: [
            {
              institution: "University of Washington",
              degree: "M.S. in Computer Science & Engineering",
              location: "Seattle, WA",
              startDate: "2016",
              endDate: "2018",
            },
            {
              institution: "UC Berkeley",
              degree: "B.S. in Electrical Engineering & Computer Sciences",
              location: "Berkeley, CA",
              startDate: "2012",
              endDate: "2016",
            },
          ],
        },
        {
          id: "skills-1",
          type: "skills",
          title: "Core Competencies & Technologies",
          confidence: "high",
          confidenceReason: "Section header matched",
          included: true,
          items: [
            { name: "Kubernetes" },
            { name: "Terraform" },
            { name: "Go" },
            { name: "Python" },
            { name: "AWS Cloud" },
            { name: "Docker" },
            { name: "Prometheus" },
            { name: "Kafka" },
            { name: "Linux Systems" },
          ],
        },
      ],
    },
  },
  {
    name: "Marcus Aurelius Chen",
    role: "Senior Product Marketing Manager",
    data: {
      personalInfo: personalInfoSchema.parse({
        fullName: "Marcus Aurelius Chen",
        email: "marcus.chen@growthmetrics.com",
        phone: "+1 (212) 555-7890",
        location: "New York, NY",
        website: "https://linkedin.com/in/marcuschen",
      }),
      personalInfoConfidence: "high",
      suggestedTitle: "Marcus Chen - Product Marketing",
      rawText: "Marcus Aurelius Chen | Product Marketing...",
      sections: [
        {
          id: "exp-2",
          type: "experience",
          title: "Work Experience",
          confidence: "high",
          confidenceReason: "Section header matched",
          included: true,
          items: [
            {
              company: "SaaS Rocket",
              position: "Lead Product Marketer",
              location: "New York, NY",
              startDate: "2022",
              endDate: "Present",
              description:
                "• Directed go-to-market product launch generating $1.8M ARR in first 90 days.\n• Spearheaded repositioning campaign resulting in a 42% lift in qualified enterprise pipeline.",
            },
          ],
        },
        {
          id: "edu-2",
          type: "education",
          title: "Education",
          confidence: "high",
          confidenceReason: "Section header matched",
          included: true,
          items: [
            {
              institution: "Columbia University",
              degree: "B.A. in Economics & Strategic Communications",
              location: "New York, NY",
              startDate: "2017",
              endDate: "2021",
            },
          ],
        },
        {
          id: "skills-2",
          type: "skills",
          title: "Skills & Tooling",
          confidence: "high",
          confidenceReason: "Section header matched",
          included: true,
          items: [
            { name: "Go-to-Market Strategy" },
            { name: "Competitive Analysis" },
            { name: "HubSpot" },
            { name: "Google Analytics 4" },
            { name: "Salesforce" },
            { name: "Content Strategy" },
          ],
        },
      ],
    },
  },
];

export default function ResumeImportViewerTool() {
  const [activeTab, setActiveTab] = useState<"visual" | "json" | "raw" | "diagnostics">("visual");
  const [parsedData, setParsedData] = useState<ParsedResumeResult>(PRESET_SAMPLES[0]!.data);
  const [report, setReport] = useState<ResumeInspectionReport>(() =>
    inspectResumeData(PRESET_SAMPLES[0]!.data)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [copiedJson, setCopiedJson] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateParsedData = (data: ParsedResumeResult) => {
    setParsedData(data);
    setReport(inspectResumeData(data));
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStatus("Reading document in memory...");

    try {
      if (file.name.endsWith(".json")) {
        const text = await file.text();
        const json = JSON.parse(text) as ParsedResumeResult;
        updateParsedData(json);
      } else {
        const { parseResumeFile } = await import("@/lib/import");
        const parsed = await parseResumeFile(file, (status) => {
          setLoadingStatus(status);
        });
        updateParsedData(parsed);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Failed to parse document. Please upload a valid PDF, DOCX, or JSON resume."
      );
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(parsedData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(parsedData.personalInfo.fullName || "resume").toLowerCase().replace(/[^a-z0-9]/g, "_")}_schema.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <FileSearch className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Resume PDF & DOCX Import Inspector
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            Inspect, validate, and convert resume files into structured JSON schemas 100% locally.
            No server uploads, complete memory privacy.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1.5 rounded-full w-fit">
          <ShieldCheck className="h-4 w-4" />
          <span>Local Client-Side Parser</span>
        </div>
      </div>

      {/* Preset Quick-Test Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Try Sample Parsed Resumes
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_SAMPLES.map((p) => (
            <button
              key={p.name}
              onClick={() => updateParsedData(p.data)}
              className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 bg-white dark:bg-slate-900 transition-all text-xs group"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                {p.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {p.role} • {p.data.sections.length} structured sections
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
        }}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl p-6 text-center transition-colors bg-slate-50 dark:bg-slate-900/50"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-2.5 bg-primary/10 text-primary rounded-full">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Drag & drop your resume (PDF, DOCX, or JSON)
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Extracted in browser memory using WebAssembly & standard client engines.
            </p>
          </div>
          <label className="cursor-pointer mt-1 px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-xl transition-colors">
            Choose Resume File
            <input
              type="file"
              accept=".pdf,.docx,.json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />
          </label>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-primary font-medium mt-2">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>{loadingStatus}</span>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-500 font-medium mt-2">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("visual")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "visual"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Visual Breakdown
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "json"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            JSON Schema
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "raw"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Extracted Text
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "diagnostics"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Diagnostics ({report.overallExtractionQuality})
          </button>
        </div>

        {/* Builder CTA */}
        <Link
          href="/editor"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Edit in Mindkit Resume Builder
        </Link>
      </div>

      {/* Tab 1: Visual Resume Breakdown */}
      {activeTab === "visual" && (
        <div className="space-y-4">
          {/* Personal Info Header Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-primary/10 text-primary rounded-lg">
                  <User className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {parsedData.personalInfo.fullName || "Unnamed Candidate"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Confidence: {parsedData.personalInfoConfidence}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-500 text-[11px] block">Email</span>
                <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                  {parsedData.personalInfo.email || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Phone</span>
                <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                  {parsedData.personalInfo.phone || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Location</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {parsedData.personalInfo.location || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Website / Portfolio</span>
                <span className="font-medium text-primary truncate block">
                  {parsedData.personalInfo.website ? (
                    <a
                      href={parsedData.personalInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      {parsedData.personalInfo.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Structured Sections */}
          {parsedData.sections.map((sec) => (
            <div
              key={sec.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {sec.type === "experience" && (
                    <span className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
                      <Briefcase className="h-4 w-4" />
                    </span>
                  )}
                  {sec.type === "education" && (
                    <span className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg">
                      <GraduationCap className="h-4 w-4" />
                    </span>
                  )}
                  {sec.type === "skills" && (
                    <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                      <Wrench className="h-4 w-4" />
                    </span>
                  )}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {sec.title}
                  </h4>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {sec.items.length} items • {sec.confidence} confidence
                </span>
              </div>

              {/* Items Render */}
              {sec.type === "skills" ? (
                <div className="flex flex-wrap gap-1.5">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {sec.items.map((item: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
                    >
                      {item.name || item.title || JSON.stringify(item)}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {sec.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1 text-xs"
                    >
                      <div className="flex flex-wrap justify-between items-baseline gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {item.position || item.degree || item.title || "Position / Degree"}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {item.startDate ? `${item.startDate} — ${item.endDate || "Present"}` : ""}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 font-medium">
                        {item.company || item.institution || item.organization || ""}
                        {item.location ? ` • ${item.location}` : ""}
                      </div>
                      {item.description && (
                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line pt-1 text-[11px] leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Structured JSON */}
      {activeTab === "json" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Mindkit Standard Resume Schema v1.0
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
              >
                {copiedJson ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedJson ? "Copied!" : "Copy JSON"}
              </button>
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download File
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 3: Raw Extracted Text */}
      {activeTab === "raw" && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Extracted Text Stream
          </span>
          <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 max-h-[500px] overflow-y-auto">
            {parsedData.rawText || "No raw text extracted."}
          </pre>
        </div>
      )}

      {/* Tab 4: Diagnostics */}
      {activeTab === "diagnostics" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Extraction Quality Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 block text-[11px]">Quality Rating</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-sm">
                  {report.overallExtractionQuality}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 block text-[11px]">Total Sections</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {report.totalSections}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 block text-[11px]">Experience Items</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {report.totalExperienceItems}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 block text-[11px]">Skills Mapped</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {report.totalSkillItems}
                </span>
              </div>
            </div>
          </div>

          {report.diagnosticNotes.length > 0 && (
            <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Parser Diagnostic Notes
              </h4>
              <ul className="list-disc list-inside text-xs text-amber-800 dark:text-amber-300 space-y-1">
                {report.diagnosticNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
