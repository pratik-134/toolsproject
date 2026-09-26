"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CATEGORIES } from "@/lib/registry/categories";
import { CATEGORY_COLORS } from "@/lib/design-tokens";

interface RotatingItem {
  id: string;
  text: string;
  color: string;
}

export const RotatingWord: React.FC = () => {
  // Construct the 5 rotating words matching the 5 design token category groups
  // pulling category names dynamically from the registry to avoid duplication.
  const rotatingItems: RotatingItem[] = useMemo(() => [
    {
      id: "resume-builder",
      text: "Resume Builder",
      color: CATEGORY_COLORS.document.heroText,
    },
    {
      id: "pdf-tools",
      text: `${CATEGORIES["document-pdf"]?.shortName?.split("&")[0]?.trim() ?? "PDF"} Tools`,
      color: CATEGORY_COLORS.pdf.heroText,
    },
    {
      id: "image-converters",
      text: `${CATEGORIES["image"]?.shortName?.replace(/s$/, "") ?? "Image"} Converters`,
      color: CATEGORY_COLORS.image.heroText,
    },
    {
      id: "calculators",
      text: CATEGORIES["calculators"]?.shortName ?? "Calculators",
      color: CATEGORY_COLORS.utility.heroText,
    },
    {
      id: "security-tools",
      text: `${CATEGORIES["security"]?.shortName ?? "Security"} Tools`,
      color: CATEGORY_COLORS.security.heroText,
    },
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

  // 1. Detect and react to prefers-reduced-motion OS preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  // 2. Pause rotation when the browser tab is hidden using Page Visibility API
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 3. Word rotation interval (~2.2s) with crossfade animation
  useEffect(() => {
    // If reduced motion is preferred or tab is hidden, do not rotate
    if (prefersReducedMotion || !isPageVisible) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      // Step 1: Fade out & translate up
      setIsFading(true);

      // Step 2: Swap word and fade back in
      timeoutId = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rotatingItems.length);
        setIsFading(false);
      }, 200);
    }, 2200);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion, isPageVisible, rotatingItems.length]);

  const fallbackItem: RotatingItem = {
    id: "resume-builder",
    text: "Resume Builder",
    color: CATEGORY_COLORS.document.heroText,
  };
  const activeItem: RotatingItem = rotatingItems[currentIndex] ?? rotatingItems[0] ?? fallbackItem;

  return (
    <div
      className="flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-slate-500 min-h-[26px]"
      aria-label="Also free forever categories"
    >
      <span className="shrink-0 text-slate-500">Also free forever:</span>
      <span
        aria-live="off"
        className={`inline-block font-semibold tracking-tight ${
          prefersReducedMotion
            ? ""
            : isFading
            ? "opacity-0 -translate-y-1 transition-all duration-200 ease-in"
            : "opacity-100 translate-y-0 transition-all duration-300 ease-out"
        }`}
        style={{
          color: activeItem.color,
        }}
      >
        {activeItem.text}
      </span>
    </div>
  );
};
