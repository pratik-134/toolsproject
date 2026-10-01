"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

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
