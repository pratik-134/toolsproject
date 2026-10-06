import React from "react";
import { BRAND } from "@/lib/brand";

/* =========================================================================
   1. QWERTYGEN OFFICIAL HIGH-RES PNG BRAND ICON
   ========================================================================= */

export interface QwertygenIconProps {
  size?: number;
  className?: string;
  hasContainer?: boolean;
}

/**
 * Official Logomark for Qwertygen (Vector SVG Format)
 */
export const QwertygenIcon: React.FC<QwertygenIconProps> = ({
  size = 36,
  className = "",
  hasContainer = false,
}) => {
  const hasCustomSizeClass = className.includes("w-") || className.includes("h-");
  return (
    <div
      style={hasCustomSizeClass ? undefined : { width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center select-none rounded-xl overflow-hidden ${
        hasContainer ? "bg-[#0F172A] p-1.5 shadow-xs" : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className="w-full h-full object-contain pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="qIconBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="qIconRingGrad" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="35%" stopColor="#3B82F6" />
            <stop offset="70%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#06D6A0" />
          </linearGradient>
          <linearGradient id="qIconTailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#06D6A0" />
          </linearGradient>
          <radialGradient id="qIconCoreGlow" cx="48%" cy="46%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
            <stop offset="65%" stopColor="#0EA5E9" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Background Tile */}
        <rect width="512" height="512" rx="116" fill="url(#qIconBgGrad)" />
        <rect width="504" height="504" x="4" y="4" rx="112" fill="none" stroke="#1E293B" strokeWidth="4" opacity="0.6" />

        {/* Ambient Glow */}
        <circle cx="240" cy="236" r="150" fill="url(#qIconCoreGlow)" />

        {/* "Q" Monogram Ring Body */}
        <circle
          cx="240"
          cy="236"
          r="126"
          fill="none"
          stroke="url(#qIconRingGrad)"
          strokeWidth="52"
          strokeLinecap="round"
        />

        {/* Dynamic Energy Tail */}
        <path
          d="M 292 288 L 396 392"
          stroke="url(#qIconTailGrad)"
          strokeWidth="52"
          strokeLinecap="round"
        />

        {/* Power Node Accent */}
        <circle cx="240" cy="236" r="28" fill="#0EA5E9" />
        <circle cx="240" cy="236" r="14" fill="#E0F2FE" />
      </svg>
    </div>
  );
};

/* =========================================================================
   2. QWERTYGEN BRAND LOGO WITH HIGH-RES PNG ICON & GRADIENT WORDMARK
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
    return <QwertygenIcon size={size} className={className} />;
  }

  // Wordmark colors: Qwerty (#0F172A/white) + gen gradient (#0EA5E9 to #06D6A0)
  const clearTextColor = isLight || variant === "dark" ? "text-white" : "text-[#0F172A] dark:text-white";

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <QwertygenIcon size={Math.round(size * 1.5)} />
        <div className="flex flex-col items-center">
          <div className="flex items-baseline font-headings font-bold tracking-[-0.02em] text-2xl sm:text-3xl leading-none">
            <span className={clearTextColor}>{BRAND.brandPrefix}</span>
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#06D6A0] bg-clip-text text-transparent">
              {BRAND.brandSuffix}
            </span>
          </div>
          <span className="mt-1 text-[9px] sm:text-[10px] font-medium font-body uppercase tracking-[0.22em] text-[#94A3B8]">
            {BRAND.tagline}
          </span>
          {productTag && (
            <span className="mt-1.5 text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-full">
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
        <QwertygenIcon size={size} />
        <div className="flex flex-col text-left justify-center">
          <div className="flex items-baseline font-headings text-base sm:text-lg font-bold tracking-[-0.02em] leading-none">
            <span className={clearTextColor}>{BRAND.brandPrefix}</span>
            <span className="bg-gradient-to-r from-[#0EA5E9] to-[#06D6A0] bg-clip-text text-transparent">
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
      <QwertygenIcon size={size} className="w-7 h-7 sm:w-[34px] sm:h-[34px]" />

      <div className="flex flex-col text-left justify-center">
        <div className="flex items-baseline font-headings text-[16px] sm:text-xl font-bold tracking-[-0.02em] leading-none">
          <span className={clearTextColor}>{BRAND.brandPrefix}</span>
          <span className="bg-gradient-to-r from-[#0EA5E9] to-[#06D6A0] bg-clip-text text-transparent">
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
