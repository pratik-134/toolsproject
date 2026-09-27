import React from "react";
import { BRAND } from "@/lib/brand";

/* =========================================================================
   1. CLEARTRIX UMBRELLA BRAND ICON & LOGO
   ========================================================================= */

export interface CleartrixIconProps {
  size?: number;
  className?: string;
  hasContainer?: boolean;
}

/**
 * Official Logomark for Cleartrix (Umbrella Brand)
 *
 * Geometric concept:
 * - A bold, modular hexagonal toolkit prism forming a stylized "C" with matrix geometry.
 * - Deep royal indigo gradient base (#1E3A8A & #2563EB).
 * - Central precision facet with an electric cyan accent node (#00D2FF),
 *   symbolizing privacy-first client-side computation and 111 integrated tools.
 */
export const CleartrixIcon: React.FC<CleartrixIconProps> = ({
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
          <linearGradient id="ct-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="ct-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Shield Container */}
        <rect width="40" height="40" rx="9" fill="url(#ct-grad-primary)" />

        {/* Central Geometric 'C' Prism Architecture */}
        <path
          d="M27 15.5C25.5 13.3 23 12 20 12C14.5 12 10.5 15.8 10.5 20C10.5 24.2 14.5 28 20 28C23 28 25.5 26.7 27 24.5L23.5 22C22.6 23.3 21.4 24 20 24C16.8 24 14.5 22.2 14.5 20C14.5 17.8 16.8 16 20 16C21.4 16 22.6 16.7 23.5 18L27 15.5Z"
          fill="#FFFFFF"
        />

        {/* Precision Cyan Privacy Anchor Node */}
        <circle cx="20" cy="20" r="2.4" fill="url(#ct-grad-cyan)" />
        <circle cx="20" cy="20" r="1.1" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export interface CleartrixLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isLight?: boolean;
  variant?: "horizontal" | "icon-only" | "compact" | "stacked" | "umbrella-lockup";
  productTag?: string;
}

/**
 * Primary Brand Logo for Cleartrix (Platform)
 */
export const CleartrixLogo: React.FC<CleartrixLogoProps> = ({
  size = 32,
  className = "",
  showText = true,
  subtitle = "",
  isLight = false,
  variant = "horizontal",
  productTag,
}) => {
  if (variant === "icon-only" || !showText) {
    return <CleartrixIcon size={size} className={className} />;
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <CleartrixIcon size={Math.round(size * 1.4)} />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline font-headings font-extrabold tracking-[-0.03em] text-xl sm:text-2xl leading-none">
            <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
              Clear
            </span>
            <span className="text-[#2563EB] dark:text-[#38BDF8] ml-0.5">trix</span>
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
        <CleartrixIcon size={size} />
        <div className="flex flex-col text-left">
          <div className="flex items-baseline font-headings text-sm sm:text-base font-extrabold tracking-[-0.03em] leading-none">
            <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
              Clear
            </span>
            <span className="text-[#2563EB] dark:text-[#38BDF8] ml-0.5">trix</span>
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

  // Default: Horizontal Lockup ([Icon] Cleartrix + optional product badge)
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <CleartrixIcon size={size} />

      <div className="flex flex-col text-left justify-center">
        <div className="flex items-baseline font-headings text-base sm:text-lg font-extrabold tracking-[-0.03em] leading-none">
          <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
            Clear
          </span>
          <span className="text-[#2563EB] dark:text-[#38BDF8] ml-0.5">trix</span>

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
 * Official Logomark for Cleartrix Resume Builder (Product Level)
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
 * Primary Brand Logo for Cleartrix Resume Builder
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
        <CleartrixIcon size={size} />
        <div className="flex flex-col text-left justify-center">
          <div className="flex items-baseline font-headings text-base sm:text-lg font-extrabold tracking-[-0.03em] leading-none">
            <span className={isLight ? "text-white" : "text-[#0B1229] dark:text-white"}>
              Cleartrix
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
            Cleartrix
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
              Cleartrix
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
            Cleartrix
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
  product?: "cleartrix" | "resume-builder";
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isLight?: boolean;
  variant?: "horizontal" | "icon-only" | "compact" | "stacked" | "umbrella-lockup";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  product = "cleartrix",
  ...props
}) => {
  if (product === "resume-builder") {
    return <ResumeBuilderLogo {...props} />;
  }
  return <CleartrixLogo {...props} />;
};

export default BrandLogo;
