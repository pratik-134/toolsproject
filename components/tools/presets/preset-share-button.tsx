"use client";

import React, { useState } from "react";
import { Link2, Check } from "lucide-react";
import { copyPresetUrl } from "@/lib/preset-urls";

interface PresetShareButtonProps {
  hashString: string;
  label?: string;
  className?: string;
}

export function PresetShareButton({
  hashString,
  label = "Share Preset",
  className = "",
}: PresetShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyPresetUrl(hashString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy preset URL", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Share a link with these pre-configured settings (never file data)"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-[16px] font-medium shadow-2xs transition-all ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Preset Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4 text-indigo-500" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
