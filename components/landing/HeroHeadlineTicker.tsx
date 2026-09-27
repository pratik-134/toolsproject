"use client";

import React, { useState, useEffect, useRef } from "react";

interface TickerItem {
  text: string;
  colorClass: string;
}

const BASE_ITEMS: TickerItem[] = [
  { text: "ATS Resumes", colorClass: "text-blue-600" },
  { text: "PDF Documents", colorClass: "text-red-600" },
  { text: "Image Conversion", colorClass: "text-orange-600" },
  { text: "Document Tools", colorClass: "text-emerald-600" },
  { text: "Security Utilities", colorClass: "text-blue-700" },
  { text: "Web Converters", colorClass: "text-purple-600" },
];

// Append clone of the first item to enable seamless infinite scroll-up loop with zero rewind
const TICKER_ITEMS: TickerItem[] = [
  ...BASE_ITEMS,
  { text: "ATS Resumes", colorClass: "text-blue-600" },
];

export const HeroHeadlineTicker: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect prefers-reduced-motion
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

  // Pause rotation when tab is hidden
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

  // Infinite vertical scroll-up interval
  useEffect(() => {
    if (prefersReducedMotion || !isPageVisible) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setIndex((prev) => prev + 1);
    }, 2500);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [prefersReducedMotion, isPageVisible]);

  // When we reach the clone (last element), seamlessly snap back to index 0 without transition
  const handleTransitionEnd = () => {
    if (index >= BASE_ITEMS.length) {
      setIsTransitioning(false);
      setIndex(0);
    }
  };

  return (
    <h1 className="font-headings text-[28px] xs:text-[34px] sm:text-hero-mobile md:text-hero-tablet lg:text-hero text-slate-900 leading-[1.14] tracking-tight">
      The free privacy engine for{" "}
      <span className="inline-flex flex-col h-[1.28em] overflow-hidden align-top relative font-black">
        <span
          onTransitionEnd={handleTransitionEnd}
          className={
            isTransitioning && !prefersReducedMotion
              ? "transition-transform duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform"
              : ""
          }
          style={{
            transform: prefersReducedMotion ? "none" : `translateY(-${index * (100 / TICKER_ITEMS.length)}%)`,
          }}
        >
          {TICKER_ITEMS.map((item, i) => (
            <span
              key={`${item.text}-${i}`}
              className={`h-[1.28em] flex items-center whitespace-nowrap px-0.5 ${item.colorClass}`}
              aria-hidden={index % BASE_ITEMS.length !== i % BASE_ITEMS.length}
            >
              {item.text}
            </span>
          ))}
        </span>
      </span>
      <br />
      that never traps your data.
    </h1>
  );
};
