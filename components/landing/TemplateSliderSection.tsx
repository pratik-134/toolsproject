"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TemplateCardPreview } from "@/components/templates/TemplateCardPreview";
import { TEMPLATES_LIST, TemplateInfo } from "@/components/templates/registry";
import { Reveal } from "@/components/ui/reveal";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  LayoutTemplate,
} from "lucide-react";

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  "ats-safe": "ATS-Safe",
  "modern": "Modern",
  "professional": "Professional",
  "specialized": "Specialized",
};

export const TemplateSliderSection: React.FC = () => {
  const [itemsPerView, setItemsPerView] = useState<number>(3);
  const [currentIndex, setCurrentIndex] = useState<number>(TEMPLATES_LIST.length);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const startXRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Triplicate templates for seamless infinite forward/backward loop
  const infiniteSlides: TemplateInfo[] = [
    ...TEMPLATES_LIST,
    ...TEMPLATES_LIST,
    ...TEMPLATES_LIST,
  ];

  const totalOriginal = TEMPLATES_LIST.length;

  // Responsive items per view: 3 desktop (>= 1024px), 2 tablet (>= 640px), 1 mobile (< 640px)
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 1024) {
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

  // Slide navigation
  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  const goToSlide = (originalIndex: number) => {
    setIsTransitioning(true);
    setCurrentIndex(totalOriginal + originalIndex);
  };

  // Autoplay management
  useEffect(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    if (isAutoPlaying && !isHovered && !isDragging) {
      autoPlayTimerRef.current = setInterval(() => {
        nextSlide();
      }, 3400);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, isHovered, isDragging, nextSlide]);

  // Handle seamless infinite loop resetting after transition finishes
  const handleTransitionEnd = () => {
    if (currentIndex >= totalOriginal * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - totalOriginal);
    } else if (currentIndex < totalOriginal) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + totalOriginal);
    }
  };

  // Touch and pointer dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with primary mouse click or touch
    if (e.button !== 0 && e.pointerType === "mouse") return;
    setIsDragging(true);
    startXRef.current = e.clientX;
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    setDragOffset(diff);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 60;
    if (dragOffset < -threshold) {
      nextSlide();
    } else if (dragOffset > threshold) {
      prevSlide();
    }
    setDragOffset(0);
  };

  const activeOriginalIndex = currentIndex % totalOriginal;
  const slidePercentWidth = 100 / itemsPerView;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/25 to-slate-50/60 py-12 sm:py-16 md:py-20 border-b border-slate-200">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-grid-light opacity-60 pointer-events-none" />

      {/* Decorative Radial Spotlight in Brand Blue */}
      <div
        className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 w-[700px] h-[320px] rounded-full blur-3xl opacity-35"
        style={{
          background:
            "radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(147, 197, 253, 0.08) 50%, transparent 75%)",
        }}
      />

      <div className="max-w-container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <Reveal variant="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
            <div className="space-y-2.5 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1 font-body text-eyebrow uppercase tracking-[1.2px] text-blue-800 font-bold shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Auto-Playing Template Showcase</span>
              </div>
              <h2 className="font-headings text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Explore 20 Recruiter-Approved Styles
              </h2>
              <p className="font-body text-sm sm:text-base text-slate-600 leading-relaxed">
                Handcrafted for modern engineering, executive, and creative careers.
                Every template is tested against ATS parsers and compiles cleanly to PDF and Word.
              </p>
            </div>

            {/* Slider Controls Bar */}
            <div className="flex items-center gap-3 self-start md:self-end shrink-0">
              {/* Autoplay Play/Pause Toggle */}
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isAutoPlaying
                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/60"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                title={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
                aria-label={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Autoplay</span>
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Paused</span>
                  </>
                )}
              </button>

              {/* Prev / Next Navigation Arrows */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevSlide}
                  className="h-8 w-8 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  aria-label="Previous template"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextSlide}
                  className="h-8 w-8 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  aria-label="Next template"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Link to Full Template Gallery */}
              <Link href="#templates" className="hidden lg:inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-semibold h-9 px-3 gap-1.5 shadow-2xs transition-colors"
                >
                  <span>All 20</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>

        {/* ========================================================================= */}
        {/* Slider Viewport with Side Gradient Vignettes                              */}
        {/* ========================================================================= */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none py-2"
        >
          {/* Left Gradient Mask */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-20" />

          {/* Right Gradient Mask */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-20" />

          {/* Sliding Track */}
          <div
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translate3d(calc(-${currentIndex * slidePercentWidth}% + ${dragOffset}px), 0, 0)`,
              transition: isTransitioning && !isDragging ? "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            }}
            className="flex will-change-transform"
          >
            {infiniteSlides.map((template, idx) => {
              const categoryLabel = CATEGORY_DISPLAY_MAP[template.category] || template.category;

              return (
                <div
                  key={`${template.id}-${idx}`}
                  style={{ flex: `0 0 ${slidePercentWidth}%` }}
                  className="px-2.5 sm:px-3"
                >
                  <div className="h-full rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                    {/* Live Scaled A4 Sheet Thumbnail */}
                    <div className="relative overflow-hidden bg-slate-50 border-b border-slate-100">
                      {/* Floating Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                        <span className="bg-white/95 backdrop-blur-xs text-slate-800 px-2.5 py-0.5 rounded-md font-body text-[10px] uppercase tracking-[1px] font-bold border border-slate-200 shadow-2xs">
                          {categoryLabel}
                        </span>
                        <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold shadow-2xs flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-blue-400" />
                          ATS {template.atsScore}%
                        </span>
                      </div>

                      {/* Scaled Preview Sheet */}
                      <div className="transition-transform duration-500 group-hover:scale-[1.02]">
                        <TemplateCardPreview templateId={template.id} />
                      </div>

                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-4 z-20">
                        <Link
                          href={`/editor?template=${template.id}`}
                          className="w-full max-w-[190px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            className="w-full gap-2 font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg h-10 text-xs shadow-md"
                          >
                            <Sparkles className="h-3.5 w-3.5" /> Use This Template
                          </Button>
                        </Link>
                        <span className="text-[11px] text-slate-300 font-medium">
                          100% Free • Direct Editor Launch
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 text-left">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="font-headings text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {template.name}
                        </h3>
                        <span className="font-body text-[11px] text-blue-600 font-bold shrink-0 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                          Free
                        </span>
                      </div>

                      <p className="font-body text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {template.description}
                      </p>

                      {/* Font & Badges Pill */}
                      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-slate-500 truncate max-w-[140px]">
                          {template.fontName}
                        </span>
                        <Link
                          href={`/editor?template=${template.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 gap-1 rounded-md"
                          >
                            <span>Customize</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Slider Pagination Dots & Quick Indicators                                 */}
        {/* ========================================================================= */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <LayoutTemplate className="h-4 w-4 text-blue-600" />
            <span>
              Showing template <strong className="text-slate-900">{activeOriginalIndex + 1}</strong> of{" "}
              <strong className="text-slate-900">{totalOriginal}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-400">Drag or use arrows to navigate</span>
          </div>

          {/* Interactive Navigation Dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
            {TEMPLATES_LIST.map((t, idx) => {
              const isActive = activeOriginalIndex === idx;
              return (
                <button
                  key={t.id}
                  onClick={() => goToSlide(idx)}
                  className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isActive
                      ? "w-6 h-2 bg-blue-600 shadow-xs shadow-blue-500/30"
                      : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  title={`Jump to ${t.name}`}
                  aria-label={`Jump to ${t.name}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
