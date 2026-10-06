"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, Twitter, Linkedin } from "lucide-react";

export interface ShareButtonsProps {
  title: string;
  url?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "https://qwertygen.com/blog";
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${title} via @Qwertygen`);
    const shareUrl = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, "_blank", "noopener,noreferrer");
  };

  const shareOnLinkedIn = () => {
    const shareUrl = encodeURIComponent(getShareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link to article"
        title="Copy link"
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>

      <button
        type="button"
        onClick={shareOnTwitter}
        aria-label="Share on X (Twitter)"
        title="Share on X"
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <Twitter className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={shareOnLinkedIn}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-blue-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <Linkedin className="w-4 h-4" />
      </button>
    </div>
  );
};
