"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { EducationItem } from "@/lib/schema";
import { SectionWrapper } from "./SectionWrapper";
import { ItemToolbar } from "./ItemToolbar";
import { EmptyState } from "./EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";

interface EducationFormProps {
  sectionId: string;
}

export const EducationForm: React.FC<EducationFormProps> = ({ sectionId }) => {
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
    duplicateSectionItem,
    moveSectionItem,
  } = useResumeStore();

  const section = resumeData.sections.find((s) => s.id === sectionId);
  const sectionIndex = resumeData.sections.findIndex((s) => s.id === sectionId);
  const canMoveUp = sectionIndex > 0;
  const canMoveDown = sectionIndex < resumeData.sections.length - 1;

  const [expandedItemId, setExpandedItemId] = useState<string | null>(
    section?.items[0]?.id || null
  );

  if (!section) return null;
  const items = section.items as EducationItem[];
  const isLocked = Boolean((section as any).locked);

  return (
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
        {items.length === 0 ? (
          <EmptyState
            title="No Education Records Added"
            description="Add your degrees, universities, high schools, or academic honors."
            buttonLabel="Add Education"
            onAdd={() => addSectionItem(sectionId)}
          />
        ) : (
          items.map((item, index) => {
            const isItemExpanded = expandedItemId === item.id;
            const canItemMoveUp = index > 0;
            const canItemMoveDown = index < items.length - 1;

            return (
              <div
                key={item.id}
                className={`rounded-lg border transition-all duration-200 ${
                  isLocked
                    ? "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/30 p-3.5"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 p-3.5 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-800 shadow-xs"
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer select-none gap-2"
                  onClick={() => setExpandedItemId(isItemExpanded ? null : item.id)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="cursor-grab text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shrink-0">
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.degree || "Degree"} {item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ""}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.institution || "Institution"} • {item.startDate || "Start"} –{" "}
                        {item.current ? "Present" : item.endDate || "Graduation"}
                      </p>
                    </div>
                  </div>

                  <ItemToolbar
                    isLocked={isLocked}
                    canMoveUp={canItemMoveUp}
                    canMoveDown={canItemMoveDown}
                    onMoveUp={() => moveSectionItem(sectionId, item.id, "up")}
                    onMoveDown={() => moveSectionItem(sectionId, item.id, "down")}
                    onDuplicate={() => duplicateSectionItem(sectionId, item.id)}
                    onRemove={() => removeSectionItem(sectionId, item.id)}
                    isExpanded={isItemExpanded}
                    onToggleExpand={() => setExpandedItemId(isItemExpanded ? null : item.id)}
                  />
                </div>

                {isItemExpanded && (
                  <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3.5 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          Degree / Credential
                        </label>
                        <Input
                          disabled={isLocked}
                          value={item.degree}
                          onChange={(e) =>
                            updateSectionItem(sectionId, item.id, {
                              degree: e.target.value,
                            })
                          }
                          placeholder="e.g. Bachelor of Science"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          Field of Study / Major
                        </label>
                        <Input
                          disabled={isLocked}
                          value={item.fieldOfStudy}
                          onChange={(e) =>
                            updateSectionItem(sectionId, item.id, {
                              fieldOfStudy: e.target.value,
                            })
                          }
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                        Institution / University
                      </label>
                      <Input
                        disabled={isLocked}
                        value={item.institution}
                        onChange={(e) =>
                          updateSectionItem(sectionId, item.id, {
                            institution: e.target.value,
                          })
                        }
                        placeholder="e.g. Stanford University"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          Location
                        </label>
                        <Input
                          disabled={isLocked}
                          value={item.location}
                          onChange={(e) =>
                            updateSectionItem(sectionId, item.id, {
                              location: e.target.value,
                            })
                          }
                          placeholder="e.g. Stanford, CA"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          Start Date
                        </label>
                        <Input
                          disabled={isLocked}
                          value={item.startDate}
                          onChange={(e) =>
                            updateSectionItem(sectionId, item.id, {
                              startDate: e.target.value,
                            })
                          }
                          placeholder="e.g. 2017"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          End Date / Graduation
                        </label>
                        <Input
                          disabled={isLocked}
                          value={item.endDate}
                          onChange={(e) =>
                            updateSectionItem(sectionId, item.id, {
                              endDate: e.target.value,
                            })
                          }
                          placeholder="e.g. 2021"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          GPA (Optional)
                        </label>
                        <Input
                          disabled={isLocked}
                          value={item.gpa || ""}
                          onChange={(e) =>
                            updateSectionItem(sectionId, item.id, {
                              gpa: e.target.value,
                            })
                          }
                          placeholder="e.g. 3.9 / 4.0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          Honors / Awards (Optional)
                        </label>
                        <Input
                          disabled={isLocked}
                          value={item.honors || ""}
                          onChange={(e) =>
                            updateSectionItem(sectionId, item.id, {
                              honors: e.target.value,
                            })
                          }
                          placeholder="e.g. Magna Cum Laude"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {items.length > 0 && !isLocked && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => addSectionItem(sectionId)}
            className="w-full gap-1.5 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50/40 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg font-medium shadow-xs transition-all h-9"
          >
            <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Add Another Education
          </Button>
        )}
      </div>
    </SectionWrapper>
  );
};
