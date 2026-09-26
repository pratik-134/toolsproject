"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { ExperienceItem } from "@/lib/schema";
import { SectionWrapper } from "./SectionWrapper";
import { ItemToolbar } from "./ItemToolbar";
import { EmptyState } from "./EmptyState";
import { AiAssistantModal } from "./AiAssistantModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Sparkles, GripVertical } from "lucide-react";

interface ExperienceFormProps {
  sectionId: string;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({ sectionId }) => {
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
  const [aiModalItem, setAiModalItem] = useState<ExperienceItem | null>(null);

  if (!section) return null;
  const items = section.items as ExperienceItem[];
  const isLocked = Boolean((section as any).locked);

  const handleAddHighlight = (item: ExperienceItem, customText?: string) => {
    const newHighlights = [
      ...(item.highlights || []),
      customText || "New quantified achievement or responsibility...",
    ];
    updateSectionItem(sectionId, item.id, { highlights: newHighlights });
  };

  const handleUpdateHighlight = (
    item: ExperienceItem,
    index: number,
    value: string
  ) => {
    const updated = [...(item.highlights || [])];
    updated[index] = value;
    updateSectionItem(sectionId, item.id, { highlights: updated });
  };

  const handleRemoveHighlight = (item: ExperienceItem, index: number) => {
    const updated = (item.highlights || []).filter((_, i) => i !== index);
    updateSectionItem(sectionId, item.id, { highlights: updated });
  };

  return (
    <>
      {aiModalItem && (
        <AiAssistantModal
          isOpen={Boolean(aiModalItem)}
          onClose={() => setAiModalItem(null)}
          mode="bullet"
          initialInput={aiModalItem.position}
          onApply={(bullet) => {
            if (typeof bullet === "string") {
              handleAddHighlight(aiModalItem, bullet);
            }
          }}
        />
      )}

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
              title="No Work Experience Added"
              description="Highlight your roles, quantifiable achievements, and leadership impact."
              buttonLabel="Add Your First Role"
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
                      ? "border-amber-200 bg-amber-50/30 p-3.5"
                      : "border-slate-200 bg-slate-50/40 p-3.5 hover:bg-white hover:border-blue-200 shadow-xs"
                  }`}
                >
                  {/* Item Summary Bar */}
                  <div
                    className="flex items-center justify-between cursor-pointer select-none gap-2"
                    onClick={() => setExpandedItemId(isItemExpanded ? null : item.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="cursor-grab text-slate-400 hover:text-slate-600 shrink-0">
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                          {item.position || "Untitled Role"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {item.company || "Company"} • {item.startDate || "Start"} –{" "}
                          {item.current ? "Present" : item.endDate || "End"}
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

                  {/* Item Detailed Fields */}
                  {isItemExpanded && (
                    <div className="mt-3 border-t border-slate-100 pt-3.5 space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">
                            Job Title
                          </label>
                          <Input
                            disabled={isLocked}
                            value={item.position}
                            onChange={(e) =>
                              updateSectionItem(sectionId, item.id, {
                                position: e.target.value,
                              })
                            }
                            placeholder="e.g. Lead Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">
                            Company Name
                          </label>
                          <Input
                            disabled={isLocked}
                            value={item.company}
                            onChange={(e) =>
                              updateSectionItem(sectionId, item.id, {
                                company: e.target.value,
                              })
                            }
                            placeholder="e.g. Google, Stripe"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">
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
                            placeholder="e.g. San Francisco, CA (or Remote)"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">
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
                            placeholder="e.g. Mar 2021"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">
                            End Date
                          </label>
                          <Input
                            disabled={item.current || isLocked}
                            value={item.endDate}
                            onChange={(e) =>
                              updateSectionItem(sectionId, item.id, {
                                endDate: e.target.value,
                              })
                            }
                            placeholder={item.current ? "Present" : "e.g. Present, Dec 2023"}
                          />
                        </div>
                      </div>

                      {/* Current Role Toggle */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`curr-${item.id}`}
                          disabled={isLocked}
                          checked={item.current}
                          onChange={(e) =>
                            updateSectionItem(sectionId, item.id, {
                              current: e.target.checked,
                              endDate: e.target.checked ? "Present" : "",
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        <label
                          htmlFor={`curr-${item.id}`}
                          className="text-xs text-slate-700 font-medium cursor-pointer"
                        >
                          I currently work here
                        </label>
                      </div>

                      {/* Bullet Highlights */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">
                            Key Accomplishments & Bullets
                          </label>
                          <div className="flex items-center gap-2">
                            {/* AI Bullet Assistant Button */}
                            {!isLocked && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAiModalItem(item)}
                                className="h-6 gap-1 text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 font-medium rounded-md px-2.5 transition-colors"
                              >
                                <Sparkles className="h-3 w-3 text-blue-600" /> AI Bullets
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isLocked}
                              onClick={() => handleAddHighlight(item)}
                              className="h-6 gap-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-md transition-colors"
                            >
                              <Plus className="h-3 w-3" /> Add Bullet
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          {(item.highlights || []).map((highlight, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="text-slate-400 text-xs select-none pl-1">•</span>
                              <Input
                                disabled={isLocked}
                                value={highlight}
                                onChange={(e) =>
                                  handleUpdateHighlight(item, idx, e.target.value)
                                }
                                className="text-xs h-8 flex-1"
                                placeholder="Describe quantified impact (e.g. 'Increased throughput by 30%...')"
                              />
                              {!isLocked && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveHighlight(item, idx)}
                                  className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
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
              className="w-full gap-1.5 border-dashed border-slate-300 bg-white text-slate-700 hover:bg-blue-50/40 hover:border-blue-300 hover:text-blue-700 rounded-lg font-medium shadow-xs transition-all h-9"
            >
              <Plus className="h-4 w-4 text-blue-600" /> Add Another Experience
            </Button>
          )}
        </div>
      </SectionWrapper>
    </>
  );
};
