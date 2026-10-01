"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES_LIST, TemplateCategory } from "@/components/templates/registry";
import { useResumeIndexStore } from "@/lib/store/use-resume-index-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Sparkles,
  LayoutTemplate,
  Check,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface NewResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewResumeModal: React.FC<NewResumeModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { createResume } = useResumeIndexStore();

  const [title, setTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("modern");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredTemplates = TEMPLATES_LIST.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  const handleCreate = () => {
    setIsSubmitting(true);
    try {
      const chosenTemplate = TEMPLATES_LIST.find((t) => t.id === selectedTemplateId);
      const finalTitle =
        title.trim() || `${chosenTemplate?.name || "Untitled"} Resume`;

      const newId = createResume({
        title: finalTitle,
        templateId: selectedTemplateId,
      });

      onClose();
      router.push(`/editor?id=${newId}`);
    } catch (err) {
      console.error("Failed to create resume:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create New Resume</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a design and title to get started. All 20 templates are 100% free.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1 rounded-lg"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Resume Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Resume Name / Target Role
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer - Google, Product Designer, My Resume"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Template ({filteredTemplates.length} styles)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Templates" },
                { id: "ats-safe", label: "100% ATS-Safe" },
                { id: "modern", label: "Modern & Clean" },
                { id: "professional", label: "Executive & Formal" },
                { id: "specialized", label: "Tech & Specialized" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as TemplateCategory)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`relative cursor-pointer rounded-lg border p-3.5 transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-500 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {tpl.name}
                      </span>
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white shadow-xs">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          {tpl.atsScore}% ATS
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {tpl.fontName}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                      {tpl.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            You can customize colors, fonts, density, and layout at any time.
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-lg px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleCreate}
              className="rounded-lg px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white gap-1.5 shadow-xs transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Create & Open Editor
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
