"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Lock,
  Unlock,
  Copy,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  Briefcase,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Award,
  Languages,
  BookOpen,
  HeartHandshake,
  Heart,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionWrapperProps {
  id: string;
  title: string;
  visible: boolean;
  locked?: boolean;
  itemCount: number;
  onToggleVisibility: () => void;
  onToggleLock?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onRenameTitle?: (newTitle: string) => void;
  onRemove?: () => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function getSectionBadgeIcon(id: string) {
  const lower = id.toLowerCase();
  if (lower.includes("exp")) return <Briefcase className="h-4 w-4 text-blue-600" />;
  if (lower.includes("edu")) return <GraduationCap className="h-4 w-4 text-blue-600" />;
  if (lower.includes("skill")) return <Sparkles className="h-4 w-4 text-blue-600" />;
  if (lower.includes("proj")) return <FolderGit2 className="h-4 w-4 text-blue-600" />;
  if (lower.includes("cert")) return <Award className="h-4 w-4 text-blue-600" />;
  if (lower.includes("lang")) return <Languages className="h-4 w-4 text-blue-600" />;
  if (lower.includes("award")) return <Award className="h-4 w-4 text-blue-600" />;
  if (lower.includes("pub")) return <BookOpen className="h-4 w-4 text-blue-600" />;
  if (lower.includes("volunt")) return <HeartHandshake className="h-4 w-4 text-blue-600" />;
  if (lower.includes("interest")) return <Heart className="h-4 w-4 text-blue-600" />;
  if (lower.includes("ref")) return <Users className="h-4 w-4 text-blue-600" />;
  return <FileText className="h-4 w-4 text-blue-600" />;
}

function getSectionBadgeBg(id: string) {
  return "bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900";
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  visible,
  locked = false,
  itemCount,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  onRenameTitle,
  onRemove,
  children,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleTitleSubmit = () => {
    if (editedTitle.trim() && onRenameTitle) {
      onRenameTitle(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setEditedTitle(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      id={`editor-section-${id}`}
      className={`group/section rounded-lg border transition-all duration-200 scroll-mt-20 ${
        locked
          ? "border-amber-200/80 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/30 shadow-xs"
          : !visible
          ? "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-60 shadow-none"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between p-3.5 sm:p-4 select-none gap-2">
        {/* Left Drag & Title Area */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 p-1 -ml-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Drag handle to reorder section"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Section Icon Badge */}
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 transition-transform duration-200 group-hover/section:scale-105 ${getSectionBadgeBg(
              id
            )}`}
          >
            {getSectionBadgeIcon(id)}
          </div>

          {/* Inline Title Editor */}
          {isEditingTitle && !locked ? (
            <div className="flex items-center gap-1 flex-1 max-w-xs" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="w-full text-sm font-semibold text-slate-900 dark:text-white border border-blue-500 rounded-md px-2 py-0.5 focus:outline-none bg-white dark:bg-slate-800 ring-2 ring-blue-500/10"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTitleSubmit}
                className="h-6 w-6 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
              onClick={() => setExpanded(!expanded)}
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate tracking-tight">
                {title}
              </span>

              {onRenameTitle && !locked && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                  }}
                  className="opacity-0 group-hover/section:opacity-100 hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded transition-opacity"
                  title="Rename section"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}

              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 shrink-0">
                {itemCount}
              </span>

              {locked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                  <Lock className="h-2.5 w-2.5" /> Locked
                </span>
              )}
            </div>
          )}
        </div>

        {/* Section Action Toolbar */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Move Up */}
          {onMoveUp && (
            <Button
              variant="ghost"
              size="icon"
              disabled={!canMoveUp || locked}
              onClick={onMoveUp}
              className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded-md transition-colors"
              title="Move Section Up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Move Down */}
          {onMoveDown && (
            <Button
              variant="ghost"
              size="icon"
              disabled={!canMoveDown || locked}
              onClick={onMoveDown}
              className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded-md transition-colors"
              title="Move Section Down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Duplicate Section */}
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="Duplicate Section"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Lock / Unlock */}
          {onToggleLock && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleLock}
              className={`h-7 w-7 rounded-md transition-colors ${
                locked
                  ? "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-100/60 dark:bg-amber-950/60"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={locked ? "Unlock section to allow editing" : "Lock section to prevent modifications"}
            >
              {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            </Button>
          )}

          {/* Visibility Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleVisibility}
            className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title={visible ? "Hide section in preview" : "Show section in preview"}
          >
            {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-amber-500" />}
          </Button>

          {/* Delete Section */}
          {onRemove && !locked && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
              title="Delete Section"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Expand / Collapse */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className={`border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 pt-4 space-y-4 ${locked ? "pointer-events-none opacity-80" : ""}`}>
          {children}
        </div>
      )}
    </div>
  );
};
