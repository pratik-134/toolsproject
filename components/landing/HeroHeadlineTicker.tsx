"use client";

import React, { useState, useEffect, useRef } from "react";

interface TickerItem {
  text: string;
  colorClass: string;
}

const BASE_ITEMS: TickerItem[] = [
  { text: "ATS Resumes", colorClass: "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 font-extrabold" },
  { text: "PDF Documents", colorClass: "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-extrabold" },
  { text: "Image Converters", colorClass: "bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 font-extrabold" },
  { text: "Document Tools", colorClass: "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 font-extrabold" },
  { text: "Security Utilities", colorClass: "bg-clip-text text-transparent bg-gradient-to-r from-slate-900 dark:from-slate-100 via-blue-800 dark:via-blue-300 to-indigo-900 dark:to-indigo-300 font-extrabold" },
  { text: "Web Converters", colorClass: "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 font-extrabold" },
];

// Append clone of the first item to enable seamless infinite scroll-up loop with zero rewind
const TICKER_ITEMS: TickerItem[] = [
  ...BASE_ITEMS,
  { text: "ATS Resumes", colorClass: "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 font-extrabold" },
];

export interface HeroHeadlineTickerProps {
  centered?: boolean;
  className?: string;
}

export const HeroHeadlineTicker: React.FC<HeroHeadlineTickerProps> = ({
  centered = true,
  className = "",
}) => {
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
    <h1
      className={`font-headings text-[21px] xs:text-[25px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.2] tracking-tight ${
        centered ? "text-center" : "text-left"
      } ${className}`}
    >
      The free privacy engine for{" "}
      <span className="inline-flex flex-col h-[1.28em] overflow-hidden align-top relative font-black max-w-full">
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
              className={`h-[1.28em] flex items-center ${
                centered ? "justify-center" : "justify-start"
              } whitespace-nowrap px-1 ${item.colorClass}`}
              aria-hidden={index % BASE_ITEMS.length !== i % BASE_ITEMS.length}
            >
              {item.text}
            </span>
          ))}
        </span>
      </span>
      <br className="hidden sm:inline" />
      {" "}that never traps your data.
    </h1>
  );
};
