"use client";

import React from "react";
import { Download, Check } from "lucide-react";
import { usePwa } from "./PwaProvider";

export function InstallButton({ className = "" }: { className?: string }) {
  const { isInstallable, isInstalled, installApp } = usePwa();

  if (isInstalled) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 ${className}`}
      >
        <Check className="w-3.5 h-3.5" />
        <span>App Installed</span>
      </span>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={installApp}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors ${className}`}
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install App</span>
    </button>
  );
}
