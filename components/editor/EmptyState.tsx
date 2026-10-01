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
    <div className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 text-center bg-slate-50/50 dark:bg-slate-800/40 flex flex-col items-center justify-center hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2.5 shadow-xs">
        <FolderPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-3.5 leading-relaxed">{description}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={onAdd}
        className="h-8 gap-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 rounded-lg shadow-xs transition-all"
      >
        <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> {buttonLabel}
      </Button>
    </div>
  );
};
