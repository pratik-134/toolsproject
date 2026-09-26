"use client";

import React, { useState } from "react";
import { ResumeData } from "@/lib/schema";
import { TemplateInfo } from "@/components/templates/registry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, ZoomIn, ZoomOut } from "lucide-react";

interface TemplatePreviewModalProps {
  template: TemplateInfo | null;
  resumeData: ResumeData;
  isOpen: boolean;
  onClose: () => void;
  onApply: (templateId: string) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  resumeData,
  isOpen,
  onClose,
  onApply,
}) => {
  const [zoom, setZoom] = useState(85);

  if (!isOpen || !template) return null;

  const TemplateComponent = template.component;
  const previewData: ResumeData = {
    ...resumeData,
    theme: {
      ...resumeData.theme,
      templateId: template.id,
    },
  };

  const scale = zoom / 100;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-6xl h-[94vh] rounded-lg border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3.5 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-headings text-lg font-bold text-slate-900">{template.name}</h3>
                <span className="font-body text-xs text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                  ATS Score: {template.atsScore}%
                </span>
                <span className="font-body text-xs text-slate-500 font-medium capitalize">
                  • {template.category}
                </span>
              </div>
              <p className="font-body text-xs text-slate-500 line-clamp-1 mt-0.5">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
                className="h-7 w-7 text-slate-500 hover:text-slate-900 rounded-md"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-mono font-bold px-1 text-slate-900 w-10 text-center">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.min(130, zoom + 10))}
                disabled={zoom >= 130}
                className="h-7 w-7 text-slate-500 hover:text-slate-900 rounded-md"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={() => onApply(template.id)}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold px-4 shadow-xs transition-colors"
            >
              <Check className="h-4 w-4" /> Apply Template
            </Button>

            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-md">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Body Preview Canvas */}
        <div className="flex-1 overflow-auto bg-slate-100 p-6 flex items-start justify-center">
          <div
            className="transition-transform duration-150 origin-top"
            style={{
              transform: `scale(${scale})`,
              width: "210mm",
            }}
          >
            <div className="bg-white text-black a4-paper-shadow rounded-xs overflow-hidden min-h-[297mm]">
              <TemplateComponent data={previewData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
