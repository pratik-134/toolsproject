"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResumeIndexItem } from "@/lib/store/resume-index-schema";
import { useResumeIndexStore } from "@/lib/store/use-resume-index-store";
import { TemplateThumbnail } from "@/components/editor/TemplateThumbnail";
import { TEMPLATES_REGISTRY } from "@/components/templates/registry";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Download,
  FileDown,
  Clock,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface ResumeCardProps {
  resume: ResumeIndexItem;
  onDelete: (resume: ResumeIndexItem) => void;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onDelete }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { renameResume, duplicateResume, getResumeDataById } = useResumeIndexStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resume.title);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const templateInfo = TEMPLATES_REGISTRY[resume.templateId];
  const resumeData = getResumeDataById(resume.id);

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== resume.title) {
      renameResume(resume.id, trimmed);
    } else {
      setTitleInput(resume.title);
    }
    setIsEditingTitle(false);
  };

  const handleDuplicate = () => {
    setIsMenuOpen(false);
    const newId = duplicateResume(resume.id);
    if (newId) {
      toast({
        title: "Resume Duplicated",
        description: `Created a copy of "${resume.title}".`,
        variant: "success",
      });
    }
  };

  const handleExportPdf = async () => {
    setIsMenuOpen(false);
    if (!resumeData) {
      toast({ title: "Resume data unavailable", variant: "error" });
      return;
    }
    setIsExportingPdf(true);
    try {
      const { exportResumeToPdf } = await import("@/lib/pdf/export-pdf");
      await exportResumeToPdf(resumeData);
      toast({
        title: "PDF Export Complete",
        description: `Exported "${resume.title}" as PDF.`,
        variant: "success",
      });
    } catch {
      toast({ title: "PDF Export Failed", variant: "error" });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setIsMenuOpen(false);
    if (!resumeData) {
      toast({ title: "Resume data unavailable", variant: "error" });
      return;
    }
    setIsExportingDocx(true);
    try {
      const { exportResumeToDocx } = await import("@/lib/docx/export-docx");
      await exportResumeToDocx(resumeData);
      toast({
        title: "Word Export Complete",
        description: `Exported "${resume.title}" as .docx.`,
        variant: "success",
      });
    } catch {
      toast({ title: "Word Export Failed", variant: "error" });
    } finally {
      setIsExportingDocx(false);
    }
  };

  const completeness = resume.completenessScore || 0;
  const scoreColor =
    completeness >= 80
      ? "text-blue-700 bg-blue-50 border-blue-200"
      : completeness >= 50
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-slate-600 bg-slate-100 border-slate-200";

  return (
    <div className="group relative rounded-2xl border border-slate-100/90 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-blue-400/60 transition-all flex flex-col overflow-hidden">
      {/* Thumbnail Area with Click-to-Open Overlay */}
      <div className="relative w-full h-[220px] bg-white border-b border-slate-100 overflow-hidden cursor-pointer">
        {resumeData ? (
          <TemplateThumbnail templateId={resume.templateId} data={resumeData} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">
            Preview unavailable
          </div>
        )}

        {/* Hover overlay with Open in Editor button */}
        <div
          onClick={() => router.push(`/editor?id=${resume.id}`)}
          className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]"
        >
          <Button
            size="sm"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs gap-1.5 shadow-lg border border-blue-500/30"
          >
            <Edit3 className="h-3.5 w-3.5 text-white" />
            <span className="text-white">Open in Editor</span>
          </Button>
        </div>
      </div>

      {/* Card Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Title & Actions Dropdown */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") {
                      setTitleInput(resume.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="w-full rounded-lg border border-blue-400 bg-white px-2 py-0.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-blue-600 hover:text-blue-700"
                  title="Save title"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setTitleInput(resume.title);
                    setIsEditingTitle(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => router.push(`/editor?id=${resume.id}`)}
                className="cursor-pointer group/title flex items-center gap-1.5"
              >
                <h3
                  className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 transition-colors"
                  title={resume.title}
                >
                  {resume.title}
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                  }}
                  className="opacity-0 group/title:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity"
                  title="Rename resume"
                >
                  <Edit3 className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-600">
                {templateInfo?.name || "Modern"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(resume.updatedAt)}
              </span>
            </div>
          </div>

          {/* Quick Actions Dropdown Menu */}
          <div className="shrink-0">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  title="More options"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={() => router.push(`/editor?id=${resume.id}`)}
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  <span>Open in Editor</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setIsEditingTitle(true)}
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleDuplicate}
                >
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Duplicate</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  disabled={isExportingPdf}
                  onSelect={handleExportPdf}
                >
                  {isExportingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  ) : (
                    <Download className="h-3.5 w-3.5 text-blue-600" />
                  )}
                  <span>Quick Export PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isExportingDocx}
                  onSelect={handleExportDocx}
                >
                  {isExportingDocx ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  ) : (
                    <FileDown className="h-3.5 w-3.5 text-blue-600" />
                  )}
                  <span>Quick Export Word</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() => onDelete(resume)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Footer Badges & Direct Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${scoreColor}`}
          >
            <ShieldCheck className="h-3 w-3" />
            {completeness}% Score
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              title="Quick Export PDF"
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              {isExportingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              title="Quick Export Word (.docx)"
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              {isExportingDocx ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              ) : (
                <FileDown className="h-3.5 w-3.5" />
              )}
            </button>
            <Link href={`/editor?id=${resume.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 rounded-md text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
              >
                Edit
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
