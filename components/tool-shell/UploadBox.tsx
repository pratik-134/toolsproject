"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, AlertCircle } from "lucide-react";
import { getCategoryTheme } from "@/lib/category-theme";

export interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeBytes?: number;
  title?: string;
  subtitle?: string;
  /** CategoryId — drives drag-over accent color */
  categoryId?: string;
  /** Pass multiple files */
  multiple?: boolean;
  onFilesSelect?: (files: File[]) => void;
}

export const UploadBox: React.FC<UploadBoxProps> = ({
  onFileSelect,
  accept,
  maxSizeBytes = 5 * 1024 * 1024,
  title = "Choose files or drop here",
  subtitle = "Processed 100% locally in your browser. Max 5 MB.",
  categoryId,
  multiple = false,
  onFilesSelect,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = categoryId ? getCategoryTheme(categoryId) : null;

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setError(`File exceeds the client-side memory limit of ${maxMb} MB.`);
      return;
    }
    onFileSelect(file);
  };

  const handleFiles = (files: FileList) => {
    setError(null);
    const arr = Array.from(files);
    const oversized = arr.find((f) => f.size > maxSizeBytes);
    if (oversized) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setError(
        `"${oversized.name}" exceeds the client-side memory limit of ${maxMb} MB.`
      );
      return;
    }
    if (onFilesSelect) {
      onFilesSelect(arr);
    } else if (arr[0]) {
      onFileSelect(arr[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Drag-over state: category-coloured border + tint via inline style; else neutral dashed
  const dragOverStyle = isDragOver && theme
    ? { borderColor: theme.primary, backgroundColor: theme.tint }
    : undefined;

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        style={dragOverStyle}
        className={`border-2 border-dashed rounded-[12px] px-6 py-12 text-center cursor-pointer
          transition-[border-color,background-color] duration-200
          flex flex-col items-center justify-center gap-4
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${theme ? theme.ring : "focus-visible:ring-blue-500"}
          ${
            isDragOver
              ? !theme
                ? "border-emerald-500 bg-emerald-50"
                : ""
              : "border-[#CBD5E1] bg-[#FAFAFA] hover:border-[#94A3B8] hover:bg-slate-50"
          }`}
      >
        {/* Stroke icon chip with categorical theme */}
        <div
          className="p-2.5 rounded-[8px] border flex items-center justify-center"
          style={
            theme
              ? {
                  backgroundColor: theme.tint,
                  borderColor: theme.border,
                  color: theme.primary,
                }
              : {
                  backgroundColor: "#EFF6FF",
                  borderColor: "#BFDBFE",
                  color: "#1D4ED8",
                }
          }
        >
          <UploadCloud
            className="h-8 w-8"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-[16px] leading-snug text-[#0F172A]">
            {title}
          </p>
          <p className="text-[13px] leading-[1.4] text-[#64748B]">{subtitle}</p>
        </div>

        {/* Browse Device — Secondary Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="h-[44px] px-[18px] rounded-lg bg-white border border-[#CBD5E1]
            text-[14px] font-medium text-[#0F172A]
            hover:bg-[#F8F9FA] hover:border-[#94A3B8]
            transition-colors duration-150"
        >
          Browse Device
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFiles(e.target.files);
            }
          }}
          className="hidden"
        />
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-700 text-[13px]
            rounded-[6px] border border-[#FECACA]"
        >
          <AlertCircle
            className="h-4 w-4 shrink-0 text-red-600"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
