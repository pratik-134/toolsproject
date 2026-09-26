"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Check,
  Copy,
  RefreshCw,
  X,
  Wand2,
  TrendingUp,
  FileText,
  BadgeCheck,
} from "lucide-react";

export type AiAssistType = "summary" | "bullet" | "skills";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AiAssistType;
  initialInput?: string;
  onApply: (result: string | string[]) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialInput = "",
  onApply,
}) => {
  const { resumeData } = useResumeStore();
  const [tone, setTone] = useState<"executive" | "metrics" | "concise">("executive");
  const [customRole, setCustomRole] = useState(resumeData.personalInfo.title || "");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate high-impact suggestions tailored to mode and job title
  const role = customRole.trim() || "Professional";

  const getSuggestions = (): string[] => {
    if (mode === "summary") {
      if (tone === "executive") {
        return [
          `Results-driven ${role} with proven experience spearheading cross-functional initiatives, optimizing operational pipelines, and delivering high-value business outcomes in fast-paced environments.`,
          `Accomplished ${role} recognized for visionary strategy, technical stewardship, and building scalable frameworks that drive organizational growth, team mentorship, and stakeholder satisfaction.`,
          `Senior ${role} combining deep domain expertise with pragmatic leadership to transform business objectives into robust, high-performance deliverables with measurable ROI.`,
        ];
      } else if (tone === "metrics") {
        return [
          `Dynamic ${role} with a record of elevating operational throughput by 35%, cutting operational costs by 20%, and delivering high-stakes projects on time and under budget.`,
          `Performance-focused ${role} with a track record of driving $2M+ in project value, accelerating delivery timelines by 40%, and maintaining 99.9% quality standards.`,
          `High-velocity ${role} specializing in scalable architecture, automating workflows to save 15+ engineering hours weekly, and driving 25% year-over-year revenue expansion.`,
        ];
      } else {
        return [
          `Focused ${role} skilled in end-to-end project execution, collaborative problem-solving, and continuous delivery of reliable solutions.`,
          `Versatile ${role} passionate about clean architecture, strategic execution, and delivering measurable user and business value.`,
          `Dedicated ${role} experienced in leading initiatives from concept to deployment with emphasis on efficiency and quality.`,
        ];
      }
    } else if (mode === "bullet") {
      return [
        `Spearheaded the re-architecture of core services, reducing page latency by 42% and enhancing system reliability across 500k+ active users.`,
        `Orchestrated cross-functional collaboration between product, design, and engineering to deliver high-priority deliverables 2 weeks ahead of schedule.`,
        `Engineered automated testing and deployment pipelines that decreased deployment failures by 65% and cut cycle times from days to hours.`,
        `Mentored 6 junior and mid-level team members, establishing engineering best practices, code review standards, and comprehensive architectural documentation.`,
      ];
    } else {
      // Skills
      return [
        "System Architecture",
        "Cross-Functional Leadership",
        "Performance Optimization",
        "Agile / Scrum Delivery",
        "Data-Driven Decision Making",
        "Stakeholder Communication",
        "Continuous Integration / Deployment",
        "Cloud Infrastructure",
      ];
    }
  };

  const suggestions = getSuggestions();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 no-print">
      <div className="w-full max-w-xl bg-white text-slate-900 border border-slate-200 rounded-lg p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900">
                {mode === "summary"
                  ? "AI Summary Polish"
                  : mode === "bullet"
                  ? "AI STAR Bullet Enhancer"
                  : "AI Role-Targeted Skills"}
              </h3>
              <p className="text-xs text-slate-500">
                100% Client-Side • Zero Data Transmission • Instant High-Impact Presets
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Target Role Input & Tone Selector */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 p-3 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-medium text-slate-700">Target Role / Focus:</label>
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. Senior Product Manager"
              className="bg-white text-slate-900 text-xs border border-slate-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 max-w-xs"
            />
          </div>

          {mode === "summary" && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">Tone:</span>
              {(["executive", "metrics", "concise"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-md capitalize transition-all ${
                    tone === t
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions List */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {mode === "skills" ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((skill, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onApply(skill);
                    onClose();
                  }}
                  className="group flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-800 px-3 py-1.5 rounded-md border border-slate-200 transition-all text-left font-medium"
                >
                  <span>+ {skill}</span>
                </button>
              ))}
            </div>
          ) : (
            suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="group p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all space-y-2"
              >
                <p className="text-xs text-slate-800 leading-relaxed font-normal">{suggestion}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-mono text-[10px]">Option #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(suggestion)}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-xs"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApply(suggestion);
                        onClose();
                      }}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      <span>Apply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Click "Apply" to instantly update your resume</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs text-slate-600 hover:text-slate-900 rounded-md">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
