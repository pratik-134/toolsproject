"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { useResumeIndexStore } from "@/lib/store/use-resume-index-store";
import { NewResumeModal } from "@/components/dashboard/NewResumeModal";
import {
  ChevronDown,
  Check,
  Plus,
  LayoutGrid,
  FileText,
  Edit3,
} from "lucide-react";

export const ResumeSwitcherDropdown: React.FC = () => {
  const router = useRouter();
  const { resumeData, updateTitle, activeResumeId, loadResume } = useResumeStore();
  const { resumes, loadIndex } = useResumeIndexStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resumeData.title);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleInput(resumeData.title);
  }, [resumeData.title]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== resumeData.title) {
      updateTitle(trimmed);
    } else {
      setTitleInput(resumeData.title);
    }
    setIsEditingTitle(false);
  };

  const handleSwitch = (targetId: string) => {
    if (targetId === activeResumeId) {
      setIsOpen(false);
      return;
    }
    const success = loadResume(targetId);
    if (success) {
      router.push(`/editor?id=${targetId}`);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div ref={containerRef} className="relative flex items-center min-w-0 shrink">
        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
              if (e.key === "Escape") {
                setTitleInput(resumeData.title);
                setIsEditingTitle(false);
              }
            }}
            autoFocus
            className="rounded-md border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[80px] xs:max-w-[110px] sm:max-w-[180px]"
          />
        ) : (
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 transition-colors min-w-0 h-8.5">
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-[220px] px-1.5 py-1 text-left"
              title="Click to rename"
            >
              {resumeData.title || "Untitled Resume"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md transition-colors shrink-0"
              title="Switch resume"
              aria-label="Switch resume"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 top-11 z-50 w-64 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl animate-fade-in text-xs">
            <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Switch Resume ({resumes.length})
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsEditingTitle(true);
                }}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" /> Rename
              </button>
            </div>

            {/* List of resumes */}
            <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
              {resumes.map((r) => {
                const isActive = r.id === activeResumeId;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSwitch(r.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                      <span className="truncate">{r.title}</span>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1 space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsNewModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Create New Resume</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/dashboard");
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>Go to My Resumes Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <NewResumeModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          loadIndex();
        }}
      />
    </>
  );
};
