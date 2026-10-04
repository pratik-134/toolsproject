"use client";

import { useEffect } from "react";

interface ToolShortcutsOptions {
  /** Callback fired on Ctrl/Cmd + Enter */
  onExecute?: () => void;
  /** Callback fired on Ctrl/Cmd + Shift + C */
  onCopy?: () => void;
  /** Whether shortcuts are active (default: true) */
  enabled?: boolean;
}

/**
 * Universal hook for in-tool keyboard shortcuts:
 * - Ctrl/Cmd + Enter: Trigger execute / format / process
 * - Ctrl/Cmd + Shift + C: Trigger copy output
 */
export function useToolKeyboardShortcuts({
  onExecute,
  onCopy,
  enabled = true,
}: ToolShortcutsOptions) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + Shift + C -> Copy primary output
      if (isCmdOrCtrl && e.shiftKey && (e.key === "C" || e.key === "c")) {
        if (onCopy) {
          e.preventDefault();
          onCopy();
        }
        return;
      }

      // Ctrl/Cmd + Enter -> Execute / format action
      if (isCmdOrCtrl && e.key === "Enter") {
        if (onExecute) {
          e.preventDefault();
          onExecute();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExecute, onCopy, enabled]);
}
