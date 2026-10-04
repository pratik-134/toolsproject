"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { SkillItem } from "@/lib/schema";
import { SectionWrapper } from "./SectionWrapper";
import { AiAssistantModal } from "./AiAssistantModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles } from "lucide-react";

interface SkillsFormProps {
  sectionId: string;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ sectionId }) => {
  const {
    resumeData,
    toggleSectionVisibility,
    toggleSectionLock,
    duplicateSection,
    moveSection,
    updateSectionTitle,
    removeSection,
    addSectionItem,
    updateSectionItem,
    removeSectionItem,
    moveSectionItem,
  } = useResumeStore();

  const section = resumeData.sections.find((s) => s.id === sectionId);
  const sectionIndex = resumeData.sections.findIndex((s) => s.id === sectionId);
  const canMoveUp = sectionIndex > 0;
  const canMoveDown = sectionIndex < resumeData.sections.length - 1;

  const [newSkillText, setNewSkillText] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  if (!section) return null;
  const items = section.items as SkillItem[];
  const isLocked = Boolean((section as any).locked);

  const handleAddQuickSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillText.trim() || isLocked) return;
    addSectionItem(sectionId, {
      name: newSkillText.trim(),
      level: "advanced",
      rating: 4,
    });
    setNewSkillText("");
  };

  const handleApplyAiSkill = (skill: string | string[]) => {
    const skillName = Array.isArray(skill) ? skill[0] : skill;
    if (skillName && !isLocked) {
      addSectionItem(sectionId, {
        name: skillName,
        level: "advanced",
        rating: 4,
      });
    }
  };

  return (
    <>
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        mode="skills"
        onApply={handleApplyAiSkill}
      />

      <SectionWrapper
        id={section.id}
        title={section.title}
        visible={section.visible}
        locked={isLocked}
        itemCount={items.length}
        onToggleVisibility={() => toggleSectionVisibility(section.id)}
        onToggleLock={() => toggleSectionLock(section.id)}
        onDuplicate={() => duplicateSection(section.id)}
        onMoveUp={() => moveSection(section.id, "up")}
        onMoveDown={() => moveSection(section.id, "down")}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onRenameTitle={(newTitle) => updateSectionTitle(section.id, newTitle)}
        onRemove={() => removeSection(section.id)}
      >
        <div className="space-y-3">
          {/* Quick Add Form & AI Button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleAddQuickSkill} className="flex gap-2 flex-1">
              <Input
                disabled={isLocked}
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                placeholder="Type skill & press enter (e.g. Next.js, Docker, Python)..."
                className="text-xs h-9"
              />
              <Button type="submit" size="sm" disabled={isLocked} className="gap-1 shrink-0 bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-3 font-semibold h-9 text-xs transition-colors shadow-xs">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </form>

            {!isLocked && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAiModalOpen(true)}
                className="h-9 gap-1.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-800 dark:hover:text-blue-200 font-medium rounded-lg border border-blue-200 dark:border-blue-800 shrink-0 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> AI Suggest Skills
              </Button>
            )}
          </div>

          {/* Existing Skills List */}
          <div className="space-y-1.5">
            {items.map((skill, index) => {
              const canSkillMoveUp = index > 0;
              const canSkillMoveDown = index < items.length - 1;

              return (
                <div
                  key={skill.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-800 px-3 py-2 sm:py-1.5 shadow-xs transition-colors"
                >
                  <Input
                    disabled={isLocked}
                    value={skill.name}
                    onChange={(e) =>
                      updateSectionItem(sectionId, skill.id, { name: e.target.value })
                    }
                    className="h-8 sm:h-7 text-xs font-medium text-slate-900 dark:text-white border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 bg-transparent w-full sm:flex-1 min-w-0"
                  />

                  <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto shrink-0">
                    <Select
                      disabled={isLocked}
                      value={skill.level}
                      onValueChange={(v) =>
                        updateSectionItem(sectionId, skill.id, {
                          level: v as any,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 sm:h-7 w-[120px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No label</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!canSkillMoveUp || isLocked}
                        onClick={() => moveSectionItem(sectionId, skill.id, "up")}
                        className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded-md transition-colors"
                        title="Move Skill Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!canSkillMoveDown || isLocked}
                        onClick={() => moveSectionItem(sectionId, skill.id, "down")}
                        className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 rounded-md transition-colors"
                        title="Move Skill Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>

                      {!isLocked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSectionItem(sectionId, skill.id)}
                          className="h-7 w-7 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
};
