"use client";

import React from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { Button } from "@/components/ui/button";
import {
  ListTree,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  Plus,
  X,
  Sparkles,
  GripVertical,
} from "lucide-react";

interface OutlineNavigatorProps {
  onClose?: () => void;
}

export const OutlineNavigator: React.FC<OutlineNavigatorProps> = ({ onClose }) => {
  const {
    resumeData,
    moveSection,
    toggleSectionVisibility,
    toggleSectionLock,
    setActiveSectionId,
    isOutlineOpen,
    toggleOutline,
  } = useResumeStore();

  const sections = resumeData.sections;

  const handleSectionClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const element = document.getElementById(`editor-section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!isOutlineOpen) return null;

  return (
    <div className="fixed right-4 top-16 z-40 w-80 bg-white text-slate-900 border border-slate-200 rounded-lg p-4 shadow-xl backdrop-blur-md no-print select-none animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-sm text-slate-900">Section Outline</span>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
            {sections.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleOutline}
          className="h-6 w-6 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Sections List */}
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {sections.map((section, index) => {
          const itemCount = section.items?.length || 0;
          const isLocked = (section as any).locked;
          const canMoveUp = index > 0;
          const canMoveDown = index < sections.length - 1;

          return (
            <div
              key={section.id}
              className={`group flex items-center justify-between px-2.5 py-2 rounded-md border transition-all ${
                section.visible
                  ? "border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-200 shadow-xs"
                  : "border-slate-200/50 bg-slate-50/30 opacity-50"
              }`}
            >
              {/* Click to jump */}
              <div
                onClick={() => handleSectionClick(section.id)}
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
              >
                <span className="text-[11px] font-mono text-slate-400 w-4">{index + 1}.</span>
                <span className="text-xs font-medium text-slate-800 truncate group-hover:text-blue-600">
                  {section.title}
                </span>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md font-mono">
                  {itemCount}
                </span>
                {isLocked && <Lock className="h-3 w-3 text-amber-500" />}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  disabled={!canMoveUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(section.id, "up");
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded-md transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={!canMoveDown}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(section.id, "down");
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded-md transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSectionVisibility(section.id);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  title={section.visible ? "Hide section" : "Show section"}
                >
                  {section.visible ? (
                    <Eye className="h-3 w-3 text-slate-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-amber-500" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any section to jump directly</span>
        <Sparkles className="h-3 w-3 text-slate-400" />
      </div>
    </div>
  );
};
