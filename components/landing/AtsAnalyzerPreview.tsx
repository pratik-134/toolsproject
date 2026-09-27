"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, FileCheck, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AtsCheck {
  title: string;
  desc: string;
  status: "passed";
}

const ATS_CHECKS: AtsCheck[] = [
  {
    title: "Standard Section Headings",
    desc: "Uses standard taxonomy ('Work Experience', 'Education', 'Skills') parsed by all enterprise bots.",
    status: "passed",
  },
  {
    title: "Linear Text Layer Hierarchy",
    desc: "Strict DOM reading order ensures no scrambled text when parsed left-to-right.",
    status: "passed",
  },
  {
    title: "Standardized Date Formats",
    desc: "Standard MMM YYYY – Present syntax accurately calculates years of domain experience.",
    status: "passed",
  },
  {
    title: "Zero Rasterized Text / Vector PDF",
    desc: "100% searchable vector glyphs with embedded fonts, avoiding image OCR errors.",
    status: "passed",
  },
  {
    title: "Contact & Link Verification",
    desc: "Email, LinkedIn, and portfolio URIs are structured for instant recruiter extraction.",
    status: "passed",
  },
];

const COMPATIBLE_SYSTEMS = [
  "Workday",
  "Greenhouse",
  "Taleo (Oracle)",
  "iCIMS",
  "Lever",
  "BambooHR",
  "SmartRecruiters",
];

export const AtsAnalyzerPreview: React.FC = () => {
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetScore = 98;
  const circumference = 2 * Math.PI * 36; // radius = 36 -> ~226.19

  useEffect(() => {
    // Check reduced motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScore(targetScore);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Animate score counter from 0 to targetScore
          let current = 0;
          const step = () => {
            current += 2;
            if (current <= targetScore) {
              setScore(current);
              requestAnimationFrame(step);
            } else {
              setScore(targetScore);
            }
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left"
    >
      {/* Left Column: Analytical Dashboard Card */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xl p-5 sm:p-7 space-y-6">
          {/* Header Bar with Animated Circular Score Gauge */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-headings text-sm font-bold text-slate-900">
                  ATS Parser Compliance Audit
                </h4>
                <p className="font-body text-[11px] text-slate-500">
                  Live verification against enterprise applicant screening algorithms
                </p>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 84 84">
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    className="text-slate-200"
                    strokeWidth="7"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="42"
                    cy="42"
                    r="36"
                    className="text-blue-600 transition-all duration-300"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-mono text-xs font-bold text-slate-900">
                  {score}%
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block leading-tight">
                  Status
                </span>
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  Excellent
                </span>
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {ATS_CHECKS.map((check, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 mt-0.5 shrink-0">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-headings text-xs font-bold text-slate-900">
                      {check.title}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                      100% Passed
                    </span>
                  </div>
                  <p className="font-body text-[11px] text-slate-600 mt-0.5 leading-snug">
                    {check.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tested Systems Pills */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Tested & Verified Against Enterprise ATS Platforms:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMPATIBLE_SYSTEMS.map((sys) => (
                <span
                  key={sys}
                  className="rounded-md bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                >
                  {sys}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Value Narrative */}
      <div className="lg:col-span-5 space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 font-body text-eyebrow uppercase tracking-[1.2px] text-blue-800 font-bold shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>75% of Resumes Get Rejected By Bots</span>
        </div>

        <h3 className="font-headings text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
          Never let a software parser discard your application.
        </h3>

        <p className="font-body text-body text-slate-600 leading-relaxed">
          Fancy graphic resumes created in design tools often hide text inside complex
          floating boxes, tables, and multi-column layers. When ATS parsers attempt to
          read them, sections get jumbled together and the bot automatically rejects you.
        </p>

        <p className="font-body text-body text-slate-600 leading-relaxed">
          Cleartrix constructs every template with strict semantic hierarchy.
          Your credentials arrive at the recruiter's inbox crystal-clear, structured,
          and completely intact.
        </p>

        <div className="pt-2">
          <Link href="/editor">
            <Button className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg px-6 py-3 font-bold gap-2 shadow-xs transition-all">
              Build ATS-Safe Resume Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
