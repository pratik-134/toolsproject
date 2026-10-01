"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { parseResumeFile, ParsedResumeResult, ParsedSectionPreview, ParsedConfidence } from "@/lib/import";
import { ResumeData, Section } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  FileUp,
  RotateCcw,
  Sparkles,
  Check,
  ArrowRight,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  BookOpen,
  Heart,
  Globe,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ResumeImportModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ResumeImportModal: React.FC<ResumeImportModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isImportModalOpen: storeIsOpen,
    setImportModalOpen,
    importResume,
    resetToDefault,
    resumeData,
  } = useResumeStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const handleClose = useCallback(() => {
    if (propOnClose) {
      propOnClose();
    } else {
      setImportModalOpen(false);
    }
  }, [propOnClose, setImportModalOpen]);

  // States: 'idle' | 'parsing' | 'review' | 'error'
  const [step, setStep] = useState<"idle" | "parsing" | "review" | "error">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [progressStatus, setProgressStatus] = useState("Extracting text...");
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedResumeResult | null>(null);
  const [sectionsState, setSectionsState] = useState<ParsedSectionPreview[]>([]);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep("idle");
    setFileName("");
    setProgressStatus("");
    setProgressPercent(0);
    setErrorMessage("");
    setParsedResult(null);
    setSectionsState([]);
    setExpandedSectionIds({});
  };

  const handleModalClose = () => {
    resetState();
    handleClose();
  };

  const handleProcessFile = async (file: File) => {
    const name = file.name;
    const lower = name.toLowerCase();

    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
      setErrorMessage("Please select a valid .PDF or .DOCX resume file.");
      setStep("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds the 10MB limit. Please upload a smaller document.");
      setStep("error");
      return;
    }

    setFileName(name);
    setStep("parsing");
    setProgressPercent(15);
    setProgressStatus("Reading document locally...");

    try {
      const result = await parseResumeFile(file, (status, percent) => {
        setProgressStatus(status);
        setProgressPercent(percent);
      });

      setParsedResult(result);
      setSectionsState(result.sections);
      setStep("review");
    } catch (err: any) {
      console.error("Resume import error:", err);
      setErrorMessage(
        err?.message || "Failed to process resume. Please verify the document format and try again."
      );
      setStep("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // Reset input value so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleSectionInclusion = (id: string) => {
    setSectionsState((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, included: !sec.included } : sec))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedSectionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleApplyToEditor = () => {
    if (!parsedResult) return;

    // Filter only included sections and convert to standard Section type
    const activeSections: Section[] = sectionsState
      .filter((s) => s.included && s.items.length > 0)
      .map((s, idx) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        order: idx,
        visible: true,
        locked: false,
        items: s.items as any,
      }));

    // Construct full ResumeData preserving theme and meta defaults
    const newResumeData: ResumeData = {
      ...resumeData,
      title: parsedResult.suggestedTitle || parsedResult.personalInfo.fullName + " Resume",
      personalInfo: {
        ...parsedResult.personalInfo,
      },
      sections: activeSections,
      meta: {
        ...resumeData.meta,
        lastEditedAt: new Date().toISOString(),
      },
    };

    importResume(newResumeData);

    toast({
      title: "Resume Imported Successfully",
      description: `Loaded ${activeSections.length} sections into the editor. You can press Ctrl+Z anytime to undo.`,
      variant: "success",
    });

    handleModalClose();
    router.push("/editor");
  };

  const handleStartBlank = () => {
    resetToDefault();
    toast({
      title: "Blank Canvas Ready",
      description: "Started fresh with a blank resume template.",
      variant: "info",
    });
    handleModalClose();
    router.push("/editor");
  };

  if (!isOpen) return null;

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "experience":
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case "education":
        return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case "skills":
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case "projects":
        return <FolderGit2 className="h-4 w-4 text-blue-600" />;
      case "certifications":
        return <Award className="h-4 w-4 text-blue-600" />;
      case "publications":
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case "volunteering":
        return <Heart className="h-4 w-4 text-blue-600" />;
      case "languages":
        return <Globe className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const renderConfidenceBadge = (confidence: ParsedConfidence, reason?: string) => {
    switch (confidence) {
      case "high":
        return (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md"
            title={reason}
          >
            <CheckCircle2 className="h-3 w-3 text-blue-600" />
            High Confidence
          </span>
        );
      case "medium":
        return (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md"
            title={reason}
          >
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            Needs Verification
          </span>
        );
      case "low":
      default:
        return (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
            title={reason}
          >
            <Info className="h-3 w-3 text-slate-500" />
            Review Needed
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <FileUp className="h-4 w-4" />
            </div>
            <div>
              <h2 id="import-modal-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Import Existing Resume
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Client-side parsing • 100% private in browser memory
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. DROPZONE (IDLE STATE) */}
          {step === "idle" && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/20 dark:hover:bg-blue-950/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <UploadCloud className="h-7 w-7" />
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-white text-center mb-1">
                  Drag and drop your resume here, or{" "}
                  <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
                  Supports .PDF and .DOCX files up to 10MB
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs font-medium text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Zero server uploads
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs font-medium text-slate-700 dark:text-slate-300">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Automatic section detection
                  </span>
                </div>
              </div>

              {/* Note / ATS Info */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3.5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  Tips for best results
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Text-based PDFs and DOCX files parse best. Scanned image-only PDFs without selectable text are not supported. You will have a chance to review all extracted fields before anything enters the editor.
                </p>
              </div>

              {/* Blank Resume Option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleStartBlank}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-2 transition-colors"
                >
                  Or prefer to start with a blank template instead?
                </button>
              </div>
            </div>
          )}

          {/* 2. PARSING PROGRESS STATE */}
          {step === "parsing" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative">
                <div className="h-16 w-16 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FileText className="h-8 w-8 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{fileName}</h3>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                  {progressStatus}
                </p>
              </div>

              <div className="w-full max-w-md">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono">
                  <span>Local client processing</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
                Analyzing sections, parsing work roles, dates, and contact information safely in memory...
              </p>
            </div>
          )}

          {/* 3. REVIEW & CONFIRM SCREEN */}
          {step === "review" && parsedResult && (
            <div className="space-y-6">
              {/* Review Guidance Banner */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3.5 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Review Extracted Resume Sections
                  </p>
                  <p className="text-blue-800 dark:text-blue-300/80 text-[11px] leading-relaxed">
                    Verify the extracted details below. Uncheck any section you prefer to omit or rebuild. Unrecognized text has been preserved in an "Unsorted Notes" section so no information is lost.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetState}
                  className="shrink-0 h-7 text-[11px] font-semibold bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/50 rounded-lg"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Re-upload
                </Button>
              </div>

              {/* Personal Information Preview */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Personal Information</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Contact & Core Identity</p>
                    </div>
                  </div>
                  {renderConfidenceBadge(parsedResult.personalInfoConfidence)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                      Full Name
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {parsedResult.personalInfo.fullName || (
                        <span className="italic text-slate-400 dark:text-slate-500 font-normal">Not detected</span>
                      )}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                      Job / Professional Title
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {parsedResult.personalInfo.title || (
                        <span className="italic text-slate-400 dark:text-slate-500 font-normal">Not detected</span>
                      )}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                      Email
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 truncate">
                      {parsedResult.personalInfo.email || (
                        <span className="italic text-slate-400 dark:text-slate-500">Not detected</span>
                      )}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                      Phone
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">
                      {parsedResult.personalInfo.phone || (
                        <span className="italic text-slate-400 dark:text-slate-500">Not detected</span>
                      )}
                    </p>
                  </div>
                </div>

                {parsedResult.personalInfo.summary && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                      Professional Summary
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {parsedResult.personalInfo.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Sections List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Detected Sections ({sectionsState.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {sectionsState.filter((s) => s.included).length} selected to import
                  </span>
                </div>

                <div className="space-y-2">
                  {sectionsState.map((section) => {
                    const isExpanded = Boolean(expandedSectionIds[section.id]);
                    const isCustomNotes = section.id.includes("unsorted");

                    return (
                      <div
                        key={section.id}
                        className={`rounded-lg border transition-all ${
                          section.included
                            ? isCustomNotes
                              ? "border-amber-200 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/20"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            : "border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 opacity-60"
                        }`}
                      >
                        {/* Section Card Header */}
                        <div className="flex items-center justify-between p-3.5">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`check-${section.id}`}
                              checked={section.included}
                              onChange={() => toggleSectionInclusion(section.id)}
                              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <label
                              htmlFor={`check-${section.id}`}
                              className="flex items-center gap-2 cursor-pointer select-none"
                            >
                              <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900">
                                {getSectionIcon(section.type)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <span>{section.title}</span>
                                  {isCustomNotes && (
                                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                                      Preserved Notes
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {section.items.length} item{section.items.length !== 1 ? "s" : ""}{" "}
                                  detected • {section.confidenceReason}
                                </p>
                              </div>
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            {renderConfidenceBadge(section.confidence, section.confidenceReason)}
                            {section.items.length > 0 && (
                              <button
                                onClick={() => toggleExpand(section.id)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Toggle item preview"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expandable Preview of Section Items */}
                        {isExpanded && section.items.length > 0 && (
                          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 rounded-b-lg text-xs space-y-2">
                            {section.type === "experience" &&
                              section.items.slice(0, 3).map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px]"
                                >
                                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                                    <span>{item.position}</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                                      {item.startDate} {item.endDate ? `– ${item.endDate}` : ""}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-300">{item.company}</p>
                                  {item.highlights && item.highlights.length > 0 && (
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 line-clamp-1 italic">
                                      • {item.highlights[0]}
                                    </p>
                                  )}
                                </div>
                              ))}

                            {section.type === "education" &&
                              section.items.slice(0, 2).map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px]"
                                >
                                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                                    <span>
                                      {item.degree} {item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ""}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400 font-normal">{item.endDate}</span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-300">{item.institution}</p>
                                </div>
                              ))}

                            {section.type === "skills" && (
                              <div className="flex flex-wrap gap-1.5 p-1">
                                {section.items.slice(0, 15).map((item: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium"
                                  >
                                    {item.name}
                                  </span>
                                ))}
                                {section.items.length > 15 && (
                                  <span className="text-slate-400 dark:text-slate-500 text-[11px] self-center">
                                    +{section.items.length - 15} more
                                  </span>
                                )}
                              </div>
                            )}

                            {section.type === "custom" &&
                              section.items.map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded bg-white dark:bg-slate-800/80 border border-amber-200/60 dark:border-amber-800/40 text-[11px]"
                                >
                                  <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                                  <p className="text-slate-600 dark:text-slate-300 text-[10px] mt-0.5 line-clamp-3">
                                    {item.description}
                                  </p>
                                </div>
                              ))}

                            {/* Fallback for other section types */}
                            {!["experience", "education", "skills", "custom"].includes(section.type) &&
                              section.items.slice(0, 2).map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px]"
                                >
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {item.name || item.title || item.language || "Item"}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. ERROR STATE */}
          {step === "error" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="max-w-md space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Could Not Import Resume</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{errorMessage}</p>
              </div>

              <div className="pt-3 flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={resetState}
                  className="gap-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 rounded-lg px-4 shadow-xs transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try Another File
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStartBlank}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 rounded-lg px-4"
                >
                  Start Blank Instead
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="hidden sm:inline">100% In-Browser • Private Session</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleModalClose}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
            >
              Cancel
            </Button>

            {step === "review" && (
              <Button
                size="sm"
                onClick={handleApplyToEditor}
                className="gap-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 rounded-lg px-4 shadow-xs active:scale-95 transition-all"
              >
                <Check className="h-3.5 w-3.5" />
                Apply to Editor
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
