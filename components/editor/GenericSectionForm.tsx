"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { SectionWrapper } from "./SectionWrapper";
import { ItemToolbar } from "./ItemToolbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";

interface GenericSectionFormProps {
  sectionId: string;
}

export const GenericSectionForm: React.FC<GenericSectionFormProps> = ({
  sectionId,
}) => {
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
  const isLocked = Boolean((section as any).locked);

  return (
    <SectionWrapper
      id={section.id}
      title={section.title}
      visible={section.visible}
      locked={isLocked}
      itemCount={section.items.length}
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
        {section.items.map((item: any, idx: number) => {
          const isItemExpanded = expandedItemId === item.id;
          const canItemMoveUp = idx > 0;
          const canItemMoveDown = idx < section.items.length - 1;

          return (
            <div
              key={item.id}
              className={`rounded-lg border transition-all duration-200 ${
                isLocked
                  ? "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/30 p-3.5"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 p-3.5 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-800 shadow-xs"
              }`}
            >
              {/* Item Summary Header */}
              <div
                className="flex items-center justify-between cursor-pointer select-none gap-2 mb-2"
                onClick={() => setExpandedItemId(isItemExpanded ? null : item.id)}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="cursor-grab text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shrink-0">
                    <GripVertical className="h-3.5 w-3.5" />
                  </div>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono px-2 py-0.5">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {item.title || item.name || item.language || item.organization || "Entry"}
                  </span>
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

              {/* Detailed Fields (Expandable) */}
              {isItemExpanded && (
                <div className="space-y-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  {/* Certifications fields */}
                  {section.type === "certifications" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        disabled={isLocked}
                        value={item.name || ""}
                        onChange={(e) =>
                          updateSectionItem(sectionId, item.id, { name: e.target.value })
                        }
                        placeholder="Certification Name (e.g. AWS Solutions Architect)"
                      />
                      <Input
                        disabled={isLocked}
                        value={item.issuer || ""}
                        onChange={(e) =>
                          updateSectionItem(sectionId, item.id, { issuer: e.target.value })
                        }
                        placeholder="Issuer (e.g. Amazon Web Services)"
                      />
                      <Input
                        disabled={isLocked}
                        value={item.issueDate || ""}
                        onChange={(e) =>
                          updateSectionItem(sectionId, item.id, { issueDate: e.target.value })
                        }
                        placeholder="Issue Date (e.g. 2023)"
                      />
                      <Input
                        disabled={isLocked}
                        value={item.credentialId || ""}
                        onChange={(e) =>
                          updateSectionItem(sectionId, item.id, { credentialId: e.target.value })
                        }
                        placeholder="Credential ID (Optional)"
                      />
                    </div>
                  )}

                  {/* Languages fields */}
                  {section.type === "languages" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        disabled={isLocked}
                        value={item.language || ""}
                        onChange={(e) =>
                          updateSectionItem(sectionId, item.id, { language: e.target.value })
                        }
                        placeholder="Language (e.g. Spanish, German, Japanese)"
                      />
                      <select
                        disabled={isLocked}
                        value={item.fluency || "Fluent"}
                        onChange={(e) =>
                          updateSectionItem(sectionId, item.id, { fluency: e.target.value })
                        }
                        className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 shadow-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Professional">Professional Working</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Elementary">Elementary</option>
                      </select>
                    </div>
                  )}

                  {/* Awards / Publications / Volunteer / Custom */}
                  {["awards", "publications", "volunteer", "interests", "references", "custom"].includes(
                    section.type
                  ) && (
                    <div className="space-y-2">
                      <Input
                        disabled={isLocked}
                        value={item.title || item.name || item.organization || ""}
                        onChange={(e) =>
                          updateSectionItem(sectionId, item.id, {
                            title: e.target.value,
                            name: e.target.value,
                            organization: e.target.value,
                          })
                        }
                        placeholder="Title / Name / Organization"
                      />
                      <Textarea
                        disabled={isLocked}
                        rows={2}
                        value={item.description || item.subtitle || ""}
                        onChange={(e) =>
                          updateSectionItem(sectionId, item.id, {
                            description: e.target.value,
                            subtitle: e.target.value,
                          })
                        }
                        placeholder="Description or details..."
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!isLocked && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => addSectionItem(sectionId)}
            className="w-full gap-1.5 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50/40 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg font-medium shadow-xs transition-all h-9"
          >
            <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Add Item to {section.title}
          </Button>
        )}
      </div>
    </SectionWrapper>
  );
};
