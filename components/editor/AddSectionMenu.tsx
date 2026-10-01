"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { SectionType } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Briefcase,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Award,
  Languages,
  BookOpen,
  HeartHandshake,
  Heart,
  Users,
  PlusCircle,
} from "lucide-react";

interface SectionOption {
  type: SectionType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTION_OPTIONS: SectionOption[] = [
  { type: "experience", title: "Work Experience", icon: Briefcase },
  { type: "education", title: "Education", icon: GraduationCap },
  { type: "skills", title: "Skills & Proficiencies", icon: Sparkles },
  { type: "projects", title: "Projects", icon: FolderGit2 },
  { type: "certifications", title: "Certifications", icon: Award },
  { type: "languages", title: "Languages", icon: Languages },
  { type: "awards", title: "Awards & Honors", icon: Award },
  { type: "publications", title: "Publications", icon: BookOpen },
  { type: "volunteer", title: "Volunteering", icon: HeartHandshake },
  { type: "interests", title: "Interests & Hobbies", icon: Heart },
  { type: "references", title: "References", icon: Users },
  { type: "custom", title: "Custom Section", icon: PlusCircle },
];

export const AddSectionMenu: React.FC = () => {
  const { resumeData, addSection } = useResumeStore();
  const [isOpen, setIsOpen] = useState(false);

  const existingTypes = new Set(resumeData.sections.map((s) => s.type));

  const handleAdd = (opt: SectionOption) => {
    addSection(opt.type, opt.title);
    setIsOpen(false);
  };

  return (
    <div className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 p-5 sm:p-6 text-center bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all duration-200 shadow-xs">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Add Resume Section</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
        Tailor your resume structure with standard ATS-compliant sections or custom additions.
      </p>

      {!isOpen ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-1.5 font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs h-9 px-4 text-xs transition-all"
        >
          <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Add Section
        </Button>
      ) : (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
            {SECTION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const alreadyExists = existingTypes.has(opt.type) && opt.type !== "custom";
              return (
                <button
                  key={opt.type}
                  disabled={alreadyExists}
                  onClick={() => handleAdd(opt)}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                    alreadyExists
                      ? "opacity-40 cursor-not-allowed bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50 text-slate-400 dark:text-slate-500"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 shadow-2xs hover:shadow-xs"
                  }`}
                >
                  <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">{opt.title}</span>
                </button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
