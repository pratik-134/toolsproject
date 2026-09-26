"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteResumeModalProps {
  isOpen: boolean;
  resumeTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteResumeModal: React.FC<DeleteResumeModalProps> = ({
  isOpen,
  resumeTitle,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 border border-red-200 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Resume?</h3>
            <p className="text-xs text-slate-500">Permanent action • Zero recovery</p>
          </div>
        </div>

        <div className="rounded-lg border border-red-100 bg-red-50/50 p-3.5 text-xs text-slate-600 leading-relaxed space-y-1.5">
          <p>
            Are you sure you want to delete{" "}
            <strong className="text-slate-900">&ldquo;{resumeTitle}&rdquo;</strong>?
          </p>
          <p className="text-red-700 font-medium">
            Because Mindkit runs 100% client-side in your browser, deleted resumes cannot be restored from a server backup.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-lg px-4 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg px-4 text-xs font-semibold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white gap-1.5 shadow-xs transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Resume
          </Button>
        </div>
      </div>
    </div>
  );
};
