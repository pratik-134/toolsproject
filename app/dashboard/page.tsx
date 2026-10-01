"use client";

import React, { useEffect, useState } from "react";
import { useResumeIndexStore } from "@/lib/store/use-resume-index-store";
import { ResumeIndexItem } from "@/lib/store/resume-index-schema";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ResumeCard } from "@/components/dashboard/ResumeCard";
import { NewResumeModal } from "@/components/dashboard/NewResumeModal";
import { DeleteResumeModal } from "@/components/dashboard/DeleteResumeModal";
import { ResumeImportModal } from "@/components/import/ResumeImportModal";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  FileUp,
  FileText,
  AlertTriangle,
  Sparkles,
  LayoutGrid,
  Lock,
} from "lucide-react";

export default function DashboardPage() {
  const {
    resumes,
    loadIndex,
    deleteResume,
    isStorageQuotaExceeded,
    isInitialized,
    exportAllResumesJson,
    importResumesBackupJson,
  } = useResumeIndexStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deletingResume, setDeletingResume] = useState<ResumeIndexItem | null>(null);

  // Initialize and load multi-resume index from localStorage on mount
  useEffect(() => {
    loadIndex();
  }, [loadIndex]);

  const handleExportBackup = () => {
    const json = exportAllResumesJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cleartrix-resumes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = importResumesBackupJson(reader.result as string);
      if (res.importedCount > 0) {
        alert(`Successfully restored ${res.importedCount} resumes from backup!`);
      } else {
        alert(`Failed to restore backup: ${res.errors.join(", ")}`);
      }
    };
    reader.readAsText(file);
  };

  const filteredResumes = resumes.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      r.templateId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Header */}
      <DashboardHeader
        onNewResume={() => setIsNewModalOpen(true)}
        onImportResume={() => setIsImportModalOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-container w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col">
        {/* Storage Quota Warning Banner (if near or exceeding browser storage limits) */}
        {isStorageQuotaExceeded && (
          <div className="mb-6 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-4 flex items-start gap-3 text-amber-800 dark:text-amber-200 text-xs sm:text-sm animate-fade-in">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Browser Local Storage Limit Reached</p>
              <p className="text-amber-700 dark:text-amber-300">
                Your browser local storage is near capacity. We recommend downloading backup
                copies (PDF or Word .docx) and deleting unneeded drafts to ensure autosave continues functioning smoothly.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Title & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-headings text-slate-900 dark:text-slate-100 tracking-tight">
              My Resumes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {resumes.length === 1
                ? "1 resume saved locally in browser"
                : `${resumes.length} resumes saved locally in browser`}
              {" • "}
              <span className="text-blue-600 dark:text-blue-400 font-semibold inline-flex items-center gap-1">
                <Lock className="h-3 w-3" /> Zero Server Transmission
              </span>
            </p>
          </div>

          {/* Search Filter */}
          {resumes.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resumes..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-xs"
              />
            </div>
          )}
        </div>

        {/* Resumes Grid or Empty States */}
        {!isInitialized ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading your resumes...</p>
            </div>
          </div>
        ) : filteredResumes.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredResumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDelete={(res) => setDeletingResume(res)}
              />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          /* Empty State: Brand New User - Properly Centered in Remaining Space */
          <div className="flex-1 flex items-center justify-center py-10 sm:py-16">
            <div className="w-full max-w-2xl rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 sm:p-14 text-center space-y-6 shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 shadow-xs">
                <FileText className="h-8 w-8" />
              </div>

              <div className="space-y-2.5">
                <h2 className="text-xl sm:text-2xl font-bold font-headings text-slate-900 dark:text-slate-100">
                  No Resumes Created Yet
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Create a resume from scratch with 20+ professional templates, or import your
                  existing PDF or Word resume. Everything is saved 100% privately in your browser.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => setIsNewModalOpen(true)}
                  className="rounded-lg px-6 font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white gap-2 shadow-xs transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create First Resume
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsImportModalOpen(true)}
                  className="rounded-lg px-6 font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 gap-2 shadow-2xs"
                >
                  <FileUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Import Existing (PDF / DOCX)
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Search Filter State - Properly Centered */
          <div className="flex-1 flex items-center justify-center py-10 sm:py-16">
            <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-4 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                <Search className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No matching resumes</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No resumes found matching &ldquo;{searchQuery}&rdquo;. Try another search term.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="rounded-lg mt-2 text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Clear Search
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <NewResumeModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <DeleteResumeModal
        isOpen={!!deletingResume}
        resumeTitle={deletingResume?.title || ""}
        onClose={() => setDeletingResume(null)}
        onConfirm={() => {
          if (deletingResume) {
            deleteResume(deletingResume.id);
            setDeletingResume(null);
          }
        }}
      />

      <ResumeImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          loadIndex();
        }}
      />
    </div>
  );
}
