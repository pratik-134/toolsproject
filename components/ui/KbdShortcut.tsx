"use client";

import React, { useState, useEffect } from "react";

export interface KbdShortcutProps {
  shortcut?: string;
  className?: string;
}

/**
 * Platform-adaptive keyboard shortcut badge.
 * Displays "Ctrl K" on Windows/Linux and "⌘ K" on macOS.
 */
export const KbdShortcut: React.FC<KbdShortcutProps> = ({
  shortcut = "K",
  className = "",
}) => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
    }
  }, []);

  return (
    <kbd
      className={`inline-flex items-center gap-1 font-sans text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-md px-1.5 py-0.5 leading-none shadow-2xs select-none shrink-0 ${className}`}
      aria-label={`${isMac ? "Command" : "Control"} plus ${shortcut}`}
    >
      <span>{isMac ? "⌘" : "Ctrl"}</span>
      <span>{shortcut}</span>
    </kbd>
  );
};

export default KbdShortcut;
