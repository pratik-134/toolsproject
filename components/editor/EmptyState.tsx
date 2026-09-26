"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonLabel: string;
  onAdd: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonLabel,
  onAdd,
}) => {
  return (
    <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center bg-slate-50/50 flex flex-col items-center justify-center hover:border-blue-200 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2.5 shadow-xs">
        <FolderPlus className="h-5 w-5 text-blue-600" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-xs mb-3.5 leading-relaxed">{description}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={onAdd}
        className="h-8 gap-1.5 text-xs font-semibold bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-lg shadow-xs transition-all"
      >
        <Plus className="h-3.5 w-3.5 text-blue-600" /> {buttonLabel}
      </Button>
    </div>
  );
};
