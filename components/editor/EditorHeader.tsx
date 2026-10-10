"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { TEMPLATES_REGISTRY } from "@/components/templates/registry";
import { TemplatePicker } from "./TemplatePicker";
import { PageSettingsModal } from "./PageSettingsModal";
import { AtsAuditDrawer } from "./AtsAuditDrawer";
import { OutlineNavigator } from "./OutlineNavigator";
import { CommandPalette } from "./CommandPalette";
import { ResumeImportModal } from "@/components/import/ResumeImportModal";
import { ResumeSwitcherDropdown } from "./ResumeSwitcherDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { KbdShortcut } from "@/components/ui/KbdShortcut";
import {
  Undo2,
  Redo2,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  FileDown,
  Loader2,
  ZoomIn,
  ZoomOut,
  Palette,
  ArrowLeft,
  LayoutTemplate,
  Sliders,
  ShieldCheck,
  ListTree,
  Search,
  Maximize2,
  Minimize2,
  Bug,
  FileUp,
} from "lucide-react";

export const EditorHeader: React.FC = () => {
  const {
    resumeData,
    saveStatus,
    undo,
    redo,
    canUndo,
    canRedo,
    updateTitle,
    zoomLevel,
    setZoomLevel,
    isFocusMode,
    toggleFocusMode,
    isDebugMode,
    toggleDebugMode,
    isOutlineOpen,
    toggleOutline,
    setPageSettingsOpen,
    setAtsAuditOpen,
    setCommandPaletteOpen,
    setImportModalOpen,
    isTemplatePickerOpen,
    setTemplatePickerOpen,
  } = useResumeStore();

  const { toast } = useToast();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const currentTemplate = TEMPLATES_REGISTRY[resumeData.theme.templateId];
  const completeness = resumeData.meta.completenessScore || 0;

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const { exportResumeToPdf } = await import("@/lib/pdf/export-pdf");
      await exportResumeToPdf(resumeData);
      toast({
        title: "PDF Export Complete",
        description: "Your high-resolution resume PDF has been generated and downloaded.",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "PDF Generation Failed",
        description: "Please try again or use the Print button as an instant fallback.",
        variant: "error",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const { exportResumeToDocx } = await import("@/lib/docx/export-docx");
      await exportResumeToDocx(resumeData);
      toast({
        title: "Word (.docx) Export Complete",
        description: "Your editable Word document has been generated and downloaded.",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Word Export Failed",
        description: "Please try again or export as PDF as an instant fallback.",
        variant: "error",
      });
    } finally {
      setIsExportingDocx(false);
    }
  };


  return (
    <>
      {/* Modals & Drawers */}
      <TemplatePicker
        isOpen={isTemplatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
      />
      <PageSettingsModal />
      <AtsAuditDrawer />
      <OutlineNavigator />
      <CommandPalette />
      <ResumeImportModal />

      {/* Header Toolbar */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-b border-slate-200/80 dark:border-slate-800 shadow-md px-2 sm:px-4 select-none">
        {/* Left: Home/Dashboard, Switcher/Title, Autosave Status */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 sm:w-auto p-0 sm:px-2.5 sm:gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium shrink-0"
              title="Return to My Resumes Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-semibold">Resumes</span>
            </Button>
          </Link>

          <div className="hidden sm:block h-4 w-[1px] bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Interactive Resume Switcher & Inline Renamer */}
          <ResumeSwitcherDropdown />

          {/* Autosave Status */}
          <div className="hidden 2xl:flex items-center gap-1.5 text-xs text-slate-400 pl-1 shrink-0">
            {saveStatus === "saved" ? (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Saved</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium text-[11px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-md">
                <Clock className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Clean Navigation Pills (Templates, Design Setup, ATS Score) — Visible on desktop >= xl to prevent tablet collisions */}
        <div className="hidden xl:flex items-center gap-1.5 lg:gap-2 shrink-0">
          {/* Template Picker Pill */}
          <button
            onClick={() => setTemplatePickerOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-all shadow-2xs"
            title="Choose template from 20+ professional designs"
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{currentTemplate?.name || "Templates"}</span>
          </button>

          {/* Design & Layout Pill */}
          <button
            onClick={() => setPageSettingsOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-all shadow-2xs"
            title="Customize margins, density, typography and colors"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Design</span>
          </button>

          {/* ATS Audit Score Trigger Button */}
          <button
            onClick={() => setAtsAuditOpen(true)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border shadow-2xs transition-all hover:scale-102 ${
              completeness >= 80
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-950"
                : completeness >= 50
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-950"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
            title="Open ATS Quality Audit Panel"
          >
            <ShieldCheck className={`h-3.5 w-3.5 shrink-0 ${completeness >= 80 ? "text-blue-600 dark:text-blue-400" : completeness >= 50 ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}`} />
            <span>ATS: {completeness}%</span>
          </button>
        </div>

        {/* Right: Tools & Export CTA */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
          {/* Import Resume Pill */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="h-8 px-2 sm:px-2.5 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs shrink-0"
            title="Import existing PDF or DOCX resume"
          >
            <FileUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="hidden sm:inline font-semibold text-xs">Import</span>
          </button>

          {/* Quick Actions Search Pill (Ctrl+K) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden lg:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs shrink-0"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="hidden xl:inline font-medium text-xs">Search</span>
            <KbdShortcut shortcut="K" className="text-[10px]" />
          </button>

          {/* Undo / Redo Segment */}
          <div className="hidden xs:flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 p-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo()}
              title="Undo (Ctrl+Z)"
              className="h-7 w-7 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 rounded-md"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo()}
              title="Redo (Ctrl+Y)"
              className="h-7 w-7 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 rounded-md"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Outline Navigator Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleOutline}
            className={`h-8 w-8 rounded-lg hidden lg:flex shrink-0 transition-all ${
              isOutlineOpen
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 font-bold"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Toggle Section Outline"
          >
            <ListTree className="h-4 w-4" />
          </Button>

          {/* Focus Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFocusMode}
            className={`h-8 w-8 rounded-lg hidden xl:flex shrink-0 transition-all ${
              isFocusMode
                ? "bg-slate-900 dark:bg-blue-600 text-white"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
          >
            {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Theme Toggle */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/* Export PDF Button */}
          <Button
            size="sm"
            onClick={handleExportPdf}
            disabled={isExportingPdf || isExportingDocx}
            className="h-8 gap-1 font-bold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 rounded-lg px-2 sm:px-3 shadow-xs transition-all active:scale-[0.98] shrink-0"
            title="Download High-Resolution Vector PDF"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline text-xs">...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span className="text-xs font-bold"><span className="hidden sm:inline">Export </span>PDF</span>
              </>
            )}
          </Button>

          {/* Export Word (.docx) Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportDocx}
            disabled={isExportingPdf || isExportingDocx}
            className="h-8 gap-1 font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700 rounded-lg px-2 sm:px-2.5 shadow-xs transition-all active:scale-[0.98] shrink-0"
            title="Download fully editable native Word (.docx) document"
          >
            {isExportingDocx ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                <span className="hidden sm:inline text-xs">...</span>
              </>
            ) : (
              <>
                <FileDown className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-semibold hidden md:inline">Word</span>
                <span className="text-xs font-semibold md:hidden">DOCX</span>
              </>
            )}
          </Button>

          {/* Browser Print Fallback */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.print()}
            className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hidden xl:flex rounded-lg shrink-0"
            title="Print or Save via Browser Dialog"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </header>
    </>
  );
};
