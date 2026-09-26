"use client";

import React, { useState, useEffect, useRef } from "react";

export interface AnimatedBannerBackgroundProps {
  variant?: "hero" | "cta";
  className?: string;
  showSpotlight?: boolean;
}

export const AnimatedBannerBackground: React.FC<AnimatedBannerBackgroundProps> = ({
  variant = "hero",
  className = "",
  showSpotlight = true,
}) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    if (!showSpotlight) return;

    const handlePointerMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      ) {
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        setMousePos(null);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [showSpotlight]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Atmospheric Ambient Mesh Glows (Sapphire, Sky & Mint) */}
      {variant === "hero" ? (
        <>
          {/* Primary Sapphire Horizon Glow (Anchored behind the right-hand mockup) */}
          <div
            className="absolute top-1/3 -right-24 sm:-right-12 w-[520px] sm:w-[720px] h-[380px] sm:h-[500px] rounded-full blur-[90px] sm:blur-[120px] opacity-70"
            style={{
              background:
                "radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(96, 165, 250, 0.14) 40%, rgba(147, 197, 253, 0.05) 70%, transparent 85%)",
            }}
          />

          {/* Secondary Soft Sky Glow (Top Left behind Title) */}
          <div
            className="absolute -top-32 -left-20 sm:-left-12 w-[460px] sm:w-[640px] h-[360px] sm:h-[480px] rounded-full blur-[80px] sm:blur-[110px] opacity-65"
            style={{
              background:
                "radial-gradient(circle, rgba(96, 165, 250, 0.18) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 80%)",
            }}
          />

          {/* Central Pedestal Glow */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[220px] rounded-full blur-[70px] opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.15) 0%, rgba(147, 197, 253, 0.08) 50%, transparent 80%)",
            }}
          />
        </>
      ) : (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[380px] rounded-full blur-[90px] opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(96, 165, 250, 0.12) 50%, transparent 80%)",
          }}
        />
      )}

      {/* 2. Bespoke Sculpted Ribbon Curves & Document Flow Architecture */}
      <div className="absolute inset-0">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1440 680"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Silky linear gradients for clean fluid curves */}
            <linearGradient id="silk-flow-primary" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.0" />
              <stop offset="20%" stopColor="#2563EB" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.22" />
              <stop offset="80%" stopColor="#60A5FA" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="silk-flow-secondary" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.0" />
              <stop offset="30%" stopColor="#60A5FA" stopOpacity="0.15" />
              <stop offset="65%" stopColor="#2563EB" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="silk-flow-accent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.0" />
              <stop offset="35%" stopColor="#3B82F6" stopOpacity="0.12" />
              <stop offset="70%" stopColor="#93C5FD" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>

            {/* Subtle luminous ribbon gradient fill */}
            <linearGradient id="silk-ribbon-fill-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.02" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="silk-ribbon-fill-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.025" />
              <stop offset="60%" stopColor="#2563EB" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fluid Ribbon Plane 1: Background Atmospheric Layer */}
          <path
            d="M -100 240 C 240 110, 520 380, 890 200 C 1160 70, 1380 260, 1540 180 L 1540 460 C 1360 410, 1140 290, 890 350 C 580 430, 260 280, -100 370 Z"
            fill="url(#silk-ribbon-fill-1)"
          />

          {/* Fluid Ribbon Plane 2: Foreground Luminous Layer */}
          <path
            d="M -100 360 C 280 200, 600 480, 960 280 C 1220 130, 1420 360, 1540 280 L 1540 560 C 1380 500, 1180 380, 920 440 C 600 520, 280 390, -100 480 Z"
            fill="url(#silk-ribbon-fill-2)"
          />

          {/* Primary Silk Contour 1 */}
          <path
            d="M -100 240 C 240 110, 520 380, 890 200 C 1160 70, 1380 260, 1540 180"
            stroke="url(#silk-flow-accent)"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Primary Silk Contour 2 (Central Graceful Arc) */}
          <path
            d="M -100 310 C 260 160, 560 430, 930 240 C 1190 100, 1400 310, 1540 230"
            stroke="url(#silk-flow-primary)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Primary Silk Contour 3 */}
          <path
            d="M -100 380 C 290 220, 610 490, 980 290 C 1230 140, 1420 370, 1540 290"
            stroke="url(#silk-flow-secondary)"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Low Anchor Wave with Grounding Bleed */}
          <path
            d="M -100 470 C 320 290, 660 560, 1040 350 C 1280 200, 1450 440, 1540 360"
            stroke="url(#silk-flow-accent)"
            strokeWidth="1.0"
            fill="none"
          />
        </svg>
      </div>

      {/* 3. Sleek Luminous Horizon Line (Grounded Architectural Stage) */}
      {variant === "hero" && (
        <div className="absolute inset-x-0 bottom-10 sm:bottom-14 h-px pointer-events-none">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="w-1/2 mx-auto h-5 -translate-y-1/2 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent blur-md rounded-full" />
        </div>
      )}

      {/* 4. Interactive Mouse Proximity Spotlight (Follows cursor with subtle refraction) */}
      {showSpotlight && isClient && mousePos && (
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.08) 0%, rgba(147, 197, 253, 0.03) 40%, transparent 75%)`,
          }}
        />
      )}

      {/* 5. Edge Feathering Masks (Zero harsh cuts at section edges) */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/90 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
    </div>
  );
};
