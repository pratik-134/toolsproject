import React from "react";
import { BRAND } from "@/lib/brand";

/* =========================================================================
   1. MINDKIT UMBRELLA BRAND ICON & LOGO
   ========================================================================= */

export interface MindkitIconProps {
  size?: number;
  className?: string;
  hasContainer?: boolean;
}

/**
 * Official Logomark for Mindkit (Umbrella Brand)
 *
 * Geometric concept:
 * - A bold, modular hexagonal toolkit prism forming a stylized "M".
 * - Left & right pillars in deep royal indigo (#1E3A8A & #2563EB).
 * - Central precision facet with an electric cyan accent node (#00D2FF),
 *   symbolizing privacy-first client-side computation and 175 integrated tools.
 */
export const MindkitIcon: React.FC<MindkitIconProps> = ({
  size = 32,
  className = "",
  hasContainer = false,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center select-none ${
        hasContainer
          ? "p-1 rounded-xl bg-white shadow-xs border border-slate-200/80"
          : ""
      } ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="mk-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="mk-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Shield / Hex Prism Container */}
        <rect width="40" height="40" rx="9" fill="url(#mk-grad-primary)" />

        {/* Central Geometric 'M' Architecture */}
        {/* Left Vertical Pillar */}
        <path
          d="M10 29V13.5C10 12.6716 10.6716 12 11.5 12H13C13.8284 12 14.5 12.6716 14.5 13.5V29H10Z"
          fill="#FFFFFF"
        />

        {/* Right Vertical Pillar */}
        <path
          d="M25.5 29V13.5C25.5 12.6716 26.1716 12 27 12H28.5C29.3284 12 30 12.6716 30 13.5V29H25.5Z"
          fill="#FFFFFF"
        />

        {/* Center Downward Diagonal Facet */}
        <path
          d="M14.5 13L20 21L25.5 13H28L21.2 22.8C20.6 23.6 19.4 23.6 18.8 22.8L12 13H14.5Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* Precision Cyan Privacy Anchor Node */}
        <circle cx="20" cy="27" r="2.2" fill="url(#mk-grad-cyan)" />
        <circle cx="20" cy="27" r="1" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export interface MindkitLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isLight?: boolean;
  variant?: "horizontal" | "icon-only" | "compact" | "stacked" | "umbrella-lockup";
  productTag?: string;
}

/**
 * Primary Brand Logo for Mindkit (Platform)
 */
export const MindkitLogo: React.FC<MindkitLogoProps> = ({
  size = 32,
  className = "",
  showText = true,
  subtitle = "",
  isLight = false,
  variant = "horizontal",
  productTag,
}) => {
  if (variant === "icon-only" || !showText) {
    return <MindkitIcon size={size} className={className} />;
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <MindkitIcon size={Math.round(size * 1.4)} />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline font-headings font-extrabold tracking-[-0.03em] text-xl sm:text-2xl leading-none">
            <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
              Mind
            </span>
            <span className="text-[#2563EB] dark:text-[#38BDF8] ml-0.5">kit</span>
          </div>
          {productTag && (
            <span className="mt-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {productTag}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <MindkitIcon size={size} />
        <div className="flex flex-col text-left">
          <div className="flex items-baseline font-headings text-sm sm:text-base font-extrabold tracking-[-0.03em] leading-none">
            <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
              Mind
            </span>
            <span className="text-[#2563EB] dark:text-[#38BDF8] ml-0.5">kit</span>
          </div>
          <span
            className={`text-[10px] font-body font-medium mt-0.5 ${
              isLight ? "text-slate-400" : "text-slate-500"
            }`}
          >
            100% Client-Side
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Lockup ([Icon] Mindkit + optional product badge)
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <MindkitIcon size={size} />

      <div className="flex flex-col text-left justify-center">
        <div className="flex items-baseline font-headings text-base sm:text-lg font-extrabold tracking-[-0.03em] leading-none">
          <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
            Mind
          </span>
          <span className="text-[#2563EB] dark:text-[#38BDF8] ml-0.5">kit</span>

          {productTag && (
            <span className="ml-2 font-body text-[11px] font-semibold text-slate-500 hidden sm:inline">
              / {productTag}
            </span>
          )}
        </div>

        {subtitle ? (
          <span
            className={`text-xs font-medium font-body mt-0.5 ${
              isLight ? "text-blue-200/85" : "text-slate-500"
            }`}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
};

/* =========================================================================
   2. RESUME BUILDER PRODUCT ICON & LOGO (FLAGSHIP TOOL)
   ========================================================================= */

export interface ResumeBuilderIconProps {
  size?: number;
  className?: string;
  hasContainer?: boolean;
}

/**
 * Official Logomark for Mindkit Resume Builder (Product Level)
 * Retains the verified R-Document + Lab Flask design.
 */
export const ResumeBuilderIcon: React.FC<ResumeBuilderIconProps> = ({
  size = 36,
  className = "",
  hasContainer = false,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center select-none ${
        hasContainer ? "p-1 rounded-xl bg-white shadow-xs border border-slate-200/80" : ""
      } ${className}`}
    >
      <img
        src="/brand/logo-icon.png"
        width={size}
        height={size}
        alt={BRAND.resumeProduct.name}
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
    </div>
  );
};

export interface ResumeBuilderLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isLight?: boolean;
  variant?: "horizontal" | "icon-only" | "compact" | "stacked" | "umbrella-lockup";
}

/**
 * Primary Brand Logo for Mindkit Resume Builder
 */
export const ResumeBuilderLogo: React.FC<ResumeBuilderLogoProps> = ({
  size = 36,
  className = "",
  showText = true,
  subtitle = "",
  isLight = false,
  variant = "horizontal",
}) => {
  if (variant === "icon-only" || !showText) {
    return <ResumeBuilderIcon size={size} className={className} />;
  }

  if (variant === "umbrella-lockup") {
    return (
      <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
        <MindkitIcon size={size} />
        <div className="flex flex-col text-left justify-center">
          <div className="flex items-baseline font-headings text-base sm:text-lg font-extrabold tracking-[-0.03em] leading-none">
            <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
              Mindkit
            </span>
            <span className="text-[#0066FF] dark:text-[#38BDF8] ml-1.5 font-bold text-sm sm:text-base">
              Resume Builder
            </span>
          </div>
          {subtitle && (
            <span className="text-xs font-medium text-slate-500 font-body mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-2.5 ${className}`}>
        <ResumeBuilderIcon size={Math.round(size * 1.4)} />
        <div className="flex flex-col items-center">
          <span
            className={`font-headings font-extrabold tracking-[-0.03em] text-xl sm:text-2xl leading-none ${
              isLight ? "text-white" : "text-[#0B1229] dark:text-white"
            }`}
          >
            Mindkit
          </span>
          <span className="font-headings font-extrabold tracking-[-0.03em] text-base sm:text-lg leading-tight text-[#0066FF] dark:text-[#38BDF8] mt-1">
            Resume Builder
          </span>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <ResumeBuilderIcon size={size} />
        <div className="flex flex-col text-left">
          <div className="flex items-baseline font-headings text-sm sm:text-base font-extrabold tracking-[-0.03em] leading-none">
            <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
              Mindkit
            </span>
            <span className="text-[#0066FF] dark:text-[#38BDF8] ml-1.5 font-bold text-xs sm:text-sm">
              Resume Builder
            </span>
          </div>
          <span
            className={`text-[10.5px] font-body font-medium mt-0.5 ${
              isLight ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Free & Privacy-First
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Lockup
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <ResumeBuilderIcon size={size} />

      <div className="flex flex-col text-left justify-center">
        <div className="flex items-baseline font-headings text-base sm:text-lg font-extrabold tracking-[-0.03em] leading-none">
          <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
            Mindkit
          </span>
          <span className="text-[#0066FF] dark:text-[#38BDF8] ml-1.5 font-bold text-sm sm:text-base">
            Resume Builder
          </span>
        </div>

        {subtitle ? (
          <span
            className={`text-xs font-medium font-body mt-0.5 ${
              isLight ? "text-blue-200/85" : "text-slate-500"
            }`}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
};

/* =========================================================================
   3. UNIFIED BRAND LOGO & BACKWARD COMPATIBLE EXPORTS
   ========================================================================= */

export interface BrandLogoProps {
  product?: "mindkit" | "resume-builder";
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isLight?: boolean;
  variant?: "horizontal" | "icon-only" | "compact" | "stacked" | "umbrella-lockup";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  product = "mindkit",
  ...props
}) => {
  if (product === "mindkit") {
    return <MindkitLogo {...props} />;
  }
  return <ResumeBuilderLogo {...props} />;
};

export default BrandLogo;
