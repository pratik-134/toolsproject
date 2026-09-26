"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiAssistantModal } from "./AiAssistantModal";

export const PersonalInfoForm: React.FC = () => {
  const { resumeData, updatePersonalInfo } = useResumeStore();
  const info = resumeData.personalInfo;
  const [expanded, setExpanded] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <>
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        mode="summary"
        initialInput={info.summary}
        onApply={(result) => {
          if (typeof result === "string") {
            updatePersonalInfo({ summary: result });
          }
        }}
      />

      <div
        id="editor-section-personal"
        className="group/personal rounded-lg border border-slate-200 bg-white shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-200 scroll-mt-20"
      >
        <div
          className="flex items-center justify-between p-3.5 sm:p-4 cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition-transform duration-200 group-hover/personal:scale-105">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900 tracking-tight">
              Personal Details
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="border-t border-slate-100 p-4 sm:p-5 pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Full Name <span className="text-red-500 font-bold">*</span>
                </label>
                <Input
                  value={info.fullName}
                  onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Professional Title
                </label>
                <Input
                  value={info.title}
                  onChange={(e) => updatePersonalInfo({ title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Email
                </label>
                <Input
                  type="email"
                  value={info.email}
                  onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                  placeholder="alex@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Phone
                </label>
                <Input
                  value={info.phone}
                  onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Location
                </label>
                <Input
                  value={info.location}
                  onChange={(e) => updatePersonalInfo({ location: e.target.value })}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Website / Portfolio
                </label>
                <Input
                  value={info.website}
                  onChange={(e) => updatePersonalInfo({ website: e.target.value })}
                  placeholder="https://portfolio.dev"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  LinkedIn
                </label>
                <Input
                  value={info.linkedin}
                  onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  GitHub
                </label>
                <Input
                  value={info.github}
                  onChange={(e) => updatePersonalInfo({ github: e.target.value })}
                  placeholder="github.com/username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Professional Summary
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAiModalOpen(true)}
                  className="h-6 gap-1 text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 font-medium rounded-md px-2.5 transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-blue-600" /> AI Polish Summary
                </Button>
              </div>
              <Textarea
                rows={3}
                value={info.summary}
                onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
                placeholder="Brief overview of your background, key achievements, and core passions..."
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
