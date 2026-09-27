"use client";

import React, { useState, useEffect } from "react";

interface TickerItem {
  text: string;
  colorClass: string;
}

const TICKER_ITEMS: TickerItem[] = [
  { text: "ATS Resumes", colorClass: "text-blue-600" },
  { text: "PDF Documents", colorClass: "text-red-600" },
  { text: "Image Conversion", colorClass: "text-orange-600" },
  { text: "Document Tools", colorClass: "text-emerald-600" },
  { text: "Security Utilities", colorClass: "text-blue-700" },
  { text: "Web Converters", colorClass: "text-purple-600" },
];

export const HeroHeadlineTicker: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

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

  // Vertical scroll-up interval
  useEffect(() => {
    if (prefersReducedMotion || !isPageVisible) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, isPageVisible]);

  return (
    <h1 className="font-headings text-[30px] xs:text-[36px] sm:text-hero-mobile md:text-hero-tablet lg:text-hero text-slate-900 leading-[1.12] tracking-tight">
      The free privacy engine for{" "}
      <span className="inline-flex flex-col h-[1.18em] overflow-hidden align-top relative font-black">
        <span
          className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: prefersReducedMotion ? "none" : `translateY(-${index * 100}%)` }}
        >
          {TICKER_ITEMS.map((item, i) => (
            <span
              key={item.text}
              className={`h-[1.18em] flex items-center whitespace-nowrap ${item.colorClass}`}
              aria-hidden={index !== i}
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
