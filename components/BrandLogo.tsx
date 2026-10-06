import React from "react";
import { BRAND } from "@/lib/brand";

/* =========================================================================
   1. QWERTYGEN OFFICIAL LOGOMARK (CONCEPT 1: CONTINUOUS RIBBON Q)
   ========================================================================= */

export interface QwertygenIconProps {
  size?: number;
  className?: string;
  hasContainer?: boolean;
  monochrome?: boolean;
}

/**
 * Official Logomark for Qwertygen — Continuous Ribbon Q (Vector SVG Format)
 */
export const QwertygenIcon: React.FC<QwertygenIconProps> = ({
  size = 36,
  className = "",
  hasContainer = false,
  monochrome = false,
}) => {
  const hasCustomSizeClass = className.includes("w-") || className.includes("h-");
  const strokeWidth = size <= 24 ? 7.5 : 6.5;

  return (
    <div
      style={hasCustomSizeClass ? undefined : { width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center select-none rounded-xl overflow-hidden ${
        hasContainer ? "bg-[#0F172A] p-1.5 shadow-xs" : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="w-full h-full object-contain pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="qRibbonIconGrad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="55%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#06D6A0" />
          </linearGradient>
        </defs>

        {/* Squircle container background if hasContainer is active */}
        {hasContainer && (
          <rect width="64" height="64" rx="15" fill="#0B132B" stroke="#1E293B" strokeWidth="1.5" />
        )}

        {/* Continuous Ribbon Q: Primary loop with internal geometric fold & terminal kick */}
        <path
          d="M 32 10 C 19.85 10 10 19.85 10 32 C 10 44.15 19.85 54 32 54 C 38.2 54 43.8 51.4 47.8 47.3 L 34 33.5 C 32.5 32 32.5 29.5 34 28 C 35.5 26.5 38 26.5 39.5 28 L 54 42.5"
          stroke={monochrome ? "currentColor" : "url(#qRibbonIconGrad)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Continuous Ribbon Q: Upper closure facet */}
        <path
          d="M 32 10 C 44.15 10 54 19.85 54 32 C 54 35.8 53 39.4 51.3 42.5"
          stroke={monochrome ? "currentColor" : "#2563EB"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

/* =========================================================================
   2. QWERTYGEN BRAND LOGO WITH VECTOR ICON & GRADIENT WORDMARK
   ========================================================================= */

export interface QwertygenLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  subtitle?: string;
  isLight?: boolean;
  variant?: "horizontal" | "icon-only" | "compact" | "stacked" | "umbrella-lockup" | "dark" | "monochrome";
  productTag?: string;
}

export const QwertygenLogo: React.FC<QwertygenLogoProps> = ({
  size = 36,
  className = "",
  showText = true,
  subtitle = "",
  isLight = false,
  variant = "horizontal",
  productTag,
}) => {
  if (variant === "icon-only" || !showText) {
    return <QwertygenIcon size={size} className={className} monochrome={variant === "monochrome"} />;
  }

  // Wordmark colors: Qwerty (#0F172A / white) + gen gradient (#0EA5E9 to #06D6A0)
  const clearTextColor = isLight || variant === "dark" ? "text-white" : "text-[#0F172A] dark:text-white";
  const isMonochrome = variant === "monochrome";

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <QwertygenIcon size={Math.round(size * 1.5)} monochrome={isMonochrome} />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline font-headings font-bold tracking-tight text-2xl sm:text-3xl leading-none">
            <span className={clearTextColor}>{BRAND.brandPrefix}</span>
            <span className={isMonochrome ? clearTextColor : "bg-gradient-to-r from-[#0EA5E9] to-[#06D6A0] bg-clip-text text-transparent"}>
              {BRAND.brandSuffix}
            </span>
          </div>
          <span className="mt-1 text-[9px] sm:text-[10px] font-medium font-body uppercase tracking-[0.22em] text-[#94A3B8]">
            {BRAND.tagline}
          </span>
          {productTag && (
            <span className="mt-1.5 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-full">
              {productTag}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <QwertygenIcon size={size} monochrome={isMonochrome} />
        <div className="flex flex-col text-left justify-center">
          <div className="flex items-baseline font-headings text-base sm:text-lg font-bold tracking-tight leading-none">
            <span className={clearTextColor}>{BRAND.brandPrefix}</span>
            <span className={isMonochrome ? clearTextColor : "bg-gradient-to-r from-[#0EA5E9] to-[#06D6A0] bg-clip-text text-transparent"}>
              {BRAND.brandSuffix}
            </span>
          </div>
          <span className="text-[9.5px] font-body font-medium tracking-[0.22em] uppercase text-[#94A3B8] mt-0.5">
            {BRAND.tagline}
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Lockup (Icon + Qwertygen Wordmark)
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <QwertygenIcon size={size} className="w-7 h-7 sm:w-[34px] sm:h-[34px]" monochrome={isMonochrome} />

      <div className="flex flex-col text-left justify-center">
        <div className="flex items-baseline font-headings text-[16px] sm:text-xl font-bold tracking-tight leading-none">
          <span className={clearTextColor}>{BRAND.brandPrefix}</span>
          <span className={isMonochrome ? clearTextColor : "bg-gradient-to-r from-[#0EA5E9] to-[#06D6A0] bg-clip-text text-transparent"}>
            {BRAND.brandSuffix}
          </span>

          {productTag && (
            <span className="ml-2 font-body text-xs font-semibold text-slate-500 hidden sm:inline">
              / {productTag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* Backward compatible alias for product icons */
export const ResumeBuilderIcon = QwertygenIcon;
export const ResumeBuilderLogo = QwertygenLogo;

export interface BrandLogoProps extends QwertygenLogoProps {
  product?: "qwertygen" | "resume-builder";
}

export const BrandLogo: React.FC<BrandLogoProps> = (props) => {
  return <QwertygenLogo {...props} />;
};

export default BrandLogo;
