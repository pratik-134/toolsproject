"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TemplateCardPreview } from "@/components/templates/TemplateCardPreview";
import { TEMPLATES_LIST, TemplateInfo } from "@/components/templates/registry";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal,
  LayoutTemplate,
} from "lucide-react";

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  "ats-safe": "ATS-Safe",
  modern: "Modern",
  professional: "Professional",
  specialized: "Specialized",
};

const FILTER_TABS = [
  { key: "all", label: `All (${TEMPLATES_LIST.length})` },
  { key: "executive", label: "Executive" },
  { key: "tech", label: "Tech & Engineering" },
  { key: "modern", label: "Modern" },
  { key: "minimal", label: "Minimal" },
  { key: "academic", label: "Academic" },
] as const;

type FilterTabKey = (typeof FILTER_TABS)[number]["key"];

function matchesCategory(template: TemplateInfo, category: FilterTabKey): boolean {
  if (category === "all") return true;
  if (category === "executive") {
    return ["executive", "corporate", "classic", "elegant"].includes(template.id);
  }
  if (category === "tech") {
    return ["tech", "startup", "infographic-light", "hybrid"].includes(template.id);
  }
  if (category === "modern") {
    return ["modern", "swiss", "nordic", "two-column"].includes(template.id);
  }
  if (category === "minimal") {
    return ["minimal", "simple", "compact", "ats-safe"].includes(template.id);
  }
  if (category === "academic") {
    return ["academic", "timeline", "bold", "creative"].includes(template.id);
  }
  return true;
}

export const LandingTemplatesSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<FilterTabKey>("all");
  const [showFullGrid, setShowFullGrid] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [itemsPerView, setItemsPerView] = useState<number>(4);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const startXRef = useRef<number>(0);

  // Responsive items per view: 4 on xl (>=1280px), 3 on lg (>=1024px), 2 on sm (>=640px), 1 on mobile
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 1280) {
        setItemsPerView(4);
      } else if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 640) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredTemplates = TEMPLATES_LIST.filter((t) =>
    matchesCategory(t, selectedCategory)
  );

  // Reset carousel index whenever category changes
  const handleCategorySelect = (key: FilterTabKey) => {
    setSelectedCategory(key);
    setCurrentIndex(0);
  };

  // Total slides count includes the filtered templates + 1 "Browse All" callout card
  const totalSlides = filteredTemplates.length + 1;
  const maxIndex = Math.max(0, totalSlides - itemsPerView);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  // Touch and pointer dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    setIsDragging(true);
    startXRef.current = e.clientX;
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - startXRef.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 50;
    if (dragOffset < -threshold) {
      nextSlide();
    } else if (dragOffset > threshold) {
      prevSlide();
    }
    setDragOffset(0);
  };

  const slideWidthPercent = 100 / itemsPerView;

  return (
    <div className="space-y-6">
      {/* Filter Tabs & View Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Resume template categories"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {FILTER_TABS.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleCategorySelect(cat.key)}
                className={`whitespace-nowrap shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Carousel Nav Controls & Grid Toggle */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          {!showFullGrid && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-2xs">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="h-7 w-7 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous templates"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 px-1.5 font-medium">
                {currentIndex + 1}–{Math.min(currentIndex + itemsPerView, totalSlides)} of {totalSlides}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className="h-7 w-7 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next templates"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Toggle between Compact Carousel & Full Grid View */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullGrid(!showFullGrid)}
            className="h-9 px-3.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 gap-1.5 rounded-lg shadow-2xs"
          >
            {showFullGrid ? (
              <>
                <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Carousel View</span>
              </>
            ) : (
              <>
                <LayoutGrid className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>View All Grid</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mode A: Compact Carousel/Slider (Default) */}
      {!showFullGrid ? (
        <div className="relative overflow-hidden">
          <div
            className="overflow-hidden select-none cursor-grab active:cursor-grabbing -mx-2 px-2 py-2"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div
              className="flex transition-transform ease-out will-change-transform"
              style={{
                transform: `translateX(calc(-${currentIndex * slideWidthPercent}% + ${dragOffset}px))`,
                transitionDuration: isDragging ? "0ms" : "350ms",
              }}
            >
              {filteredTemplates.map((t) => (
                <div
                  key={t.id}
                  className="shrink-0 px-2"
                  style={{ width: `${slideWidthPercent}%` }}
                >
                  <div className="h-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_28px_-4px_rgba(15,23,42,0.14)] dark:shadow-none dark:hover:shadow-none hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200 ease-in-out group flex flex-col justify-between text-left overflow-hidden">
                    <div>
                      {/* Live Scaled A4 Template Box */}
                      <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        {/* Top Floating Badges */}
                        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-none">
                          <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-md font-body text-xs uppercase tracking-wider font-bold border border-slate-200 dark:border-slate-700 shadow-2xs">
                            {CATEGORY_DISPLAY_MAP[t.category] || t.category}
                          </span>
                          <span className="bg-slate-900 text-white px-2.5 py-1 rounded-md font-mono text-xs font-bold shadow-2xs flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-blue-400" />
                            ATS {t.atsScore}%
                          </span>
                        </div>

                        {/* Scaled Template Visual */}
                        <div className="transition-transform duration-500 group-hover:scale-[1.02]">
                          <TemplateCardPreview templateId={t.id} />
                        </div>

                        {/* Hover Action Overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-4 z-20">
                          <Link
                            href={`/editor?template=${t.id}`}
                            className="w-full max-w-[170px]"
                          >
                            <Button
                              size="sm"
                              className="w-full gap-1.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 text-sm shadow-md"
                            >
                              <Sparkles className="h-4 w-4" /> Use Template
                            </Button>
                          </Link>
                          <span className="text-xs text-slate-300 font-medium">
                            100% Free • No Account
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-headings text-base sm:text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {t.name}
                          </h3>
                          <span className="font-body text-xs text-blue-600 dark:text-blue-400 font-bold shrink-0 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 px-2 py-0.5 rounded">
                            Free
                          </span>
                        </div>
                        <p className="font-body text-sm text-slate-700 dark:text-slate-200 font-medium mt-2 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
                      <span className="font-body text-xs text-slate-700 dark:text-slate-200 font-semibold truncate">
                        PDF • Word DOCX
                      </span>
                      <Link href={`/editor?template=${t.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-300 rounded-md text-xs sm:text-sm font-bold h-7 px-2.5 gap-1 transition-colors"
                        >
                          Use <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Final Carousel Card: "Browse All 20 Templates →" */}
              <div
                className="shrink-0 px-2"
                style={{ width: `${slideWidthPercent}%` }}
              >
                <div className="h-full min-h-[360px] rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
                      <LayoutTemplate className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block mb-1">
                        Full Gallery
                      </span>
                      <h3 className="font-headings text-xl font-black text-white leading-snug">
                        Browse All 20 Templates
                      </h3>
                      <p className="font-body text-xs text-blue-100/90 mt-2 leading-relaxed">
                        Compare every design, typography pairing, and custom section style live in the builder.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/15">
                    <Link href="/editor" className="block w-full">
                      <Button
                        size="sm"
                        className="w-full bg-white hover:bg-blue-50 text-blue-900 font-bold h-10 rounded-lg text-xs gap-1.5 shadow-md transition-colors"
                      >
                        Open In Editor <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <p className="text-[11px] text-blue-200 text-center font-medium">
                      Zero paywalls • 100% free export
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mode B: Full 20-Template Responsive Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_28px_-4px_rgba(15,23,42,0.14)] dark:shadow-none dark:hover:shadow-none hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200 ease-in-out group flex flex-col justify-between text-left overflow-hidden"
            >
              <div>
                <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-none">
                    <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-md font-body text-xs uppercase tracking-wider font-bold border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {CATEGORY_DISPLAY_MAP[t.category] || t.category}
                    </span>
                    <span className="bg-slate-900 text-white px-2.5 py-1 rounded-md font-mono text-xs font-bold shadow-2xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-blue-400" />
                      ATS {t.atsScore}%
                    </span>
                  </div>

                  <div className="transition-transform duration-500 group-hover:scale-[1.02]">
                    <TemplateCardPreview templateId={t.id} />
                  </div>

                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-4 z-20">
                    <Link
                      href={`/editor?template=${t.id}`}
                      className="w-full max-w-[170px]"
                    >
                      <Button
                        size="sm"
                        className="w-full gap-1.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 text-sm shadow-md"
                      >
                        <Sparkles className="h-4 w-4" /> Use Template
                      </Button>
                    </Link>
                    <span className="text-xs text-slate-300 font-medium">
                      100% Free • No Account
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-headings text-base sm:text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t.name}
                    </h3>
                    <span className="font-body text-xs text-blue-600 dark:text-blue-400 font-bold shrink-0 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 px-2 py-0.5 rounded">
                      Free
                    </span>
                  </div>
                  <p className="font-body text-sm text-slate-700 dark:text-slate-200 font-medium mt-2 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
                <span className="font-body text-xs text-slate-700 dark:text-slate-200 font-semibold">
                  PDF • Word DOCX
                </span>
                <Link href={`/editor?template=${t.id}`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-300 rounded-md text-xs sm:text-sm font-bold h-7 px-2.5 gap-1 transition-colors"
                  >
                    Use <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
