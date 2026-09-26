"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, FileUp, LayoutGrid } from "lucide-react";
import { ResumeImportModal } from "@/components/import/ResumeImportModal";
import { INDEX_STORAGE_KEY, safeLocalStorageGet } from "@/lib/store/storage-utils";

export const LandingHeroActions: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [hasExistingResumes, setHasExistingResumes] = useState(false);

  useEffect(() => {
    try {
      const raw = safeLocalStorageGet(INDEX_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHasExistingResumes(true);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-2">
        <Link href={hasExistingResumes ? "/dashboard" : "/editor"} className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto justify-center gap-2 text-sm sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg min-h-[46px] sm:min-h-[48px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-blue-600/20 active:scale-[0.98]"
          >
            {hasExistingResumes ? (
              <>
                <LayoutGrid className="h-4 w-4" /> Go to My Resumes
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" /> Start Building Free
              </>
            )}
          </Button>
        </Link>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setIsImportModalOpen(true)}
          className="w-full sm:w-auto justify-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg min-h-[46px] sm:min-h-[48px] bg-white text-slate-800 border-slate-200/90 hover:bg-blue-50/70 hover:text-blue-600 hover:border-blue-300 font-semibold transition-all duration-200 shadow-2xs hover:shadow-sm active:scale-[0.98]"
        >
          <FileUp className="h-4 w-4 text-blue-600" /> Import Resume (PDF / DOCX)
        </Button>
        <a href="#templates" className="w-full sm:w-auto">
          <Button
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto justify-center gap-2 text-sm sm:text-base px-4 sm:px-5 py-3 sm:py-3.5 rounded-lg min-h-[46px] sm:min-h-[48px] text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold transition-all duration-200 active:scale-[0.98]"
          >
            Browse 20+ Templates
          </Button>
        </a>
      </div>

      <ResumeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
};
