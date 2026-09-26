"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/lib/store/use-resume-store";
import { TEMPLATES_LIST, TEMPLATES_REGISTRY, TemplateCategory, TemplateInfo } from "@/components/templates/registry";
import { TemplateThumbnail } from "./TemplateThumbnail";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, LayoutTemplate, Eye } from "lucide-react";

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ isOpen, onClose }) => {
  const { resumeData, updateTheme } = useResumeStore();
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("all");
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateInfo | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = TEMPLATES_LIST.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  const handleSelectTemplate = (templateId: string) => {
    updateTheme({ templateId });
  };

  const handleApplyFromModal = (templateId: string) => {
    updateTheme({ templateId });
    setPreviewingTemplate(null);
    onClose();
  };

  return (
    <>
      <TemplatePreviewModal
        template={previewingTemplate}
        resumeData={resumeData}
        isOpen={!!previewingTemplate}
        onClose={() => setPreviewingTemplate(null)}
        onApply={handleApplyFromModal}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-2 sm:p-6 overflow-y-auto">
        <div className="relative w-full max-w-6xl rounded-lg border border-slate-200 bg-white p-3.5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                <LayoutTemplate className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-headings text-base sm:text-lg font-bold text-slate-900 leading-tight">Select Resume Template</h3>
                <p className="hidden xs:block font-body text-xs text-slate-500 mt-0.5">
                  Every template is 100% free with zero paywalls. Hover or tap to preview your live resume data.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-md">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 py-3 shrink-0 overflow-x-auto">
            {(
              [
                { id: "all", label: "All Templates (20)" },
                { id: "ats-safe", label: "ATS-Safe" },
                { id: "modern", label: "Modern" },
                { id: "professional", label: "Professional & Executive" },
                { id: "specialized", label: "Specialized & Tech" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Templates Grid with Live Thumbnails */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((template) => {
                const isSelected = resumeData.theme.templateId === template.id;

                return (
                  <div
                    key={template.id}
                    className={`group relative rounded-lg border p-3 flex flex-col justify-between transition-all duration-200 ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-xs"
                        : "border-slate-200 hover:border-blue-300 hover:shadow-xs bg-white"
                    }`}
                  >
                    {/* Live Thumbnail Box with Hover Actions */}
                    <div className="relative rounded-md overflow-hidden mb-3 border border-slate-200 bg-white">
                      <TemplateThumbnail templateId={template.id} data={resumeData} />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPreviewingTemplate(template)}
                          className="w-full gap-1.5 text-xs font-bold h-8 shadow-xs rounded-md bg-white text-slate-900 hover:bg-slate-100"
                        >
                          <Eye className="h-3.5 w-3.5" /> Full Size
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSelectTemplate(template.id)}
                          className="w-full gap-1.5 text-xs font-bold h-8 shadow-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Check className="h-3.5 w-3.5" /> {isSelected ? "Active" : "Apply"}
                        </Button>
                      </div>

                      {/* Top Right ATS Pill */}
                      <div className="absolute top-2 right-2">
                        <span className="rounded-md bg-slate-900/90 text-white px-2 py-0.5 text-[10px] font-mono font-bold border border-slate-700 shadow-2xs">
                          ATS {template.atsScore}%
                        </span>
                      </div>
                    </div>

                    {/* Card Content Info */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-headings text-sm font-bold text-slate-900">
                          {template.name}
                        </h4>
                        {isSelected && (
                          <Badge variant="default" className="gap-1 text-[10px] py-0 px-2 font-bold rounded-md bg-blue-600 text-white">
                            <Check className="h-3 w-3" /> Active
                          </Badge>
                        )}
                      </div>

                      <p className="font-body text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                        {template.description}
                      </p>
                    </div>

                    {/* Footer Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-1 pt-2 border-t border-slate-100 mt-auto text-[10px] text-slate-500">
                      <span className="font-medium">{template.fontName}</span>
                      <span className="capitalize text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {template.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-slate-100 pt-3 flex justify-between items-center shrink-0">
            <span className="font-body text-xs text-slate-500">
              Current Template: <strong className="text-slate-900 font-bold">{TEMPLATES_REGISTRY[resumeData.theme.templateId]?.name || "Modern"}</strong>
            </span>
            <Button size="sm" onClick={onClose} className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg px-5 shadow-xs transition-colors">
              Done
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
