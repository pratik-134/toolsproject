"use client";

import React, { useEffect, useState, useRef } from "react";
import { Keyboard, X } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
  category: "Global & Search" | "Tool Workflows" | "Display & Zen";
}

const SHORTCUTS: ShortcutItem[] = [
  {
    category: "Global & Search",
    keys: ["Ctrl", "K"],
    description: "Open Command Palette / Smart Tool Search",
  },
  {
    category: "Global & Search",
    keys: ["?"],
    description: "Show this Keyboard Shortcuts Cheatsheet",
  },
  {
    category: "Global & Search",
    keys: ["Esc"],
    description: "Dismiss active modal, palette, or exit Focus mode",
  },
  {
    category: "Tool Workflows",
    keys: ["Ctrl", "Enter"],
    description: "Execute / Format / Transform input in current tool",
  },
  {
    category: "Tool Workflows",
    keys: ["Ctrl", "Shift", "C"],
    description: "Copy primary output directly to clipboard",
  },
  {
    category: "Display & Zen",
    keys: ["Alt", "Z"],
    description: "Toggle Zen / Focus Mode (Distraction-free workspace)",
  },
];

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "?" && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ["Global & Search", "Tool Workflows", "Display & Zen"] as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Power-user hotkeys for speed and frictionless productivity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {categories.map((category) => {
            const items = SHORTCUTS.filter((s) => s.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {category}
                </h4>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <React.Fragment key={kIdx}>
                            <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
                              {k}
                            </kbd>
                            {kIdx < item.keys.length - 1 && (
                              <span className="text-slate-400 text-[10px]">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[10px]">?</kbd> anywhere to open or dismiss this cheatsheet
          </p>
        </div>
      </div>
    </div>
  );
}
