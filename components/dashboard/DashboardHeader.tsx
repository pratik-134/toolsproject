"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useResumeIndexStore } from "@/lib/store/use-resume-index-store";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileUp,
  HardDrive,
  Download,
  Upload,
  Sparkles,
} from "lucide-react";

interface DashboardHeaderProps {
  onNewResume: () => void;
  onImportResume: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onNewResume,
  onImportResume,
  onExportBackup,
  onImportBackup,
}) => {
  const { storageUsage, isStorageQuotaExceeded } = useResumeIndexStore();
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleBackupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportBackup) {
      onImportBackup(file);
    }
    if (e.target) e.target.value = "";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white px-3 sm:px-8 select-none shadow-md">
      {/* Left: Brand & Dashboard Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="group" title="Cleartrix Resume Builder Home">
          <BrandLogo product="resume-builder" size={32} subtitle="My Resumes" />
        </Link>
        <Link
          href="/tools"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors border border-slate-200"
          title="Browse all 111+ in-browser privacy tools"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>All 111+ Tools</span>
        </Link>
      </div>

      {/* Right: Storage Meter + Action CTAs */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Private Local Storage Indicator */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium ${
            isStorageQuotaExceeded
              ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
              : "bg-slate-50 text-slate-600 border-slate-200"
          }`}
          title="Cleartrix stores all your resume data exclusively in your browser memory and local storage. Zero data leaves your machine."
        >
          <HardDrive className="h-3.5 w-3.5 text-slate-500" />
          <span>Storage: {storageUsage.formattedUsed} used</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600 font-semibold">100% Private</span>
        </div>

        {/* Export All Backup JSON */}
        {onExportBackup && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportBackup}
            title="Download JSON backup of all your resumes"
            className="hidden sm:inline-flex rounded-lg px-2.5 sm:px-3 h-9 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 gap-1.5"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Export JSON</span>
          </Button>
        )}

        {/* Import JSON Backup */}
        {onImportBackup && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => backupInputRef.current?.click()}
              title="Restore resumes from a JSON backup file"
              className="hidden sm:inline-flex rounded-lg px-2.5 sm:px-3 h-9 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 gap-1.5"
            >
              <Upload className="h-3.5 w-3.5 text-slate-600" />
              <span>Restore Backup</span>
            </Button>
            <input
              ref={backupInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleBackupFileChange}
              className="hidden"
            />
          </>
        )}

        {/* Import Resume Button (PDF/Word) */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onImportResume}
          className="rounded-lg px-2.5 sm:px-3.5 h-9 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 gap-1.5"
        >
          <FileUp className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden sm:inline">Import Resume</span>
          <span className="sm:hidden">Import</span>
        </Button>

        {/* New Resume Primary Button */}
        <Button
          type="button"
          size="sm"
          onClick={onNewResume}
          className="rounded-lg px-3 sm:px-4 h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">New Resume</span>
          <span className="xs:hidden">New</span>
        </Button>
      </div>
    </header>
  );
};
