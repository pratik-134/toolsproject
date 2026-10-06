"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: "button" | "segmented";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
  variant = "button",
}) => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  if (variant === "segmented") {
    return (
      <div
        className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 shadow-xs ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-900/60 text-blue-600 dark:text-cyan-400">
            {isDark ? (
              <Moon className="h-4 w-4 text-cyan-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Theme
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {isDark ? "Dark mode active" : "Light mode active"}
            </div>
          </div>
        </div>

        <div className="flex items-center bg-slate-200/80 dark:bg-slate-900/90 p-1 rounded-lg border border-slate-300/60 dark:border-slate-700/60 gap-1">
          <button
            type="button"
            onClick={() => setTheme("light")}
            aria-pressed={!isDark}
            aria-label="Switch to light theme"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              !isDark
                ? "bg-white text-blue-600 shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sun className={`h-3.5 w-3.5 ${!isDark ? "text-amber-500" : "text-slate-400"}`} />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            aria-pressed={isDark}
            aria-label="Switch to dark theme"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isDark
                ? "bg-slate-800 text-cyan-400 shadow-xs border border-slate-700 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Moon className={`h-3.5 w-3.5 ${isDark ? "text-cyan-400" : "text-slate-400"}`} />
            <span>Dark</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:scale-95 transition-all shrink-0 ${className}`}
    >
      <div className="relative h-4 w-4">
        {/* Sun Icon (visible in dark mode) */}
        <Sun
          className={`h-4 w-4 transition-all duration-300 absolute inset-0 ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-amber-400"
              : "rotate-90 scale-0 opacity-0 text-slate-400"
          }`}
        />
        {/* Moon Icon (visible in light mode) */}
        <Moon
          className={`h-4 w-4 transition-all duration-300 absolute inset-0 ${
            isDark
              ? "-rotate-90 scale-0 opacity-0 text-slate-400"
              : "rotate-0 scale-100 opacity-100 text-slate-700 hover:text-blue-600"
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
