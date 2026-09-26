"use client";

import React, { useState, useEffect, useRef } from "react";
import { ResumeData } from "@/lib/schema";
import { getTemplateComponent } from "@/components/templates/registry";

interface TemplateThumbnailProps {
  templateId: string;
  data: ResumeData;
  className?: string;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  templateId,
  data,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scale, setScale] = useState<number>(0.34);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy load using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Dynamically calculate scale so the A4 sheet fills the entire card width ("full show") without white gaps
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          // 794px is the standard rendered A4 preview width
          const computed = width / 794;
          setScale(Math.max(0.15, Math.min(0.85, computed)));
        }
      }
    };

    updateScale();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateScale();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateScale);
    return () => {
      window.removeEventListener("resize", updateScale);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const TemplateComponent = getTemplateComponent(templateId);

  const previewData: ResumeData = {
    ...data,
    theme: {
      ...data.theme,
      templateId,
    },
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[220px] overflow-hidden bg-white flex items-start justify-center pt-0 select-none ${className}`}
    >
      {isVisible ? (
        <>
          {/* Centered A4 Document Sheet scaled to fill 100% width */}
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              width: 794,
              height: 1123,
            }}
            className="shrink-0 bg-white pointer-events-none select-none transition-transform duration-150"
          >
            <TemplateComponent data={previewData} />
          </div>

          {/* Bottom subtle gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white via-white/60 to-transparent pointer-events-none" />
        </>
      ) : (
        <div className="w-full h-full bg-white p-4 space-y-2 animate-pulse">
          <div className="h-3 w-1/3 bg-slate-200 rounded" />
          <div className="h-2 w-1/4 bg-blue-100 rounded" />
          <div className="h-px bg-slate-100 my-2" />
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full bg-slate-200 rounded" />
            <div className="h-1.5 w-5/6 bg-slate-200 rounded" />
            <div className="h-1.5 w-4/6 bg-slate-200 rounded" />
          </div>
          <div className="space-y-1 pt-2">
            <div className="h-1.5 w-full bg-slate-200 rounded" />
            <div className="h-1.5 w-3/4 bg-slate-200 rounded" />
          </div>
        </div>
      )}
    </div>
  );
};
