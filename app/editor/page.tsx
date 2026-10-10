"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { useResumeIndexStore } from "@/lib/store/use-resume-index-store";
import { useToast } from "@/components/ui/toast";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { PersonalInfoForm } from "@/components/editor/PersonalInfoForm";
import { ExperienceForm } from "@/components/editor/ExperienceForm";
import { EducationForm } from "@/components/editor/EducationForm";
import { SkillsForm } from "@/components/editor/SkillsForm";
import { ProjectsForm } from "@/components/editor/ProjectsForm";
import { GenericSectionForm } from "@/components/editor/GenericSectionForm";
import { AddSectionMenu } from "@/components/editor/AddSectionMenu";
import { LivePreview } from "@/components/editor/LivePreview";
import { TEMPLATES_REGISTRY } from "@/components/templates/registry";
import { Edit3, Eye, LayoutTemplate, Sliders, ShieldCheck } from "lucide-react";

function ResumeRouteGuard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const handledKeyRef = React.useRef<string | null>(null);

  useEffect(() => {
    const idParam = searchParams.get("id");
    const templateParam = searchParams.get("template");
    const currentKey = `${idParam ?? ""}_${templateParam ?? ""}`;

    // Prevent redundant execution for the same query parameters
    if (handledKeyRef.current === currentKey) {
      return;
    }

    const { loadIndex, createResume } = useResumeIndexStore.getState();
    const { loadResume, updateTheme, activeResumeId } = useResumeStore.getState();
    const indexList = loadIndex();

    if (idParam) {
      const exists = indexList.some((r) => r.id === idParam);
      if (exists) {
        handledKeyRef.current = currentKey;
        if (activeResumeId !== idParam) {
          loadResume(idParam);
        }
        if (templateParam) {
          updateTheme({ templateId: templateParam });
          // Canonicalize URL to strip templateParam now that theme is applied
          router.replace(`/editor?id=${idParam}`);
        }
      } else {
        handledKeyRef.current = currentKey;
        toast({
          title: "Resume Not Found",
          description: "The requested resume does not exist. Redirecting to your dashboard.",
          variant: "error",
        });
        router.replace("/dashboard");
      }
    } else if (templateParam) {
      handledKeyRef.current = currentKey;
      const newId = createResume({
        title: "My Resume",
        templateId: templateParam,
      });
      loadResume(newId);
      router.replace(`/editor?id=${newId}`);
    } else {
      handledKeyRef.current = currentKey;
      if (indexList.length > 0) {
        router.replace("/dashboard");
      } else {
        const newId = createResume({
          title: "My Resume",
          templateId: "modern",
        });
        loadResume(newId);
        router.replace(`/editor?id=${newId}`);
      }
    }
  }, [searchParams, router, toast]);

  return null;
}

export default function EditorPage() {
  const {
    resumeData,
    undo,
    redo,
    canUndo,
    canRedo,
    isFocusMode,
    toggleFocusMode,
    setTemplatePickerOpen,
    setPageSettingsOpen,
    setAtsAuditOpen,
  } = useResumeStore();
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  const currentTemplate = TEMPLATES_REGISTRY[resumeData.theme.templateId];
  const completeness = resumeData.meta.completenessScore || 0;

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo()) redo();
        } else {
          if (canUndo()) undo();
        }
      } else if (modifier && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100 antialiased">
      <Suspense fallback={null}>
        <ResumeRouteGuard />
      </Suspense>

      {/* Top Header Toolbar or Minimal Focus Mode Dock */}
      <div className="no-print">
        {isFocusMode ? (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-1.5 rounded-lg bg-slate-900/95 text-white border border-slate-700/60 shadow-xl backdrop-blur-md text-xs select-none">
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Focus Mode
            </span>
            <span className="text-slate-500">•</span>
            <button
              onClick={toggleFocusMode}
              className="text-slate-300 hover:text-white flex items-center gap-1 hover:underline text-[11px] transition-colors"
            >
              Exit Focus Mode (ESC)
            </button>
          </div>
        ) : (
          <EditorHeader />
        )}
      </div>

      {/* Mobile & Tablet Controls Toolbar (Tab Switcher + Quick Actions for Templates, Design, ATS) */}
      <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 xl:hidden no-print gap-1.5 shadow-2xs">
        {/* Mobile Tab Switcher: shown only on < lg because >= lg has split-screen */}
        <div className="flex lg:hidden w-full max-w-md mx-auto rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setMobileTab("edit")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === "edit"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Edit Form
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === "preview"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Live Preview
          </button>
        </div>

        {/* Quick Action Buttons for Templates, Design, and ATS (Visible on < xl to avoid header crowding) */}
        <div className="flex items-center justify-between gap-1.5 max-w-md mx-auto w-full pt-0.5">
          <button
            type="button"
            onClick={() => setTemplatePickerOpen(true)}
            className="flex-1 min-w-0 flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 py-1.5 px-2 rounded-lg transition-all"
            title="Change Template"
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">{currentTemplate?.name || "Templates"}</span>
          </button>

          <button
            type="button"
            onClick={() => setPageSettingsOpen(true)}
            className="flex-1 min-w-0 flex items-center justify-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 py-1.5 px-2 rounded-lg transition-all"
            title="Formatting & Design Settings"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Design</span>
          </button>

          <button
            type="button"
            onClick={() => setAtsAuditOpen(true)}
            className={`flex-1 min-w-0 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 px-2 rounded-lg border transition-all ${
              completeness >= 80
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                : completeness >= 50
                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
            title="ATS Compatibility Score"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>ATS {completeness}%</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Form Editor Column */}
        <div
          className={`w-full lg:w-[48%] xl:w-[45%] h-full overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 space-y-4 no-print ${
            mobileTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-4 pb-20">
            {/* 1. Personal Details */}
            <PersonalInfoForm />

            {/* 2. Dynamic Sections */}
            {resumeData.sections.map((section) => {
              switch (section.type) {
                case "experience":
                  return <ExperienceForm key={section.id} sectionId={section.id} />;
                case "education":
                  return <EducationForm key={section.id} sectionId={section.id} />;
                case "skills":
                  return <SkillsForm key={section.id} sectionId={section.id} />;
                case "projects":
                  return <ProjectsForm key={section.id} sectionId={section.id} />;
                default:
                  return (
                    <GenericSectionForm key={section.id} sectionId={section.id} />
                  );
              }
            })}

            {/* 3. Add Sections Menu */}
            <AddSectionMenu />
          </div>
        </div>

        {/* Right Live Preview Canvas */}
        <div
          className={`w-full lg:w-[52%] xl:w-[55%] h-full overflow-hidden bg-slate-100 dark:bg-slate-900 ${
            mobileTab === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <LivePreview mobileTab={mobileTab} />
        </div>
      </div>
    </div>
  );
}
