"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { useResumeIndexStore } from "@/lib/store/use-resume-index-store";
import { TEMPLATES_LIST } from "@/components/templates/registry";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Search,
  LayoutTemplate,
  Sliders,
  ShieldCheck,
  ListTree,
  Download,
  FileDown,
  Printer,
  Maximize2,
  Bug,
  Split,
  Plus,
  Type,
  Palette,
  Undo2,
  Redo2,
  X,
  Sparkles,
  FileUp,
  LayoutGrid,
  Copy,
  FolderSync,
} from "lucide-react";

export const CommandPalette: React.FC = () => {
  const {
    resumeData,
    updateTheme,
    undo,
    redo,
    addSection,
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setImportModalOpen,
    toggleFocusMode,
    toggleDebugMode,
    togglePdfSplitView,
    setPageSettingsOpen,
    setAtsAuditOpen,
    toggleOutline,
  } = useResumeStore();

  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === "Escape" && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Build searchable items
  interface CommandItem {
    id: string;
    title: string;
    category: "Actions" | "Templates" | "Tools & Views" | "Add Section" | "Formatting";
    icon: React.ReactNode;
    action: () => void;
  }

  const items: CommandItem[] = [
    // Export & Print
    {
      id: "export-pdf",
      title: "Export High-Resolution Vector PDF",
      category: "Actions",
      icon: <Download className="h-3.5 w-3.5 text-blue-600" />,
      action: async () => {
        setCommandPaletteOpen(false);
        try {
          const { exportResumeToPdf } = await import("@/lib/pdf/export-pdf");
          await exportResumeToPdf(resumeData);
          toast({ title: "PDF Export Complete", variant: "success" });
        } catch {
          toast({ title: "PDF Export Failed", variant: "error" });
        }
      },
    },
    {
      id: "export-docx",
      title: "Export Native Word Document (.docx)",
      category: "Actions",
      icon: <FileDown className="h-3.5 w-3.5 text-blue-600" />,
      action: async () => {
        setCommandPaletteOpen(false);
        try {
          const { exportResumeToDocx } = await import("@/lib/docx/export-docx");
          await exportResumeToDocx(resumeData);
          toast({ title: "Word Document Export Complete", variant: "success" });
        } catch {
          toast({ title: "Word Document Export Failed", variant: "error" });
        }
      },
    },
    {
      id: "print",
      title: "Print Resume / Browser Print Dialog",
      category: "Actions",
      icon: <Printer className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        setCommandPaletteOpen(false);
        window.print();
      },
    },
    {
      id: "import-resume",
      title: "Import Resume (PDF or DOCX)",
      category: "Actions",
      icon: <FileUp className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        setCommandPaletteOpen(false);
        setImportModalOpen(true);
      },
    },
    {
      id: "my-resumes-dashboard",
      title: "My Resumes Dashboard",
      category: "Actions",
      icon: <LayoutGrid className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        setCommandPaletteOpen(false);
        router.push("/dashboard");
      },
    },
    {
      id: "new-resume",
      title: "New Resume / Create Resume",
      category: "Actions",
      icon: <Plus className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        setCommandPaletteOpen(false);
        const newId = useResumeIndexStore.getState().createResume();
        router.push(`/editor?id=${newId}`);
        toast({ title: "New Resume Created", variant: "success" });
      },
    },
    {
      id: "duplicate-resume",
      title: "Duplicate Current Resume",
      category: "Actions",
      icon: <Copy className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        setCommandPaletteOpen(false);
        const activeId = useResumeStore.getState().activeResumeId;
        if (activeId) {
          const newId = useResumeIndexStore.getState().duplicateResume(activeId);
          if (newId) {
            router.push(`/editor?id=${newId}`);
            toast({ title: "Resume Duplicated", variant: "success" });
          }
        } else {
          toast({ title: "No active resume to duplicate", variant: "error" });
        }
      },
    },
    {
      id: "switch-resume",
      title: "Switch Resume (Go to Dashboard)",
      category: "Actions",
      icon: <FolderSync className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        setCommandPaletteOpen(false);
        router.push("/dashboard");
      },
    },
    {
      id: "undo",
      title: "Undo Last Edit",
      category: "Actions",
      icon: <Undo2 className="h-3.5 w-3.5 text-slate-500" />,
      action: () => {
        undo();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "redo",
      title: "Redo Next Edit",
      category: "Actions",
      icon: <Redo2 className="h-3.5 w-3.5 text-slate-500" />,
      action: () => {
        redo();
        setCommandPaletteOpen(false);
      },
    },

    // Tools & Views
    {
      id: "focus-mode",
      title: "Toggle Focus / Distraction-Free Mode",
      category: "Tools & Views",
      icon: <Maximize2 className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        toggleFocusMode();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "pdf-debug",
      title: "Toggle PDF Parity Debug Mode",
      category: "Tools & Views",
      icon: <Bug className="h-3.5 w-3.5 text-amber-600" />,
      action: () => {
        toggleDebugMode();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "pdf-split",
      title: "Toggle Side-by-Side PDF Stream Split View",
      category: "Tools & Views",
      icon: <Split className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        togglePdfSplitView();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "ats-audit",
      title: "Open ATS Quality & Parser Audit Panel",
      category: "Tools & Views",
      icon: <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        setAtsAuditOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "outline",
      title: "Open Section Outline Navigator",
      category: "Tools & Views",
      icon: <ListTree className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        toggleOutline();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "page-settings",
      title: "Open Page Setup & Density Controller",
      category: "Tools & Views",
      icon: <Sliders className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        setPageSettingsOpen(true);
        setCommandPaletteOpen(false);
      },
    },

    // Formatting Shortcuts
    {
      id: "density-compact",
      title: "Set Density: Compact (Max Single Page)",
      category: "Formatting",
      icon: <Sliders className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        updateTheme({ density: "compact" });
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "density-comfortable",
      title: "Set Density: Balanced / Comfortable (Standard)",
      category: "Formatting",
      icon: <Sliders className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        updateTheme({ density: "comfortable" });
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "density-spacious",
      title: "Set Density: Spacious (Executive)",
      category: "Formatting",
      icon: <Sliders className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        updateTheme({ density: "spacious" });
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "margin-narrow",
      title: "Set Margins: Narrow (28pt / 0.4 in)",
      category: "Formatting",
      icon: <Sliders className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        updateTheme({ marginSize: "narrow" });
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "margin-normal",
      title: "Set Margins: Normal (36pt / 0.5 in)",
      category: "Formatting",
      icon: <Sliders className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        updateTheme({ marginSize: "normal" });
        setCommandPaletteOpen(false);
      },
    },

    // Add Sections
    {
      id: "add-experience",
      title: "Add Section: Work Experience",
      category: "Add Section",
      icon: <Plus className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        addSection("experience", "Work Experience");
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "add-skills",
      title: "Add Section: Skills & Competencies",
      category: "Add Section",
      icon: <Plus className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        addSection("skills", "Skills");
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "add-projects",
      title: "Add Section: Projects & Portfolio",
      category: "Add Section",
      icon: <Plus className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        addSection("projects", "Projects");
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "add-certifications",
      title: "Add Section: Certifications & Licenses",
      category: "Add Section",
      icon: <Plus className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        addSection("certifications", "Certifications");
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "add-languages",
      title: "Add Section: Languages",
      category: "Add Section",
      icon: <Plus className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        addSection("languages", "Languages");
        setCommandPaletteOpen(false);
      },
    },

    // Templates (all 20)
    ...TEMPLATES_LIST.map((tpl) => ({
      id: `template-${tpl.id}`,
      title: `Switch Template: ${tpl.name} (${tpl.category})`,
      category: "Templates" as const,
      icon: <LayoutTemplate className="h-3.5 w-3.5 text-blue-600" />,
      action: () => {
        updateTheme({ templateId: tpl.id });
        setCommandPaletteOpen(false);
      },
    })),
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 no-print select-none">
      <div className="w-full max-w-xl bg-white text-slate-900 border border-slate-200 rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, template, or action... (e.g. Modern, Margin, PDF)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-500">
              ESC
            </kbd>
            <Button
              variant="ghost"
              size="icon"
              onClick={setCommandPaletteOpen.bind(null, false)}
              className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands or templates found.
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-blue-50/50 text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-md bg-slate-50 group-hover:bg-blue-50 border border-slate-200 group-hover:border-blue-200 transition-colors shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-slate-800 group-hover:text-blue-700 font-medium truncate">
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-600 shrink-0">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="font-mono bg-white border border-slate-200 px-1 rounded text-slate-600">Click</kbd>
            <span>or</span>
            <kbd className="font-mono bg-white border border-slate-200 px-1 rounded text-slate-600">Enter</kbd>
          </div>
          <span className="text-slate-500 font-medium text-[11px]">Command Hub</span>
        </div>
      </div>
    </div>
  );
};
