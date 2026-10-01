"use client";

import React from "react";

interface ModernWaveDividerProps {
  variant?: "zigzag" | "wave" | "curved";
  fillColor?: string;
  accentColor?: string;
  className?: string;
}

/**
 * Modern fluid geometric wave / zig-zag section divider
 * Creates smooth organic transitions between website sections.
 */
export const ModernWaveDivider: React.FC<ModernWaveDividerProps> = ({
  variant = "zigzag",
  fillColor = "fill-slate-50/80",
  accentColor = "rgba(59, 130, 246, 0.08)",
  className = "",
}) => {
  if (variant === "zigzag") {
    return (
      <div
        className={`w-full overflow-hidden leading-none pointer-events-none select-none dark:hidden ${className}`}
        aria-hidden="true"
      >
        <svg
          className="relative block w-full h-8 sm:h-12 lg:h-16"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          {/* Background accent wave */}
          <path
            d="M0,30 L240,60 L480,15 L720,55 L960,20 L1200,65 L1440,25 L1440,80 L0,80 Z"
            fill={accentColor}
          />
          {/* Foreground main fill */}
          <path
            d="M0,45 L180,15 L360,60 L540,25 L720,65 L900,20 L1080,55 L1260,15 L1440,50 L1440,80 L0,80 Z"
            className={fillColor}
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none select-none dark:hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        className="relative block w-full h-10 sm:h-14 lg:h-20"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 C320,100 420,0 720,50 C1020,100 1120,10 1440,40 L1440,100 L0,100 Z"
          fill={accentColor}
        />
        <path
          d="M0,60 C280,10 480,90 720,30 C960,80 1200,20 1440,70 L1440,100 L0,100 Z"
          className={fillColor}
        />
      </svg>
    </div>
  );
};
